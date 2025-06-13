import { z } from "zod";

// User schema for authentication
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(), // Will be hashed
  role: z.enum(['admin', 'user']).default('user'),
  createdAt: z.date().optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Faculty schema
export const facultySchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  name: z.string(),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  createdAt: z.date().optional(),
});

export const insertFacultySchema = facultySchema.omit({ _id: true, createdAt: true });
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Faculty = z.infer<typeof facultySchema>;

// Subject schema
export const subjectSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  duration: z.number(),
  no_of_classes_per_week: z.number(),
  facultyId: z.string(),
  createdAt: z.date().optional(),
});

export const insertSubjectSchema = subjectSchema.omit({ _id: true, createdAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = z.infer<typeof subjectSchema>;

// Room schema
export const roomSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  name: z.string(),
  capacity: z.number().optional(),
  createdAt: z.date().optional(),
});

export const insertRoomSchema = roomSchema.omit({ _id: true, createdAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = z.infer<typeof roomSchema>;

// Break schema
export const breakSchema = z.object({
  _id: z.string().optional(),
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.date().optional(),
});

export const insertBreakSchema = breakSchema.omit({ _id: true, createdAt: true });
export type InsertBreak = z.infer<typeof insertBreakSchema>;
export type Break = z.infer<typeof breakSchema>;

// College time schema
export const collegeTimeSchema = z.object({
  _id: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.date().optional(),
});

export const insertCollegeTimeSchema = collegeTimeSchema.omit({ _id: true, createdAt: true });
export type InsertCollegeTime = z.infer<typeof insertCollegeTimeSchema>;
export type CollegeTime = z.infer<typeof collegeTimeSchema>;

// MongoDB Schedule Definitions
export const scheduleSchema = z.object({
  _id: z.string().optional(),
  college_time: z.object({
    startTime: z.string(),
    endTime: z.string(),
  }),
  break_periods: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  rooms: z.array(z.string()),
  subjects: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    time: z.number().optional(), // Additional time field
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
  created_at: z.string().optional(),
});

export const insertScheduleSchema = scheduleSchema.omit({
  _id: true,
  created_at: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;

// API data structure interfaces for external scheduler API
export interface APICollegeTime {
  startTime: string;
  endTime: string;
}

export interface APIBreakPeriod {
  day: string;
  startTime: string;
  endTime: string;
}

export interface APIFacultyAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface APIFaculty {
  id: string;
  name: string;
  availability: APIFacultyAvailability[];
}

export interface APISubject {
  name: string;
  duration: number;
  no_of_classes_per_week: number;
  faculty: APIFaculty[];
}

export interface ScheduleAPIRequest {
  college_time: APICollegeTime;
  break_: APIBreakPeriod[];
  rooms: string[];
  subjects: APISubject[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  subject?: string;
  faculty?: string;
  room?: string;
  isBreak?: boolean;
}

export interface DaySchedule {
  [day: string]: TimeSlot[];
}

export interface RoomSchedule {
  roomId: string;
  schedule: DaySchedule;
  utilization: number;
  conflicts: number;
}

export interface FacultySchedule {
  facultyId: string;
  name: string;
  schedule: DaySchedule;
  teachingHours: number;
  subjects: string[];
}

export interface ScheduleInsights {
  avgUtilization: number;
  conflicts: number;
  peakTime: string;
  activeFaculty: number;
  roomUtilization: Array<{
    roomId: string;
    utilization: number;
  }>;
  recommendations: Array<{
    type: 'optimization' | 'workload' | 'efficiency' | 'conflict';
    title: string;
    description: string;
  }>;
}
