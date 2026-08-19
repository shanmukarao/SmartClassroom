const bcrypt = require('bcryptjs');
const { query, get, run } = require('../db/database');

exports.getAdminDashboard = async (req, res) => {
  try {
    const studentCount = (await get(`SELECT COUNT(*) as count FROM students`)).count;
    const teacherCount = (await get(`SELECT COUNT(*) as count FROM teachers`)).count;
    const classCount = (await get(`SELECT COUNT(*) as count FROM classes`)).count;
    const classroomCount = (await get(`SELECT COUNT(*) as count FROM classrooms`)).count;
    const subjectCount = (await get(`SELECT COUNT(*) as count FROM subjects`)).count;
    const helpRequestCount = (await get(`SELECT COUNT(*) as count FROM help_requests`)).count;
    const supportSignalCount = (await get(`SELECT COUNT(*) as count FROM support_signals`)).count;
    const continuityPackageCount = (await get(`SELECT COUNT(*) as count FROM continuity_packages`)).count;

    // Classroom utilization
    const classroomStats = await query(
      `SELECT cr.id, cr.room_number, cr.building, cr.capacity,
              COUNT(c.id) as assigned_classes,
              COALESCE(SUM((SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id)), 0) as total_enrolled
       FROM classrooms cr
       LEFT JOIN classes c ON c.classroom_id = cr.id
       GROUP BY cr.id`
    );

    // Subject breakdown
    const subjectStats = await query(
      `SELECT s.id, s.code, s.name, COUNT(c.id) as total_classes
       FROM subjects s
       LEFT JOIN classes c ON c.subject_id = s.id
       GROUP BY s.id`
    );

    // Activity trend
    const recentSignals = await query(
      `SELECT category, COUNT(*) as count FROM support_signals GROUP BY category`
    );

    res.json({
      counts: {
        studentCount,
        teacherCount,
        classCount,
        classroomCount,
        subjectCount,
        helpRequestCount,
        supportSignalCount,
        continuityPackageCount
      },
      classroomStats,
      subjectStats,
      recentSignals
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error loading admin dashboard' });
  }
};

// ==================== USER MANAGEMENT ====================

exports.getUsers = async (req, res) => {
  try {
    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              st.id as student_id, st.roll_number, st.grade_level, st.section,
              t.id as teacher_id, t.department, t.designation
       FROM users u
       LEFT JOIN students st ON u.id = st.user_id
       LEFT JOIN teachers t ON u.id = t.user_id
       ORDER BY u.role, u.name`
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, roll_number, grade_level, section, department, designation } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const existing = await get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const defaultPassword = password || 'student123';
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    const userResult = await run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role]
    );

    const userId = userResult.id;

    if (role === 'student') {
      const roll = roll_number || `STU-${Date.now().toString().slice(-4)}`;
      const stRes = await run(
        `INSERT INTO students (user_id, roll_number, grade_level, section) VALUES (?, ?, ?, ?)`,
        [userId, roll, grade_level || 'Grade 10', section || 'A']
      );
      // Initialize preferences
      await run(
        `INSERT INTO student_preferences (student_id, language, accessibility_needs, captioning_enabled, preferred_format) VALUES (?, 'en', 'standard', 0, 'visual')`,
        [stRes.id]
      );
    } else if (role === 'teacher') {
      await run(
        `INSERT INTO teachers (user_id, department, designation) VALUES (?, ?, ?)`,
        [userId, department || 'Science & Math', designation || 'Assistant Professor']
      );
    }

    res.status(201).json({ message: 'User account created successfully', userId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, roll_number, grade_level, section, department, designation } = req.body;

    const user = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await run(
      `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`,
      [name.trim(), email.toLowerCase().trim(), role, id]
    );

    if (role === 'student') {
      const student = await get(`SELECT id FROM students WHERE user_id = ?`, [id]);
      if (student) {
        await run(
          `UPDATE students SET roll_number = ?, grade_level = ?, section = ? WHERE id = ?`,
          [roll_number || 'STU-1001', grade_level || 'Grade 10', section || 'A', student.id]
        );
      } else {
        await run(
          `INSERT INTO students (user_id, roll_number, grade_level, section) VALUES (?, ?, ?, ?)`,
          [id, roll_number || `STU-${Date.now().toString().slice(-4)}`, grade_level || 'Grade 10', section || 'A']
        );
      }
    } else if (role === 'teacher') {
      const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [id]);
      if (teacher) {
        await run(
          `UPDATE teachers SET department = ?, designation = ? WHERE id = ?`,
          [department || 'Department', designation || 'Faculty', teacher.id]
        );
      } else {
        await run(
          `INSERT INTO teachers (user_id, department, designation) VALUES (?, ?, ?)`,
          [id, department || 'Department', designation || 'Faculty']
        );
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      const adminCount = (await get(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`)).count;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the sole System Administrator account' });
      }
    }

    await run(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

// ==================== SUBJECT MANAGEMENT ====================

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await query(
      `SELECT s.*, (SELECT COUNT(*) FROM classes c WHERE c.subject_id = s.id) as total_classes FROM subjects s ORDER BY s.code`
    );
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subjects' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Subject code and name are required' });

    await run(
      `INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)`,
      [code.toUpperCase().trim(), name.trim(), description || '']
    );
    res.status(201).json({ message: 'Subject created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating subject' });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    await run(
      `UPDATE subjects SET code = ?, name = ?, description = ? WHERE id = ?`,
      [code.toUpperCase().trim(), name.trim(), description || '', id]
    );
    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating subject' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM subjects WHERE id = ?`, [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting subject' });
  }
};

