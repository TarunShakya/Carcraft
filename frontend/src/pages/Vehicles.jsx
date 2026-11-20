import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // ===== MODEL KE HISAB SE FORM =====
  const [form, setForm] = useState({
    brand: '',
    model_name: '',
    variant: '',
    year: new Date().getFullYear(),
    fuel_type: 'Petrol',
    transmission: 'Manual',
    color: 'White',
    body_type: 'Hatchback',
    price: '',
    stock_quantity: 1,
    status: 'Available',
    vin_number: '',
    mileage_kmpl: '',
    features: '', // User comma se likhega, hum JSON List bana ke bhejenge
  });

  const [brandForm, setBrandForm] = useState({ name: '', country: 'India', website: '' });

  const getCarImage = (model = '') => {
    const m = (model || '').toLowerCase();
    if (m.includes('swift')) return 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80';
    if (m.includes('creta')) return 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80';
    if (m.includes('thar')) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80';
    if (m.includes('fortuner')) return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80';
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80';
  };

  const getBrandName = (vehicle) => {
    if (vehicle.brand_name) return vehicle.brand_name;
    if (typeof vehicle.brand === 'string') return vehicle.brand;
    const found = brands.find(b => b.id === vehicle.brand);
    return found ? found.name : `Brand #${vehicle.brand}`;
  };

  const getFeaturesList = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try { const parsed = JSON.parse(features); return Array.isArray(parsed) ? parsed : [features]; } catch { return [features]; }
    }
    return [];
  };

  useEffect(() => {
    Promise.all([
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('brands/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([v, b]) => { setVehicles(v); setBrands(b); }).finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(v =>
    (v.model_name || '').toLowerCase().includes(search.toLowerCase()) ||
    getBrandName(v).toLowerCase().includes(search.toLowerCase()) ||
    (v.vin_number || '').toLowerCase().includes(search.toLowerCase())
  );

  // --- Add Brand ---
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) { alert('Brand ka naam likho'); return; }
    try {
      const res = await api.post('brands/', {
        name: brandForm.name.trim(),
        country: brandForm.country,
        website: brandForm.website || null,
      });
      setBrands([...brands, res.data]);
      setForm({ ...form, brand: res.data.id });
      setBrandForm({ name: '', country: 'India', website: '' });
      setShowBrandModal(false);
      alert(`${res.data.name} Brand add ho gaya!`);
    } catch (err) {
      console.log(err.response?.data);
      alert('Brand add failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  // --- Add Vehicle - MODEL KE HISAB SE ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.model_name || !form.vin_number || !form.price || !form.body_type) {
      alert('Brand, Model, VIN Number, Price aur Body Type zaroori hai');
      return;
    }
    try {
      // Features ko Text se JSON List banao - Model me JSONField hai
      const featuresList = form.features
        ? form.features.split(',').map(f => f.trim()).filter(f => f !== '')
        : [];

      await api.post('vehicles/', {
        brand: Number(form.brand),
        model_name: form.model_name,
        variant: form.variant || null,
        year: Number(form.year),
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        color: form.color || null,
        body_type: form.body_type,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity || 1),
        status: form.status,
        vin_number: form.vin_number,
        mileage_kmpl: form.mileage_kmpl ? Number(form.mileage_kmpl) : null,
        features: featuresList,
      });
      alert('Vehicle Database me save ho gaya!');
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  return (
    <AdminLayout title="Vehicles" subtitle="Inventory, pricing & stock">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search model, brand, VIN..." className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-2.5 text-sm w-full sm:w- outline-none" />
        <button onClick={() => setShowModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shrink-0">+ Add Vehicle</button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-[#E8EBF0] rounded- p-6"><p className="text- text-[#5B6B82]">Total Vehicles</p><p className="font-display text- font-bold mt-1">{vehicles.length}</p></div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-6"><p className="text- text-[#5B6B82]">Available</p><p className="font-display text- font-bold mt-1">{vehicles.filter(v => v.status === 'Available').length}</p></div>
        <div className="bg-[#0A1628] text-white rounded- p-6"><p className="text- text-white/60">Total Stock Value</p><p className="font-display text- font-bold mt-2">₹ {(vehicles.reduce((s, v) => s + (Number(v.price) || 0) * (Number(v.stock_quantity) || 1), 0) / 100000).toFixed(1)} Lakh</p></div>
      </div>

      <div className="bg-white border border-[#E8EBF0] rounded- p-6">
        <h3 className="font-display font-bold text-">Inventory</h3>
        <p className="text- text-[#5B6B82]">Card pe click karne se Details khulegi</p>
        {loading ? <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
        : filtered.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">No vehicles found. + Add Vehicle se add kar.</p>
        : (
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div key={v.id} onClick={() => window.location.href = `/vehicles/${v.id}`} className="border border-[#E8EBF0] rounded-2xl overflow-hidden hover:shadow-md transition bg-white cursor-pointer">
                <img src={getCarImage(v.model_name)} alt={v.model_name} className="w-full h- object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-">{getBrandName(v)} {v.model_name} {v.variant ? `• ${v.variant}` : ''}</p>
                      <p className="text- text-[#5B6B82]">{v.year} • {v.fuel_type} • {v.color} • {v.transmission}</p>
                      <p className="text- text-[#5B6B82]">{v.body_type} • Stock: {v.stock_quantity}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text- font-semibold shrink-0 ${v.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v.status}</span>
                  </div>
                  <p className="text- text-[#94A3B8] mt-2">VIN: {v.vin_number}</p>
                  <p className="font-display font-bold text- mt-1">₹ {Number(v.price).toLocaleString('en-IN')}</p>
                  <p className="text- text-[#5B6B82]">{v.mileage_kmpl ? `${v.mileage_kmpl} kmpl` : ''}</p>
                  {getFeaturesList(v.features).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getFeaturesList(v.features).slice(0, 3).map((f, i) => <span key={i} className="bg-[#F6F7F9] px-2 py-0.5 rounded-full text-">{f}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== ADD VEHICLE MODAL - MODEL MATCH ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAdd} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add New Vehicle</h3>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>

            <label className="block text- font-medium mt-5">Brand *</label>
            <div className="flex gap-2 mt-1">
              <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="flex-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowBrandModal(true)} className="bg-[#0A1628] text-white px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap hover:bg-black transition">+ New Brand</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Model Name *</label><input value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })} placeholder="e.g. Swift" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Variant</label><input value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })} placeholder="e.g. ZXI" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">VIN Number * (17 chars)</label><input value={form.vin_number} onChange={e => setForm({ ...form, vin_number: e.target.value })} placeholder="e.g. MA3..." maxLength={17} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Year</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Stock Quantity</label><input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
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
                  <option>Available</option><option>Reserved</option><option>Sold</option><option>In-Service</option>
                </select></div>
            </div>

            <div className="mt-4 bg-[#F6F7F9] rounded-2xl p-4">
              <p className="font-semibold text-sm">🚗 Vehicle Details</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><label className="text- font-medium">Transmission *</label>
                  <select value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })} className="w-full mt-1 bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option>Manual</option><option>Automatic</option>
                  </select></div>
                <div><label className="text- font-medium">Body Type *</label>
                  <select value={form.body_type} onChange={e => setForm({ ...form, body_type: e.target.value })} className="w-full mt-1 bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option>Hatchback</option><option>Sedan</option><option>SUV</option><option>MUV</option><option>Coupe</option><option>Convertible</option><option>Pickup</option>
                  </select></div>
              </div>
              <label className="block text- font-medium mt-3">Mileage (kmpl)</label>
              <input type="number" step="0.01" value={form.mileage_kmpl} onChange={e => setForm({ ...form, mileage_kmpl: e.target.value })} placeholder="e.g. 22.5" className="w-full mt-1 bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
              <label className="block text- font-medium mt-3">Features (comma se alag karke)</label>
              <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="e.g. Sunroof, Alloy Wheels, Touchscreen" className="w-full mt-1 bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
              <p className="text- text-[#94A3B8] mt-1">Backend me ye JSON List ban ke save hoga: ["Sunroof", "Alloy Wheels"]</p>
            </div>

            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Vehicle →</button>
          </form>
        </div>
      )}

      {/* ===== ADD BRAND MODAL ===== */}
      {showBrandModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddBrand} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add New Brand</h3>
              <button type="button" onClick={() => setShowBrandModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-5">Brand Name *</label>
            <input value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} placeholder="e.g. Kia" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" autoFocus />
            <label className="block text- font-medium mt-4">Country *</label>
            <select value={brandForm.country} onChange={e => setBrandForm({ ...brandForm, country: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>India</option><option>Japan</option><option>Korea</option><option>Germany</option><option>USA</option><option>UK</option><option>Other</option>
            </select>
            <label className="block text- font-medium mt-4">Website (optional)</label>
            <input value={brandForm.website} onChange={e => setBrandForm({ ...brandForm, website: e.target.value })} placeholder="https://kia.com" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Brand →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}