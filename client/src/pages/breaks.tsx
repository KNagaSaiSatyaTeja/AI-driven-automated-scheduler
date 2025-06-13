import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { 
  Coffee, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Clock,
  Calendar
} from 'lucide-react';

interface Break {
  _id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'break' | 'lunch' | 'tea' | 'other';
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const BREAK_TYPES = ['break', 'lunch', 'tea', 'other'];

export default function BreaksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Break form state
  const [breakForm, setBreakForm] = useState({
    name: '',
    day: 'MONDAY',
    startTime: '10:30',
    endTime: '10:45',
    type: 'break' as 'break' | 'lunch' | 'tea' | 'other'
  });
  
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query breaks data
  const { data: breaks = [], isLoading } = useQuery<Break[]>({ 
    queryKey: ['/api/breaks'] 
  });

  // Create break mutation
  const createBreakMutation = useMutation({
    mutationFn: (data: any) => {
      const duration = calculateDuration(data.startTime, data.endTime);
      return apiRequest('/api/breaks', { method: 'POST', body: { ...data, duration } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks'] });
      toast({ title: 'Break period created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error creating break', description: error.message, variant: 'destructive' });
    }
  });

  // Update break mutation
  const updateBreakMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const duration = calculateDuration(data.startTime, data.endTime);
      return apiRequest(`/api/breaks/${id}`, { method: 'PUT', body: { ...data, duration } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks'] });
      toast({ title: 'Break period updated successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error updating break', description: error.message, variant: 'destructive' });
    }
  });

  // Delete break mutation
  const deleteBreakMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/breaks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks'] });
      toast({ title: 'Break period deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting break', description: error.message, variant: 'destructive' });
    }
  });

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
  };

  const resetForm = () => {
    setBreakForm({
      name: '',
      day: 'MONDAY',
      startTime: '10:30',
      endTime: '10:45',
      type: 'break' as 'break' | 'lunch' | 'tea' | 'other'
    });
    setEditingBreak(null);
  };

  const handleEdit = (breakPeriod: Break) => {
    setEditingBreak(breakPeriod);
    setBreakForm({
      name: breakPeriod.name,
      day: breakPeriod.day,
      startTime: breakPeriod.startTime,
      endTime: breakPeriod.endTime,
      type: breakPeriod.type
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingBreak) {
      updateBreakMutation.mutate({ id: editingBreak._id, data: breakForm });
    } else {
      createBreakMutation.mutate(breakForm);
    }
  };

  const getBreakIcon = (type: string) => {
    switch (type) {
      case 'lunch': return '🍽️';
      case 'tea': return '☕';
      case 'break': return '⏸️';
      default: return '⏰';
    }
  };

  const getBreakColor = (type: string) => {
    switch (type) {
      case 'lunch': return 'text-orange-600';
      case 'tea': return 'text-yellow-600';
      case 'break': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Break Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Manage break periods and lunch times' : 'View scheduled break periods'}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Break
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">
                    {editingBreak ? 'Edit Break Period' : 'Add New Break Period'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    {editingBreak ? 'Update break information' : 'Create a new break period'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Break Name</Label>
                    <Input
                      value={breakForm.name}
                      onChange={(e) => setBreakForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="e.g., Morning Break, Lunch Break"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Day</Label>
                      <Select value={breakForm.day} onValueChange={(value) => setBreakForm(prev => ({ ...prev, day: value }))}>
                        <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                          {DAYS.map(day => (
                            <SelectItem key={day} value={day} className="text-black dark:text-white">
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">Type</Label>
                      <Select value={breakForm.type} onValueChange={(value: any) => setBreakForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                          {BREAK_TYPES.map(type => (
                            <SelectItem key={type} value={type} className="text-black dark:text-white">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Start Time</Label>
                      <Input
                        type="time"
                        value={breakForm.startTime}
                        onChange={(e) => setBreakForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">End Time</Label>
                      <Input
                        type="time"
                        value={breakForm.endTime}
                        onChange={(e) => setBreakForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {calculateDuration(breakForm.startTime, breakForm.endTime)} minutes
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={createBreakMutation.isPending || updateBreakMutation.isPending}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingBreak ? 'Update' : 'Create'} Break
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

        {/* Breaks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breaks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Break Periods
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isAdmin ? 'Add break periods to get started' : 'No break periods have been scheduled yet'}
              </p>
            </div>
          ) : (
            breaks.map((breakPeriod) => (
              <Card key={breakPeriod._id} className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-black dark:text-white flex items-center">
                        <Coffee className={`w-5 h-5 mr-2 ${getBreakColor(breakPeriod.type)}`} />
                        {breakPeriod.name}
                        <span className="ml-2 text-lg">{getBreakIcon(breakPeriod.type)}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {breakPeriod.day} • {breakPeriod.type}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(breakPeriod)}
                          className="text-purple-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBreakMutation.mutate(breakPeriod._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {breakPeriod.day}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {breakPeriod.startTime} - {breakPeriod.endTime}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {breakPeriod.duration} minutes
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {breakPeriod.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}