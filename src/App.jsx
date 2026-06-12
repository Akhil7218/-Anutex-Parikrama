import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DeviceShell from './components/DeviceShell';
import Splash from './components/Splash';
import Login from './components/Login';
import Register from './components/Register';
import UserChecklist from './components/UserChecklist';
import UploadVerification from './components/UploadVerification';
import AdminData from './components/AdminData';
import AdminChecklistDetail from './components/AdminChecklistDetail';
import AdminCreateTemplate from './components/AdminCreateTemplate';
import AdminExistingTemplates from './components/AdminExistingTemplates';
import Profile from './components/Profile';
import SuperAdmin from './components/SuperAdmin';
import TimeSimulator from './components/TimeSimulator';

function App() {
  return (
    <BrowserRouter>
      <DeviceShell>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* USER ROUTES */}
          <Route path="/user/checklist" element={<UserChecklist />} />
          <Route path="/user/upload/:itemId" element={<UploadVerification />} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin/data" element={<AdminData />} />
          <Route path="/admin/create" element={<AdminCreateTemplate />} />
          <Route path="/admin/existing" element={<AdminExistingTemplates />} />
          <Route path="/admin/checklist/:checklistId" element={<AdminChecklistDetail />} />
          
          {/* SUPER ADMIN ROUTES */}
          <Route path="/superadmin" element={<SuperAdmin />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TimeSimulator />
      </DeviceShell>
    </BrowserRouter>
  );
}

export default App;
