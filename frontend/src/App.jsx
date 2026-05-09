import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/Layout.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentList from './pages/StudentList.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import ManageStudents from './pages/manage/ManageStudents.jsx';
import ManageFamily from './pages/manage/ManageFamily.jsx';
import ManageAcademic from './pages/manage/ManageAcademic.jsx';
import ManageBehavior from './pages/manage/ManageBehavior.jsx';
import ManageEnrollment from './pages/manage/ManageEnrollment.jsx';
import TrainModel from './pages/prediction/TrainModel.jsx';
import PredictionResults from './pages/prediction/PredictionResults.jsx';
import FeatureImportance from './pages/prediction/FeatureImportance.jsx';
import Simulation from './pages/Simulation.jsx';
import Tools from './pages/Tools.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentDetail />} />

        <Route path="manage/students" element={<ManageStudents />} />
        <Route path="manage/family" element={<ManageFamily />} />
        <Route path="manage/academic" element={<ManageAcademic />} />
        <Route path="manage/behavior" element={<ManageBehavior />} />
        <Route path="manage/enrollment" element={<ManageEnrollment />} />

        <Route path="prediction/train" element={<TrainModel />} />
        <Route path="prediction/results" element={<PredictionResults />} />
        <Route path="prediction/analysis" element={<FeatureImportance />} />

        <Route path="simulation" element={<Simulation />} />
        <Route path="tools" element={<Tools />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
