import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Shop() {
  const [parts, setParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api.get('parts/').then(r => setParts(Array.isArray(r.data) ? r.data : r.data.results || [])).catch(() => setParts([])).finally(() => setLoading(false));
    api.get('cart/').then(r => setCart(Array.isArray(r.data) ? r.data : r.data.results || [])).catch(() => setCart([]));
  }, []);

  const cats = ['All', ...new Set(parts.map(p => p.category_name || p.category).filter(Boolean))];
  const filtered = parts.filter(p => (p.part_name || '').toLowerCase().includes(search.toLowerCase()) && (cat === 'All' || (p.category_name || p.category) === cat));

  const total = cart.reduce((s, item) => s + (item.quantity || 1) * 0, 0); // Cart total backend se aayega, yaha count dikhayenge

  return (
    <AdminLayout title="Parts Shop" subtitle="Genuine parts • Best price • Fast delivery">
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Left - Parts */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brake pad, filter..." className="flex-1 bg-white border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0A1628]" />
            <select value={cat} onChange={e => setCat(e.target.value)} className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm outline-none">
              {cats.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          {loading ? <p className="text-sm text-[#5B6B82] py-10 text-center">Loading parts...</p> : filtered.length === 0 ? (
            <div className="bg-white border border-[#E8EBF0] rounded- p-10 text-center"><p className="font-display font-bold text-lg">No parts found</p><p className="text-sm text-[#5B6B82] mt-1">Add parts from Django Admin → Shop → Parts</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => (
                <div key={p.id} className="bg-white border border-[#E8EBF0] rounded- p-5 hover:shadow-[0_12px_30px_rgba(10,22,40,0.10)] transition">
                  <div className="h- bg-[#F6F7F9] rounded-2xl flex items-center justify-center text-">🛠️</div>
                  <p className="text- tracking-wide text-[#94A3B8] font-semibold uppercase mt-4">{p.category_name || 'Part'} • {p.sku || ''}</p>
                  <h3 className="font-display font-bold text- mt-1 leading-tight">{p.part_name}</h3>
                  <p className="text- text-[#5B6B82] mt-1">For: {p.compatible_model || 'All models'} • Stock: {p.stock_quantity ?? 0}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="font-display font-bold text-">₹{Number(p.price || 0).toLocaleString('en-IN')}</p>
                    <span className={`text- font-semibold px-2 py-1 rounded-full ${p.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{p.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <button className="w-full mt-4 bg-[#0A1628] text-white py-2.5 rounded-xl text- font-semibold hover:bg-black transition">Add to Cart +</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Cart */}
        <div className="bg-white border border-[#E8EBF0] rounded- p-6 sticky top-">
          <div className="flex justify-between items-center"><h3 className="font-display font-bold text-">Your Cart</h3><span className="bg-[#0A1628] text-white text-xs px-2.5 py-1 rounded-full">{cart.length} items</span></div>
          <p className="text- text-[#5B6B82] mt-1">Items from your cart (API: /api/cart/)</p>
          <div className="mt-4 space-y-3">
            {cart.length === 0 ? <p className="text-sm text-[#5B6B82] bg-[#F6F7F9] rounded-xl p-4 text-center">Cart is empty.<br/>Add a part to get started.</p> : cart.map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-[#F6F7F9] rounded-xl px-3 py-3">
                <div><p className="text-sm font-semibold">Part #{c.part}</p><p className="text-xs text-[#5B6B82]">Qty: {c.quantity}</p></div>
                <p className="text-sm font-semibold">—</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 bg-[#FF5A1F] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#e84e16] transition">Proceed to Checkout →</button>
          <p className="text-center text- text-[#94A3B8] mt-3">Free shipping on orders above ₹999 • 30-day returns</p>
        </div>
      </div>
    </AdminLayout>
  );
}