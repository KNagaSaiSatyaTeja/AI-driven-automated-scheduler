import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  PlayCircle, 
  Download, 
  Settings, 
  Users, 
  BookOpen, 
  Building, 
  Coffee, 
  Clock 
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

export default function GenerateSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state for schedule generation
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [subjectFacultyMapping, setSubjectFacultyMapping] = useState<Record<string, string[]>>({});
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);

  // Queries for data
  const { data: faculty = [] } = useQuery<Faculty[]>({ queryKey: ['/api/faculty'] });
  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ['/api/subjects'] });
  const { data: rooms = [] } = useQuery<Room[]>({ queryKey: ['/api/rooms'] });
  const { data: breaks = [] } = useQuery<Break[]>({ queryKey: ['/api/breaks'] });
  const { data: collegeTime } = useQuery<CollegeTime>({ queryKey: ['/api/college-time'] });

  // Schedule generation mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return apiRequest('/api/generate-schedule', { 
        method: 'POST', 
        body: scheduleData 
      });
    },
    onSuccess: (data) => {
      setGeneratedSchedule(data);
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/latest'] });
      toast({ title: 'Schedule generated successfully!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Schedule generation failed', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleRoomToggle = (roomName: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomName) 
        ? prev.filter(r => r !== roomName)
        : [...prev, roomName]
    );
  };

  const handleFacultyToggle = (subjectId: string, facultyId: string) => {
    setSubjectFacultyMapping(prev => ({
      ...prev,
      [subjectId]: prev[subjectId]?.includes(facultyId)
        ? prev[subjectId].filter(f => f !== facultyId)
        : [...(prev[subjectId] || []), facultyId]
    }));
  };

  const generateScheduleJSON = () => {
    if (!collegeTime) {
      toast({ 
        title: 'Missing college time', 
        description: 'Please set college timings in the admin panel first',
        variant: 'destructive'
      });
      return;
    }

    if (selectedRooms.length === 0) {
      toast({ 
        title: 'No rooms selected', 
        description: 'Please select at least one room',
        variant: 'destructive'
      });
      return;
    }

    const scheduleJSON = {
      college_time: {
        startTime: collegeTime.startTime,
        endTime: collegeTime.endTime
      },
      break_: breaks.map(b => ({
        day: b.day,
        startTime: b.startTime,
        endTime: b.endTime
      })),
      rooms: selectedRooms,
      subjects: subjects
        .filter(subject => subjectFacultyMapping[subject._id]?.length > 0)
        .map(subject => ({
          name: subject.name,
          duration: subject.duration,
          time: subject.duration, // For compatibility
          no_of_classes_per_week: subject.no_of_classes_per_week,
          faculty: subjectFacultyMapping[subject._id]
            ?.map(facultyId => {
              const facultyMember = faculty.find(f => f._id === facultyId);
              return facultyMember ? {
                id: facultyMember.id || facultyMember._id,
                name: facultyMember.name,
                availability: facultyMember.availability
              } : null;
            })
            .filter(Boolean) || []
        }))
    };

    return scheduleJSON;
  };

  const handleGenerateSchedule = () => {
    const scheduleData = generateScheduleJSON();
    if (scheduleData) {
      generateScheduleMutation.mutate(scheduleData);
    }
  };

  const downloadJSON = () => {
    const scheduleData = generateScheduleJSON();
    if (scheduleData) {
      const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule-data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Generate Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and generate optimized class schedules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* College Time Display */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-red-600" />
                  College Timings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collegeTime ? (
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
                    <p className="text-black dark:text-white">
                      {collegeTime.startTime} - {collegeTime.endTime}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No college timings set. Please configure in Admin Panel.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-600" />
                  Select Rooms
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Choose rooms to include in the schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div key={room._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-${room._id}`}
                        checked={selectedRooms.includes(room.name)}
                        onCheckedChange={() => handleRoomToggle(room.name)}
                      />
                      <Label 
                        htmlFor={`room-${room._id}`} 
                        className="text-black dark:text-white flex-1 cursor-pointer"
                      >
                        {room.name} ({room.type}, Cap: {room.capacity})
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {selectedRooms.length} room(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subject-Faculty Mapping */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Subject-Faculty Assignment
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Assign faculty members to subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div key={subject._id} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                      <h4 className="font-medium text-black dark:text-white mb-2">
                        {subject.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {subject.duration} min • {subject.no_of_classes_per_week} classes/week
                      </p>
                      
                      <div className="space-y-2">
                        {faculty.map((facultyMember) => (
                          <div key={facultyMember._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subject-${subject._id}-faculty-${facultyMember._id}`}
                              checked={subjectFacultyMapping[subject._id]?.includes(facultyMember._id) || false}
                              onCheckedChange={() => handleFacultyToggle(subject._id, facultyMember._id)}
                            />
                            <Label 
                              htmlFor={`subject-${subject._id}-faculty-${facultyMember._id}`}
                              className="text-sm text-black dark:text-white cursor-pointer"
                            >
                              {facultyMember.name} ({facultyMember.department})
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      {subjectFacultyMapping[subject._id]?.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {subjectFacultyMapping[subject._id].map(facultyId => {
                              const facultyMember = faculty.find(f => f._id === facultyId);
                              return facultyMember ? (
                                <Badge key={facultyId} variant="outline" className="text-xs">
                                  {facultyMember.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generation Panel */}
          <div className="space-y-6">
            {/* Breaks Display */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Coffee className="w-5 h-5 mr-2 text-orange-600" />
                  Break Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breaks.length > 0 ? (
                  <div className="space-y-2">
                    {breaks.map((breakPeriod) => (
                      <div key={breakPeriod._id} className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                        <span className="text-black dark:text-white">{breakPeriod.day}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {breakPeriod.startTime} - {breakPeriod.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No break periods configured
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Generation Actions */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Generate Schedule
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Create optimized schedule based on your configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={downloadJSON}
                    variant="outline"
                    disabled={selectedRooms.length === 0}
                    className="text-black dark:text-white border-gray-300 dark:border-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                  
                  <Button
                    onClick={handleGenerateSchedule}
                    disabled={generateScheduleMutation.isPending || selectedRooms.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {generateScheduleMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>• {selectedRooms.length} rooms selected</p>
                  <p>• {Object.keys(subjectFacultyMapping).filter(s => subjectFacultyMapping[s]?.length > 0).length} subjects configured</p>
                  <p>• {breaks.length} break periods</p>
                </div>
              </CardContent>
            </Card>

            {/* Generated Schedule Preview */}
            {generatedSchedule && (
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Generated Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Schedule generated successfully!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      View the complete schedule in the Dashboard
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}