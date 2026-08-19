import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminClassesSubjectsPage from './pages/AdminClassesSubjectsPage';
import AdminClassroomsPage from './pages/AdminClassroomsPage';
import ClassContinuityPage from './pages/ClassContinuityPage';
import HelpRequestsPage from './pages/HelpRequestsPage';
import ResourcesPage from './pages/ResourcesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import PreferencesPage from './pages/PreferencesPage';

function ProtectedLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/admin'} replace />} />

      {/* Student Protected Routes */}
      <Route path="/student" element={<ProtectedLayout allowedRoles={['student']}><StudentDashboard /></ProtectedLayout>} />
      <Route path="/student/help" element={<ProtectedLayout allowedRoles={['student']}><HelpRequestsPage /></ProtectedLayout>} />
      <Route path="/student/missed" element={<ProtectedLayout allowedRoles={['student']}><ClassContinuityPage /></ProtectedLayout>} />
      <Route path="/student/resources" element={<ProtectedLayout allowedRoles={['student']}><ResourcesPage /></ProtectedLayout>} />
      <Route path="/student/announcements" element={<ProtectedLayout allowedRoles={['student']}><AnnouncementsPage /></ProtectedLayout>} />
      <Route path="/student/preferences" element={<ProtectedLayout allowedRoles={['student']}><PreferencesPage /></ProtectedLayout>} />

      {/* Teacher Protected Routes */}
      <Route path="/teacher" element={<ProtectedLayout allowedRoles={['teacher']}><TeacherDashboard /></ProtectedLayout>} />
      <Route path="/teacher/help-insights" element={<ProtectedLayout allowedRoles={['teacher']}><HelpRequestsPage /></ProtectedLayout>} />
      <Route path="/teacher/signals" element={<ProtectedLayout allowedRoles={['teacher']}><TeacherDashboard /></ProtectedLayout>} />
      <Route path="/teacher/continuity" element={<ProtectedLayout allowedRoles={['teacher']}><ClassContinuityPage /></ProtectedLayout>} />
      <Route path="/teacher/resources" element={<ProtectedLayout allowedRoles={['teacher']}><ResourcesPage /></ProtectedLayout>} />
      <Route path="/teacher/announcements" element={<ProtectedLayout allowedRoles={['teacher']}><AnnouncementsPage /></ProtectedLayout>} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<ProtectedLayout allowedRoles={['admin']}><AdminDashboard /></ProtectedLayout>} />
      <Route path="/admin/users" element={<ProtectedLayout allowedRoles={['admin']}><AdminManageUsersPage /></ProtectedLayout>} />
      <Route path="/admin/classes" element={<ProtectedLayout allowedRoles={['admin']}><AdminClassesSubjectsPage /></ProtectedLayout>} />
      <Route path="/admin/classrooms" element={<ProtectedLayout allowedRoles={['admin']}><AdminClassroomsPage /></ProtectedLayout>} />

      {/* Catch-All */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/admin') : '/login'} replace />} />
    </Routes>
  );
}
