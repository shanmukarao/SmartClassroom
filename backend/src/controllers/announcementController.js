const { query, get, run } = require('../db/database');

exports.getAnnouncements = async (req, res) => {
  try {
    const { class_id } = req.query;
    let params = [];
    let sql = `SELECT a.*, c.name as class_name, s.name as subject_name, u.name as teacher_name
               FROM announcements a
               JOIN classes c ON a.class_id = c.id
               JOIN subjects s ON c.subject_id = s.id
               JOIN teachers t ON a.teacher_id = t.id
               JOIN users u ON t.user_id = u.id`;

    if (class_id) {
      sql += ` WHERE a.class_id = ?`;
      params.push(class_id);
    } else if (req.user.role === 'student') {
      const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (student) {
        sql += ` WHERE a.class_id IN (SELECT class_id FROM enrollments WHERE student_id = ?)`;
        params.push(student.id);
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
      if (teacher) {
        sql += ` WHERE a.teacher_id = ?`;
        params.push(teacher.id);
      }
    }

    sql += ` ORDER BY a.created_at DESC`;
    const announcements = await query(sql, params);
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ error: 'Error loading announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Only teachers can create announcements' });

    const { class_id, title, content, priority } = req.body;

    if (!class_id || !title || !content) {
      return res.status(400).json({ error: 'Class, title, and content are required' });
    }

    const result = await run(
      `INSERT INTO announcements (class_id, teacher_id, title, content, priority, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [class_id, teacher.id, title, content, priority || 'normal']
    );

    res.status(201).json({ message: 'Announcement created', announcementId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating announcement' });
  }
};
