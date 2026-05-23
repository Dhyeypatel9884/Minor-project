import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ClientDashboard from './pages/ClientDashboard';
import PostProject from './pages/PostProject';
import MyProjects from './pages/MyProjects';
import BidsReceived from './pages/BidsReceived';
import Profile from './pages/Profile';
import ProjectDetails from './pages/ProjectDetails';
import BrowseProjects from './pages/BrowseProjects';
import PlaceBid from './pages/PlaceBid';
import MyBids from './pages/MyBids';
import Messages from './pages/Messages';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-projects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <BrowseProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-details/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/place-bid/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PlaceBid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyBids />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'client']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute allowedRoles={['student', 'client']}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'client']}>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Client Routes (Protected) */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/post-project"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <PostProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/my-projects"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <MyProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/bids"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <BidsReceived />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
