const { query, get, run } = require('../db/database');

exports.createPackage = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Only teachers can create continuity packages' });

    const { class_id, title, class_date, summary_notes, tasks } = req.body;

    if (!class_id || !title || !class_date) {
      return res.status(400).json({ error: 'Class, title, and date are required' });
    }

    // Verify class ownership
    const cls = await get(`SELECT id FROM classes WHERE id = ? AND teacher_id = ?`, [class_id, teacher.id]);
    if (!cls) return res.status(403).json({ error: 'Unauthorized class selection' });

    const pkgResult = await run(
      `INSERT INTO continuity_packages (class_id, teacher_id, title, class_date, summary_notes, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [class_id, teacher.id, title, class_date, summary_notes || '']
    );

    const packageId = pkgResult.id;

    if (tasks && Array.isArray(tasks)) {
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        await run(
          `INSERT INTO continuity_tasks (package_id, title, task_type, resource_link, order_index)
           VALUES (?, ?, ?, ?, ?)`,
          [packageId, t.title, t.task_type || 'reading', t.resource_link || '', i + 1]
        );
      }
    }

    res.status(201).json({ message: 'Class continuity package created successfully', packageId });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Error creating continuity package' });
  }
};

exports.getPackagesForClass = async (req, res) => {
  try {
    const { classId } = req.params;
    let studentId = null;

    if (req.user.role === 'student') {
      const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (student) studentId = student.id;
    }

    const packages = await query(
      `SELECT cp.id, cp.class_id, cp.title, cp.class_date, cp.summary_notes, cp.created_at,
              c.name as class_name, s.name as subject_name, u.name as teacher_name
       FROM continuity_packages cp
       JOIN classes c ON cp.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN teachers t ON cp.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE cp.class_id = ?
       ORDER BY cp.class_date DESC`,
      [classId]
    );

    // Attach tasks and student completion state
    for (let pkg of packages) {
      const tasks = await query(
        `SELECT ct.id, ct.title, ct.task_type, ct.resource_link, ct.order_index,
                (SELECT stp.completed FROM student_task_progress stp WHERE stp.task_id = ct.id AND stp.student_id = ?) as is_completed
         FROM continuity_tasks ct
         WHERE ct.package_id = ?
         ORDER BY ct.order_index ASC`,
        [studentId || 0, pkg.id]
      );

      pkg.tasks = tasks.map(t => ({ ...t, is_completed: t.is_completed === 1 }));
      const completedCount = pkg.tasks.filter(t => t.is_completed).length;
      pkg.total_tasks = pkg.tasks.length;
      pkg.completed_tasks = completedCount;
      pkg.progress_pct = pkg.total_tasks > 0 ? Math.round((completedCount / pkg.total_tasks) * 100) : 0;
    }

    res.json({ packages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Error loading continuity packages' });
  }
};

exports.getPackageDetails = async (req, res) => {
  try {
    const { packageId } = req.params;
    let studentId = null;

    if (req.user.role === 'student') {
      const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (student) studentId = student.id;
    }

    const pkg = await get(
      `SELECT cp.*, c.name as class_name, s.name as subject_name, u.name as teacher_name
       FROM continuity_packages cp
       JOIN classes c ON cp.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN teachers t ON cp.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE cp.id = ?`,
      [packageId]
    );

    if (!pkg) return res.status(404).json({ error: 'Continuity package not found' });

    const tasks = await query(
      `SELECT ct.id, ct.title, ct.task_type, ct.resource_link, ct.order_index,
              (SELECT stp.completed FROM student_task_progress stp WHERE stp.task_id = ct.id AND stp.student_id = ?) as is_completed
       FROM continuity_tasks ct
       WHERE ct.package_id = ?
       ORDER BY ct.order_index ASC`,
      [studentId || 0, packageId]
    );

    pkg.tasks = tasks.map(t => ({ ...t, is_completed: t.is_completed === 1 }));
    const completedCount = pkg.tasks.filter(t => t.is_completed).length;
    pkg.total_tasks = pkg.tasks.length;
    pkg.completed_tasks = completedCount;
    pkg.progress_pct = pkg.total_tasks > 0 ? Math.round((completedCount / pkg.total_tasks) * 100) : 0;

    res.json({ package: pkg });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching package details' });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) return res.status(403).json({ error: 'Only students can complete tasks' });

    const { taskId } = req.params;
    const { completed } = req.body;

    const existing = await get(
      `SELECT id, completed FROM student_task_progress WHERE student_id = ? AND task_id = ?`,
      [student.id, taskId]
    );

    const isDone = completed ? 1 : 0;
    if (existing) {
      await run(
        `UPDATE student_task_progress SET completed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [isDone, existing.id]
      );
    } else {
      await run(
        `INSERT INTO student_task_progress (student_id, task_id, completed, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [student.id, taskId, isDone]
      );
    }

    res.json({ message: 'Task completion status updated', completed: isDone === 1 });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Error updating task progress' });
  }
};
