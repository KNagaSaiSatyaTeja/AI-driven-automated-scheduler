import { Schedule, InsertSchedule, ScheduleData, RoomSchedule, FacultySchedule, ScheduleInsights } from "@shared/schema";

export interface IStorage {
  getSchedule(): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined>;
  getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined>;
  getInsights(): Promise<ScheduleInsights>;
  getAllRooms(): Promise<string[]>;
  getAllFaculty(): Promise<Array<{ id: string; name: string }>>;
}

export class MemStorage implements IStorage {
  private schedule: Schedule | undefined;
  private currentId: number;

  constructor() {
    this.currentId = 1;
  }

  async getSchedule(): Promise<Schedule | undefined> {
    return this.schedule;
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentId++;
    const schedule: Schedule = {
      ...insertSchedule,
      id,
      created_at: new Date().toISOString(),
    };
    this.schedule = schedule;
    return schedule;
  }

  async updateSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    if (!this.schedule) {
      return this.createSchedule(insertSchedule);
    }
    
    const updatedSchedule: Schedule = {
      ...this.schedule,
      ...insertSchedule,
      created_at: new Date().toISOString(),
    };
    this.schedule = updatedSchedule;
    return updatedSchedule;
  }

  async getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined> {
    if (!this.schedule) return undefined;

    const scheduleData = this.schedule.subjects as any;
    const rooms = this.schedule.rooms as string[];
    
    if (!rooms.includes(roomId)) return undefined;

    // Generate room schedule from schedule data
    const roomSchedule = this.generateRoomSchedule(roomId, scheduleData);
    return roomSchedule;
  }

  async getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined> {
    if (!this.schedule) return undefined;

    const scheduleData = this.schedule.subjects as any;
    
    // Find faculty in subjects
    let facultyName = '';
    const subjects = scheduleData.subjects || [];
    
    for (const subject of subjects) {
      const faculty = subject.faculty?.find((f: any) => f.id === facultyId);
      if (faculty) {
        facultyName = faculty.name;
        break;
      }
    }

    if (!facultyName) return undefined;

    // Generate faculty schedule
    const facultySchedule = this.generateFacultySchedule(facultyId, facultyName, scheduleData);
    return facultySchedule;
  }

  async getInsights(): Promise<ScheduleInsights> {
    if (!this.schedule) {
      return {
        avgUtilization: 0,
        conflicts: 0,
        peakTime: 'N/A',
        activeFaculty: 0,
        roomUtilization: [],
        recommendations: []
      };
    }

    const scheduleData = this.schedule.subjects as any;
    const rooms = this.schedule.rooms as string[];
    const subjects = scheduleData.subjects || [];

    // Calculate insights
    const roomUtilization = await this.calculateRoomUtilization(rooms);
    const avgUtilization = roomUtilization.reduce((sum, room) => sum + room.utilization, 0) / roomUtilization.length;
    const conflicts = await this.detectConflicts();
    const activeFaculty = this.countActiveFaculty(subjects);
    const peakTime = this.calculatePeakTime(subjects);
    const recommendations = this.generateRecommendations(roomUtilization, subjects);

    return {
      avgUtilization: Math.round(avgUtilization * 100) / 100,
      conflicts,
      peakTime,
      activeFaculty,
      roomUtilization,
      recommendations
    };
  }

  async getAllRooms(): Promise<string[]> {
    if (!this.schedule) return [];
    return this.schedule.rooms as string[];
  }

  async getAllFaculty(): Promise<Array<{ id: string; name: string }>> {
    if (!this.schedule) return [];
    
    const scheduleData = this.schedule.subjects as any;
    const subjects = scheduleData.subjects || [];
    const faculty: Array<{ id: string; name: string }> = [];

    for (const subject of subjects) {
      if (subject.faculty) {
        for (const f of subject.faculty) {
          if (!faculty.find(existing => existing.id === f.id)) {
            faculty.push({ id: f.id, name: f.name });
          }
        }
      }
    }

    return faculty;
  }

  private generateRoomSchedule(roomId: string, scheduleData: any): RoomSchedule {
    const subjects = scheduleData.subjects || [];
    const collegeTime = scheduleData.college_time || { startTime: '09:30', endTime: '16:30' };
    const breakPeriods = scheduleData.break_ || [];

    const schedule: any = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: []
    };

    // Generate time slots based on college time
    const timeSlots = this.generateTimeSlots(collegeTime.startTime, collegeTime.endTime, 50);

    for (const day of Object.keys(schedule)) {
      schedule[day] = timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, breakPeriods)
      }));
    }

    // Assign subjects to time slots (simplified scheduling)
    for (const subject of subjects) {
      if (subject.faculty && subject.faculty.length > 0) {
        const faculty = subject.faculty[0];
        for (const availability of faculty.availability) {
          const day = availability.day;
          if (schedule[day]) {
            // Find suitable time slot
            const suitableSlot = schedule[day].find((slot: any) => 
              !slot.subject && !slot.isBreak && 
              this.isTimeInRange(slot.startTime, availability.startTime, availability.endTime)
            );
            
            if (suitableSlot) {
              suitableSlot.subject = subject.name;
              suitableSlot.faculty = faculty.name;
              suitableSlot.room = roomId;
            }
          }
        }
      }
    }

    const utilization = this.calculateUtilization(schedule);
    const conflicts = this.countConflicts(schedule);

    return {
      roomId,
      schedule,
      utilization,
      conflicts
    };
  }

  private generateFacultySchedule(facultyId: string, facultyName: string, scheduleData: any): FacultySchedule {
    const subjects = scheduleData.subjects || [];
    const collegeTime = scheduleData.college_time || { startTime: '09:30', endTime: '16:30' };
    const breakPeriods = scheduleData.break_ || [];

    const schedule: any = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: []
    };

    // Generate time slots
    const timeSlots = this.generateTimeSlots(collegeTime.startTime, collegeTime.endTime, 50);

    for (const day of Object.keys(schedule)) {
      schedule[day] = timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, breakPeriods)
      }));
    }

    let teachingHours = 0;
    const facultySubjects: string[] = [];

    // Assign subjects taught by this faculty
    for (const subject of subjects) {
      if (subject.faculty) {
        const faculty = subject.faculty.find((f: any) => f.id === facultyId);
        if (faculty) {
          facultySubjects.push(subject.name);
          
          for (const availability of faculty.availability) {
            const day = availability.day;
            if (schedule[day]) {
              const suitableSlot = schedule[day].find((slot: any) => 
                !slot.subject && !slot.isBreak && 
                this.isTimeInRange(slot.startTime, availability.startTime, availability.endTime)
              );
              
              if (suitableSlot) {
                suitableSlot.subject = subject.name;
                suitableSlot.faculty = faculty.name;
                suitableSlot.room = 'TBD'; // Room assignment would be determined by scheduling algorithm
                teachingHours += subject.duration / 60; // Convert minutes to hours
              }
            }
          }
        }
      }
    }

    return {
      facultyId,
      name: facultyName,
      schedule,
      teachingHours: Math.round(teachingHours * 100) / 100,
      subjects: facultySubjects
    };
  }

  private generateTimeSlots(startTime: string, endTime: string, duration: number) {
    const slots = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    for (let current = start; current < end; current += duration) {
      slots.push({
        startTime: this.minutesToTime(current),
        endTime: this.minutesToTime(current + duration)
      });
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private isBreakTime(startTime: string, endTime: string, breakPeriods: any[]): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    return breakPeriods.some(breakPeriod => {
      const breakStart = this.timeToMinutes(breakPeriod.startTime);
      const breakEnd = this.timeToMinutes(breakPeriod.endTime);
      return start >= breakStart && end <= breakEnd;
    });
  }

  private isTimeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(rangeStart);
    const endMinutes = this.timeToMinutes(rangeEnd);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  private calculateUtilization(schedule: any): number {
    let totalSlots = 0;
    let occupiedSlots = 0;

    for (const day of Object.keys(schedule)) {
      for (const slot of schedule[day]) {
        if (!slot.isBreak) {
          totalSlots++;
          if (slot.subject) {
            occupiedSlots++;
          }
        }
      }
    }

    return totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
  }

  private countConflicts(schedule: any): number {
    // Simplified conflict detection
    return 0;
  }

  private async calculateRoomUtilization(rooms: string[]): Promise<Array<{ roomId: string; utilization: number }>> {
    const roomUtilization = [];
    
    for (const roomId of rooms) {
      const roomSchedule = await this.getRoomSchedule(roomId);
      roomUtilization.push({
        roomId,
        utilization: roomSchedule?.utilization || 0
      });
    }

    return roomUtilization;
  }

  private async detectConflicts(): Promise<number> {
    // Simplified conflict detection
    return 0;
  }

  private countActiveFaculty(subjects: any[]): number {
    const facultyIds = new Set();
    
    for (const subject of subjects) {
      if (subject.faculty) {
        for (const faculty of subject.faculty) {
          facultyIds.add(faculty.id);
        }
      }
    }

    return facultyIds.size;
  }

  private calculatePeakTime(subjects: any[]): string {
    // Simplified peak time calculation
    return '10:00-12:00';
  }

  private generateRecommendations(roomUtilization: any[], subjects: any[]): any[] {
    const recommendations = [];

    // Check for underutilized rooms
    const underutilizedRooms = roomUtilization.filter(room => room.utilization < 50);
    if (underutilizedRooms.length > 0) {
      recommendations.push({
        type: 'efficiency',
        title: 'Underutilized Rooms',
        description: `${underutilizedRooms.length} rooms have low utilization. Consider reassigning classes or reviewing schedule.`
      });
    }

    // Check for optimization opportunities
    const highUtilizationRooms = roomUtilization.filter(room => room.utilization > 90);
    if (highUtilizationRooms.length > 0) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Peak Hours',
        description: 'Some rooms are overutilized. Consider redistributing classes to balance load.'
      });
    }

    return recommendations;
  }
}

export const storage = new MemStorage();
