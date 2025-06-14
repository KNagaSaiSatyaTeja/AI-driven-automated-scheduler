import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  BookOpen, 
  Coffee, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Calendar,
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

interface Subject {
  _id: string;
  name: string;
  duration: number;
  no_of_classes_per_week: number;
  faculty: string[];
}

interface Room {
  _id: string;
  name: string;
  capacity: number;
  type: string;
}

interface Break {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface CollegeTime {
  _id: string;
  startTime: string;
  endTime: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Faculty state
  const [facultyForm, setFacultyForm] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    availability: [{ day: 'MONDAY', startTime: '09:00', endTime: '17:00' }]
  });
  
  // Subject state
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    duration: 50,
    no_of_classes_per_week: 3,
    faculty: [] as string[]
  });
  
  // Room state
  const [roomForm, setRoomForm] = useState({
    id: '',
    name: '',
    capacity: 30,
    type: 'Classroom'
  });
  
  // Break state
  const [breakForm, setBreakForm] = useState({
    day: 'ALL_DAYS',
    startTime: '13:00',
    endTime: '14:00'
  });
  
  // College time state
  const [collegeTimeForm, setCollegeTimeForm] = useState({
    startTime: '09:00',
    endTime: '17:00'
  });

  // Queries
  const { data: faculty = [] } = useQuery<Faculty[]>({ queryKey: ['/api/faculty'] });
  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ['/api/subjects'] });
  const { data: rooms = [] } = useQuery<Room[]>({ queryKey: ['/api/rooms'] });
  const { data: breaks = [] } = useQuery<Break[]>({ queryKey: ['/api/breaks'] });
  const { data: collegeTime } = useQuery<CollegeTime>({ queryKey: ['/api/college-time'] });

  // Faculty mutations
  const createFacultyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/faculty', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faculty'] });
      toast({ title: 'Faculty created successfully' });
      setFacultyForm({ id: '', name: '', email: '', department: '', availability: [{ day: 'MONDAY', startTime: '09:00', endTime: '17:00' }] });
    }
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/faculty/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faculty'] });
      toast({ title: 'Faculty deleted successfully' });
    }
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/subjects', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Subject created successfully' });
      setSubjectForm({ name: '', duration: 50, no_of_classes_per_week: 3, faculty: [] });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/subjects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Subject deleted successfully' });
    }
  });

  // Room mutations
  const createRoomMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/rooms', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: 'Room created successfully' });
      setRoomForm({ id: '', name: '', capacity: 30, type: 'Classroom' });
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/rooms/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: 'Room deleted successfully' });
    }
  });

  // Break mutations
  const createBreakMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/breaks', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks'] });
      toast({ title: 'Break created successfully' });
      setBreakForm({ day: 'ALL_DAYS', startTime: '13:00', endTime: '14:00' });
    }
  });

  const deleteBreakMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/breaks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks'] });
      toast({ title: 'Break deleted successfully' });
    }
  });

  // College time mutation
  const updateCollegeTimeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/college-time', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-time'] });
      toast({ title: 'College time updated successfully' });
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

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage faculty, subjects, rooms, breaks, and college timings
          </p>
        </div>

        <Tabs defaultValue="faculty" className="space-y-6">
          <TabsList className="bg-gray-200 dark:bg-gray-800 w-full justify-start flex-wrap h-auto p-3 gap-3 border border-gray-300 dark:border-gray-600">
            <TabsTrigger 
              value="faculty" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/40 dark:data-[state=active]:text-blue-200 px-4 py-2 font-medium"
            >
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Faculty
            </TabsTrigger>
            <TabsTrigger 
              value="subjects" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/40 dark:data-[state=active]:text-green-200 px-4 py-2 font-medium"
            >
              <BookOpen className="w-4 h-4 mr-2 text-green-600" />
              Subjects
            </TabsTrigger>
            <TabsTrigger 
              value="rooms" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-900/40 dark:data-[state=active]:text-purple-200 px-4 py-2 font-medium"
            >
              <Building className="w-4 h-4 mr-2 text-purple-600" />
              Rooms
            </TabsTrigger>
            <TabsTrigger 
              value="breaks" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 dark:data-[state=active]:bg-orange-900/40 dark:data-[state=active]:text-orange-200 px-4 py-2 font-medium"
            >
              <Coffee className="w-4 h-4 mr-2 text-orange-600" />
              Breaks
            </TabsTrigger>
            <TabsTrigger 
              value="college-time" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900/40 dark:data-[state=active]:text-red-200 px-4 py-2 font-medium"
            >
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              College Time
            </TabsTrigger>
            <TabsTrigger 
              value="scheduler" 
              className="bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-200 px-4 py-2 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
              Scheduler
            </TabsTrigger>
          </TabsList>

          {/* Faculty Tab */}
          <TabsContent value="faculty">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    Add Faculty
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Faculty ID</Label>
                    <Input
                      value={facultyForm.id}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, id: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="e.g., F1, F2, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Name</Label>
                    <Input
                      value={facultyForm.name}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Email</Label>
                    <Input
                      type="email"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Department</Label>
                    <Input
                      value={facultyForm.department}
                      onChange={(e) => setFacultyForm(prev => ({ ...prev, department: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Availability</Label>
                    {facultyForm.availability.map((slot, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Select value={slot.day} onValueChange={(value) => updateAvailabilitySlot(index, 'day', value)}>
                          <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
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
                  
                  <Button
                    onClick={() => createFacultyMutation.mutate(facultyForm)}
                    disabled={createFacultyMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Faculty
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Faculty List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faculty.map((f) => (
                      <div key={f._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{f.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{f.email} • {f.department}</p>
                          <div className="flex gap-1 mt-1">
                            {f.availability?.map((slot, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {slot.day}: {slot.startTime}-{slot.endTime}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFacultyMutation.mutate(f._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subject Tab */}
          <TabsContent value="subjects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-green-600" />
                    Add Subject
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Subject Name</Label>
                    <Input
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={subjectForm.duration}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Classes per Week</Label>
                    <Input
                      type="number"
                      value={subjectForm.no_of_classes_per_week}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, no_of_classes_per_week: parseInt(e.target.value) }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Faculty</Label>
                    <Select 
                      value={subjectForm.faculty[0] || ""} 
                      onValueChange={(value) => setSubjectForm(prev => ({ ...prev, faculty: [value] }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map(f => (
                          <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createSubjectMutation.mutate(subjectForm)}
                    disabled={createSubjectMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Subject
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Subjects List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjects.map((s) => (
                      <div key={s._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{s.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {s.duration} min • {s.no_of_classes_per_week} classes/week
                          </p>
                          {s.faculty && s.faculty.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {s.faculty.map((facultyId) => {
                                const facultyMember = faculty.find(f => f._id === facultyId);
                                return facultyMember ? (
                                  <Badge key={facultyId} variant="outline" className="text-xs">
                                    {facultyMember.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSubjectMutation.mutate(s._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-purple-600" />
                    Add Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Room ID</Label>
                    <Input
                      value={roomForm.id}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, id: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      placeholder="e.g., R1, R2, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Room Name</Label>
                    <Input
                      value={roomForm.name}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Capacity</Label>
                    <Input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">Type</Label>
                    <Select value={roomForm.type} onValueChange={(value) => setRoomForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Classroom">Classroom</SelectItem>
                        <SelectItem value="Lab">Lab</SelectItem>
                        <SelectItem value="Auditorium">Auditorium</SelectItem>
                        <SelectItem value="Conference">Conference Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createRoomMutation.mutate(roomForm)}
                    disabled={createRoomMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Rooms List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rooms.map((r) => (
                      <div key={r._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{r.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Capacity: {r.capacity} • Type: {r.type}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRoomMutation.mutate(r._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Breaks Tab */}
          <TabsContent value="breaks">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-orange-600" />
                    Add Break
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Day</Label>
                    <Select value={breakForm.day} onValueChange={(value) => setBreakForm(prev => ({ ...prev, day: value }))}>
                      <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_DAYS">All Days</SelectItem>
                        {DAYS.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Button
                    onClick={() => createBreakMutation.mutate(breakForm)}
                    disabled={createBreakMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Break
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Breaks List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {breaks.map((b) => (
                      <div key={b._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{b.day}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {b.startTime} - {b.endTime}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBreakMutation.mutate(b._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* College Time Tab */}
          <TabsContent value="college-time">
            <Card className="max-w-md mx-auto border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-red-600" />
                  College Timings
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Set the daily operating hours for the college
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black dark:text-white">Start Time</Label>
                  <Input
                    type="time"
                    value={collegeTimeForm.startTime}
                    onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-black dark:text-white">End Time</Label>
                  <Input
                    type="time"
                    value={collegeTimeForm.endTime}
                    onChange={(e) => setCollegeTimeForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  />
                </div>
                {collegeTime && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current: {collegeTime.startTime} - {collegeTime.endTime}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => updateCollegeTimeMutation.mutate(collegeTimeForm)}
                  disabled={updateCollegeTimeMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update College Time
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Generate Schedule
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Generate an optimized timetable using the configured faculty, subjects, rooms, and breaks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-black dark:text-white">Faculty</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{faculty.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-medium text-black dark:text-white">Subjects</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{subjects.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configured</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Building className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-medium text-black dark:text-white">Rooms</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{rooms.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium text-black dark:text-white mb-2">Prerequisites</h4>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center ${faculty.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${faculty.length > 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        At least one faculty member ({faculty.length} configured)
                      </li>
                      <li className={`flex items-center ${subjects.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${subjects.length > 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        At least one subject ({subjects.length} configured)
                      </li>
                      <li className={`flex items-center ${rooms.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${rooms.length > 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        At least one room ({rooms.length} configured)
                      </li>
                      <li className={`flex items-center ${collegeTime ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${collegeTime ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        College time configured ({collegeTime ? `${collegeTime.startTime} - ${collegeTime.endTime}` : 'Not set'})
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => {
                      setLocation('/generate-schedule');
                    }}
                    disabled={faculty.length === 0 || subjects.length === 0 || rooms.length === 0 || !collegeTime}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Go to Schedule Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}