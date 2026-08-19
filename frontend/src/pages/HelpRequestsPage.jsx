import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AskHelpModal from '../components/AskHelpModal';
import { HelpCircle, Lock, Plus, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function HelpRequestsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [teacherInsights, setTeacherInsights] = useState({ aggregatedTopics: [], requestDetails: [] });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const isStudent = user.role === 'student';

  const fetchData = () => {
    setLoading(true);
    if (isStudent) {
      api.get('/student/classes').then(res => setClasses(res.data.classes || []));
      api.get('/help/student')
        .then(res => setRequests(res.data.requests || []))
        .finally(() => setLoading(false));
    } else {
      api.get('/help/teacher-insights')
        .then(res => setTeacherInsights(res.data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.role]);

  const handleUpdateStatus = (requestId, newStatus) => {
    api.put(`/help/${requestId}/status`, { status: newStatus })
      .then(() => fetchData())
      .catch(err => console.error('Update help request status error:', err));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('helpRequests')}</h2>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              Privacy Scoped: Confidential communication channel between student and subject teacher.
            </p>
          </div>
        </div>

        {isStudent && (
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t('askForHelp')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : isStudent ? (
        /* Student View */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Submitted Help Requests</h3>

          {requests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">You have not submitted any private help requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 uppercase">
                      {req.subject_name} • {req.topic_name}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      req.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : req.status === 'in_progress' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">"{req.description || 'No description provided.'}"</p>
                  <span className="text-[10px] text-slate-400 block">Submitted on: {new Date(req.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Teacher View */
        <div className="space-y-6">
          {/* Aggregated Topic Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Aggregated Confusion Topics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teacherInsights.aggregatedTopics.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-brand-600">{item.subject_name}</span>
                  <h4 className="text-sm font-bold text-slate-900">{item.topic_name}</h4>
                  <div className="flex justify-between text-xs text-slate-600 pt-1">
                    <span>Total Requests: <strong>{item.total_requests}</strong></span>
                    <span className="text-amber-700 font-semibold">{item.pending_requests} Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Requests for Controlled Follow-Up */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Student Query Follow-Up Queue</h3>
            <div className="space-y-3">
              {teacherInsights.requestDetails.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{req.student_name} ({req.roll_number})</span>
                      <span className="text-xs text-slate-500">• {req.class_name}</span>
                    </div>
                    <p className="text-xs font-semibold text-brand-700">Topic: {req.topic_name}</p>
                    <p className="text-xs text-slate-700">"{req.description}"</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isStudent && (
        <AskHelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          classes={classes}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
