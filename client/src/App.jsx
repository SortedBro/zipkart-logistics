import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import PartiesList from './pages/parties/PartiesList.jsx';
import PartyNew from './pages/parties/PartyNew.jsx';
import PartyShow from './pages/parties/PartyShow.jsx';

import TrucksList from './pages/trucks/TrucksList.jsx';
import TruckNew from './pages/trucks/TruckNew.jsx';
import TruckShow from './pages/trucks/TruckShow.jsx';

import BiltiesList from './pages/bilties/BiltiesList.jsx';
import BiltyNew from './pages/bilties/BiltyNew.jsx';
import BiltyShow from './pages/bilties/BiltyShow.jsx';

import TripsList from './pages/trips/TripsList.jsx';
import TripNew from './pages/trips/TripNew.jsx';

import StaffList from './pages/staff/StaffList.jsx';
import StaffNew from './pages/staff/StaffNew.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/parties" element={<ProtectedRoute><PartiesList /></ProtectedRoute>} />
      <Route path="/parties/new" element={<ProtectedRoute><PartyNew /></ProtectedRoute>} />
      <Route path="/parties/:id" element={<ProtectedRoute><PartyShow /></ProtectedRoute>} />

      <Route path="/trucks" element={<ProtectedRoute><TrucksList /></ProtectedRoute>} />
      <Route path="/trucks/new" element={<ProtectedRoute><TruckNew /></ProtectedRoute>} />
      <Route path="/trucks/:id" element={<ProtectedRoute><TruckShow /></ProtectedRoute>} />

      <Route path="/bilties" element={<ProtectedRoute><BiltiesList /></ProtectedRoute>} />
      <Route path="/bilties/new" element={<ProtectedRoute><BiltyNew /></ProtectedRoute>} />
      <Route path="/bilties/:id" element={<ProtectedRoute><BiltyShow /></ProtectedRoute>} />

      <Route path="/trips" element={<ProtectedRoute><TripsList /></ProtectedRoute>} />
      <Route path="/trips/new" element={<ProtectedRoute><TripNew /></ProtectedRoute>} />

      <Route path="/staff" element={<ProtectedRoute ownerOnly><StaffList /></ProtectedRoute>} />
      <Route path="/staff/new" element={<ProtectedRoute ownerOnly><StaffNew /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
