const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, query } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ error: `Account exists, but selected role (${role}) does not match your registered account role (${user.role})` });
    }

    let roleData = {};
    if (user.role === 'student') {
      const student = await get(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
      if (student) roleData.student = student;
    } else if (user.role === 'teacher') {
      const teacher = await get(`SELECT * FROM teachers WHERE user_id = ?`, [user.id]);
      if (teacher) roleData.teacher = teacher;
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: roleData.student ? roleData.student.id : null,
      teacherId: roleData.teacher ? roleData.teacher.id : null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...roleData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login authentication' });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role requested' });
    }

    const users = await query(
      `SELECT u.id, u.name, u.email, u.role,
              st.roll_number, st.grade_level, st.section,
              t.department, t.designation
       FROM users u
       LEFT JOIN students st ON u.id = st.user_id
       LEFT JOIN teachers t ON u.id = t.user_id
       WHERE u.role = ?
       ORDER BY u.name ASC`,
      [role]
    );

    res.json({ users });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Error fetching users by role' });
  }
};

exports.demoLogin = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'User selection and role are required' });
    }

    const user = await get(`SELECT * FROM users WHERE id = ? AND role = ?`, [userId, role]);
    if (!user) {
      return res.status(404).json({ error: 'Selected user profile not found or role mismatch' });
    }

    let roleData = {};
    if (user.role === 'student') {
      const student = await get(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
      if (student) roleData.student = student;
    } else if (user.role === 'teacher') {
      const teacher = await get(`SELECT * FROM teachers WHERE user_id = ?`, [user.id]);
      if (teacher) roleData.teacher = teacher;
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: roleData.student ? roleData.student.id : null,
      teacherId: roleData.teacher ? roleData.teacher.id : null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Prototype demo authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...roleData
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Server error during demo authentication' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await get(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let roleData = {};
    if (user.role === 'student') {
      const student = await get(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
      if (student) {
        roleData.student = student;
        const preferences = await get(`SELECT * FROM student_preferences WHERE student_id = ?`, [student.id]);
        roleData.preferences = preferences;
      }
    } else if (user.role === 'teacher') {
      const teacher = await get(`SELECT * FROM teachers WHERE user_id = ?`, [user.id]);
      if (teacher) roleData.teacher = teacher;
    }

    res.json({
      user: {
        ...user,
        ...roleData
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};
