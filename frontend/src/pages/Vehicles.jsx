import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    model_name: '',
    brand: '',
    vin: '',
    year: new Date().getFullYear(),
    price: '',
    color: 'White',
    fuel_type: 'Petrol',
    status: 'Available',
    mileage: '',
  });

  // --- Load Vehicles ---
  useEffect(() => {
    api.get('vehicles/')
      .then(r => setVehicles(Array.isArray(r.data) ? r.data : r.data.results || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(v =>
    (v.model_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.brand || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.vin || '').toLowerCase().includes(search.toLowerCase())
  );

  // --- Add Vehicle ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.model_name || !form.vin || !form.price) {
      alert('Model Name, VIN aur Price zaroori hai');
      return;
    }
    try {
      await api.post('vehicles/', {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : 0,
      });
      alert('Vehicle Database me save ho gaya!');
      setShowModal(false);
      setForm({ model_name: '', brand: '', vin: '', year: new Date().getFullYear(), price: '', color: 'White', fuel_type: 'Petrol', status: 'Available', mileage: '' });
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  return (
    <AdminLayout title="Vehicles" subtitle="Inventory, pricing & stock">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search model, brand, VIN..."
            className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-2.5 text-sm w- outline-none"
          />
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition">
          + Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <p className="text- text-[#5B6B82]">Total Vehicles</p>
          <p className="font-display text- font-bold mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <p className="text- text-[#5B6B82]">Available</p>
          <p className="font-display text- font-bold mt-1">{vehicles.filter(v => v.status === 'Available').length}</p>
        </div>
        <div className="bg-[#0A1628] text-white rounded- p-6">
          <p className="text- text-white/60">Total Stock Value</p>
          <p className="font-display text- font-bold mt-2">₹ {(vehicles.reduce((s, v) => s + (Number(v.price) || 0), 0) / 100000).toFixed(1)} Lakh</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#E8EBF0] rounded- p-6">
        <h3 className="font-display font-bold text-">Inventory</h3>
        <p className="text- text-[#5B6B82]">All vehicles in stock</p>

        {loading ? (
          <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#5B6B82] py-8 text-center">No vehicles found. + Add Vehicle se add kar.</p>
        ) : (
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div key={v.id} className="border border-[#E8EBF0] rounded-2xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-">{v.brand} {v.model_name}</p>
                    <p className="text- text-[#5B6B82]">{v.year} • {v.fuel_type} • {v.color}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text- font-semibold ${v.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v.status}</span>
                </div>
                <p className="text- text-[#94A3B8] mt-2">VIN: {v.vin}</p>
                <p className="font-display font-bold text- mt-1">₹ {Number(v.price).toLocaleString('en-IN')}</p>
                <p className="text- text-[#5B6B82]">{v.mileage ? `${v.mileage} km` : 'New'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== ADD MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAdd} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add New Vehicle</h3>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>

            <label className="block text- font-medium mt-5">Brand</label>
            <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. 【entity-Maruti Suzuki¦canonical_name=Maruti Suzuki】" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />

            <label className="block text- font-medium mt-4">Model Name *</label>
            <input value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })} placeholder="e.g. Swift ZXI" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">VIN *</label><input value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} placeholder="e.g. MA3..." className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Year</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Mileage (km)</label><input type="number" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} placeholder="0 for New" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div><label className="text- font-medium">Color</label>
                <select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>White</option><option>Black</option><option>Silver</option><option>Red</option><option>Blue</option><option>Grey</option>
                </select></div>
              <div><label className="text- font-medium">Fuel</label>
                <select value={form.fuel_type} onChange={e => setForm({ ...form, fuel_type: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
                </select></div>
              <div><label className="text- font-medium">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Available</option><option>Reserved</option><option>Sold</option>
                </select></div>
            </div>

            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Vehicle →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}