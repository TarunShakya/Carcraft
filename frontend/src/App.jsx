import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Leads from './pages/Leads';
import Shop from './pages/Shop';
import Service from './pages/Service';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/sales" element={<Leads />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/orders" element={<Shop />} />
        <Route path="/shipments" element={<Shop />} />
        <Route path="/reviews" element={<Shop />} />
        <Route path="/service" element={<Service />} />
        <Route path="/technicians" element={<Service />} />
        <Route path="/service-history" element={<Service />} />
        <Route path="/notifications" element={<Service />} />
      </Routes>
    </BrowserRouter>
  );
}