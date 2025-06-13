import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { 
  Clock, 
  Edit, 
  Save,
  Settings,
  Calendar
} from 'lucide-react';

interface CollegeTime {
  _id: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  workingDays: string[];
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function CollegeTimePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // College time form state
  const [collegeTimeForm, setCollegeTimeForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query college time data
  const { data: collegeTime, isLoading } = useQuery<CollegeTime>({ 
    queryKey: ['/api/college-time'],
    retry: false
  });

  // Create/Update college time mutation
  const saveCollegeTimeMutation = useMutation({
    mutationFn: (data: any) => {
      const totalHours = calculateTotalHours(data.startTime, data.endTime, data.lunchBreakStart, data.lunchBreakEnd);
      return apiRequest('/api/college-time', { 
        method: collegeTime ? 'PUT' : 'POST', 
        body: { ...data, totalHours } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-time'] });
      toast({ title: 'College timing updated successfully' });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error updating college timing', description: error.message, variant: 'destructive' });
    }
  });

  const calculateTotalHours = (startTime: string, endTime: string, lunchStart?: string, lunchEnd?: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (lunchStart && lunchEnd) {
      const lunchStartTime = new Date(`2000-01-01 ${lunchStart}`);
      const lunchEndTime = new Date(`2000-01-01 ${lunchEnd}`);
      const lunchMinutes = (lunchEndTime.getTime() - lunchStartTime.getTime()) / (1000 * 60);
      totalMinutes -= lunchMinutes;
    }
    
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  const handleEdit = () => {
    if (collegeTime) {
      setCollegeTimeForm({
        startTime: collegeTime.startTime,
        endTime: collegeTime.endTime,
        lunchBreakStart: collegeTime.lunchBreakStart || '12:00',
        lunchBreakEnd: collegeTime.lunchBreakEnd || '13:00',
        workingDays: collegeTime.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    saveCollegeTimeMutation.mutate(collegeTimeForm);
  };

  const toggleWorkingDay = (day: string) => {
    setCollegeTimeForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">College Timing</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Configure college working hours and schedule' : 'View college operating hours'}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {collegeTime ? 'Edit Timing' : 'Set Timing'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">
                    {collegeTime ? 'Edit College Timing' : 'Set College Timing'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Configure the operating hours and working days for the college
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">College Start Time</Label>
                      <Input
                        type="time"
                        value={collegeTimeForm.startTime}
                        onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">College End Time</Label>
                      <Input
                        type="time"
                        value={collegeTimeForm.endTime}
                        onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Lunch Break Start</Label>
                      <Input
                        type="time"
                        value={collegeTimeForm.lunchBreakStart}
                        onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, lunchBreakStart: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">Lunch Break End</Label>
                      <Input
                        type="time"
                        value={collegeTimeForm.lunchBreakEnd}
                        onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, lunchBreakEnd: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white mb-3 block">Working Days</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {DAYS.map(day => (
                        <Button
                          key={day}
                          type="button"
                          variant={collegeTimeForm.workingDays.includes(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWorkingDay(day)}
                          className={collegeTimeForm.workingDays.includes(day) 
                            ? "bg-orange-600 hover:bg-orange-700 text-white" 
                            : "text-black dark:text-white border-gray-300 dark:border-gray-700"
                          }
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium text-black dark:text-white mb-2">Summary</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Working Hours: {formatTime(collegeTimeForm.startTime)} - {formatTime(collegeTimeForm.endTime)}</p>
                      <p>Lunch Break: {formatTime(collegeTimeForm.lunchBreakStart)} - {formatTime(collegeTimeForm.lunchBreakEnd)}</p>
                      <p>Total Working Hours: {calculateTotalHours(collegeTimeForm.startTime, collegeTimeForm.endTime, collegeTimeForm.lunchBreakStart, collegeTimeForm.lunchBreakEnd)} hours</p>
                      <p>Working Days: {collegeTimeForm.workingDays.length} days/week</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={saveCollegeTimeMutation.isPending}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Timing
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-black dark:text-white border-gray-300 dark:border-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* College Time Display */}
        {collegeTime ? (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-orange-600" />
                    College Operating Hours
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Current timing configuration for the institution
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Settings className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-2">Daily Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start Time:</span>
                        <span className="font-medium text-black dark:text-white">{formatTime(collegeTime.startTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">End Time:</span>
                        <span className="font-medium text-black dark:text-white">{formatTime(collegeTime.endTime)}</span>
                      </div>
                      {collegeTime.lunchBreakStart && collegeTime.lunchBreakEnd && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Lunch Break:</span>
                          <span className="font-medium text-black dark:text-white">
                            {formatTime(collegeTime.lunchBreakStart)} - {formatTime(collegeTime.lunchBreakEnd)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                        <span className="font-medium text-black dark:text-white">{collegeTime.totalHours} hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Working Days
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {collegeTime.workingDays?.map(day => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {collegeTime.workingDays?.length || 0} working days per week
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No College Timing Set
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isAdmin ? 'Configure the college operating hours to get started' : 'College timing has not been configured yet'}
            </p>
            {isAdmin && (
              <Button 
                onClick={handleEdit}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Set College Timing
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}