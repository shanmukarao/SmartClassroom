const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { exec, run } = require('../src/db/database');

async function seed() {
  console.log('Starting seed process (Shanmuka Rao single student setup)...');

  // Read schema
  const schemaPath = path.resolve(__dirname, '../src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await exec(sql);

  // Clear all existing data cleanly
  await run(`DELETE FROM student_task_progress`);
  await run(`DELETE FROM continuity_tasks`);
  await run(`DELETE FROM continuity_packages`);
  await run(`DELETE FROM support_signals`);
  await run(`DELETE FROM help_requests`);
  await run(`DELETE FROM help_topics`);
  await run(`DELETE FROM activity_performance`);
  await run(`DELETE FROM student_preferences`);
  await run(`DELETE FROM enrollments`);
  await run(`DELETE FROM resources`);
  await run(`DELETE FROM announcements`);
  await run(`DELETE FROM classes`);
  await run(`DELETE FROM subjects`);
  await run(`DELETE FROM classrooms`);
  await run(`DELETE FROM students`);
  await run(`DELETE FROM teachers`);
  await run(`DELETE FROM users`);

  console.log('Cleared all existing database tables.');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // 1. Admin User
  await run(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('System Administrator', 'admin@classroom.edu', ?, 'admin')`,
    [passwordHash]
  );

  // 2. Teacher User (Prof. Rajesh Sharma)
  const teacherUser = await run(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('Prof. Rajesh Sharma', 'teacher.sharma@classroom.edu', ?, 'teacher')`,
    [teacherHash]
  );
  const teacherObj = await run(
    `INSERT INTO teachers (user_id, department, designation) VALUES (?, 'Mathematics & Computing', 'Senior Lecturer')`,
    [teacherUser.id]
  );

  // 3. EXACTLY ONE STUDENT: Shanmuka Rao
  const studentUser = await run(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('Shanmuka Rao', 'student.shanmuka@classroom.edu', ?, 'student')`,
    [studentHash]
  );
  const studentObj = await run(
    `INSERT INTO students (user_id, roll_number, grade_level, section) VALUES (?, 'STU-1001', 'Grade 10', 'A')`,
    [studentUser.id]
  );

  // Student Preferences for Shanmuka Rao
  await run(
    `INSERT INTO student_preferences (student_id, language, accessibility_needs, captioning_enabled, preferred_format, notes)
     VALUES (?, 'en', 'Visual aid preference', 1, 'interactive', 'Prefers diagrams and step-by-step visual guides.')`,
    [studentObj.id]
  );

  // Classrooms & Subjects
  const room1 = await run(
    `INSERT INTO classrooms (room_number, building, capacity, features) VALUES ('R-101', 'Aryabhatta Science Block', 45, 'Interactive Smartboard, HD Projector, Audio System')`
  );
  const room2 = await run(
    `INSERT INTO classrooms (room_number, building, capacity, features) VALUES ('R-204', 'Ramanujam Math Complex', 40, 'Digital Screen, Whiteboard, High Speed Wi-Fi')`
  );

  const subMath = await run(
    `INSERT INTO subjects (code, name, description) VALUES ('MATH-101', 'Advanced Mathematics', 'Algebraic expressions, quadratic equations, and trigonometry fundamentals.')`
  );
  const subSci = await run(
    `INSERT INTO subjects (code, name, description) VALUES ('SCI-202', 'Integrated Physics & Chemistry', 'Newtonian dynamics, chemical bonding, and thermodynamics.')`
  );

  // Class Sections assigned to Prof. Rajesh Sharma
  const class1 = await run(
    `INSERT INTO classes (subject_id, teacher_id, classroom_id, name, schedule_time, academic_term)
     VALUES (?, ?, ?, 'Grade 10 Mathematics - Section A', 'Mon / Wed / Fri - 09:00 AM', 'Semester 1 (2026)')`,
    [subMath.id, teacherObj.id, room1.id]
  );
  const class2 = await run(
    `INSERT INTO classes (subject_id, teacher_id, classroom_id, name, schedule_time, academic_term)
     VALUES (?, ?, ?, 'Grade 10 Physics & Chemistry', 'Tue / Thu - 11:30 AM', 'Semester 1 (2026)')`,
    [subSci.id, teacherObj.id, room2.id]
  );

  // Enroll Shanmuka Rao into Classes
  await run(`INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)`, [studentObj.id, class1.id]);
  await run(`INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)`, [studentObj.id, class2.id]);

  // Help Topics
  const topic1 = await run(`INSERT INTO help_topics (subject_id, name) VALUES (?, 'Quadratic Equations & Roots')`, [subMath.id]);
  const topic2 = await run(`INSERT INTO help_topics (subject_id, name) VALUES (?, 'Trigonometric Identities')`, [subMath.id]);

  // Help Request for Shanmuka Rao
  await run(
    `INSERT INTO help_requests (student_id, class_id, topic_id, description, status, created_at)
     VALUES (?, ?, ?, 'Need clarification on solving quadratic equations using completing the square method.', 'pending', CURRENT_TIMESTAMP)`,
    [studentObj.id, class1.id, topic1.id]
  );

  // Activity Performance Records for Shanmuka Rao (10 days history)
  const dates = [
    '2026-08-01', '2026-08-03', '2026-08-05', '2026-08-08', '2026-08-10',
    '2026-08-12', '2026-08-15', '2026-08-17', '2026-08-18', '2026-08-19'
  ];

  for (let d of dates) {
    const sAttendance = d === '2026-08-18' ? 'absent' : 'present';
    await run(
      `INSERT INTO activity_performance (student_id, class_id, record_date, attendance_status, participation_score, quiz_score)
       VALUES (?, ?, ?, ?, 8.5, 90)`,
      [studentObj.id, class1.id, d, sAttendance]
    );
  }

  // Class Continuity Catch-Up Package for Shanmuka Rao (August 18 session)
  const pkg1 = await run(
    `INSERT INTO continuity_packages (class_id, teacher_id, title, class_date, summary_notes, created_at)
     VALUES (?, ?, 'Quadratic Equations & Roots (Missed Class Catch-Up)', '2026-08-18', 
             'Lecture summary for August 18: Derive the quadratic formula using completing the square. Solved 3 sample exam problems.', CURRENT_TIMESTAMP)`,
    [class1.id, teacherObj.id]
  );

  const task1 = await run(
    `INSERT INTO continuity_tasks (package_id, title, task_type, resource_link, order_index)
     VALUES (?, 'Read Chapter 4.2 Lecture Notes on Quadratic Formula', 'reading', 'https://example.edu/docs/math101-ch4-notes.pdf', 1)`,
    [pkg1.id]
  );
  const task2 = await run(
    `INSERT INTO continuity_tasks (package_id, title, task_type, resource_link, order_index)
     VALUES (?, 'Watch 12-minute Video Explanation of Completing the Square', 'video', 'https://example.edu/videos/completing-the-square', 2)`,
    [pkg1.id]
  );
  const task3 = await run(
    `INSERT INTO continuity_tasks (package_id, title, task_type, resource_link, order_index)
     VALUES (?, 'Complete 5 Practice Problems on Quadratic Roots', 'assignment', 'https://example.edu/worksheets/ws-quadratics.pdf', 3)`,
    [pkg1.id]
  );

  // Initialize task progress
  await run(
    `INSERT INTO student_task_progress (student_id, task_id, completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
    [studentObj.id, task1.id]
  );

  // Learning Resources & Announcements
  await run(
    `INSERT INTO resources (class_id, teacher_id, title, description, resource_type, url, created_at)
     VALUES (?, ?, 'Quadratic Equations Formula Sheet & Shortcuts', 'Comprehensive 2-page formula reference guide with step-by-step examples.', 'PDF Document', 'https://example.edu/resources/math101-formula-sheet.pdf', CURRENT_TIMESTAMP)`,
    [class1.id, teacherObj.id]
  );

  await run(
    `INSERT INTO announcements (class_id, teacher_id, title, content, priority, created_at)
     VALUES (?, ?, 'Mid-Semester Math Evaluation Schedule', 'The mid-semester evaluation for Grade 10 Mathematics will be held on Friday, August 28th in Room R-101. Please review Chapter 1 to 5 continuity packages.', 'important', CURRENT_TIMESTAMP)`,
    [class1.id, teacherObj.id]
  );

  console.log('Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('ONLY ONE STUDENT CREATED: Shanmuka Rao');
  console.log('  Student: Shanmuka Rao (student.shanmuka@classroom.edu)');
  console.log('  Teacher: Prof. Rajesh Sharma (teacher.sharma@classroom.edu)');
  console.log('  Admin:   System Administrator (admin@classroom.edu)');
  console.log('--------------------------------------------------');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
