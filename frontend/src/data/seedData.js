/**
 * Comprehensive Initial Seed Data for Inclusive Smart Classroom Prototype
 * SIH PS ID: NRIIT-EDU-01
 */

export const INITIAL_USERS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 101,
      rollNumber: '21NR1A0501',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-A'
    }
  },
  {
    id: 2,
    name: 'Ananya Verma',
    email: 'ananya@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 102,
      rollNumber: '21NR1A0502',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-A'
    }
  },
  {
    id: 3,
    name: 'Vikram Reddy',
    email: 'vikram@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 103,
      rollNumber: '21NR1A0503',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-A'
    }
  },
  {
    id: 4,
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 104,
      rollNumber: '21NR1A0504',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-A'
    }
  },
  {
    id: 5,
    name: 'Karthik Rao',
    email: 'karthik@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 105,
      rollNumber: '21NR1A0505',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-B'
    }
  },
  {
    id: 6,
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    password: 'student123',
    role: 'student',
    studentProfile: {
      id: 106,
      rollNumber: '21NR1A0506',
      gradeLevel: '3rd Year B.Tech',
      section: 'CSE-B'
    }
  },
  {
    id: 7,
    name: 'Dr. A. Sharma',
    email: 'teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    teacherProfile: {
      id: 201,
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor'
    }
  },
  {
    id: 8,
    name: 'Prof. R. Verma',
    email: 'verma@example.com',
    password: 'teacher123',
    role: 'teacher',
    teacherProfile: {
      id: 202,
      department: 'Information Technology',
      designation: 'Assistant Professor'
    }
  },
  {
    id: 9,
    name: 'Dr. K. Patel',
    email: 'patel@example.com',
    password: 'teacher123',
    role: 'teacher',
    teacherProfile: {
      id: 203,
      department: 'AI & Data Science',
      designation: 'Professor'
    }
  },
  {
    id: 10,
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
];

