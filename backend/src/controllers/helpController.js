const { query, get, run } = require('../db/database');

exports.createHelpRequest = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) {
      return res.status(403).json({ error: 'Only registered students can submit help requests' });
    }

    const { class_id, topic_id, description } = req.body;

    if (!class_id || !topic_id) {
      return res.status(400).json({ error: 'Class ID and Topic ID are required' });
    }

    // Verify student is enrolled in class
    const enrollment = await get(`SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?`, [student.id, class_id]);
    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    const result = await run(
      `INSERT INTO help_requests (student_id, class_id, topic_id, description, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [student.id, class_id, topic_id, description || '']
    );

    res.status(201).json({
      message: 'Help request submitted confidentially',
      requestId: result.id
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({ error: 'Error submitting help request' });
  }
};

exports.getStudentHelpRequests = async (req, res) => {
  try {
    const student = await get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
    if (!student) return res.status(404).json({ error: 'Student record not found' });

    const requests = await query(
      `SELECT hr.id, hr.description, hr.status, hr.created_at,
              c.name as class_name, s.name as subject_name, ht.name as topic_name
       FROM help_requests hr
       JOIN classes c ON hr.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN help_topics ht ON hr.topic_id = ht.id
       WHERE hr.student_id = ?
       ORDER BY hr.created_at DESC`,
      [student.id]
    );

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student help requests' });
  }
};

exports.getTeacherHelpInsights = async (req, res) => {
  try {
    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Unauthorized teacher action' });

    const { class_id } = req.query;

    let classClause = '';
    let params = [teacher.id];

    if (class_id) {
      classClause = ' AND c.id = ?';
      params.push(class_id);
    }

    // Aggregated topic confusion list
    const aggregatedTopics = await query(
      `SELECT ht.id as topic_id, ht.name as topic_name, s.name as subject_name, c.name as class_name,
              COUNT(hr.id) as total_requests,
              SUM(CASE WHEN hr.status = 'pending' THEN 1 ELSE 0 END) as pending_requests
       FROM help_requests hr
       JOIN help_topics ht ON hr.topic_id = ht.id
       JOIN classes c ON hr.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       WHERE c.teacher_id = ? ${classClause}
       GROUP BY ht.id, c.id
       ORDER BY total_requests DESC`,
      params
    );

    // List of individual requests for controlled teacher follow-up
    const requestDetails = await query(
      `SELECT hr.id, hr.description, hr.status, hr.created_at,
              c.name as class_name, s.name as subject_name, ht.name as topic_name,
              u.name as student_name, st.roll_number
       FROM help_requests hr
       JOIN help_topics ht ON hr.topic_id = ht.id
       JOIN classes c ON hr.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       JOIN students st ON hr.student_id = st.id
       JOIN users u ON st.user_id = u.id
       WHERE c.teacher_id = ? ${classClause}
       ORDER BY hr.created_at DESC`,
      params
    );

    res.json({ aggregatedTopics, requestDetails });
  } catch (error) {
    console.error('Help insights error:', error);
    res.status(500).json({ error: 'Error loading help insights' });
  }
};

exports.updateHelpRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const teacher = await get(`SELECT id FROM teachers WHERE user_id = ?`, [req.user.id]);
    if (!teacher) return res.status(403).json({ error: 'Unauthorized teacher action' });

    // Verify teacher owns the class of this request
    const hr = await get(
      `SELECT hr.id FROM help_requests hr
       JOIN classes c ON hr.class_id = c.id
       WHERE hr.id = ? AND c.teacher_id = ?`,
      [requestId, teacher.id]
    );

    if (!hr) {
      return res.status(404).json({ error: 'Help request not found or unauthorized' });
    }

    await run(`UPDATE help_requests SET status = ? WHERE id = ?`, [status || 'resolved', requestId]);
    res.json({ message: 'Help request status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating help request' });
  }
};

exports.getTopicsForClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await get(`SELECT subject_id FROM classes WHERE id = ?`, [classId]);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const topics = await query(`SELECT * FROM help_topics WHERE subject_id = ?`, [cls.subject_id]);
    res.json({ topics });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching topics' });
  }
};
