import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import CreatePrescription from './pages/doctor/CreatePrescription';
import PrescriptionDetails from './pages/common/PrescriptionDetails';
import MedicineManagement from './pages/pharmacist/MedicineManagement';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Doctor Routes */}
          <Route
            path="/doctor"
            element={
              // <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              //  </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/create-prescription"
            element={
              // <ProtectedRoute allowedRoles={['doctor']}>
                <CreatePrescription />
              //  {/* </ProtectedRoute> */}
            }
          />
          
          {/* Patient Routes */}
          <Route
            path="/patient"
            element={
              // <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              // </ProtectedRoute>
            }
          />
          
          {/* Pharmacist Routes */}
          <Route
            path="/pharmacist"
            element={
              // <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistDashboard />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist/medicines"
            element={
              // <ProtectedRoute allowedRoles={['pharmacist']}>
                <MedicineManagement />
              // </ProtectedRoute>
            }
          />
          
          {/* Common Routes */}
          <Route
            path="/prescription/:id"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'patient', 'pharmacist']}>
                <PrescriptionDetails />
              </ProtectedRoute>
            }
          />
          
          {/* <Route path="/" element={<Navigate to="/login" />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;