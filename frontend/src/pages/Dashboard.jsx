import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Dashboard() {
  const [stats, setStats] = useState({ vehicles: 0, leads: 0, orders: 0, revenue: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({
    vehicle: '',
    lead: '',
    sale_price: '',
    payment_method: 'Cash',
    notes: '',
  });

  // --- Load Dashboard Data ---
  useEffect(() => {
    Promise.all([
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('leads/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('orders/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('quotations/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([vehicles, leads, orders, quotes]) => {
      const revenue = orders.reduce((s, o) => s + (Number(o.total_amount || o.total || 0)), 0) +
        quotes.reduce((s, q) => s + (Number(q.total || 0)), 0);
      setStats({ vehicles: vehicles.length, leads: leads.length, orders: orders.length, revenue });
      setVehiclesList(vehicles);
      setLeadsList(leads);
      setRecentLeads(leads.slice(0, 5));
      setRecentOrders(orders.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  // --- New Sale ---
  const handleSale = async (e) => {
    e.preventDefault();
    if (!saleForm.vehicle || !saleForm.sale_price) {
      alert('Vehicle aur Sale Price zaroori hai');
      return;
    }
    try {
      await api.post('sales/', {
        vehicle: Number(saleForm.vehicle),
        lead: saleForm.lead ? Number(saleForm.lead) : null,
        sale_price: Number(saleForm.sale_price),
        payment_method: saleForm.payment_method,
        notes: saleForm.notes,
        status: 'Completed',
      });
      alert('Sale Database me save ho gayi!');
      setShowSaleModal(false);
      setSaleForm({ vehicle: '', lead: '', sale_price: '', payment_method: 'Cash', notes: '' });
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      // Agar /sales/ endpoint alag naam se hai to quotations me save kar do
      if (err.response?.status === 404) {
        try {
          await api.post('quotations/', {
            vehicle_model: vehiclesList.find(v => v.id == saleForm.vehicle)?.model_name || 'Vehicle',
            price: Number(saleForm.sale_price),
            total: Number(saleForm.sale_price),
            status: 'Converted',
            notes: `SALE - ${saleForm.payment_method} - ${saleForm.notes}`,
          });
          alert('Sale Quotation ke roop me save ho gayi!');
          setShowSaleModal(false);
          window.location.reload();
          return;
        } catch (e2) {
          console.log(e2.response?.data);
        }
      }
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend - /api/sales/ endpoint'));
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your dealership today">
      {/* Top Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#E8EBF0] rounded- p-5">
          <p className="text- text-[#5B6B82]">Total Vehicles</p>
          <p className="font-display text- font-bold mt-1">{loading ? '...' : stats.vehicles}</p>
          <p className="text- text-emerald-600 mt-1">In inventory</p>
        </div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-5">
          <p className="text- text-[#5B6B82]">Total Leads</p>
          <p className="font-display text- font-bold mt-1">{loading ? '...' : stats.leads}</p>
          <p className="text- text-amber-600 mt-1">Need follow-up</p>
        </div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-5">
          <p className="text- text-[#5B6B82]">Orders</p>
          <p className="font-display text- font-bold mt-1">{loading ? '...' : stats.orders}</p>
          <p className="text- text-blue-600 mt-1">Shop orders</p>
        </div>
        <div className="bg-[#0A1628] text-white rounded- p-5">
          <p className="text- text-white/60">Total Revenue</p>
          <p className="font-display text- font-bold mt-1">₹ {stats.revenue.toLocaleString('en-IN')}</p>
          <button onClick={() => setShowSaleModal(true)} className="mt-3 w-full bg-white text-black py-2 rounded-xl text- font-semibold hover:bg-gray-100 transition">+ New Sale</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        {/* Recent Leads */}
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <h3 className="font-display font-bold text-">Recent Leads</h3>
          <p className="text- text-[#5B6B82]">Latest enquiries</p>
          <div className="mt-4 space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-[#5B6B82] py-4 text-center">No leads yet. Leads page se add kar.</p>
            ) : recentLeads.map(l => (
              <div key={l.id} className="flex items-center gap-3 bg-[#F6F7F9] rounded-2xl p-3">
                <div className="w-9 h-9 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm">{(l.customer_name || l.full_name || 'L')[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{l.customer_name || l.full_name || `Customer #${l.customer}`}</p>
                  <p className="text- text-[#5B6B82] truncate">{l.interest || '—'} • {l.source || 'Walk-in'}</p>
                </div>
                <span className="px-2 py-1 rounded-full text- font-semibold bg-amber-100 text-amber-700">{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-[#E8EBF0] rounded- p-6">
          <h3 className="font-display font-bold text-">Recent Orders</h3>
          <p className="text- text-[#5B6B82]">Shop & parts orders</p>
          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[#5B6B82] py-4 text-center">No orders yet. Shop se order kar.</p>
            ) : recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 bg-[#F6F7F9] rounded-2xl p-3">
                <div className="w-9 h-9 bg-white border border-[#E8EBF0] rounded-xl flex items-center justify-center text-lg">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Order #{o.id} • {o.customer_name || 'Customer'}</p>
                  <p className="text- text-[#5B6B82]">{o.status || 'Pending'} • {o.created_at?.slice(0, 10) || ''}</p>
                </div>
                <p className="font-bold text-sm">₹ {Number(o.total_amount || o.total || 0).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[#E8EBF0] rounded- p-6 mt-5">
        <h3 className="font-display font-bold text-">Quick Actions</h3>
        <div className="grid sm:grid-cols-4 gap-3 mt-4">
          <a href="/vehicles" className="bg-[#F6F7F9] rounded-2xl p-4 text-center hover:bg-[#E8EBF0] transition"><p className="text-2xl">🚗</p><p className="font-semibold text-sm mt-1">Add Vehicle</p></a>
          <a href="/leads" className="bg-[#F6F7F9] rounded-2xl p-4 text-center hover:bg-[#E8EBF0] transition"><p className="text-2xl">👤</p><p className="font-semibold text-sm mt-1">New Lead</p></a>
          <a href="/service" className="bg-[#F6F7F9] rounded-2xl p-4 text-center hover:bg-[#E8EBF0] transition"><p className="text-2xl">🔧</p><p className="font-semibold text-sm mt-1">Book Service</p></a>
          <button onClick={() => setShowSaleModal(true)} className="bg-[#0A1628] text-white rounded-2xl p-4 text-center hover:bg-black transition"><p className="text-2xl">💰</p><p className="font-semibold text-sm mt-1">New Sale</p></button>
        </div>
      </div>

      {/* ===== NEW SALE MODAL ===== */}
      {showSaleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSale} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Record New Sale</h3>
              <button type="button" onClick={() => setShowSaleModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-5">Vehicle *</label>
            <select value={saleForm.vehicle} onChange={e => {
              const v = vehiclesList.find(x => x.id == e.target.value);
              setSaleForm({ ...saleForm, vehicle: e.target.value, sale_price: v ? v.price : '' });
            }} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Vehicle</option>
              {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model_name} — ₹ {Number(v.price).toLocaleString('en-IN')}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Customer / Lead (optional)</label>
            <select value={saleForm.lead} onChange={e => setSaleForm({ ...saleForm, lead: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Walk-in Customer</option>
              {leadsList.map(l => <option key={l.id} value={l.id}>{l.customer_name || l.full_name || `Lead #${l.id}`}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Sale Price (₹) *</label><input type="number" value={saleForm.sale_price} onChange={e => setSaleForm({ ...saleForm, sale_price: e.target.value })} placeholder="750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Payment</label>
                <select value={saleForm.payment_method} onChange={e => setSaleForm({ ...saleForm, payment_method: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Loan / Finance</option><option>EMI</option>
                </select></div>
            </div>
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={saleForm.notes} onChange={e => setSaleForm({ ...saleForm, notes: e.target.value })} placeholder="e.g. Full payment done" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Complete Sale →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}