export const INITIAL_SUBJECTS = [
  { id: 1, code: 'CS201', name: 'Data Structures', description: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs & Recursion' },
  { id: 2, code: 'CS202', name: 'Database Management Systems', description: 'Relational Model, SQL, Normalization, Transactions & Indexing' },
  { id: 3, code: 'CS203', name: 'Computer Networks', description: 'OSI Model, TCP/IP, Routing Algorithms & Network Security' },
  { id: 4, code: 'CS204', name: 'Operating Systems', description: 'Processes, Threads, CPU Scheduling, Memory Management & File Systems' },
  { id: 5, code: 'CS205', name: 'Web Development', description: 'HTML5, CSS3, JavaScript ES6+, React & RESTful APIs' }
];

export const INITIAL_CLASSROOMS = [
  { id: 1, roomNumber: 'Room 301', building: 'Academic Block A', capacity: 60, features: 'Interactive Smart Board, Audio System, Captions Screen' },
  { id: 2, roomNumber: 'Room 302', building: 'Academic Block A', capacity: 60, features: 'Dual Projector, High-Speed WiFi' },
  { id: 3, roomNumber: 'Room 303', building: 'Academic Block B', capacity: 50, features: 'Smart Display, High Contrast Lighting' },
  { id: 4, roomNumber: 'Lab 2', building: 'Technology Center', capacity: 40, features: '40 Workstations, High-Spec Dual Monitors' }
];

export const INITIAL_CLASSES = [
  { id: 1, subjectId: 1, teacherId: 201, classroomId: 1, name: 'Data Structures — CSE A', scheduleTime: 'Mon, Wed, Fri (09:00 AM - 10:00 AM)', academicTerm: 'Fall 2026' },
  { id: 2, subjectId: 2, teacherId: 202, classroomId: 2, name: 'Database Management — CSE A', scheduleTime: 'Tue, Thu (10:30 AM - 12:00 PM)', academicTerm: 'Fall 2026' },
  { id: 3, subjectId: 3, teacherId: 203, classroomId: 3, name: 'Computer Networks — CSE B', scheduleTime: 'Mon, Wed (02:00 PM - 03:30 PM)', academicTerm: 'Fall 2026' },
  { id: 4, subjectId: 4, teacherId: 201, classroomId: 4, name: 'Operating Systems — CSE A', scheduleTime: 'Tue, Fri (11:15 AM - 12:45 PM)', academicTerm: 'Fall 2026' }
];

export const INITIAL_ENROLLMENTS = [
  { id: 1, studentId: 101, classId: 1 },
  { id: 2, studentId: 101, classId: 2 },
  { id: 3, studentId: 101, classId: 4 },
  { id: 4, studentId: 102, classId: 1 },
  { id: 5, studentId: 102, classId: 2 },
  { id: 6, studentId: 103, classId: 1 },
  { id: 7, studentId: 104, classId: 1 },
  { id: 8, studentId: 105, classId: 3 },
  { id: 9, studentId: 106, classId: 3 }
];

export const INITIAL_HELP_REQUESTS = [
  { id: 1, studentId: 101, classId: 1, subjectId: 1, topic: 'Recursion', description: "I don't understand how recursive call stack unwinding works.", status: 'pending', createdAt: '2026-08-18T10:15:00Z' },
  { id: 2, studentId: 102, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Base cases in tree traversal recursion are confusing.', status: 'pending', createdAt: '2026-08-18T11:00:00Z' },
  { id: 3, studentId: 103, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Difference between direct and tail recursion.', status: 'pending', createdAt: '2026-08-18T14:20:00Z' },
  { id: 4, studentId: 104, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Need simple examples for tail call optimization.', status: 'pending', createdAt: '2026-08-18T16:05:00Z' },
  { id: 5, studentId: 105, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Memoization vs simple recursion.', status: 'pending', createdAt: '2026-08-19T08:30:00Z' },
  { id: 6, studentId: 106, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Stack overflow exception causes.', status: 'pending', createdAt: '2026-08-19T09:10:00Z' },
  { id: 7, studentId: 101, classId: 1, subjectId: 1, topic: 'Recursion', description: 'Revisiting recursive Fibonacci implementation.', status: 'pending', createdAt: '2026-08-19T09:45:00Z' },
  { id: 8, studentId: 102, classId: 1, subjectId: 1, topic: 'Linked Lists', description: 'Doubly linked list pointer updates.', status: 'pending', createdAt: '2026-08-17T12:00:00Z' },
  { id: 9, studentId: 103, classId: 1, subjectId: 1, topic: 'Linked Lists', description: 'Detecting cycles using Floyd algorithm.', status: 'pending', createdAt: '2026-08-17T15:30:00Z' },
  { id: 10, studentId: 104, classId: 1, subjectId: 1, topic: 'Linked Lists', description: 'Reversing a linked list recursively.', status: 'pending', createdAt: '2026-08-18T09:00:00Z' },
  { id: 11, studentId: 101, classId: 1, subjectId: 1, topic: 'Binary Trees', description: 'In-order traversal non-recursive implementation.', status: 'pending', createdAt: '2026-08-16T14:00:00Z' },
  { id: 12, studentId: 105, classId: 1, subjectId: 1, topic: 'Binary Trees', description: 'Binary Search Tree deletion cases.', status: 'pending', createdAt: '2026-08-17T11:20:00Z' },
  { id: 13, studentId: 106, classId: 1, subjectId: 1, topic: 'Binary Trees', description: 'Height balanced AVL trees insertion.', status: 'pending', createdAt: '2026-08-18T13:10:00Z' }
];

export const INITIAL_SUPPORT_SIGNALS = [
  {
    id: 1,
    studentId: 101,
    studentName: 'Rahul Sharma',
    classId: 1,
    className: 'Data Structures — CSE A',
    category: 'Classroom Engagement & Academic Trend',
    severity: 'medium',
    metricSummary: 'Observed a 30% drop in recent quiz performance and missed 2 recent classes. Student may benefit from class continuity package review and check-in.',
    disclaimer: 'This is an assistive signal, not a diagnosis.',
    status: 'active',
    createdAt: '2026-08-18T10:00:00Z'
  }
];

export const INITIAL_CONTINUITY_PACKAGES = [
  {
    id: 1,
    classId: 1,
    className: 'Data Structures — CSE A',
    teacherId: 201,
    teacherName: 'Dr. A. Sharma',
    title: 'Data Structures — Recursion',
    classDate: '2026-08-17',
    summaryNotes: 'We covered recursive functions, base cases vs recursive step, call stack behavior, and memory stack frames. Key emphasis on avoiding infinite recursion.',
    resources: [
      { id: 'r1', title: 'Recursion Call Stack Visualizer Guide (PDF)', url: 'https://example.com/resources/recursion-guide.pdf', type: 'notes' },
      { id: 'r2', title: 'Video Lecture: Understanding Call Stacks', url: 'https://example.com/resources/recursion-video', type: 'video' }
    ],
    assignment: 'Complete 3 recursion practice exercises on calculating factorial, Fibonacci sequence, and string reversal.',
    checklistTasks: [
      { id: 't1', title: 'Read lecture notes on Recursion & Call Stacks', type: 'reading' },
      { id: 't2', title: 'Review resource video (15 mins)', type: 'video' },
      { id: 't3', title: 'Complete 3 recursion practice exercises', type: 'assignment' },
      { id: 't4', title: 'Review key concepts & self-check base case logic', type: 'quiz' }
    ],
    createdAt: '2026-08-17T16:00:00Z'
  }
];

export const INITIAL_STUDENT_TASK_PROGRESS = [
  { studentId: 101, taskId: 't1', completed: true },
  { studentId: 101, taskId: 't2', completed: false },
  { studentId: 101, taskId: 't3', completed: false },
  { studentId: 101, taskId: 't4', completed: false }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    classId: 1,
    className: 'Data Structures — CSE A',
    teacherId: 201,
    teacherName: 'Dr. A. Sharma',
    title: 'Doubt Clarification Session on Recursion',
    content: 'We will hold an optional interactive doubt clarification session on Recursion and Tree Traversals this Friday at 4:00 PM in Room 301.',
    priority: 'important',
    createdAt: '2026-08-18T09:00:00Z'
  },
  {
    id: 2,
    classId: 2,
    className: 'Database Management — CSE A',
    teacherId: 202,
    teacherName: 'Prof. R. Verma',
    title: 'Lab Assignment 3 Published',
    content: 'Lab assignment 3 on ER Diagrams and Relational Algebra is now live in the Resources section. Due date is next Monday.',
    priority: 'normal',
    createdAt: '2026-08-17T11:30:00Z'
  }
];

export const INITIAL_RESOURCES = [
  {
    id: 1,
    classId: 1,
    className: 'Data Structures — CSE A',
    teacherId: 201,
    teacherName: 'Dr. A. Sharma',
    title: 'Interactive Recursion & Call Stack Cheatsheet',
    description: 'Visual diagram explaining memory stack frames during recursive execution.',
    resourceType: 'notes',
    url: 'https://example.com/resources/recursion-cheatsheet.pdf',
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 2,
    classId: 2,
    className: 'Database Management — CSE A',
    teacherId: 202,
    teacherName: 'Prof. R. Verma',
    title: 'SQL Normalization Quick Reference (1NF to 3NF)',
    description: 'Step-by-step examples for functional dependencies and BCNF conversion.',
    resourceType: 'slides',
    url: 'https://example.com/resources/sql-normalization.pdf',
    createdAt: '2026-08-16T14:20:00Z'
  }
];

export const INITIAL_PREFERENCES = {
  101: {
    studentId: 101,
    language: 'en',
    accessibilityNeeds: 'Captions & High Contrast Text',
    captioningEnabled: true,
    preferredFormat: 'visual',
    notes: 'Prefers step-by-step visual diagrams for algorithms.'
  }
};
