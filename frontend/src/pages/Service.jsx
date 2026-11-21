import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Service() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // --- Appointment Form - SERVICEAPPOINTMENT MODEL MATCH ---
  const [appointmentForm, setAppointmentForm] = useState({
    customer: '', vehicle: '', service_type: 'General Service',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00', status: 'Booked', notes: '',
  });

  // --- Technician Form - TECHNICIAN MODEL MATCH ---
  const [techForm, setTechForm] = useState({
    name: '', phone: '', specialization: 'Engine', experience_years: '', is_available: true,
  });

  // --- Service Record Form - SERVICERECORD MODEL MATCH ---
  const [recordForm, setRecordForm] = useState({
    technician: '', work_done: '', cost: '', recommendation: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('service-appointments/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => api.get('appointments/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => [])),
      api.get('technicians/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([a, t, c, v]) => {
      setAppointments(a); setTechnicians(t); setCustomersList(c); setVehiclesList(v);
    }).finally(() => setLoading(false));
  }, []);

  const getCustomerName = (id) => {
    const f = customersList.find(c => c.id === id);
    return f ? f.full_name : `Customer #${id}`;
  };
  const getVehicleName = (id) => {
    const f = vehiclesList.find(v => v.id === id);
    return f ? `${f.model_name} ${f.variant || ''}` : '—';
  };

  // --- Book Appointment ---
  const handleAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentForm.customer || !appointmentForm.vehicle || !appointmentForm.appointment_date || !appointmentForm.appointment_time) {
      alert('Customer, Vehicle, Date aur Time zaroori hai');
      return;
    }
    try {
      await api.post('service-appointments/', {
        customer: Number(appointmentForm.customer),
        vehicle: Number(appointmentForm.vehicle),
        service_type: appointmentForm.service_type,
        appointment_date: appointmentForm.appointment_date,
        appointment_time: appointmentForm.appointment_time,
        status: appointmentForm.status,
        notes: appointmentForm.notes || null,
      }).catch(async (err) => {
        if (err.response?.status === 404) {
          return await api.post('appointments/', {
            customer: Number(appointmentForm.customer),
            vehicle: Number(appointmentForm.vehicle),
            service_type: appointmentForm.service_type,
            appointment_date: appointmentForm.appointment_date,
            appointment_time: appointmentForm.appointment_time,
            status: appointmentForm.status,
            notes: appointmentForm.notes || null,
          });
        }
        throw err;
      });
      alert('Appointment book ho gayi!');
      setShowAppointmentModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  // --- Add Technician ---
  const handleAddTechnician = async (e) => {
    e.preventDefault();
    if (!techForm.name || !techForm.phone) { alert('Name aur Phone zaroori hai'); return; }
    try {
      await api.post('technicians/', {
        name: techForm.name,
        phone: techForm.phone,
        specialization: techForm.specialization,
        experience_years: techForm.experience_years ? Number(techForm.experience_years) : 0,
        is_available: techForm.is_available,
      });
      alert('Technician add ho gaya!');
      setShowTechModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  // --- Complete Service - Create ServiceRecord + Assign Technician ---
  const openRecord = (appt) => {
    setSelectedAppointment(appt);
    setRecordForm({ technician: '', work_done: '', cost: '', recommendation: '' });
    setShowRecordModal(true);
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.work_done || !recordForm.cost) { alert('Work Done aur Cost zaroori hai'); return; }
    try {
      await api.post('service-records/', {
        appointment: selectedAppointment.id,
        technician: recordForm.technician ? Number(recordForm.technician) : null,
        work_done: recordForm.work_done,
        cost: Number(recordForm.cost),
        recommendation: recordForm.recommendation || null,
      }).catch(async (err) => {
        if (err.response?.status === 404) {
          return await api.post('service-history/', {
            appointment: selectedAppointment.id,
            technician: recordForm.technician ? Number(recordForm.technician) : null,
            work_done: recordForm.work_done,
            cost: Number(recordForm.cost),
            recommendation: recordForm.recommendation || null,
          });
        }
        throw err;
      });
      alert('Service Record save ho gaya! Technician assign ho gaya.');
      setShowRecordModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  return (
    <AdminLayout title="Service Center" subtitle="Appointments, Technicians & Service History">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('appointments')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'appointments' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Appointments ({appointments.length})</button>
        <button onClick={() => setActiveTab('technicians')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'technicians' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Technicians ({technicians.length})</button>
      </div>

      {/* ===== APPOINTMENTS TAB ===== */}
      {activeTab === 'appointments' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAppointmentModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Book Appointment</button>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Appointments</h3>
            {loading ? <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
            : appointments.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi appointment nahi hai. + Book Appointment se add kar.</p>
            : <div className="mt-5 space-y-3">{appointments.map(a => (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-white border border-[#E8EBF0] rounded-xl flex items-center justify-center text-lg shrink-0">🔧</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text- truncate">{getCustomerName(a.customer)} — {getVehicleName(a.vehicle)}</p>
                  <p className="text- text-[#5B6B82] truncate">{a.service_type} • {a.appointment_date} at {a.appointment_time} • {a.notes || 'No notes'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text- font-semibold bg-blue-100 text-blue-700 shrink-0">{a.status}</span>
                <button onClick={() => openRecord(a)} className="bg-[#0A1628] text-white px-4 py-2 rounded-xl text- font-semibold shrink-0">Complete Service →</button>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== TECHNICIANS TAB ===== */}
      {activeTab === 'technicians' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowTechModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Add Technician</button>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Technicians</h3>
            {technicians.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi Technician nahi hai. + Add Technician se bana.</p>
            : <div className="mt-5 grid sm:grid-cols-2 gap-3">{technicians.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{t.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text- truncate">{t.name}</p>
                  <p className="text- text-[#5B6B82] truncate">{t.specialization} • {t.experience_years} yrs • {t.phone}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text- font-semibold shrink-0 ${t.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{t.is_available ? 'Available' : 'Busy'}</span>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== BOOK APPOINTMENT MODAL ===== */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAppointment} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Book Appointment</h3>
              <button type="button" onClick={() => setShowAppointmentModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-4">Customer *</label>
            <select value={appointmentForm.customer} onChange={e => setAppointmentForm({ ...appointmentForm, customer: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Customer</option>
              {customersList.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Vehicle *</label>
            <select value={appointmentForm.vehicle} onChange={e => setAppointmentForm({ ...appointmentForm, vehicle: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Vehicle</option>
              {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.model_name} {v.variant || ''} — ₹ {Number(v.price).toLocaleString('en-IN')}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Service Type</label>
            <select value={appointmentForm.service_type} onChange={e => setAppointmentForm({ ...appointmentForm, service_type: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>General Service</option><option>Oil Change</option><option>Brake Service</option><option>AC Service</option><option>Denting Painting</option><option>Other</option>
            </select>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Date *</label><input type="date" value={appointmentForm.appointment_date} onChange={e => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Time *</label><input type="time" value={appointmentForm.appointment_time} onChange={e => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <label className="block text- font-medium mt-4">Status</label>
            <select value={appointmentForm.status} onChange={e => setAppointmentForm({ ...appointmentForm, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>Booked</option><option>Confirmed</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
            </select>
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={appointmentForm.notes} onChange={e => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} placeholder="e.g. Brake me awaz aa rahi hai" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Book Appointment →</button>
          </form>
        </div>
      )}

      {/* ===== ADD TECHNICIAN MODAL ===== */}
      {showTechModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddTechnician} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add Technician</h3>
              <button type="button" onClick={() => setShowTechModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-4">Name *</label>
            <input value={techForm.name} onChange={e => setTechForm({ ...techForm, name: e.target.value })} placeholder="e.g. Ramesh Kumar" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Phone *</label>
            <input value={techForm.phone} onChange={e => setTechForm({ ...techForm, phone: e.target.value })} placeholder="9876543210" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Specialization</label>
                <select value={techForm.specialization} onChange={e => setTechForm({ ...techForm, specialization: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Engine</option><option>Brake</option><option>AC</option><option>Electrical</option><option>General</option><option>Body & Paint</option>
                </select></div>
              <div><label className="text- font-medium">Experience (Years)</label><input type="number" value={techForm.experience_years} onChange={e => setTechForm({ ...techForm, experience_years: e.target.value })} placeholder="5" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <label className="flex items-center gap-2 mt-4 text- font-medium">
              <input type="checkbox" checked={techForm.is_available} onChange={e => setTechForm({ ...techForm, is_available: e.target.checked })} className="w-4 h-4" /> Available for work
            </label>
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Add Technician →</button>
          </form>
        </div>
      )}

      {/* ===== COMPLETE SERVICE / ASSIGN TECHNICIAN MODAL ===== */}
      {showRecordModal && selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleRecord} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Complete Service</h3>
              <button type="button" onClick={() => setShowRecordModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <p className="text- text-[#5B6B82] mt-2">For: {getCustomerName(selectedAppointment.customer)} — {getVehicleName(selectedAppointment.vehicle)}</p>
            <p className="text- text-[#5B6B82]">Service: {selectedAppointment.service_type}</p>

            <label className="block text- font-medium mt-4">Assign Technician</label>
            <select value={recordForm.technician} onChange={e => setRecordForm({ ...recordForm, technician: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Technician</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialization} ({t.experience_years} yrs) {t.is_available ? '' : '• Busy'}</option>)}
            </select>
            {technicians.length === 0 && <p className="text- text-red-500 mt-1">Pehle Technicians tab se Technician bana.</p>}

            <label className="block text- font-medium mt-4">Work Done *</label>
            <textarea value={recordForm.work_done} onChange={e => setRecordForm({ ...recordForm, work_done: e.target.value })} placeholder="e.g. Engine oil + filter changed, brake pads replaced" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={3} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Cost (₹) *</label><input type="number" value={recordForm.cost} onChange={e => setRecordForm({ ...recordForm, cost: e.target.value })} placeholder="2500" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Recommendation</label><input value={recordForm.recommendation} onChange={e => setRecordForm({ ...recordForm, recommendation: e.target.value })} placeholder="e.g. Next service in 6 months" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Service Record →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}