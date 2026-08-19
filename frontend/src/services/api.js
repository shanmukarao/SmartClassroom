import {
  mockAuthService,
  getUsers,
  addUser,
  deleteUser,
  getSubjects,
  addSubject,
  deleteSubject,
  getClassrooms,
  addClassroom,
  deleteClassroom,
  getClasses,
  addClass,
  deleteClass,
  getHelpRequests,
  addHelpRequest,
  getAggregatedHelpInsights,
  getSupportSignals,
  getContinuityPackages,
  addContinuityPackage,
  deleteContinuityPackage,
  getStudentTaskProgress,
  toggleTaskProgress,
  getAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  getResources,
  addResource,
  deleteResource,
  getStudentPreferences,
  saveStudentPreferences,
  resetDemoData
} from './mockDataService';

/**
 * Client-Side Standalone Mock API Service
 * Eliminates all network REST calls and routes requests to LocalStorage.
 * Fully compatible with GitHub Pages static hosting.
 */
const mockApi = {
  get: async (url, config) => {
    // Auth Check
    if (url === '/auth/me') {
      const user = await mockAuthService.getCurrentUser();
      if (!user) throw { response: { status: 401, data: { error: 'Unauthorized' } } };
      return { data: { user } };
    }

    if (url.startsWith('/auth/users-by-role/')) {
      const role = url.split('/').pop();
      const users = getUsers()
        .filter((u) => u.role === role)
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          roll_number: u.studentProfile?.rollNumber,
          grade_level: u.studentProfile?.gradeLevel,
          section: u.studentProfile?.section,
          department: u.teacherProfile?.department,
          designation: u.teacherProfile?.designation
        }));
      return { data: { users } };
    }

    // Help Requests & Aggregated Insights
    if (url.startsWith('/help/topics/class/')) {
      return {
        data: {
          topics: [
            { id: 'Recursion', name: 'Recursion' },
            { id: 'Linked Lists', name: 'Linked Lists' },
            { id: 'Binary Trees', name: 'Binary Trees' },
            { id: 'Graph Traversals', name: 'Graph Traversals' },
            { id: 'Call Stack Memory', name: 'Call Stack Memory' }
          ]
        }
      };
    }

    if (url === '/student/classes') {
      const allClasses = getClasses();
      return { data: { classes: allClasses.map((c) => ({ id: c.id, name: c.name, subject_name: 'Data Structures' })) } };
    }


    if (url === '/help/student' || url === '/help/my-requests' || url === '/help') {
      const requests = getHelpRequests().map((r) => ({
        ...r,
        subject_name: 'Data Structures',
        topic_name: r.topic
      }));
      return { data: { requests } };
    }

    if (url === '/help/teacher-insights' || url === '/help/insights' || url === '/help/aggregate') {
      const insights = getAggregatedHelpInsights();
      const aggregatedTopics = insights.map((i) => ({
        subject_name: 'Data Structures',
        topic_name: i.topic,
        total_requests: i.count,
        pending_requests: i.count
      }));

      const requests = getHelpRequests();
      const requestDetails = requests.map((r) => ({
        id: r.id,
        student_name: 'Rahul Sharma',
        roll_number: '21NR1A0501',
        class_name: 'Data Structures — CSE A',
        topic_name: r.topic,
        description: r.description,
        status: r.status
      }));

      return { data: { aggregatedTopics, requestDetails, insights } };
    }


    if (url === '/teacher/classes') {
      const allClasses = getClasses();
      return { data: { classes: allClasses.map((c) => ({ id: c.id, name: c.name, subject_name: 'Data Structures' })) } };
    }

    // Support Signals
    if (url === '/teacher/signals' || url === '/signals') {
      return { data: { signals: getSupportSignals() } };
    }

    // Class Continuity Packages
    if (url.startsWith('/continuity') || url.startsWith('/student/continuity')) {
      const packages = getContinuityPackages();
      const studentId = 101;
      const progressList = getStudentTaskProgress(studentId);

      const formattedPackages = packages.map((pkg) => {
        const rawTasks = pkg.checklistTasks || [];
        const tasks = rawTasks.map((t) => {
          const prog = progressList.find((p) => p.taskId === t.id);
          return {
            id: t.id,
            title: t.title,
            task_type: t.type || 'reading',
            is_completed: prog ? prog.completed : false
          };
        });

        const completedCount = tasks.filter((t) => t.is_completed).length;
        const total = tasks.length || 1;
        const progress_pct = Math.round((completedCount / total) * 100);

        return {
          id: pkg.id,
          subject_name: 'Data Structures',
          title: pkg.title,
          class_date: pkg.classDate,
          summary_notes: pkg.summaryNotes,
          completed_tasks: completedCount,
          total_tasks: total,
          progress_pct,
          tasks
        };
      });

      return { data: { packages: formattedPackages } };
    }


    // Announcements
    if (url.startsWith('/announcements')) {
      return { data: { announcements: getAnnouncements() } };
    }

    // Resources
    if (url.startsWith('/resources')) {
      return { data: { resources: getResources() } };
    }

    // Admin Resources (Users, Classes, Subjects, Rooms)
    if (url === '/admin/users') {
      return { data: { users: getUsers() } };
    }
    if (url === '/admin/subjects') {
      return { data: { subjects: getSubjects() } };
    }
    if (url === '/admin/classrooms') {
      return { data: { classrooms: getClassrooms() } };
    }
    if (url === '/admin/classes') {
      return { data: { classes: getClasses() } };
    }

    // Dashboards
    if (url === '/student/dashboard') {
      const studentId = 101;
      const allClasses = getClasses();
      const allSubjects = getSubjects();
      const allUsers = getUsers();
      const packages = getContinuityPackages();
      const progressList = getStudentTaskProgress(studentId);

      const enrolledClasses = allClasses.map((cls) => {
        const sub = allSubjects.find((s) => s.id === cls.subjectId) || {};
        const tch = allUsers.find((u) => u.teacherProfile?.id === cls.teacherId) || {};
        return {
          id: cls.id,
          name: cls.name,
          subject_code: sub.code || 'CS201',
          subject_name: sub.name || cls.name,
          teacher_name: tch.name || 'Dr. A. Sharma',
          schedule_time: cls.scheduleTime
        };
      });

      const processedPackages = packages.map((pkg) => {
        const tasks = pkg.checklistTasks || [];
        const completedCount = tasks.filter((t) => {
          const prog = progressList.find((p) => p.taskId === t.id);
          return prog ? prog.completed : false;
        }).length;
        const total = tasks.length || 1;
        const progress_pct = Math.round((completedCount / total) * 100);

        return {
          package_id: pkg.id,
          subject_name: pkg.className,
          title: pkg.title,
          class_date: pkg.classDate,
          summary_notes: pkg.summaryNotes,
          total_tasks: total,
          completed_tasks: completedCount,
          progress_pct
        };
      });

      return {
        data: {
          student: { roll_number: '21NR1A0501', grade_level: '3rd Year B.Tech', section: 'CSE-A' },
          classes: enrolledClasses,
          missedPackages: processedPackages,
          announcements: getAnnouncements(),
          helpRequests: getHelpRequests().filter((r) => r.studentId === studentId),
          progress: {
            attendancePct: 92,
            quizAvg: 86,
            completedCatchupPackages: processedPackages.filter((p) => p.progress_pct === 100).length,
            totalCatchupPackages: processedPackages.length
          }
        }
      };
    }

    if (url === '/teacher/dashboard') {
      const allClasses = getClasses();
      const insights = getAggregatedHelpInsights();
      const rawRequests = getHelpRequests();
      const signals = getSupportSignals();
      const packages = getContinuityPackages();
      const announcements = getAnnouncements();

      const topicConfusion = insights.map((i) => ({
        topic_name: i.topic,
        request_count: i.count
      }));

      const formattedSignals = signals.map((s) => ({
        id: s.id,
        student_id: s.studentId,
        student_name: s.studentName || 'Rahul Sharma',
        roll_number: '21NR1A0501',
        class_name: s.className || 'Data Structures — CSE A',
        category: s.category,
        severity: s.severity,
        metric_summary: s.metricSummary,
        disclaimer: s.disclaimer || 'This is an assistive signal, not a diagnosis.',
        status: s.status,
        teacher_notes: s.teacher_notes || null
      }));

      const formattedPackages = packages.map((p) => ({
        id: p.id,
        title: p.title,
        class_date: p.classDate,
        class_name: p.className || 'Data Structures — CSE A',
        completionPct: 75
      }));

      return {
        data: {
          teacher: { user_id: 7, name: 'Dr. A. Sharma', department: 'Computer Science', designation: 'Associate Professor' },
          classes: allClasses.map((c) => ({ ...c, studentCount: 32 })),
          totalStudentsCount: 120,
          pendingHelpRequestsCount: rawRequests.length,
          topicConfusion,
          supportSignals: formattedSignals,
          continuityPackages: formattedPackages,
          announcements,
          accessibilitySummary: [
            { language: 'en', accessibility_needs: 'Captions & Large Text', preferred_format: 'visual', captioning_enabled: true },
            { language: 'te', accessibility_needs: 'Telugu Transcripts & Notes', preferred_format: 'notes', captioning_enabled: false },
            { language: 'en', accessibility_needs: 'Screen Reader Optimizations', preferred_format: 'audio', captioning_enabled: true }
          ]
        }
      };
    }


    if (url === '/admin/dashboard') {
      const users = getUsers();
      const teachers = users.filter((u) => u.role === 'teacher');
      const students = users.filter((u) => u.role === 'student');
      const classes = getClasses();
      const subjects = getSubjects();
      const rooms = getClassrooms();

      const classroomStats = rooms.map((r) => {
        const assigned = classes.filter((c) => c.classroomId === r.id);
        return {
          id: r.id,
          room_number: r.roomNumber,
          building: r.building,
          capacity: r.capacity,
          assigned_classes: assigned.length,
          total_enrolled: assigned.length * 32
        };
      });

      const subjectStats = subjects.map((s) => {
        const subClasses = classes.filter((c) => c.subjectId === s.id);
        return {
          id: s.id,
          code: s.code,
          name: s.name,
          total_classes: subClasses.length
        };
      });

      return {
        data: {
          counts: {
            studentCount: students.length,
            teacherCount: teachers.length,
            classCount: classes.length,
            subjectCount: subjects.length,
            classroomCount: rooms.length
          },
          classroomStats,
          subjectStats
        }
      };
    }


    // Student Preferences
    if (url.startsWith('/student/preferences')) {
      const studentId = 101;
      return { data: { preferences: getStudentPreferences(studentId) } };
    }
    if (url.startsWith('/student/progress')) {
      const studentId = 101;
      return { data: { progress: getStudentTaskProgress(studentId) } };
    }


    return { data: {} };
  },

  post: async (url, data) => {
    // Auth Routes
    if (url === '/auth/login' || url === '/auth/demo-login') {
      const session = await mockAuthService.login(data.email, data.password, data.role);
      return { data: session };
    }

    // Help Requests
    if (url === '/help/request' || url === '/help') {
      const topic = data.topic || data.topic_id || 'Recursion';
      const newReq = addHelpRequest({ ...data, topic });
      return { data: { message: 'Help request submitted privately.', request: newReq } };
    }


    // Continuity Packages
    if (url === '/continuity' || url === '/teacher/continuity') {
      const newPkg = addContinuityPackage(data);
      return { data: { message: 'Continuity package created.', package: newPkg } };
    }

    // Toggle Task Progress
    if (url.startsWith('/continuity/progress') || url.startsWith('/student/task-progress') || (url.includes('/continuity/task/') && url.endsWith('/toggle'))) {
      const parts = url.split('/');
      const taskId = parts.length > 2 ? parts[parts.length - 2] : data.taskId;
      const updated = toggleTaskProgress(101, taskId);
      return { data: { progress: updated } };
    }


    // Announcements
    if (url === '/announcements' || url === '/teacher/announcements') {
      const newAnn = addAnnouncement(data);
      return { data: { announcement: newAnn } };
    }

    // Resources
    if (url === '/resources' || url === '/teacher/resources') {
      const newRes = addResource(data);
      return { data: { resource: newRes } };
    }

    // Admin Actions
    if (url === '/admin/users') {
      const newUser = addUser(data);
      return { data: { user: newUser } };
    }
    if (url === '/admin/subjects') {
      const newSub = addSubject(data);
      return { data: { subject: newSub } };
    }
    if (url === '/admin/classrooms') {
      const newRoom = addClassroom(data);
      return { data: { classroom: newRoom } };
    }
    if (url === '/admin/classes') {
      const newClass = addClass(data);
      return { data: { class: newClass } };
    }
    if (url === '/admin/reset-demo') {
      resetDemoData();
      return { data: { message: 'Demo data reset successfully.' } };
    }

    // Preferences
    if (url === '/student/preferences') {
      const saved = saveStudentPreferences(data.studentId || 101, data);
      return { data: { preferences: saved } };
    }

    return { data: { success: true } };
  },

  put: async (url, data) => {
    if (url.startsWith('/student/preferences')) {
      const saved = saveStudentPreferences(data.studentId || 101, data);
      return { data: { preferences: saved } };
    }
    return { data: { success: true } };
  },

  delete: async (url) => {
    const parts = url.split('/');
    const id = parseInt(parts[parts.length - 1], 10);

    if (url.startsWith('/admin/users/')) deleteUser(id);
    if (url.startsWith('/admin/subjects/')) deleteSubject(id);
    if (url.startsWith('/admin/classrooms/')) deleteClassroom(id);
    if (url.startsWith('/admin/classes/')) deleteClass(id);
    if (url.startsWith('/continuity/')) deleteContinuityPackage(id);
    if (url.startsWith('/announcements/')) deleteAnnouncement(id);
    if (url.startsWith('/resources/')) deleteResource(id);

    return { data: { success: true } };
  }
};

export default mockApi;
