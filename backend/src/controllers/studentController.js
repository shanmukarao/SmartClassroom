const { query, get, run } = require('../db/database');
const { evaluateStudentSupportSignals } = require('../services/smartSignalEngine');

exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await get(`SELECT * FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    // 1. Enrolled classes
    const classes = await query(
      `SELECT c.id, c.name, c.schedule_time, c.academic_term, s.name as subject_name, s.code as subject_code, 
              u.name as teacher_name, cr.room_number, cr.building
       FROM enrollments e
       JOIN classes c ON e.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN teachers t ON c.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE e.student_id = ?`,
      [student.id]
    );

    const classIds = classes.map(c => c.id);

    // 2. Missed Classes & Continuity Packages
    let missedPackages = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      missedPackages = await query(
        `SELECT cp.id as package_id, cp.title, cp.class_date, cp.summary_notes, c.name as class_name, s.name as subject_name,
                (SELECT COUNT(*) FROM continuity_tasks ct WHERE ct.package_id = cp.id) as total_tasks,
                (SELECT COUNT(*) FROM student_task_progress stp 
                 JOIN continuity_tasks ct ON stp.task_id = ct.id 
                 WHERE ct.package_id = cp.id AND stp.student_id = ? AND stp.completed = 1) as completed_tasks
         FROM continuity_packages cp
         JOIN classes c ON cp.class_id = c.id
         JOIN subjects s ON c.subject_id = s.id
         WHERE cp.class_id IN (${placeholders})
         ORDER BY cp.class_date DESC`,
        [student.id, ...classIds]
      );
    }

    // Calculate completion % for missed packages
    missedPackages = missedPackages.map(pkg => ({
      ...pkg,
      progress_pct: pkg.total_tasks > 0 ? Math.round((pkg.completed_tasks / pkg.total_tasks) * 100) : 0
    }));

    // 3. Recent Announcements for student's classes
    let announcements = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      announcements = await query(
        `SELECT a.id, a.title, a.content, a.priority, a.created_at, c.name as class_name, u.name as teacher_name
         FROM announcements a
         JOIN classes c ON a.class_id = c.id
         JOIN teachers t ON a.teacher_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE a.class_id IN (${placeholders})
         ORDER BY a.created_at DESC LIMIT 5`,
        classIds
      );
    }

    // 4. Student's own private help requests
    const helpRequests = await query(
      `SELECT hr.id, hr.description, hr.status, hr.created_at, s.name as subject_name, ht.name as topic_name, c.name as class_name
       FROM help_requests hr
       JOIN classes c ON hr.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN help_topics ht ON hr.topic_id = ht.id
       WHERE hr.student_id = ?
       ORDER BY hr.created_at DESC LIMIT 5`,
      [student.id]
    );

    // 5. Personal Learning Progress (recent attendance & quiz average)
    const recentActivity = await query(
      `SELECT record_date, attendance_status, quiz_score, participation_score
       FROM activity_performance
       WHERE student_id = ?
       ORDER BY record_date DESC LIMIT 10`,
      [student.id]
    );

    const totalAttendance = recentActivity.length;
    const presentCount = recentActivity.filter(a => a.attendance_status === 'present').length;
    const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;
    const quizAvg = totalAttendance > 0 
      ? Math.round(recentActivity.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / totalAttendance) 
      : 85;

    // 6. Student Preferences
    const preferences = await get(`SELECT * FROM student_preferences WHERE student_id = ?`, [student.id]) || {
      language: 'en',
      accessibility_needs: 'standard',
      captioning_enabled: 0,
      preferred_format: 'visual'
    };

    // Trigger signal check silently in background
    for (const c of classIds) {
      evaluateStudentSupportSignals(student.id, c);
    }

    res.json({
      student,
      classes,
      missedPackages,
      announcements,
      helpRequests,
      progress: {
        attendancePct,
        quizAvg,
        completedCatchupPackages: missedPackages.filter(p => p.progress_pct === 100).length,
        totalCatchupPackages: missedPackages.length
      },
      preferences
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Server error loading student dashboard' });
  }
};

exports.getStudentClasses = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classes = await query(
      `SELECT c.*, s.name as subject_name, s.code as subject_code, u.name as teacher_name, cr.room_number, cr.building
       FROM enrollments e
       JOIN classes c ON e.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN teachers t ON c.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE e.student_id = ?`,
      [student.id]
    );

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student classes' });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let pref = await get(`SELECT * FROM student_preferences WHERE student_id = ?`, [student.id]);
    if (!pref) {
      pref = {
        student_id: student.id,
        language: 'en',
        accessibility_needs: 'standard',
        captioning_enabled: 0,
        preferred_format: 'visual',
        notes: ''
      };
    }

    res.json({ preferences: pref });
  } catch (error) {
    res.status(500).json({ error: 'Error loading student preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { language, accessibility_needs, captioning_enabled, preferred_format, notes } = req.body;

    const existing = await get(`SELECT id FROM student_preferences WHERE student_id = ?`, [student.id]);
    if (existing) {
      await run(
        `UPDATE student_preferences 
         SET language = ?, accessibility_needs = ?, captioning_enabled = ?, preferred_format = ?, notes = ?
         WHERE student_id = ?`,
        [language || 'en', accessibility_needs || 'standard', captioning_enabled ? 1 : 0, preferred_format || 'visual', notes || '', student.id]
      );
    } else {
      await run(
        `INSERT INTO student_preferences (student_id, language, accessibility_needs, captioning_enabled, preferred_format, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [student.id, language || 'en', accessibility_needs || 'standard', captioning_enabled ? 1 : 0, preferred_format || 'visual', notes || '']
      );
    }

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Error saving student preferences' });
  }
};
