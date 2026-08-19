const { query, get, run } = require('../db/database');

exports.getResources = async (req, res) => {
  try {
    const { class_id } = req.query;
    let params = [];
    let sql = `SELECT r.*, c.name as class_name, s.name as subject_name, u.name as teacher_name
               FROM resources r
               JOIN classes c ON r.class_id = c.id
               JOIN subjects s ON c.subject_id = s.id
               JOIN teachers t ON r.teacher_id = t.id
               JOIN users u ON t.user_id = u.id`;

    if (class_id) {
      sql += ` WHERE r.class_id = ?`;
      params.push(class_id);
    } else if (req.user.role === 'student') {
      const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (student) {
        sql += ` WHERE r.class_id IN (SELECT class_id FROM enrollments WHERE student_id = ?)`;
        params.push(student.id);
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
      if (teacher) {
        sql += ` WHERE r.teacher_id = ?`;
        params.push(teacher.id);
      }
    }

    sql += ` ORDER BY r.created_at DESC`;
    const resources = await query(sql, params);
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: 'Error loading resources' });
  }
};

exports.createResource = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Only teachers can upload resources' });

    const { class_id, title, description, resource_type, url } = req.body;

    if (!class_id || !title || !url) {
      return res.status(400).json({ error: 'Class, title, and link/url are required' });
    }

    const result = await run(
      `INSERT INTO resources (class_id, teacher_id, title, description, resource_type, url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [class_id, teacher.id, title, description || '', resource_type || 'PDF Document', url]
    );

    res.status(201).json({ message: 'Resource added successfully', resourceId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating resource' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Unauthorized teacher action' });

    const { id } = req.params;
    await run(`DELETE FROM resources WHERE id = ? AND teacher_id = ?`, [id, teacher.id]);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting resource' });
  }
};