// ==================== CLASS MANAGEMENT ====================

exports.getClasses = async (req, res) => {
  try {
    const classes = await query(
      `SELECT c.*, s.name as subject_name, s.code as subject_code, u.name as teacher_name, cr.room_number, cr.building,
              (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id) as enrolled_count
       FROM classes c
       JOIN subjects s ON c.subject_id = s.id
       JOIN teachers t ON c.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.id
       ORDER BY c.name`
    );
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching classes' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { subject_id, teacher_id, classroom_id, name, schedule_time, academic_term } = req.body;
    if (!subject_id || !teacher_id || !name) {
      return res.status(400).json({ error: 'Subject, teacher, and class name are required' });
    }

    await run(
      `INSERT INTO classes (subject_id, teacher_id, classroom_id, name, schedule_time, academic_term) VALUES (?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, classroom_id || null, name, schedule_time || 'Mon/Wed 10:00 AM', academic_term || 'Semester 1 (2026)']
    );
    res.status(201).json({ message: 'Class created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating class' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, teacher_id, classroom_id, name, schedule_time, academic_term } = req.body;
    await run(
      `UPDATE classes SET subject_id = ?, teacher_id = ?, classroom_id = ?, name = ?, schedule_time = ?, academic_term = ? WHERE id = ?`,
      [subject_id, teacher_id, classroom_id || null, name, schedule_time, academic_term, id]
    );
    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating class' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM classes WHERE id = ?`, [id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting class' });
  }
};

// Enrollment Management
exports.getClassEnrollments = async (req, res) => {
  try {
    const { classId } = req.params;
    const enrolled = await query(
      `SELECT e.id as enrollment_id, st.id as student_id, st.roll_number, st.grade_level, st.section, u.name, u.email
       FROM enrollments e
       JOIN students st ON e.student_id = st.id
       JOIN users u ON st.user_id = u.id
       WHERE e.class_id = ?
       ORDER BY u.name`,
      [classId]
    );

    const availableStudents = await query(
      `SELECT st.id as student_id, st.roll_number, st.grade_level, st.section, u.name, u.email
       FROM students st
       JOIN users u ON st.user_id = u.id
       WHERE st.id NOT IN (SELECT student_id FROM enrollments WHERE class_id = ?)
       ORDER BY u.name`,
      [classId]
    );

    res.json({ enrolled, availableStudents });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching class enrollments' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { classId } = req.params;
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'Student selection required' });

    await run(
      `INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)`,
      [student_id, classId]
    );
    res.status(201).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error enrolling student' });
  }
};

exports.unenrollStudent = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    await run(`DELETE FROM enrollments WHERE id = ?`, [enrollmentId]);
    res.json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error unenrolling student' });
  }
};

// ==================== CLASSROOM MANAGEMENT ====================

exports.getClassrooms = async (req, res) => {
  try {
    const classrooms = await query(
      `SELECT cr.*, (SELECT COUNT(*) FROM classes c WHERE c.classroom_id = cr.id) as assigned_classes FROM classrooms cr ORDER BY cr.building, cr.room_number`
    );
    res.json({ classrooms });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching classrooms' });
  }
};

exports.createClassroom = async (req, res) => {
  try {
    const { room_number, building, capacity, features } = req.body;
    if (!room_number || !building) return res.status(400).json({ error: 'Room number and building are required' });

    await run(
      `INSERT INTO classrooms (room_number, building, capacity, features) VALUES (?, ?, ?, ?)`,
      [room_number.trim(), building.trim(), capacity || 40, features || 'Smartboard, Projector']
    );
    res.status(201).json({ message: 'Classroom created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating classroom' });
  }
};

exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, building, capacity, features } = req.body;
    await run(
      `UPDATE classrooms SET room_number = ?, building = ?, capacity = ?, features = ? WHERE id = ?`,
      [room_number.trim(), building.trim(), capacity, features, id]
    );
    res.json({ message: 'Classroom updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating classroom' });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM classrooms WHERE id = ?`, [id]);
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting classroom' });
  }
};
