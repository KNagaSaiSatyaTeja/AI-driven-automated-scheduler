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
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Clock,
  Repeat
} from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
  duration: number;
  department: string;
  semester: number;
  classesPerWeek: number;
}

export default function SubjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Subject form state
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    credits: 3,
    duration: 60,
    department: '',
    semester: 1,
    classesPerWeek: 3
  });
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query subjects data
  const { data: subjects = [], isLoading } = useQuery<Subject[]>({ 
    queryKey: ['/api/subjects'] 
  });

  // Create subject mutation
  const createSubjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/subjects', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Subject created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error creating subject', description: error.message, variant: 'destructive' });
    }
  });

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/subjects/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Subject updated successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error updating subject', description: error.message, variant: 'destructive' });
    }
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/subjects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Subject deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting subject', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setSubjectForm({
      name: '',
      code: '',
      credits: 3,
      duration: 60,
      department: '',
      semester: 1,
      classesPerWeek: 3
    });
    setEditingSubject(null);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      duration: subject.duration,
      department: subject.department,
      semester: subject.semester,
      classesPerWeek: subject.classesPerWeek
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject._id, data: subjectForm });
    } else {
      createSubjectMutation.mutate(subjectForm);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Subject Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Manage academic subjects and courses' : 'View available subjects'}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">
                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    {editingSubject ? 'Update subject information' : 'Create a new academic subject'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Subject Name</Label>
                      <Input
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        placeholder="e.g., Data Structures"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">Subject Code</Label>
                      <Input
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        placeholder="e.g., CS101"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Credits</Label>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={subjectForm.credits}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">Duration (minutes)</Label>
                      <Input
                        type="number"
                        min="30"
                        max="180"
                        step="15"
                        value={subjectForm.duration}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Department</Label>
                      <Input
                        value={subjectForm.department}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, department: e.target.value }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-black dark:text-white">Semester</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={subjectForm.semester}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, semester: parseInt(e.target.value) || 1 }))}
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Classes Per Week</Label>
                    <Input
                      type="number"
                      min="1"
                      max="7"
                      value={subjectForm.classesPerWeek}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, classesPerWeek: parseInt(e.target.value) || 3 }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingSubject ? 'Update' : 'Create'} Subject
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

        {/* Subjects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Subjects Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isAdmin ? 'Add subjects to get started' : 'No subjects have been added yet'}
              </p>
            </div>
          ) : (
            subjects.map((subject) => (
              <Card key={subject._id} className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-black dark:text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                        {subject.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {subject.code} • {subject.department}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subject)}
                          className="text-green-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSubjectMutation.mutate(subject._id)}
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
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {subject.duration} min
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Repeat className="w-3 h-3 mr-1" />
                        {subject.classesPerWeek} classes/week
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {subject.credits} credits
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Sem {subject.semester}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Department:</strong> {subject.department}</p>
                      <p><strong>Total Hours/Week:</strong> {(subject.duration * subject.classesPerWeek) / 60} hours</p>
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