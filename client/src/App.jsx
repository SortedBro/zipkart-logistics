import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings.jsx';
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

import Tracking from './pages/tracking/Tracking.jsx';
import TrackPublic from './pages/tracking/TrackPublic.jsx';

// TMS Pro Additions
import DriversList from './pages/drivers/DriversList.jsx';
import DriverNew from './pages/drivers/DriverNew.jsx';

import InvoicesList from './pages/invoices/InvoicesList.jsx';
import InvoiceNew from './pages/invoices/InvoiceNew.jsx';

import ExpensesList from './pages/expenses/ExpensesList.jsx';
import ExpenseNew from './pages/expenses/ExpenseNew.jsx';

import LoansList from './pages/loans/LoansList.jsx';
import LoanNew from './pages/loans/LoanNew.jsx';

import TransactionsList from './pages/transactions/TransactionsList.jsx';
import TransactionNew from './pages/transactions/TransactionNew.jsx';

import FuelList from './pages/fuel/FuelList.jsx';
import FuelNew from './pages/fuel/FuelNew.jsx';

import VendorsList from './pages/vendors/VendorsList.jsx';
import VendorNew from './pages/vendors/VendorNew.jsx';

import InventoryList from './pages/inventory/InventoryList.jsx';
import InventoryNew from './pages/inventory/InventoryNew.jsx';

import AttendanceManager from './pages/attendance/AttendanceManager.jsx';

import SalariesList from './pages/salaries/SalariesList.jsx';
import SalaryNew from './pages/salaries/SalaryNew.jsx';

import DocumentsList from './pages/documents/DocumentsList.jsx';
import DocumentNew from './pages/documents/DocumentNew.jsx';

import ReportsHub from './pages/reports/ReportsHub.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ── Public Tracking ── */}
      <Route path="/track"          element={<TrackPublic />} />
      <Route path="/track/:lrNumber" element={<TrackPublic />} />

      {/* ── Core Fleet & Operations ── */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/parties"     element={<ProtectedRoute><PartiesList /></ProtectedRoute>} />
      <Route path="/parties/new" element={<ProtectedRoute><PartyNew /></ProtectedRoute>} />
      <Route path="/parties/:id" element={<ProtectedRoute><PartyShow /></ProtectedRoute>} />

      <Route path="/trucks"     element={<ProtectedRoute><TrucksList /></ProtectedRoute>} />
      <Route path="/trucks/new" element={<ProtectedRoute><TruckNew /></ProtectedRoute>} />
      <Route path="/trucks/:id" element={<ProtectedRoute><TruckShow /></ProtectedRoute>} />

      <Route path="/drivers"     element={<ProtectedRoute><DriversList /></ProtectedRoute>} />
      <Route path="/drivers/new" element={<ProtectedRoute><DriverNew /></ProtectedRoute>} />

      <Route path="/bilties"     element={<ProtectedRoute><BiltiesList /></ProtectedRoute>} />
      <Route path="/bilties/new" element={<ProtectedRoute><BiltyNew /></ProtectedRoute>} />
      <Route path="/bilties/:id" element={<ProtectedRoute><BiltyShow /></ProtectedRoute>} />

      <Route path="/trips"     element={<ProtectedRoute><TripsList /></ProtectedRoute>} />
      <Route path="/trips/new" element={<ProtectedRoute><TripNew /></ProtectedRoute>} />

      <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />

      {/* ── Finance & Accounting ── */}
      <Route path="/invoices"     element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
      <Route path="/invoices/new" element={<ProtectedRoute><InvoiceNew /></ProtectedRoute>} />

      <Route path="/expenses"     element={<ProtectedRoute><ExpensesList /></ProtectedRoute>} />
      <Route path="/expenses/new" element={<ProtectedRoute><ExpenseNew /></ProtectedRoute>} />

      <Route path="/loans"     element={<ProtectedRoute><LoansList /></ProtectedRoute>} />
      <Route path="/loans/new" element={<ProtectedRoute><LoanNew /></ProtectedRoute>} />

      <Route path="/transactions"     element={<ProtectedRoute><TransactionsList /></ProtectedRoute>} />
      <Route path="/transactions/new" element={<ProtectedRoute><TransactionNew /></ProtectedRoute>} />

      {/* ── Resources ── */}
      <Route path="/fuel"     element={<ProtectedRoute><FuelList /></ProtectedRoute>} />
      <Route path="/fuel/new" element={<ProtectedRoute><FuelNew /></ProtectedRoute>} />

      <Route path="/vendors"     element={<ProtectedRoute><VendorsList /></ProtectedRoute>} />
      <Route path="/vendors/new" element={<ProtectedRoute><VendorNew /></ProtectedRoute>} />

      <Route path="/inventory"     element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
      <Route path="/inventory/new" element={<ProtectedRoute><InventoryNew /></ProtectedRoute>} />

      {/* ── HR & Payroll ── */}
      <Route path="/attendance" element={<ProtectedRoute><AttendanceManager /></ProtectedRoute>} />

      <Route path="/salaries"     element={<ProtectedRoute><SalariesList /></ProtectedRoute>} />
      <Route path="/salaries/new" element={<ProtectedRoute><SalaryNew /></ProtectedRoute>} />

      <Route path="/staff"     element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
      <Route path="/staff/new" element={<ProtectedRoute><StaffNew /></ProtectedRoute>} />

      {/* ── System & Vault ── */}
      <Route path="/documents"     element={<ProtectedRoute><DocumentsList /></ProtectedRoute>} />
      <Route path="/documents/new" element={<ProtectedRoute><DocumentNew /></ProtectedRoute>} />

      <Route path="/reports"  element={<ProtectedRoute><ReportsHub /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
