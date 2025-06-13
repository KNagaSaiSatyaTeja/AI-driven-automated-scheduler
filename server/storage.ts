import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './database';
import type { 
  User,
  InsertUser,
  FacultyRecord,
  InsertFaculty,
  SubjectRecord,
  InsertSubject,
  Room,
  InsertRoom,
  Break,
  InsertBreak,
  CollegeTimeRecord,
  InsertCollegeTime,
  GeneratedSchedule,
  Schedule, 
  InsertSchedule, 
  RoomSchedule, 
  FacultySchedule, 
  ScheduleInsights 
} from '@shared/schema';

// MongoDB Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const FacultySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  no_of_classes_per_week: { type: Number, required: true },
  facultyId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const BreakSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CollegeTimeSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ScheduleSchema = new mongoose.Schema({
  college_time: {
    startTime: String,
    endTime: String
  },
  break_periods: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  rooms: [String],
  subjects: [{
    name: String,
    duration: Number,
    time: Number,
    no_of_classes_per_week: Number,
    faculty: [{
      id: String,
      name: String,
      availability: [{
        day: String,
        startTime: String,
        endTime: String
      }]
    }]
  }],
  created_at: { type: String, default: () => new Date().toISOString() }
});

const GeneratedScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scheduleData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Avoid model recompilation errors
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const FacultyModel = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const RoomModel = mongoose.models.Room || mongoose.model('Room', RoomSchema);
export const BreakModel = mongoose.models.Break || mongoose.model('Break', BreakSchema);
export const CollegeTimeModel = mongoose.models.CollegeTime || mongoose.model('CollegeTime', CollegeTimeSchema);
export const ScheduleModel = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
export const GeneratedScheduleModel = mongoose.models.GeneratedSchedule || mongoose.model('GeneratedSchedule', GeneratedScheduleSchema);

export interface IStorage {
  // Authentication
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Faculty management
  getAllFaculty(): Promise<FacultyRecord[]>;
  createFaculty(faculty: InsertFaculty): Promise<FacultyRecord>;
  updateFaculty(id: string, faculty: Partial<InsertFaculty>): Promise<FacultyRecord | undefined>;
  deleteFaculty(id: string): Promise<boolean>;
  
  // Subject management
  getAllSubjects(): Promise<SubjectRecord[]>;
  createSubject(subject: InsertSubject): Promise<SubjectRecord>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<SubjectRecord | undefined>;
  deleteSubject(id: string): Promise<boolean>;
  
  // Room management
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
  
  // Break management
  getAllBreaks(): Promise<Break[]>;
  createBreak(breakPeriod: InsertBreak): Promise<Break>;
  updateBreak(id: string, breakPeriod: Partial<InsertBreak>): Promise<Break | undefined>;
  deleteBreak(id: string): Promise<boolean>;
  
  // College time management
  getCollegeTime(): Promise<CollegeTimeRecord | undefined>;
  setCollegeTime(collegeTime: InsertCollegeTime): Promise<CollegeTimeRecord>;
  
  // Generated schedules
  saveGeneratedSchedule(name: string, scheduleData: GeneratedSchedule): Promise<void>;
  getGeneratedSchedule(name: string): Promise<GeneratedSchedule | undefined>;
  getAllGeneratedSchedules(): Promise<Array<{name: string; createdAt: Date}>>;
  
  // Legacy methods for existing functionality
  getSchedule(): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined>;
  getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined>;
  getInsights(): Promise<ScheduleInsights>;
}

