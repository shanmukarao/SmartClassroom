import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Building, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

export default function AdminClassroomsPage() {
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ room_number: '', building: '', capacity: 40, features: 'Interactive Smartboard, Projector' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchClassrooms = () => {
    setLoading(true);
    api.get('/admin/classrooms')
      .then(res => setClassrooms(res.data.classrooms || []))
      .catch(err => console.error('Fetch classrooms error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const apiCall = editingRoom
      ? api.put(`/admin/classrooms/${editingRoom.id}`, roomForm)
      : api.post('/admin/classrooms', roomForm);

    apiCall.then(() => {
      setSuccessMsg(`Classroom ${editingRoom ? 'updated' : 'created'} successfully.`);
      setIsModalOpen(false);
      setEditingRoom(null);
      setRoomForm({ room_number: '', building: '', capacity: 40, features: 'Interactive Smartboard, Projector' });
      fetchClassrooms();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Classroom action failed.'));
  };

  const handleDelete = (id, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete classroom "${roomNumber}"?`)) return;
    api.delete(`/admin/classrooms/${id}`).then(() => {
      setSuccessMsg('Classroom deleted successfully.');
      fetchClassrooms();
      setTimeout(() => setSuccessMsg(''), 3000);
    }).catch(err => setErrorMsg(err.response?.data?.error || 'Failed to delete classroom.'));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Classrooms</h2>
            <p className="text-xs text-slate-500">Configure campus smart classrooms, seating capacity, and digital features.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingRoom(null);
            setRoomForm({ room_number: '', building: '', capacity: 40, features: 'Interactive Smartboard, Projector' });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Classroom</span>
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

      {/* Classrooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200">
            No classrooms configured yet. Click "Add Classroom" above.
          </div>
        ) : (
          classrooms.map((cr) => (
            <div key={cr.id} className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                    {cr.room_number}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cr.capacity} Seats
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{cr.building}</h3>
                <p className="text-xs text-slate-500">Features: {cr.features || 'Standard Smartboard'}</p>
                <p className="text-xs font-semibold text-slate-700">Assigned Classes: {cr.assigned_classes || 0}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingRoom(cr);
                    setRoomForm({ room_number: cr.room_number, building: cr.building, capacity: cr.capacity, features: cr.features });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cr.id, cr.room_number)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingRoom ? 'Edit Classroom' : 'Add New Classroom'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R-101"
                    value={roomForm.room_number}
                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Building Complex</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryabhatta Science Block"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={200}
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Smart Equipment / Features</label>
                <input
                  type="text"
                  placeholder="Interactive Smartboard, Projector, Audio System"
                  value={roomForm.features}
                  onChange={(e) => setRoomForm({ ...roomForm, features: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
                >
                  {editingRoom ? 'Save Changes' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
