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
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Mail,
  Building
} from 'lucide-react';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  department: string;
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function FacultyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Faculty form state
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    department: '',
    availability: [{ day: 'MONDAY', startTime: '09:00', endTime: '17:00' }]
  });
  
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query faculty data
  const { data: faculty = [], isLoading } = useQuery<Faculty[]>({ 
    queryKey: ['/api/faculty'] 
  });

  // Create faculty mutation
  const createFacultyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/faculty', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faculty'] });
      toast({ title: 'Faculty created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error creating faculty', description: error.message, variant: 'destructive' });
    }
  });

  // Update faculty mutation
  const updateFacultyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/faculty/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faculty'] });
      toast({ title: 'Faculty updated successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error updating faculty', description: error.message, variant: 'destructive' });
    }
  });

  // Delete faculty mutation
  const deleteFacultyMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/faculty/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faculty'] });
      toast({ title: 'Faculty deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting faculty', description: error.message, variant: 'destructive' });
    }
  });

  const addAvailabilitySlot = () => {
    setFacultyForm(prev => ({
      ...prev,
      availability: [...prev.availability, { day: 'MONDAY', startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const removeAvailabilitySlot = (index: number) => {
    setFacultyForm(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const updateAvailabilitySlot = (index: number, field: string, value: string) => {
    setFacultyForm(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const resetForm = () => {
    setFacultyForm({
      name: '',
      email: '',
      department: '',
      availability: [{ day: 'MONDAY', startTime: '09:00', endTime: '17:00' }]
    });
    setEditingFaculty(null);
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      availability: faculty.availability.length > 0 ? faculty.availability : [{ day: 'MONDAY', startTime: '09:00', endTime: '17:00' }]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingFaculty) {
      updateFacultyMutation.mutate({ id: editingFaculty._id, data: facultyForm });
    } else {
      createFacultyMutation.mutate(facultyForm);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Faculty Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Manage faculty members and their availability' : 'View faculty members'}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">
                    {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    {editingFaculty ? 'Update faculty information' : 'Create a new faculty member'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Name</Label>
                    <Input
                      value={facultyForm.name}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="Enter faculty name"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Email</Label>
                    <Input
                      type="email"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Department</Label>
                    <Input
                      value={facultyForm.department}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, department: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Availability</Label>
                    {facultyForm.availability.map((slot, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Select 
                          value={slot.day} 
                          onValueChange={(value) => updateAvailabilitySlot(index, 'day', value)}
                        >
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
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                          className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                          className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAvailabilitySlot(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAvailabilitySlot}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={createFacultyMutation.isPending || updateFacultyMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingFaculty ? 'Update' : 'Create'} Faculty
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

        {/* Faculty List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Faculty Members
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isAdmin ? 'Add faculty members to get started' : 'No faculty members have been added yet'}
              </p>
            </div>
          ) : (
            faculty.map((f) => (
              <Card key={f._id} className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-black dark:text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        {f.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {f.department}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(f)}
                          className="text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFacultyMutation.mutate(f._id)}
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
                      <Mail className="w-4 h-4 mr-2" />
                      {f.email}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Building className="w-4 h-4 mr-2" />
                      {f.department}
                    </div>
                    
                    {f.availability && f.availability.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white mb-2">Availability:</p>
                        <div className="flex flex-wrap gap-1">
                          {f.availability.map((slot, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {slot.day}: {slot.startTime}-{slot.endTime}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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