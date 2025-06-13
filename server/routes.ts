import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { storage } from "./storage";
import { 
  loginSchema, 
  signupSchema, 
  insertFacultySchema,
  insertSubjectSchema,
  insertRoomSchema,
  insertBreakSchema,
  insertCollegeTimeSchema,
  type ScheduleAPIRequest
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Session middleware
function setupSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.session?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserByUsername(decoded.username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = {
      _id: user._id!,
      username: user.username,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);

  // Create default admin user
  try {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      await storage.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created: admin / admin123');
    }

    const existingUser = await storage.getUserByUsername('user');
    if (!existingUser) {
      await storage.createUser({
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Default user created: user / user123');
    }
  } catch (error) {
    console.log('Default users may already exist');
  }

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.session!.token = token;
      
      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await storage.createUser({
        ...userData,
        role: 'user'
      });

      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.session!.token = token;

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  // Faculty routes
  app.get('/api/faculty', authenticate, async (req, res) => {
    try {
      const faculty = await storage.getAllFaculty();
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch faculty' });
    }
  });

  app.post('/api/faculty', authenticate, requireAdmin, async (req, res) => {
    try {
      const facultyData = insertFacultySchema.parse(req.body);
      const faculty = await storage.createFaculty(facultyData);
      res.status(201).json(faculty);
    } catch (error) {
      res.status(400).json({ message: 'Invalid faculty data' });
    }
  });

  app.put('/api/faculty/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const facultyData = insertFacultySchema.partial().parse(req.body);
      const faculty = await storage.updateFaculty(req.params.id, facultyData);
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ message: 'Invalid faculty data' });
    }
  });

  app.delete('/api/faculty/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteFaculty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete faculty' });
    }
  });

  // Subject routes
  app.get('/api/subjects', authenticate, async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch subjects' });
    }
  });

  app.post('/api/subjects', authenticate, requireAdmin, async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ message: 'Invalid subject data' });
    }
  });

  app.put('/api/subjects/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(req.params.id, subjectData);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      res.json(subject);
    } catch (error) {
      res.status(400).json({ message: 'Invalid subject data' });
    }
  });

  app.delete('/api/subjects/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSubject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete subject' });
    }
  });

  // Room routes
  app.get('/api/rooms', authenticate, async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });

  app.post('/api/rooms', authenticate, requireAdmin, async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: 'Invalid room data' });
    }
  });

  app.put('/api/rooms/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(req.params.id, roomData);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: 'Invalid room data' });
    }
  });

  app.delete('/api/rooms/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete room' });
    }
  });

  // Break routes
  app.get('/api/breaks', authenticate, async (req, res) => {
    try {
      const breaks = await storage.getAllBreaks();
      res.json(breaks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch breaks' });
    }
  });

  app.post('/api/breaks', authenticate, requireAdmin, async (req, res) => {
    try {
      const breakData = insertBreakSchema.parse(req.body);
      const breakPeriod = await storage.createBreak(breakData);
      res.status(201).json(breakPeriod);
    } catch (error) {
      res.status(400).json({ message: 'Invalid break data' });
    }
  });

  app.put('/api/breaks/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const breakData = insertBreakSchema.partial().parse(req.body);
      const breakPeriod = await storage.updateBreak(req.params.id, breakData);
      if (!breakPeriod) {
        return res.status(404).json({ message: 'Break not found' });
      }
      res.json(breakPeriod);
    } catch (error) {
      res.status(400).json({ message: 'Invalid break data' });
    }
  });

  app.delete('/api/breaks/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBreak(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Break not found' });
      }
      res.json({ message: 'Break deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete break' });
    }
  });

  // College time routes
  app.get('/api/college-time', authenticate, async (req, res) => {
    try {
      const collegeTime = await storage.getCollegeTime();
      res.json(collegeTime);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch college time' });
    }
  });

  app.post('/api/college-time', authenticate, requireAdmin, async (req, res) => {
    try {
      const collegeTimeData = insertCollegeTimeSchema.parse(req.body);
      const collegeTime = await storage.setCollegeTime(collegeTimeData);
      res.json(collegeTime);
    } catch (error) {
      res.status(400).json({ message: 'Invalid college time data' });
    }
  });

  // Schedule generation route
  app.post('/api/generate-schedule', authenticate, requireAdmin, async (req, res) => {
    try {
      const scheduleRequest: ScheduleAPIRequest = req.body;
      
      // Call external scheduler API
      const response = await fetch('http://127.0.0.1:8000/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleRequest)
      });

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const generatedSchedule = await response.json();
      
      // Save the generated schedule
      await storage.saveGeneratedSchedule('latest', generatedSchedule);
      
      res.json(generatedSchedule);
    } catch (error) {
      console.error('Schedule generation error:', error);
      res.status(500).json({ 
        message: 'Failed to generate schedule. Make sure the external scheduler API is running.' 
      });
    }
  });

  // Get generated schedules
  app.get('/api/schedules', authenticate, async (req, res) => {
    try {
      const schedules = await storage.getAllGeneratedSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch schedules' });
    }
  });

  app.get('/api/schedules/:name', authenticate, async (req, res) => {
    try {
      const schedule = await storage.getGeneratedSchedule(req.params.name);
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch schedule' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}