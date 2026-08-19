import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Plus, Edit2, Trash2, Users, CheckCircle, X } from 'lucide-react';

export default function AdminClassesSubjectsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  // Form state
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', description: '' });
  const [classForm, setClassForm] = useState({
    subject_id: '',
    teacher_id: '',
    classroom_id: '',
    name: '',
    schedule_time: 'Mon / Wed 10:00 AM',
    academic_term: 'Semester 1 (2026)'
  });

  // Enrollment Modal state
  const [selectedClassForEnrollment, setSelectedClassForEnrollment] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/classes'),
      api.get('/admin/subjects'),
      api.get('/admin/classrooms'),
      api.get('/auth/users-by-role/teacher')
    ]).then(([clsRes, subRes, roomRes, teachRes]) => {
      setClasses(clsRes.data.classes || []);
      setSubjects(subRes.data.subjects || []);
      setClassrooms(roomRes.data.classrooms || []);
      setTeachers(teachRes.data.users || []);
    }).catch(err => console.error('Error fetching admin class/subject data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Subject Handlers
  const handleSubjectSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const apiCall = editingSubject
      ? api.put(`/admin/subjects/${editingSubject.id}`, subjectForm)
      : api.post('/admin/subjects', subjectForm);

    apiCall.then(() => {
      setSuccessMsg(`Subject ${editingSubject ? 'updated' : 'created'} successfully.`);
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
      setSubjectForm({ code: '', name: '', description: '' });
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Subject action failed.'));
  };

  const handleDeleteSubject = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete subject "${name}"?`)) return;
    api.delete(`/admin/subjects/${id}`).then(() => {
      setSuccessMsg('Subject deleted successfully.');
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Failed to delete subject.'));
  };

  // Class Handlers
  const handleClassSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const apiCall = editingClass
      ? api.put(`/admin/classes/${editingClass.id}`, classForm)
      : api.post('/admin/classes', classForm);

    apiCall.then(() => {
      setSuccessMsg(`Class section ${editingClass ? 'updated' : 'created'} successfully.`);
      setIsClassModalOpen(false);
      setEditingClass(null);
      setClassForm({ subject_id: '', teacher_id: '', classroom_id: '', name: '', schedule_time: 'Mon / Wed 10:00 AM', academic_term: 'Semester 1 (2026)' });
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Class action failed.'));
  };

  const handleDeleteClass = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete class "${name}"?`)) return;
    api.delete(`/admin/classes/${id}`).then(() => {
      setSuccessMsg('Class section deleted successfully.');
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Failed to delete class.'));
  };

  // Enrollment Handlers
  const openEnrollmentModal = (cls) => {
    setSelectedClassForEnrollment(cls);
    fetchEnrollmentData(cls.id);
  };

  const fetchEnrollmentData = (classId) => {
    api.get(`/admin/classes/${classId}/enrollments`).then((res) => {
      setEnrolledStudents(res.data.enrolled || []);
      setAvailableStudents(res.data.availableStudents || []);
      if (res.data.availableStudents && res.data.availableStudents.length > 0) {
        setSelectedStudentToEnroll(res.data.availableStudents[0].student_id);
      } else {
        setSelectedStudentToEnroll('');
      }
    });
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!selectedStudentToEnroll || !selectedClassForEnrollment) return;
    api.post(`/admin/classes/${selectedClassForEnrollment.id}/enrollments`, { student_id: selectedStudentToEnroll })
      .then(() => {
        fetchEnrollmentData(selectedClassForEnrollment.id);
        fetchAllData();
      })
      .catch(err => setErrorMsg(err.response?.data?.error || 'Enrollment failed.'));
  };

  const handleUnenrollStudent = (enrollmentId) => {
    api.delete(`/admin/enrollments/${enrollmentId}`)
      .then(() => {
        fetchEnrollmentData(selectedClassForEnrollment.id);
        fetchAllData();
      })
      .catch(err => setErrorMsg(err.response?.data?.error || 'Unenrollment failed.'));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Classes & Subjects Management</h2>
            <p className="text-xs text-slate-500">Create subject offerings, set up class sections, assign faculty, and manage enrollments.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'classes' ? (
            <button
              onClick={() => {
                setEditingClass(null);
                setClassForm({
                  subject_id: subjects[0]?.id || '',
                  teacher_id: teachers[0]?.teacher_id || '',
                  classroom_id: classrooms[0]?.id || '',
                  name: '',
                  schedule_time: 'Mon / Wed 10:00 AM',
                  academic_term: 'Semester 1 (2026)'
                });
                setIsClassModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Class Section</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingSubject(null);
                setSubjectForm({ code: '', name: '', description: '' });
                setIsSubjectModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subject</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'classes' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Classes ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'subjects' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Subject Catalog ({subjects.length})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : activeTab === 'classes' ? (
        /* Classes View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200">
              No class sections created yet. Click "Create Class Section" above.
            </div>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="p-5 rounded-3xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      {cls.subject_code} • {cls.academic_term}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{cls.name}</h3>
                    <p className="text-xs text-slate-500">Instructor: {cls.teacher_name}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                    {cls.enrolled_count || 0} Enrolled
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Schedule: <strong>{cls.schedule_time}</strong></div>
                  <div>Classroom: <strong>{cls.room_number ? `${cls.room_number} (${cls.building})` : 'Unassigned'}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openEnrollmentModal(cls)}
                    className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Enrollment</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setClassForm({
                          subject_id: cls.subject_id,
                          teacher_id: cls.teacher_id,
                          classroom_id: cls.classroom_id || '',
                          name: cls.name,
                          schedule_time: cls.schedule_time,
                          academic_term: cls.academic_term
                        });
                        setIsClassModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Subjects Catalog View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-3.5 px-6">Subject Code</th>
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Total Classes</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-indigo-700 uppercase">{sub.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{sub.description}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{sub.total_classes || 0} Sections</td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingSubject(sub);
                          setSubjectForm({ code: sub.code, name: sub.name, description: sub.description });
                          setIsSubjectModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MATH-101"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Mathematics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Subject syllabus summary..."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingClass ? 'Edit Class Section' : 'Create Class Section'}</h3>
            <form onSubmit={handleClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 Mathematics - Section A"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject</label>
                  <select
                    value={classForm.subject_id}
                    onChange={(e) => setClassForm({ ...classForm, subject_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} ({s.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Teacher</label>
                  <select
                    value={classForm.teacher_id}
                    onChange={(e) => setClassForm({ ...classForm, teacher_id: e.target.user_id || e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.teacher_id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Classroom</label>
                  <select
                    value={classForm.classroom_id}
                    onChange={(e) => setClassForm({ ...classForm, classroom_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {classrooms.map((cr) => (
                      <option key={cr.id} value={cr.id}>{cr.room_number} ({cr.building})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={classForm.schedule_time}
                    onChange={(e) => setClassForm({ ...classForm, schedule_time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Management Modal */}
      {selectedClassForEnrollment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setSelectedClassForEnrollment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Manage Enrollment: {selectedClassForEnrollment.name}</h3>
              <p className="text-xs text-slate-500">Enroll available students into this section or remove active enrollments.</p>
            </div>

            {/* Enroll New Student Form */}
            <form onSubmit={handleEnrollStudent} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <select
                value={selectedStudentToEnroll}
                onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                {availableStudents.length === 0 ? (
                  <option value="">No unenrolled students available</option>
                ) : (
                  availableStudents.map((st) => (
                    <option key={st.student_id} value={st.student_id}>
                      {st.name} ({st.roll_number} - {st.grade_level})
                    </option>
                  ))
                )}
              </select>

              <button
                type="submit"
                disabled={!selectedStudentToEnroll || availableStudents.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Enroll Student
              </button>
            </form>

            {/* Currently Enrolled Students List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Currently Enrolled Students ({enrolledStudents.length})</h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                {enrolledStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No students enrolled in this section yet.</p>
                ) : (
                  enrolledStudents.map((st) => (
                    <div key={st.enrollment_id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{st.name}</span>
                        <span className="text-slate-500 text-[11px] block">Roll: {st.roll_number} • {st.grade_level}</span>
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(st.enrollment_id)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 bg-rose-50 rounded-lg"
                      >
                        Unenroll
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
