import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Dashboard() {
  const [stats, setStats] = useState({ vehicles: 0, leads: 0, orders: 0, revenue: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [quotationsList, setQuotationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // --- Sale Form - SALE MODEL MATCH ---
  const [saleForm, setSaleForm] = useState({
    vehicle: '',
    customer: '',
    quotation: '',
    salesperson_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: '',
    payment_method: 'Cash',
    status: 'Completed',
  });

  // --- Load Dashboard Data ---
  useEffect(() => {
    Promise.all([
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('leads/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('orders/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('quotations/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('sales/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([vehicles, leads, customers, orders, quotes, sales]) => {
      const revenue = sales.reduce((s, o) => s + Number(o.sale_price || 0), 0);
      setStats({ vehicles: vehicles.length, leads: leads.length, orders: orders.length, revenue });
      setVehiclesList(vehicles);
      setCustomersList(customers);
      setQuotationsList(quotes);
      setRecentLeads(leads.slice(0, 5));
      setRecentOrders(orders.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const getCustomerName = (customerId) => {
    const found = customersList.find(c => c.id === customerId);
    return found ? found.full_name : `Customer #${customerId}`;
  };

  const getVehicleName = (vehicleId) => {
    const found = vehiclesList.find(v => v.id === vehicleId);
    return found ? `${found.model_name} ${found.variant || ''}` : '—';
  };

  // --- New Sale - SALE MODEL MATCH ---
  const handleSale = async (e) => {
    e.preventDefault();
    if (!saleForm.vehicle || !saleForm.customer || !saleForm.salesperson_name || !saleForm.sale_date || !saleForm.sale_price) {
      alert('Vehicle, Customer, Salesperson, Sale Date aur Price zaroori hai');
      return;
    }
    try {
      await api.post('sales/', {
        vehicle: Number(saleForm.vehicle),
        customer: Number(saleForm.customer),
        quotation: saleForm.quotation ? Number(saleForm.quotation) : null,
        salesperson_name: saleForm.salesperson_name,
        sale_date: saleForm.sale_date,
        sale_price: Number(saleForm.sale_price),
        payment_method: saleForm.payment_method,
        status: saleForm.status,
      });
      alert('Sale Database me save ho gayi!');
      setShowSaleModal(false);
      setSaleForm({
        vehicle: '', customer: '', quotation: '', salesperson_name: '',
        sale_date: new Date().toISOString().split('T')[0],
        sale_price: '', payment_method: 'Cash', status: 'Completed',
      });
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
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
          <p className="text- text-white/60">Total Revenue (Sales)</p>
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
                <div className="w-9 h-9 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm">{getCustomerName(l.customer)[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{getCustomerName(l.customer)}</p>
                  <p className="text- text-[#5B6B82] truncate">{getVehicleName(l.interested_vehicle)} • {l.source || 'Walk-in'}</p>
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

      {/* ===== NEW SALE MODAL - SALE MODEL MATCH ===== */}
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
              {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.model_name} {v.variant || ''} — ₹ {Number(v.price).toLocaleString('en-IN')}</option>)}
            </select>

            <label className="block text- font-medium mt-4">Customer *</label>
            <select value={saleForm.customer} onChange={e => setSaleForm({ ...saleForm, customer: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Customer</option>
              {customersList.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone} — {c.city}</option>)}
            </select>

            <label className="block text- font-medium mt-4">Quotation (optional)</label>
            <select value={saleForm.quotation} onChange={e => setSaleForm({ ...saleForm, quotation: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Without Quotation - Direct Sale</option>
              {quotationsList.map(q => <option key={q.id} value={q.id}>Quote #{q.id} — ₹ {Number(q.quoted_price).toLocaleString('en-IN')} — {q.status}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Salesperson Name *</label><input value={saleForm.salesperson_name} onChange={e => setSaleForm({ ...saleForm, salesperson_name: e.target.value })} placeholder="e.g. Tarun Shakya" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Sale Date *</label><input type="date" value={saleForm.sale_date} onChange={e => setSaleForm({ ...saleForm, sale_date: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Sale Price (₹) *</label><input type="number" value={saleForm.sale_price} onChange={e => setSaleForm({ ...saleForm, sale_price: e.target.value })} placeholder="750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Payment Method</label>
                <select value={saleForm.payment_method} onChange={e => setSaleForm({ ...saleForm, payment_method: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Cash</option><option>Loan</option><option>EMI</option><option>UPI</option><option>Card</option>
                </select></div>
            </div>

            <div className="mt-4"><label className="text- font-medium">Status</label>
              <select value={saleForm.status} onChange={e => setSaleForm({ ...saleForm, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                <option>Completed</option><option>Pending</option><option>Cancelled</option>
              </select></div>

            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Complete Sale →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}