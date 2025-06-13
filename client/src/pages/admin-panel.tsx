import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calendar, Clock, Users, Building } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schemas
const facultyFormSchema = z.object({
  id: z.string().min(1, "Faculty ID is required"),
  name: z.string().min(1, "Name is required"),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).min(1, "At least one availability slot is required"),
});

const subjectFormSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  duration: z.number().min(30, "Duration must be at least 30 minutes"),
  no_of_classes_per_week: z.number().min(1, "At least 1 class per week required"),
  facultyId: z.string().min(1, "Faculty selection is required"),
});

const roomFormSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Room name is required"),
  capacity: z.number().optional(),
});

const breakFormSchema = z.object({
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const collegeTimeFormSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const scheduleFormSchema = z.object({
  college_time: z.object({
    startTime: z.string(),
    endTime: z.string(),
  }),
  break_: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  rooms: z.array(z.string()),
  subjects: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    no_of_classes_per_week: z.number(),
    faculty: z.array(z.object({
      id: z.string(),
      name: z.string(),
      availability: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })),
    })),
  })),
});

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  // Data queries
  const { data: faculty = [] } = useQuery({
    queryKey: ['/api/faculty'],
    queryFn: () => apiRequest('/api/faculty', { headers }),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    queryFn: () => apiRequest('/api/subjects', { headers }),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
    queryFn: () => apiRequest('/api/rooms', { headers }),
  });

  const { data: breaks = [] } = useQuery({
    queryKey: ['/api/breaks'],
    queryFn: () => apiRequest('/api/breaks', { headers }),
  });

  const { data: collegeTime } = useQuery({
    queryKey: ['/api/college-time'],
    queryFn: () => apiRequest('/api/college-time', { headers }),
  });

  // Generate schedule mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return apiRequest('/api/generate-schedule', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Schedule generated successfully" });
      setOpenDialogs(prev => ({ ...prev, generateSchedule: false }));
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleGenerateSchedule = () => {
    if (!collegeTime || breaks.length === 0 || rooms.length === 0 || subjects.length === 0) {
      toast({
        title: "Missing Data",
        description: "Please ensure college time, breaks, rooms, and subjects are configured",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      college_time: {
        startTime: collegeTime.startTime,
        endTime: collegeTime.endTime,
      },
      break_: breaks.map(b => ({
        day: b.day,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
      rooms: rooms.map(r => r.id),
      subjects: subjects.map(s => {
        const subjectFaculty = faculty.find(f => f.id === s.facultyId);
        return {
          name: s.name,
          duration: s.duration,
          no_of_classes_per_week: s.no_of_classes_per_week,
          faculty: subjectFaculty ? [{
            id: subjectFaculty.id,
            name: subjectFaculty.name,
            availability: subjectFaculty.availability,
          }] : [],
        };
      }),
    };

    generateScheduleMutation.mutate(scheduleData);
  };

  const openDialog = (key: string) => setOpenDialogs(prev => ({ ...prev, [key]: true }));
  const closeDialog = (key: string) => setOpenDialogs(prev => ({ ...prev, [key]: false }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage faculty, subjects, rooms, and generate schedules</p>
        </div>
        <Button 
          onClick={handleGenerateSchedule}
          disabled={generateScheduleMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {generateScheduleMutation.isPending ? "Generating..." : "Generate Schedule"}
        </Button>
      </div>

      <Tabs defaultValue="faculty" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Faculty Management
                </CardTitle>
                <CardDescription>Manage faculty members and their availability</CardDescription>
              </div>
              <FacultyDialog 
                open={openDialogs.addFaculty || false}
                onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, addFaculty: open }))}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/faculty'] })}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {faculty.map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{f.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {f.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {f.availability.length} availability slots
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subject Management</CardTitle>
                <CardDescription>Manage subjects and assign faculty</CardDescription>
              </div>
              <SubjectDialog 
                faculty={faculty}
                open={openDialogs.addSubject || false}
                onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, addSubject: open }))}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/subjects'] })}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {subjects.map((s: any) => (
                  <div key={s._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Duration: {s.duration} minutes | Classes: {s.no_of_classes_per_week}/week
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Faculty: {faculty.find((f: any) => f.id === s.facultyId)?.name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Room Management
                </CardTitle>
                <CardDescription>Manage classroom and facility information</CardDescription>
              </div>
              <RoomDialog 
                open={openDialogs.addRoom || false}
                onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, addRoom: open }))}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/rooms'] })}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rooms.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {r.id}</p>
                      {r.capacity && (
                        <p className="text-sm text-muted-foreground">Capacity: {r.capacity}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Break Management
                </CardTitle>
                <CardDescription>Configure break periods and lunch times</CardDescription>
              </div>
              <BreakDialog 
                open={openDialogs.addBreak || false}
                onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, addBreak: open }))}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/breaks'] })}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {breaks.map((b: any) => (
                  <div key={b._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{b.day}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.startTime} - {b.endTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>College Time Settings</CardTitle>
              <CardDescription>Configure college operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <CollegeTimeDialog 
                currentTime={collegeTime}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/college-time'] })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog Components
function FacultyDialog({ open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(facultyFormSchema) });
  const token = localStorage.getItem('token');

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/faculty', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "Faculty added successfully" });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Faculty Member</DialogTitle>
          <DialogDescription>Add a new faculty member with availability schedule</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            const availability = [
              { day: "MONDAY", startTime: "09:30", endTime: "16:30" },
              { day: "TUESDAY", startTime: "09:30", endTime: "16:30" },
              { day: "WEDNESDAY", startTime: "09:30", endTime: "16:30" },
              { day: "THURSDAY", startTime: "09:30", endTime: "16:30" },
              { day: "FRIDAY", startTime: "09:30", endTime: "16:30" },
            ];
            mutation.mutate({ ...data, availability });
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty ID</FormLabel>
                  <FormControl>
                    <Input placeholder="F001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding..." : "Add Faculty"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SubjectDialog({ faculty, open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(subjectFormSchema) });
  const token = localStorage.getItem('token');

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/subjects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "Subject added successfully" });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogDescription>Add a new subject and assign faculty</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="no_of_classes_per_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classes per week</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Faculty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {faculty.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding..." : "Add Subject"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RoomDialog({ open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(roomFormSchema) });
  const token = localStorage.getItem('token');

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/rooms', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "Room added successfully" });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>Add a new classroom or facility</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room ID</FormLabel>
                  <FormControl>
                    <Input placeholder="R101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Lab 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="40" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function BreakDialog({ open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(breakFormSchema) });
  const token = localStorage.getItem('token');

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/breaks', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "Break period added successfully" });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Break
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Break Period</DialogTitle>
          <DialogDescription>Configure a break or lunch period</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL_DAYS">All Days</SelectItem>
                      <SelectItem value="MONDAY">Monday</SelectItem>
                      <SelectItem value="TUESDAY">Tuesday</SelectItem>
                      <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                      <SelectItem value="THURSDAY">Thursday</SelectItem>
                      <SelectItem value="FRIDAY">Friday</SelectItem>
                      <SelectItem value="SATURDAY">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding..." : "Add Break"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CollegeTimeDialog({ currentTime, onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({ 
    resolver: zodResolver(collegeTimeFormSchema),
    defaultValues: currentTime || { startTime: "09:30", endTime: "16:30" }
  });
  const token = localStorage.getItem('token');

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/college-time', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "College time updated successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating..." : "Update College Time"}
        </Button>
      </form>
    </Form>
  );
}