import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  college_time: jsonb("college_time").notNull(),
  break_periods: jsonb("break_periods").notNull(),
  rooms: jsonb("rooms").notNull(),
  subjects: jsonb("subjects").notNull(),
  created_at: text("created_at").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  created_at: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Detailed type definitions for the JSON structure
export interface CollegeTime {
  startTime: string;
  endTime: string;
}

export interface BreakPeriod {
  day: string;
  startTime: string;
  endTime: string;
}

export interface FacultyAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Faculty {
  id: string;
  name: string;
  availability: FacultyAvailability[];
}

export interface Subject {
  name: string;
  duration: number;
  no_of_classes_per_week: number;
  faculty: Faculty[];
}

export interface ScheduleData {
  college_time: CollegeTime;
  break_: BreakPeriod[];
  rooms: string[];
  subjects: Subject[];
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
