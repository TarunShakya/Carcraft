import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Service() {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customer: '',
    vehicle: '',
    service_type: 'General Service',
    appointment_date: '',
    appointment_time: '10:00',
    notes: '',
  });

  // --- Load Data ---
  useEffect(() => {
    Promise.all([
      api.get('service-appointments/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('technicians/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([a, t, c, v]) => {
      setAppointments(a);
      setTechnicians(t);
      setCustomers(c);
      setVehiclesList(v);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a => serviceFilter === 'All' || a.service_type === serviceFilter);

  // --- Book Appointment ---
  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.customer || !form.vehicle || !form.appointment_date) {
      alert('Please select Customer, Vehicle and Date');
      return;
    }
    try {
      await api.post('service-appointments/', {
        customer: Number(form.customer),
        vehicle: Number(form.vehicle),
        service_type: form.service_type,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        notes: form.notes,
        status: 'Booked',
      });
      alert('Appointment booked successfully!');
      setShowModal(false);
      setForm({ customer: '', vehicle: '', service_type: 'General Service', appointment_date: '', appointment_time: '10:00', notes: '' });
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed to book. Backend error: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  return (
    <AdminLayout title="Service & Appointments" subtitle="Book service, assign technicians, track history">
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <p className="text- text-[#5B6B82]">Today's Appointments</p>
          <p className="font-display text- font-bold mt-1">{appointments.length}</p>
          <p className="text-xs text-[#94A3B8] mt-1">All bookings</p>
        </div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <p className="text- text-[#5B6B82]">Available Technicians</p>
          <p className="font-display text- font-bold mt-1">{technicians.filter(t => t.is_available).length} / {technicians.length}</p>
          <p className="text-xs text-[#94A3B8] mt-1">Ready to assign</p>
        </div>
        <div className="bg-[#0A1628] text-white rounded- p-6">
          <p className="text- text-white/60">Next Slot</p>
          <p className="font-display text- font-bold mt-2">Today, 10:30 AM</p>
          <p className="text-xs text-white/50 mt-1">Oil Change • Swift ZXI</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* Appointments */}
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-">Appointments</h3>
              <p className="text- text-[#5B6B82]">Upcoming service bookings</p>
            </div>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="bg-[#F6F7F9] border border-[#E8EBF0] rounded-xl px-3 py-2 text- outline-none">
              <option>All</option>
              <option>General Service</option>
              <option>Oil Change</option>
              <option>Brake Service</option>
              <option>AC Service</option>
              <option>Denting Painting</option>
              <option>Other</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-[#5B6B82] py-8 text-center">Loading appointments...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#5B6B82] py-8 text-center">No appointments for this filter. Filter ko All karke dekho.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {filtered.map(a => (
                <div key={a.id} className="flex items-center gap-4 bg-[#F6F7F9] rounded-2xl p-4">
                  <div className="w-12 h-12 bg-white border border-[#E8EBF0] rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="font-display font-bold text- leading-none">{a.appointment_date?.split('-')[2] || '—'}</span>
                    <span className="text- text-[#5B6B82]">Day</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text- truncate">{a.service_type} • Vehicle #{a.vehicle}</p>
                    <p className="text- text-[#5B6B82]">{a.appointment_date} at {a.appointment_time} • Customer #{a.customer}</p>
                    {a.notes && <p className="text- text-[#94A3B8] mt-0.5 truncate">{a.notes}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text- font-semibold shrink-0 ${a.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.status || 'Booked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technicians */}
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <h3 className="font-display font-bold text-">Technicians</h3>
          <p className="text- text-[#5B6B82] mt-0.5">Availability & skills</p>
          <div className="mt-4 space-y-3">
            {technicians.length === 0 ? (
              <p className="text-sm text-[#5B6B82]">No technicians yet. Add from Admin.</p>
            ) : technicians.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {(t.name || 'T')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{t.name}</p>
                  <p className="text- text-[#5B6B82] truncate">{t.specialization} • {t.experience_years} yrs exp</p>
                </div>
                <span className={`text- font-semibold px-2 py-1 rounded-full shrink-0 ${t.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                  {t.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-[#FFF1E8] border border-[#FFE0C7] rounded-2xl p-4">
            <p className="font-semibold text-sm">Book New Service</p>
            <p className="text- text-[#5B6B82] mt-1 leading-relaxed">Select vehicle, service type and time. Technician will be assigned automatically.</p>
            <button onClick={() => setShowModal(true)} className="w-full mt-3 bg-[#0A1628] text-white py-2.5 rounded-xl text- font-semibold hover:bg-black transition">
              + Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ===== BOOK MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleBook} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Book New Service</h3>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>

            <label className="block text- font-medium mt-5">Customer</label>
            <select value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name || c.name} — {c.phone}</option>)}
            </select>

            <label className="block text- font-medium mt-4">Vehicle</label>
            <select value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Vehicle</option>
              {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.model_name} — {v.vin}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text- font-medium">Service Type</label>
                <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>General Service</option>
                  <option>Oil Change</option>
                  <option>Brake Service</option>
                  <option>AC Service</option>
                  <option>Denting Painting</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text- font-medium">Time</label>
                <input type="time" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <label className="block text- font-medium mt-4">Date</label>
            <input type="date" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />

            <label className="block text- font-medium mt-4">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Brake noise aa rahi hai" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />

            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">
              Confirm Booking →
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}