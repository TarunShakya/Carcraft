import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('token/', form);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/dashboard');
    } catch { setError('Incorrect username or password. Please check and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr] bg-white">
      {/* Left — Brand Story */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0A1628] text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w- h- bg-[#FF5A1F]/20 rounded-full blur-" />
        <div className="flex items-center gap-2.5 relative">
          <div className="w-10 h-10 bg-[#FF5A1F] rounded-xl flex items-center justify-center font-display font-bold text-lg">C</div>
          <span className="font-display font-bold text-xl tracking-tight">CarCraft</span>
          <span className="text- bg-white/10 px-2 py-1 rounded-full text-white/70 ml-2">DEALER SUITE</span>
        </div>

        <div className="relative max-w-">
          <p className="text- tracking-[0.18em] text-[#FF5A1F] font-semibold">TRUSTED BY 40+ DEALERSHIPS</p>
          <h1 className="font-display text- leading-[1.05] font-bold mt-4">Sell more cars.<br/>Service them<br/>beautifully.</h1>
          <p className="text-white/60 text- leading-relaxed mt-5">Inventory, leads, quotations, service and parts — everything your showroom needs, in one calm, fast workspace.</p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { v: '1,248', l: 'Vehicles sold' },
              { v: '₹4.8 Cr', l: 'Revenue tracked' },
              { v: '4.9 / 5', l: 'Customer rating' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="font-display font-bold text-xl">{s.v}</p>
                <p className="text-white/50 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs relative">© 2026 CarCraft — Crafted for modern dealerships in India</p>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <form onSubmit={submit} className="w-full max-w-">
          <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-9 h-9 bg-[#FF5A1F] rounded-xl flex items-center justify-center font-bold text-white">C</div><span className="font-display font-bold text-lg">CarCraft</span></div>
          <h2 className="font-display text- font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted text- mt-1.5">Sign in to manage your showroom, sales and service.</p>

          <div className="mt-8 space-y-4">
            <div><label className="text- font-medium text-ink">Username</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. admin" className="w-full mt-1.5 border border-line rounded-xl px-4 py-3 text- outline-none focus:border-ink focus:ring-2 focus:ring-ink/10" /></div>
            <div><label className="text- font-medium text-ink">Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="w-full mt-1.5 border border-line rounded-xl px-4 py-3 text- outline-none focus:border-ink focus:ring-2 focus:ring-ink/10" /></div>
          </div>

          {error && <p className="bg-red-50 border border-red-100 text-red-600 text- px-4 py-3 rounded-xl mt-4">{error}</p>}

          <button disabled={loading} className="w-full mt-6 bg-ink text-white py-3.5 rounded-xl font-semibold text- hover:bg-black transition disabled:opacity-60">{loading ? 'Signing you in...' : 'Sign in →'}</button>
          <p className="text-center text-xs text-muted mt-4">Demo account — <span className="font-semibold text-ink">admin / admin</span></p>
          <p className="text-center text-xs text-muted mt-2">Facing issues? Contact your admin.</p>
        </form>
      </div>
    </div>
  );
}