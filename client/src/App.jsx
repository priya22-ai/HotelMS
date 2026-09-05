import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import AdminLogin from './pages/admin/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminMenu from './pages/admin/Menu.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminTimings from './pages/admin/Timings.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminPayments from './pages/admin/Payments.jsx';
import AdminNotifications from './pages/admin/Notifications.jsx';

import UserLogin from './pages/user/Login.jsx';
import UserDashboard from './pages/user/Dashboard.jsx';
import UserMealOrder from './pages/user/MealOrder.jsx';
import UserActivity from './pages/user/Activity.jsx';
import UserReport from './pages/user/Report.jsx';
import UserPayments from './pages/user/Payments.jsx';
import UserNotifications from './pages/user/Notifications.jsx';

function Layout({ children }) {
  return (
    <>
      <Header />
      <div className="header-spacer" />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/menu" element={<AdminMenu />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/timings" element={<AdminTimings />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />

      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/meal-order" element={<UserMealOrder />} />
      <Route path="/user/activity" element={<UserActivity />} />
      <Route path="/user/report" element={<UserReport />} />
      <Route path="/user/payments" element={<UserPayments />} />
      <Route path="/user/notifications" element={<UserNotifications />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
