import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import TimetableGrid from '@/components/timetable-grid';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Building, 
  Coffee, 
  Clock,
  PlayCircle,
  Eye
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

interface GeneratedSchedule {
  [day: string]: Array<{
    startTime: string;
    endTime: string;
    subject?: string;
    faculty?: string;
    room?: string;
    isBreak?: boolean;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // Queries for data
  const { data: faculty = [] } = useQuery<Faculty[]>({ queryKey: ['/api/faculty'] });
  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ['/api/subjects'] });
  const { data: rooms = [] } = useQuery<Room[]>({ queryKey: ['/api/rooms'] });
  const { data: breaks = [] } = useQuery<Break[]>({ queryKey: ['/api/breaks'] });
  const { data: collegeTime } = useQuery<CollegeTime>({ queryKey: ['/api/college-time'] });
  const { data: schedule } = useQuery<GeneratedSchedule>({ 
    queryKey: ['/api/schedules/latest'],
    retry: false 
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {isAdmin ? 'Admin Dashboard' : 'Schedule Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin 
              ? 'Manage and view all scheduling data' 
              : 'View current schedules and timetables'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black dark:text-white">Faculty</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{faculty.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active faculty members</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black dark:text-white">Subjects</CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{subjects.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total subjects</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black dark:text-white">Rooms</CardTitle>
              <Building className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{rooms.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Available rooms</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black dark:text-white">Breaks</CardTitle>
              <Coffee className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{breaks.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Break periods</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-900">
            <TabsTrigger value="schedule" className="text-black dark:text-white">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-black dark:text-white">
              <Eye className="w-4 h-4 mr-2 text-green-600" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Current Schedule
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {schedule ? 'Generated timetable for the week' : 'No schedule generated yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedule ? (
                  <TimetableGrid schedule={schedule} showRooms={true} />
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Schedule Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {isAdmin 
                        ? 'Generate a new schedule using the admin panel' 
                        : 'Contact your administrator to generate a schedule'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Faculty Overview */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Faculty Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {faculty.map((f) => (
                      <div key={f._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{f.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{f.department}</p>
                          <div className="flex gap-1 mt-1">
                            {f.availability?.slice(0, 2).map((slot, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {slot.day}
                              </Badge>
                            ))}
                            {f.availability?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{f.availability.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subjects Overview */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {subjects.map((s) => (
                      <div key={s._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{s.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {s.duration} min • {s.no_of_classes_per_week} classes/week
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rooms Overview */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Building className="w-5 h-5 mr-2 text-purple-600" />
                    Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {rooms.map((r) => (
                      <div key={r._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{r.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {r.type} • Capacity: {r.capacity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* College Time & Breaks */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-red-600" />
                    Timings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collegeTime && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
                        <h4 className="font-medium text-black dark:text-white mb-1">College Hours</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collegeTime.startTime} - {collegeTime.endTime}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-black dark:text-white mb-2">Break Periods</h4>
                      <div className="space-y-2">
                        {breaks.map((b) => (
                          <div key={b._id} className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                            <span className="text-sm text-black dark:text-white">{b.day}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {b.startTime} - {b.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}