export class MongoStorage implements IStorage {
  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    await connectToDatabase();
  }

  // Authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    await connectToDatabase();
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return undefined;
    
    return {
      _id: (user as any)._id.toString(),
      username: (user as any).username,
      email: (user as any).email,
      password: (user as any).password,
      role: (user as any).role as 'admin' | 'user',
      createdAt: (user as any).createdAt
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await connectToDatabase();
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return undefined;
    
    return {
      _id: (user as any)._id.toString(),
      username: (user as any).username,
      email: (user as any).email,
      password: (user as any).password,
      role: (user as any).role as 'admin' | 'user',
      createdAt: (user as any).createdAt
    };
  }

  async createUser(user: InsertUser): Promise<User> {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newUser = new UserModel({
      ...user,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    return {
      _id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      password: savedUser.password,
      role: savedUser.role as 'admin' | 'user',
      createdAt: savedUser.createdAt
    };
  }

  // Faculty methods
  async getAllFaculty(): Promise<FacultyRecord[]> {
    await connectToDatabase();
    const faculty = await FacultyModel.find().lean();
    return faculty.map((f: any) => ({
      _id: f._id.toString(),
      id: f.id,
      name: f.name,
      availability: f.availability.map((a: any) => ({
        day: a.day || '',
        startTime: a.startTime || '',
        endTime: a.endTime || ''
      })),
      createdAt: f.createdAt
    }));
  }

  async createFaculty(faculty: InsertFaculty): Promise<FacultyRecord> {
    await connectToDatabase();
    const newFaculty = new FacultyModel(faculty);
    const saved = await newFaculty.save();
    return {
      _id: saved._id.toString(),
      id: saved.id,
      name: saved.name,
      availability: saved.availability.map((a: any) => ({
        day: a.day || '',
        startTime: a.startTime || '',
        endTime: a.endTime || ''
      })),
      createdAt: saved.createdAt
    };
  }

  async updateFaculty(id: string, faculty: Partial<InsertFaculty>): Promise<FacultyRecord | undefined> {
    await connectToDatabase();
    const updated = await FacultyModel.findOneAndUpdate({ id }, faculty, { new: true }).lean();
    if (!updated) return undefined;
    
    const updatedDoc = updated as any;
    return {
      _id: updatedDoc._id.toString(),
      id: updatedDoc.id,
      name: updatedDoc.name,
      availability: updatedDoc.availability.map((a: any) => ({
        day: a.day || '',
        startTime: a.startTime || '',
        endTime: a.endTime || ''
      })),
      createdAt: updatedDoc.createdAt
    };
  }

  async deleteFaculty(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await FacultyModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Subject methods
  async getAllSubjects(): Promise<SubjectRecord[]> {
    await connectToDatabase();
    const subjects = await SubjectModel.find().lean();
    return subjects.map((s: any) => ({
      _id: s._id.toString(),
      name: s.name,
      duration: s.duration,
      no_of_classes_per_week: s.no_of_classes_per_week,
      facultyId: s.facultyId,
      createdAt: s.createdAt
    }));
  }

  async createSubject(subject: InsertSubject): Promise<SubjectRecord> {
    await connectToDatabase();
    const newSubject = new SubjectModel(subject);
    const saved = await newSubject.save();
    return {
      _id: saved._id.toString(),
      name: saved.name,
      duration: saved.duration,
      no_of_classes_per_week: saved.no_of_classes_per_week,
      facultyId: saved.facultyId,
      createdAt: saved.createdAt
    };
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<SubjectRecord | undefined> {
    await connectToDatabase();
    const updated = await SubjectModel.findByIdAndUpdate(id, subject, { new: true }).lean();
    if (!updated) return undefined;
    
    return {
      _id: updated._id.toString(),
      name: updated.name,
      duration: updated.duration,
      no_of_classes_per_week: updated.no_of_classes_per_week,
      facultyId: updated.facultyId,
      createdAt: updated.createdAt
    };
  }

  async deleteSubject(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await SubjectModel.findByIdAndDelete(id);
    return !!result;
  }

  // Room methods
  async getAllRooms(): Promise<Room[]> {
    await connectToDatabase();
    const rooms = await RoomModel.find().lean();
    return rooms.map(r => ({
      _id: r._id.toString(),
      id: r.id,
      name: r.name,
      capacity: r.capacity || undefined,
      createdAt: r.createdAt
    }));
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    await connectToDatabase();
    const newRoom = new RoomModel(room);
    const saved = await newRoom.save();
    return {
      _id: saved._id.toString(),
      id: saved.id,
      name: saved.name,
      capacity: saved.capacity,
      createdAt: saved.createdAt
    };
  }

  async updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room | undefined> {
    await connectToDatabase();
    const updated = await RoomModel.findOneAndUpdate({ id }, room, { new: true }).lean();
    if (!updated) return undefined;
    
    return {
      _id: updated._id.toString(),
      id: updated.id,
      name: updated.name,
      capacity: updated.capacity,
      createdAt: updated.createdAt
    };
  }

  async deleteRoom(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await RoomModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Break methods
  async getAllBreaks(): Promise<Break[]> {
    await connectToDatabase();
    const breaks = await BreakModel.find().lean();
    return breaks.map(b => ({
      _id: b._id.toString(),
      day: b.day,
      startTime: b.startTime,
      endTime: b.endTime,
      createdAt: b.createdAt
    }));
  }

  async createBreak(breakPeriod: InsertBreak): Promise<Break> {
    await connectToDatabase();
    const newBreak = new BreakModel(breakPeriod);
    const saved = await newBreak.save();
    return {
      _id: saved._id.toString(),
      day: saved.day,
      startTime: saved.startTime,
      endTime: saved.endTime,
      createdAt: saved.createdAt
    };
  }

  async updateBreak(id: string, breakPeriod: Partial<InsertBreak>): Promise<Break | undefined> {
    await connectToDatabase();
    const updated = await BreakModel.findByIdAndUpdate(id, breakPeriod, { new: true }).lean();
    if (!updated) return undefined;
    
    return {
      _id: updated._id.toString(),
      day: updated.day,
      startTime: updated.startTime,
      endTime: updated.endTime,
      createdAt: updated.createdAt
    };
  }

  async deleteBreak(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await BreakModel.findByIdAndDelete(id);
    return !!result;
  }

  // College time methods
  async getCollegeTime(): Promise<CollegeTimeRecord | undefined> {
    await connectToDatabase();
    const collegeTime = await CollegeTimeModel.findOne().lean();
    if (!collegeTime) return undefined;
    
    return {
      _id: collegeTime._id.toString(),
      startTime: collegeTime.startTime,
      endTime: collegeTime.endTime,
      createdAt: collegeTime.createdAt
    };
  }

  async setCollegeTime(collegeTime: InsertCollegeTime): Promise<CollegeTimeRecord> {
    await connectToDatabase();
    await CollegeTimeModel.deleteMany({});
    const newCollegeTime = new CollegeTimeModel(collegeTime);
    const saved = await newCollegeTime.save();
    return {
      _id: saved._id.toString(),
      startTime: saved.startTime,
      endTime: saved.endTime,
      createdAt: saved.createdAt
    };
  }

  // Generated schedule methods
  async saveGeneratedSchedule(name: string, scheduleData: GeneratedSchedule): Promise<void> {
    await connectToDatabase();
    await GeneratedScheduleModel.findOneAndUpdate(
      { name },
      { name, scheduleData },
      { upsert: true }
    );
  }

  async getGeneratedSchedule(name: string): Promise<GeneratedSchedule | undefined> {
    await connectToDatabase();
    const schedule = await GeneratedScheduleModel.findOne({ name }).lean();
    if (!schedule) return undefined;
    return schedule.scheduleData;
  }

  async getAllGeneratedSchedules(): Promise<Array<{name: string; createdAt: Date}>> {
    await connectToDatabase();
    const schedules = await GeneratedScheduleModel.find({}, { name: 1, createdAt: 1 }).lean();
    return schedules.map(s => ({ name: s.name, createdAt: s.createdAt }));
  }

  // Legacy methods (keeping existing functionality)
  async getSchedule(): Promise<Schedule | undefined> {
    await connectToDatabase();
    const schedule = await ScheduleModel.findOne().sort({ created_at: -1 }).lean();
    if (!schedule || !schedule.college_time || !schedule.break_periods || !schedule.rooms || !schedule.subjects) {
      return undefined;
    }
    
    return {
      _id: schedule._id.toString(),
      college_time: schedule.college_time as { startTime: string; endTime: string; },
      break_periods: schedule.break_periods as any[],
      rooms: schedule.rooms as string[],
      subjects: schedule.subjects as any[],
      created_at: schedule.created_at?.toString(),
    };
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    await connectToDatabase();
    await ScheduleModel.deleteMany({});
    
    const newSchedule = new ScheduleModel({
      ...insertSchedule,
      created_at: new Date().toISOString(),
    });
    
    const savedSchedule = await newSchedule.save();
    return {
      _id: savedSchedule._id.toString(),
      college_time: savedSchedule.college_time as { startTime: string; endTime: string; },
      break_periods: savedSchedule.break_periods as any[],
      rooms: savedSchedule.rooms as string[],
      subjects: savedSchedule.subjects as any[],
      created_at: savedSchedule.created_at,
    };
  }

  async updateSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    return this.createSchedule(insertSchedule);
  }

  async getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined> {
    const schedule = await this.getSchedule();
    if (!schedule) return undefined;
    
    return this.generateRoomSchedule(roomId, schedule);
  }

  async getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined> {
    const schedule = await this.getSchedule();
    if (!schedule) return undefined;
    
    const faculty = schedule.subjects
      .flatMap(s => s.faculty)
      .find(f => f.id === facultyId);
    
    if (!faculty) return undefined;
    
    return this.generateFacultySchedule(facultyId, faculty.name, schedule);
  }

  async getInsights(): Promise<ScheduleInsights> {
    const schedule = await this.getSchedule();
    if (!schedule) {
      return {
        avgUtilization: 0,
        conflicts: 0,
        peakTime: "N/A",
        activeFaculty: 0,
        roomUtilization: [],
        recommendations: []
      };
    }

    const rooms = schedule.rooms;
    const subjects = schedule.subjects;
    
    return {
      avgUtilization: this.calculateUtilization(schedule),
      conflicts: this.countConflicts(schedule),
      peakTime: this.calculatePeakTime(subjects),
      activeFaculty: this.countActiveFaculty(subjects),
      roomUtilization: await this.calculateRoomUtilization(rooms),
      recommendations: this.generateRecommendations([], subjects)
    };
  }

  // Helper methods (keeping existing implementation)
  private generateRoomSchedule(roomId: string, scheduleData: any): RoomSchedule {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule: any = {};
    
    days.forEach(day => {
      schedule[day] = this.generateTimeSlots(
        scheduleData.college_time.startTime,
        scheduleData.college_time.endTime,
        50
      ).map(slot => ({
        ...slot,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, scheduleData.break_periods)
      }));
    });

    return {
      roomId,
      schedule,
      utilization: this.calculateUtilization(scheduleData),
      conflicts: this.countConflicts(scheduleData)
    };
  }

  private generateFacultySchedule(facultyId: string, facultyName: string, scheduleData: any): FacultySchedule {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule: any = {};
    
    days.forEach(day => {
      schedule[day] = this.generateTimeSlots(
        scheduleData.college_time.startTime,
        scheduleData.college_time.endTime,
        50
      ).map(slot => ({
        ...slot,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, scheduleData.break_periods)
      }));
    });

    const facultySubjects = scheduleData.subjects
      .filter((s: any) => s.faculty.some((f: any) => f.id === facultyId))
      .map((s: any) => s.name);

    return {
      facultyId,
      name: facultyName,
      schedule,
      teachingHours: facultySubjects.reduce((total: number, _: any) => total + 4, 0),
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
    return breakPeriods.some(bp => 
      this.isTimeInRange(startTime, bp.startTime, bp.endTime) ||
      this.isTimeInRange(endTime, bp.startTime, bp.endTime)
    );
  }

  private isTimeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(rangeStart);
    const endMinutes = this.timeToMinutes(rangeEnd);
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  private calculateUtilization(schedule: any): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  }

  private countConflicts(schedule: any): number {
    return Math.floor(Math.random() * 5); // 0-4 conflicts
  }

  private async calculateRoomUtilization(rooms: string[]): Promise<Array<{ roomId: string; utilization: number }>> {
    return rooms.map(roomId => ({
      roomId,
      utilization: Math.floor(Math.random() * 40) + 60
    }));
  }

  private async detectConflicts(): Promise<number> {
    return Math.floor(Math.random() * 5);
  }

  private countActiveFaculty(subjects: any[]): number {
    const facultyIds = new Set();
    subjects.forEach(subject => {
      subject.faculty.forEach((f: any) => facultyIds.add(f.id));
    });
    return facultyIds.size;
  }

  private calculatePeakTime(subjects: any[]): string {
    const peakTimes = ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
    return peakTimes[Math.floor(Math.random() * peakTimes.length)];
  }

  private generateRecommendations(roomUtilization: any[], subjects: any[]): any[] {
    return [
      {
        type: 'optimization',
        title: 'Optimize Room Usage',
        description: 'Consider redistributing classes to balance room utilization'
      },
      {
        type: 'workload',
        title: 'Faculty Workload Balance',
        description: 'Review faculty schedules to ensure balanced teaching loads'
      }
    ];
  }
}

export const storage = new MongoStorage();