-- Schema SQL for Inclusive Smart Classroom Platform (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  grade_level TEXT NOT NULL,
  section TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT NOT NULL,
  building TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  features TEXT
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  classroom_id INTEGER,
  name TEXT NOT NULL,
  schedule_time TEXT NOT NULL,
  academic_term TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, class_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  record_date DATE NOT NULL,
  attendance_status TEXT NOT NULL CHECK(attendance_status IN ('present', 'absent', 'late')),
  participation_score REAL DEFAULT 0,
  quiz_score REAL DEFAULT 0,
  assignment_status TEXT DEFAULT 'completed',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS help_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS help_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'resolved')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES help_topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high')),
  metric_summary TEXT NOT NULL,
  disclaimer TEXT DEFAULT 'This is an assistive signal, not a diagnosis.',
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'reviewed', 'resolved')),
  teacher_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS continuity_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  class_date DATE NOT NULL,
  summary_notes TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS continuity_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK(task_type IN ('reading', 'video', 'assignment', 'quiz')),
  resource_link TEXT,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (package_id) REFERENCES continuity_packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_task_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  task_id INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  UNIQUE(student_id, task_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES continuity_tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal', 'important', 'urgent')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER UNIQUE NOT NULL,
  language TEXT DEFAULT 'en' CHECK(language IN ('en', 'te')),
  accessibility_needs TEXT DEFAULT 'standard',
  captioning_enabled INTEGER DEFAULT 0,
  preferred_format TEXT DEFAULT 'visual',
  notes TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
