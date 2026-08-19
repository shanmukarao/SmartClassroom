import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import NewUserModal from '../components/NewUserModal';
import { Users, Plus, Edit2, Trash2, Search, Filter, Shield, GraduationCap, UserCheck, CheckCircle } from 'lucide-react';

export default function AdminManageUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch((err) => console.error('Fetch users error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    setErrorMsg('');
    setSuccessMsg('');
    api.delete(`/admin/users/${userId}`)
      .then(() => {
        setSuccessMsg(`User "${userName}" deleted successfully.`);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || 'Failed to delete user.');
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    api.put(`/admin/users/${editingUser.id}`, editingUser)
      .then(() => {
        setSuccessMsg(`User "${editingUser.name}" updated successfully.`);
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || 'Failed to update user.');
      });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.roll_number && u.roll_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage User Accounts</h2>
            <p className="text-xs text-slate-500">Create, edit, assign roles, and delete Students, Teachers, and Admins.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createUser')}</span>
        </button>
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

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students ({users.filter(u => u.role === 'student').length})</option>
            <option value="teacher">Teachers ({users.filter(u => u.role === 'teacher').length})</option>
            <option value="admin">Administrators ({users.filter(u => u.role === 'admin').role === 'admin' ? users.filter(u => u.role === 'admin').length : users.filter(u => u.role === 'admin').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No users match the selected search/filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-3.5 px-6">User Name & Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Role Details</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        u.role === 'student'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'teacher'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.role === 'student' ? (
                        <span>Roll: <strong>{u.roll_number || 'N/A'}</strong> • {u.grade_level} ({u.section})</span>
                      ) : u.role === 'teacher' ? (
                        <span>{u.designation} • {u.department}</span>
                      ) : (
                        <span>System Administration</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <NewUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setSuccessMsg('User account created successfully.');
          setTimeout(() => setSuccessMsg(''), 3000);
        }}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit User Account</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser.role === 'student' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Roll No</label>
                    <input
                      type="text"
                      value={editingUser.roll_number || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, roll_number: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Grade</label>
                    <input
                      type="text"
                      value={editingUser.grade_level || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, grade_level: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Section</label>
                    <input
                      type="text"
                      value={editingUser.section || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}

              {editingUser.role === 'teacher' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                    <input
                      type="text"
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
