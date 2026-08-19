import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSROOMS,
  INITIAL_CLASSES,
  INITIAL_ENROLLMENTS,
  INITIAL_HELP_REQUESTS,
  INITIAL_SUPPORT_SIGNALS,
  INITIAL_CONTINUITY_PACKAGES,
  INITIAL_STUDENT_TASK_PROGRESS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_RESOURCES,
  INITIAL_PREFERENCES
} from '../data/seedData';

const KEYS = {
  USERS: 'smartclassroom_users',
  SUBJECTS: 'smartclassroom_subjects',
  ROOMS: 'smartclassroom_rooms',
  CLASSES: 'smartclassroom_classes',
  ENROLLMENTS: 'smartclassroom_enrollments',
  HELP_REQUESTS: 'smartclassroom_help_requests',
  SUPPORT_SIGNALS: 'smartclassroom_support_signals',
  CONTINUITY_PACKAGES: 'smartclassroom_continuity_packages',
  TASK_PROGRESS: 'smartclassroom_task_progress',
  ANNOUNCEMENTS: 'smartclassroom_announcements',
  RESOURCES: 'smartclassroom_resources',
  PREFERENCES: 'smartclassroom_preferences',
  SESSION: 'smartclassroom_session'
};

// Initialize Storage with Seed Data if Empty
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.SUBJECTS)) {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  }
  if (!localStorage.getItem(KEYS.ROOMS)) {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_CLASSROOMS));
  }
  if (!localStorage.getItem(KEYS.CLASSES)) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(KEYS.ENROLLMENTS)) {
    localStorage.setItem(KEYS.ENROLLMENTS, JSON.stringify(INITIAL_ENROLLMENTS));
  }
  if (!localStorage.getItem(KEYS.HELP_REQUESTS)) {
    localStorage.setItem(KEYS.HELP_REQUESTS, JSON.stringify(INITIAL_HELP_REQUESTS));
  }
  if (!localStorage.getItem(KEYS.SUPPORT_SIGNALS)) {
    localStorage.setItem(KEYS.SUPPORT_SIGNALS, JSON.stringify(INITIAL_SUPPORT_SIGNALS));
  }
  if (!localStorage.getItem(KEYS.CONTINUITY_PACKAGES)) {
    localStorage.setItem(KEYS.CONTINUITY_PACKAGES, JSON.stringify(INITIAL_CONTINUITY_PACKAGES));
  }
  if (!localStorage.getItem(KEYS.TASK_PROGRESS)) {
    localStorage.setItem(KEYS.TASK_PROGRESS, JSON.stringify(INITIAL_STUDENT_TASK_PROGRESS));
  }
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(KEYS.RESOURCES)) {
    localStorage.setItem(KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
  }
  if (!localStorage.getItem(KEYS.PREFERENCES)) {
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(INITIAL_PREFERENCES));
  }
};

// Run initialization immediately upon module import
initStorage();

// Generic Helpers
const getItem = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultVal;
  }
};

const setItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error setting ${key} in localStorage:`, err);
  }
};

// ----------------------------------------------------
// AUTH & USERS
// ----------------------------------------------------
export const mockAuthService = {
  login: async (email, password, role) => {
    const users = getItem(KEYS.USERS, []);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!found) {
      throw new Error('Invalid email or password.');
    }

    if (role && found.role !== role) {
      throw new Error(`Account exists but is registered as a ${found.role}, not a ${role}.`);
    }

    const session = {
      token: `mock-jwt-token-${found.id}-${Date.now()}`,
      user: found
    };

    setItem(KEYS.SESSION, session);
    localStorage.setItem('sih_token', session.token);
    localStorage.setItem('sih_user', JSON.stringify(found));

    return session;
  },

  getCurrentUser: async () => {
    const saved = localStorage.getItem('sih_user');
    return saved ? JSON.parse(saved) : null;
  },

  logout: () => {
    localStorage.removeItem(KEYS.SESSION);
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_user');
  }
};

// ----------------------------------------------------
// USERS CRUD
// ----------------------------------------------------
export const getUsers = () => getItem(KEYS.USERS, []);

export const addUser = (userData) => {
  const users = getUsers();
  const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

  let studentProfile = null;
  let teacherProfile = null;

  if (userData.role === 'student') {
    studentProfile = {
      id: 100 + newId,
      rollNumber: userData.rollNumber || `21NR1A05${10 + newId}`,
      gradeLevel: userData.gradeLevel || '3rd Year B.Tech',
      section: userData.section || 'CSE-A'
    };
  } else if (userData.role === 'teacher') {
    teacherProfile = {
      id: 200 + newId,
      department: userData.department || 'Computer Science & Engineering',
      designation: userData.designation || 'Assistant Professor'
    };
  }

  const newUser = {
    id: newId,
    name: userData.name,
    email: userData.email,
    password: userData.password || 'password123',
    role: userData.role,
    studentProfile,
    teacherProfile
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  return newUser;
};

export const deleteUser = (userId) => {
  const users = getUsers().filter((u) => u.id !== userId);
  setItem(KEYS.USERS, users);
};

// ----------------------------------------------------
// SUBJECTS CRUD
// ----------------------------------------------------
export const getSubjects = () => getItem(KEYS.SUBJECTS, []);

export const addSubject = (subjectData) => {
  const subjects = getSubjects();
  const newId = subjects.length > 0 ? Math.max(...subjects.map((s) => s.id)) + 1 : 1;
  const newSub = { id: newId, ...subjectData };
  subjects.push(newSub);
  setItem(KEYS.SUBJECTS, subjects);
  return newSub;
};

export const deleteSubject = (id) => {
  const subjects = getSubjects().filter((s) => s.id !== id);
  setItem(KEYS.SUBJECTS, subjects);
};

// ----------------------------------------------------
// CLASSROOMS CRUD
// ----------------------------------------------------
export const getClassrooms = () => getItem(KEYS.ROOMS, []);

export const addClassroom = (roomData) => {
  const rooms = getClassrooms();
  const newId = rooms.length > 0 ? Math.max(...rooms.map((r) => r.id)) + 1 : 1;
  const newRoom = { id: newId, ...roomData };
  rooms.push(newRoom);
  setItem(KEYS.ROOMS, rooms);
  return newRoom;
};

export const deleteClassroom = (id) => {
  const rooms = getClassrooms().filter((r) => r.id !== id);
  setItem(KEYS.ROOMS, rooms);
};

// ----------------------------------------------------
// CLASSES CRUD
// ----------------------------------------------------
export const getClasses = () => getItem(KEYS.CLASSES, []);

export const addClass = (classData) => {
  const classes = getClasses();
  const newId = classes.length > 0 ? Math.max(...classes.map((c) => c.id)) + 1 : 1;
  const newClass = { id: newId, ...classData };
  classes.push(newClass);
  setItem(KEYS.CLASSES, classes);
  return newClass;
};

export const deleteClass = (id) => {
  const classes = getClasses().filter((c) => c.id !== id);
  setItem(KEYS.CLASSES, classes);
};

// ----------------------------------------------------
// HELP REQUESTS & AGGREGATED INSIGHTS
// ----------------------------------------------------
export const getHelpRequests = () => getItem(KEYS.HELP_REQUESTS, []);

export const addHelpRequest = (requestData) => {
  const requests = getHelpRequests();
  const newId = requests.length > 0 ? Math.max(...requests.map((r) => r.id)) + 1 : 1;
  const newReq = {
    id: newId,
    studentId: requestData.studentId || 101,
    classId: requestData.classId || 1,
    subjectId: parseInt(requestData.subjectId, 10) || 1,
    topic: requestData.topic,
    description: requestData.description || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  requests.push(newReq);
  setItem(KEYS.HELP_REQUESTS, requests);
  return newReq;
};

export const getAggregatedHelpInsights = () => {
  const requests = getHelpRequests();
  const topicCounts = {};

  requests.forEach((req) => {
    const topicKey = req.topic || 'General Clarification';
    if (!topicCounts[topicKey]) {
      topicCounts[topicKey] = {
        topic: topicKey,
        count: 0,
        subjectId: req.subjectId,
        recentTrend: 'High priority topic requested by students'
      };
    }
    topicCounts[topicKey].count += 1;
  });

  return Object.values(topicCounts).sort((a, b) => b.count - a.count);
};

// ----------------------------------------------------
// SUPPORT SIGNALS
// ----------------------------------------------------
export const getSupportSignals = () => getItem(KEYS.SUPPORT_SIGNALS, []);

// ----------------------------------------------------
// CLASS CONTINUITY PACKAGES & PROGRESS
// ----------------------------------------------------
export const getContinuityPackages = () => getItem(KEYS.CONTINUITY_PACKAGES, []);

export const addContinuityPackage = (packageData) => {
  const packages = getContinuityPackages();
  const newId = packages.length > 0 ? Math.max(...packages.map((p) => p.id)) + 1 : 1;

  const newPkg = {
    id: newId,
    classId: packageData.classId || 1,
    className: packageData.className || 'Data Structures — CSE A',
    teacherId: packageData.teacherId || 201,
    teacherName: packageData.teacherName || 'Dr. A. Sharma',
    title: packageData.title,
    classDate: packageData.classDate || new Date().toISOString().split('T')[0],
    summaryNotes: packageData.summaryNotes,
    resources: packageData.resources || [],
    assignment: packageData.assignment || '',
    checklistTasks: packageData.checklistTasks || [
      { id: 't1', title: 'Read lecture notes', type: 'reading' },
      { id: 't2', title: 'Review resource', type: 'video' },
      { id: 't3', title: 'Complete assignment', type: 'assignment' },
      { id: 't4', title: 'Review key concepts', type: 'quiz' }
    ],
    createdAt: new Date().toISOString()
  };

  packages.unshift(newPkg);
  setItem(KEYS.CONTINUITY_PACKAGES, packages);
  return newPkg;
};

export const deleteContinuityPackage = (packageId) => {
  const packages = getContinuityPackages().filter((p) => p.id !== packageId);
  setItem(KEYS.CONTINUITY_PACKAGES, packages);
};

export const getStudentTaskProgress = (studentId) => {
  const allProgress = getItem(KEYS.TASK_PROGRESS, []);
  return allProgress.filter((p) => p.studentId === studentId);
};

export const toggleTaskProgress = (studentId, taskId) => {
  let allProgress = getItem(KEYS.TASK_PROGRESS, []);
  const existing = allProgress.find((p) => p.studentId === studentId && p.taskId === taskId);

  if (existing) {
    existing.completed = !existing.completed;
  } else {
    allProgress.push({ studentId, taskId, completed: true });
  }

  setItem(KEYS.TASK_PROGRESS, allProgress);
  return allProgress.filter((p) => p.studentId === studentId);
};

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------
export const getAnnouncements = () => getItem(KEYS.ANNOUNCEMENTS, []);

export const addAnnouncement = (announcementData) => {
  const announcements = getAnnouncements();
  const newId = announcements.length > 0 ? Math.max(...announcements.map((a) => a.id)) + 1 : 1;

  const newAnn = {
    id: newId,
    classId: announcementData.classId || 1,
    className: announcementData.className || 'Data Structures — CSE A',
    teacherId: announcementData.teacherId || 201,
    teacherName: announcementData.teacherName || 'Dr. A. Sharma',
    title: announcementData.title,
    content: announcementData.content,
    priority: announcementData.priority || 'normal',
    createdAt: new Date().toISOString()
  };

  announcements.unshift(newAnn);
  setItem(KEYS.ANNOUNCEMENTS, announcements);
  return newAnn;
};

export const deleteAnnouncement = (id) => {
  const announcements = getAnnouncements().filter((a) => a.id !== id);
  setItem(KEYS.ANNOUNCEMENTS, announcements);
};

// ----------------------------------------------------
// RESOURCES
// ----------------------------------------------------
export const getResources = () => getItem(KEYS.RESOURCES, []);

export const addResource = (resourceData) => {
  const resources = getResources();
  const newId = resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1;

  const newRes = {
    id: newId,
    classId: resourceData.classId || 1,
    className: resourceData.className || 'Data Structures — CSE A',
    teacherId: resourceData.teacherId || 201,
    teacherName: resourceData.teacherName || 'Dr. A. Sharma',
    title: resourceData.title,
    description: resourceData.description || '',
    resourceType: resourceData.resourceType || 'notes',
    url: resourceData.url || '#',
    createdAt: new Date().toISOString()
  };

  resources.unshift(newRes);
  setItem(KEYS.RESOURCES, resources);
  return newRes;
};

export const deleteResource = (id) => {
  const resources = getResources().filter((r) => r.id !== id);
  setItem(KEYS.RESOURCES, resources);
};

// ----------------------------------------------------
// PREFERENCES
// ----------------------------------------------------
export const getStudentPreferences = (studentId) => {
  const allPrefs = getItem(KEYS.PREFERENCES, {});
  return allPrefs[studentId] || {
    studentId,
    language: 'en',
    accessibilityNeeds: 'Standard',
    captioningEnabled: false,
    preferredFormat: 'visual',
    notes: ''
  };
};

export const saveStudentPreferences = (studentId, prefs) => {
  const allPrefs = getItem(KEYS.PREFERENCES, {});
  allPrefs[studentId] = { ...prefs, studentId };
  setItem(KEYS.PREFERENCES, allPrefs);
  return allPrefs[studentId];
};

// ----------------------------------------------------
// DEMO RESET
// ----------------------------------------------------
export const resetDemoData = () => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_CLASSROOMS));
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(KEYS.ENROLLMENTS, JSON.stringify(INITIAL_ENROLLMENTS));
  localStorage.setItem(KEYS.HELP_REQUESTS, JSON.stringify(INITIAL_HELP_REQUESTS));
  localStorage.setItem(KEYS.SUPPORT_SIGNALS, JSON.stringify(INITIAL_SUPPORT_SIGNALS));
  localStorage.setItem(KEYS.CONTINUITY_PACKAGES, JSON.stringify(INITIAL_CONTINUITY_PACKAGES));
  localStorage.setItem(KEYS.TASK_PROGRESS, JSON.stringify(INITIAL_STUDENT_TASK_PROGRESS));
  localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  localStorage.setItem(KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(INITIAL_PREFERENCES));
  return true;
};
