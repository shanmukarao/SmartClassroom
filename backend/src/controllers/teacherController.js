const { query, get, run } = require('../db/database');

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await get(`SELECT * FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher record not found' });
    }

    // 1. Assigned classes
    const classes = await query(
      `SELECT c.id, c.name, c.schedule_time, c.academic_term, s.name as subject_name, s.code as subject_code,
              cr.room_number, cr.building,
              (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id) as student_count
       FROM classes c
       JOIN subjects s ON c.subject_id = s.id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE c.teacher_id = ?`,
      [teacher.id]
    );

    const classIds = classes.map(c => c.id);

    let totalStudentsCount = 0;
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      const countRes = await get(
        `SELECT COUNT(DISTINCT student_id) as total FROM enrollments WHERE class_id IN (${placeholders})`,
        classIds
      );
      totalStudentsCount = countRes ? countRes.total : 0;
    }

    // 2. Aggregated Help Requests & Topic Confusion Insights (NO direct student names by default)
    let topicConfusion = [];
    let pendingHelpRequestsCount = 0;
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      topicConfusion = await query(
        `SELECT ht.name as topic_name, s.name as subject_name, COUNT(hr.id) as request_count
         FROM help_requests hr
         JOIN help_topics ht ON hr.topic_id = ht.id
         JOIN classes c ON hr.class_id = c.id
         JOIN subjects s ON c.subject_id = s.id
         WHERE hr.class_id IN (${placeholders})
         GROUP BY ht.id
         ORDER BY request_count DESC LIMIT 6`,
        classIds
      );

      const pendingRes = await get(
        `SELECT COUNT(*) as count FROM help_requests WHERE class_id IN (${placeholders}) AND status = 'pending'`,
        classIds
      );
      pendingHelpRequestsCount = pendingRes ? pendingRes.count : 0;
    }

    // 3. Authorized Private Support Signals (FOR ASSIGNED CLASSES ONLY)
    let supportSignals = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      supportSignals = await query(
        `SELECT ss.id, ss.category, ss.severity, ss.metric_summary, ss.disclaimer, ss.status, ss.teacher_notes, ss.created_at,
                c.name as class_name, u.name as student_name, st.roll_number
         FROM support_signals ss
         JOIN classes c ON ss.class_id = c.id
         JOIN students st ON ss.student_id = st.id
         JOIN users u ON st.user_id = u.id
         WHERE ss.class_id IN (${placeholders})
         ORDER BY 
           CASE ss.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
           ss.created_at DESC`,
        classIds
      );
    }

    // 4. Class Continuity Packages Progress
    let continuityPackages = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      continuityPackages = await query(
        `SELECT cp.id, cp.title, cp.class_date, cp.summary_notes, c.name as class_name,
                (SELECT COUNT(*) FROM continuity_tasks ct WHERE ct.package_id = cp.id) as total_tasks,
                (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = cp.class_id) as enrolled_students,
                (SELECT COUNT(*) FROM student_task_progress stp 
                 JOIN continuity_tasks ct ON stp.task_id = ct.id 
                 WHERE ct.package_id = cp.id AND stp.completed = 1) as total_completed_tasks
         FROM continuity_packages cp
         JOIN classes c ON cp.class_id = c.id
         WHERE cp.teacher_id = ? AND cp.class_id IN (${placeholders})
         ORDER BY cp.class_date DESC LIMIT 5`,
        [teacher.id, ...classIds]
      );

      continuityPackages = continuityPackages.map(pkg => {
        const possibleTotal = pkg.total_tasks * pkg.enrolled_students;
        const completionPct = possibleTotal > 0 ? Math.round((pkg.total_completed_tasks / possibleTotal) * 100) : 0;
        return { ...pkg, completionPct };
      });
    }

    // 5. Inclusive Student Preferences (Non-sensitive classroom accessibility summary)
    let accessibilitySummary = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      accessibilitySummary = await query(
        `SELECT sp.language, sp.accessibility_needs, sp.captioning_enabled, sp.preferred_format, COUNT(sp.id) as count
         FROM student_preferences sp
         JOIN students st ON sp.student_id = st.id
         JOIN enrollments e ON st.id = e.student_id
         WHERE e.class_id IN (${placeholders})
         GROUP BY sp.language, sp.accessibility_needs, sp.captioning_enabled, sp.preferred_format`,
        classIds
      );
    }

    // 6. Recent Announcements
    let announcements = [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      announcements = await query(
        `SELECT a.id, a.title, a.content, a.priority, a.created_at, c.name as class_name
         FROM announcements a
         JOIN classes c ON a.class_id = c.id
         WHERE a.teacher_id = ? AND a.class_id IN (${placeholders})
         ORDER BY a.created_at DESC LIMIT 5`,
        [teacher.id, ...classIds]
      );
    }

    res.json({
      teacher,
      classes,
      totalStudentsCount,
      pendingHelpRequestsCount,
      topicConfusion,
      supportSignals,
      continuityPackages,
      accessibilitySummary,
      announcements
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Server error loading teacher dashboard' });
  }
};

exports.updateSupportSignalStatus = async (req, res) => {
  try {
    const { signalId } = req.params;
    const { status, teacher_notes } = req.body;

    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Unauthorized teacher action' });

    // Verify teacher owns the class of this signal
    const signal = await get(
      `SELECT ss.id FROM support_signals ss
       JOIN classes c ON ss.class_id = c.id
       WHERE ss.id = ? AND c.teacher_id = ?`,
      [signalId, teacher.id]
    );

    if (!signal) {
      return res.status(404).json({ error: 'Support signal not found or unauthorized' });
    }

    await run(
      `UPDATE support_signals SET status = ?, teacher_notes = ? WHERE id = ?`,
      [status || 'reviewed', teacher_notes || '', signalId]
    );

    res.json({ message: 'Support signal updated successfully' });
  } catch (error) {
    console.error('Update signal error:', error);
    res.status(500).json({ error: 'Error updating support signal' });
  }
};

exports.getAssignedClasses = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const classes = await query(
      `SELECT c.*, s.name as subject_name, s.code as subject_code, cr.room_number, cr.building
       FROM classes c
       JOIN subjects s ON c.subject_id = s.id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE c.teacher_id = ?`,
      [teacher.id]
    );

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assigned classes' });
  }
};
