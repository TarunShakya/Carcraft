import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// --- Sidebar Menu ---
const MENU = [
  {
    section: 'Showroom',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '▦', desc: 'Overview & revenue' },
      { label: 'Vehicles', path: '/vehicles', icon: '🚗', desc: 'Inventory & stock' },
      { label: 'Leads & Quotes', path: '/leads', icon: '👥', desc: 'Customers & deals' },
      { label: 'Sales', path: '/sales', icon: '🧾', desc: 'Quotations & sales' },
    ],
  },
  {
    section: 'Shop',
    items: [
      { label: 'Parts Shop', path: '/shop', icon: '🛠️', desc: 'Parts & catalog' },
      { label: 'Orders', path: '/orders', icon: '📦', desc: 'Cart & checkout' },
      { label: 'Shipments', path: '/shipments', icon: '🚚', desc: 'Fulfillment' },
      { label: 'Reviews', path: '/reviews', icon: '⭐', desc: 'Ratings & feedback' },
    ],
  },
  {
    section: 'Service',
    items: [
      { label: 'Appointments', path: '/service', icon: '📅', desc: 'Service bookings' },
      { label: 'Technicians', path: '/technicians', icon: '🔧', desc: 'Availability & skill' },
      { label: 'Service History', path: '/service-history', icon: '📋', desc: 'Records & advice' },
      { label: 'Notifications', path: '/notifications', icon: '🔔', desc: 'Reminders & messages' },
    ],
  },
];

export default function AdminLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen flex bg-[#F6F7F9] text-[#0A1628] font-sans">
      {/* ============ SIDEBAR - Desktop ============ */}
      <aside className="hidden lg:flex w- shrink-0 bg-white border-r border-[#E8EBF0] flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0A1628] rounded- flex items-center justify-center text-white font-display font-bold text-lg">C</div>
          <div>
            <p className="font-display font-bold text- leading-none tracking-tight">CarCraft</p>
            <p className="text- tracking-[0.18em] text-[#5B6B82] font-medium mt-1">DEALERSHIP SUITE</p>
          </div>
          <span className="ml-auto text- font-semibold bg-[#FFF1E8] text-[#FF5A1F] px-2 py-1 rounded-full">ADMIN</span>
        </div>

        {/* Search in sidebar */}
        <div className="px-5 pb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages, vehicles..."
            className="w-full bg-[#F6F7F9] border border-[#E8EBF0] rounded-xl px-3.5 py-2.5 text- outline-none focus:border-[#0A1628] focus:bg-white placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {MENU.map((group) => (
            <div key={group.section} className="mb-5">
              <p className="text- font-semibold tracking-[0.12em] text-[#94A3B8] px-3 mb-2 uppercase">{group.section}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                        active ? 'bg-[#0A1628] text-white' : 'text-[#334155] hover:bg-[#F6F7F9] hover:text-[#0A1628]'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text- shrink-0 ${active ? 'bg-white/10' : 'bg-[#F6F7F9] group-hover:bg-white'}`}>{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text- font-medium leading-tight ${active ? 'text-white' : ''}`}>{item.label}</span>
                        <span className={`block text- mt-0.5 truncate ${active ? 'text-white/60' : 'text-[#94A3B8]'}`}>{item.desc}</span>
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Card */}
        <div className="p-4 border-t border-[#E8EBF0]">
          <div className="bg-[#FFF1E8] border border-[#FFE0C7] rounded-2xl p-4">
            <p className="font-display font-bold text-">Need help?</p>
            <p className="text- text-[#5B6B82] mt-1 leading-relaxed">Our support team is available Mon–Sat, 9 AM – 7 PM.</p>
            <button className="mt-3 w-full bg-white border border-[#FFE0C7] py-2 rounded-lg text- font-semibold hover:border-[#FF5A1F] transition">Contact Support</button>
          </div>
          <button onClick={logout} className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text- font-medium text-[#5B6B82] hover:bg-[#F6F7F9] hover:text-[#0A1628] transition">
            <span>↩</span> Logout
          </button>
        </div>
      </aside>

      {/* ============ SIDEBAR - Mobile Drawer ============ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w- bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-lg">CarCraft</p>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <div className="mt-6 space-y-1">
              {MENU.flatMap(g => g.items).map(item => (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(item.path) ? 'bg-[#0A1628] text-white' : 'text-[#334155] hover:bg-[#F6F7F9]'}`}>
                  {item.icon} &nbsp; {item.label}
                </Link>
              ))}
            </div>
            <button onClick={logout} className="w-full mt-6 py-2.5 rounded-xl bg-[#F6F7F9] text-sm font-medium">Logout</button>
          </div>
        </div>
      )}

      {/* ============ MAIN ============ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#E8EBF0]">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-lg bg-[#F6F7F9] flex items-center justify-center">☰</button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-bold text- lg:text- tracking-tight truncate">{title || 'Dashboard'}</h1>
              {subtitle && <p className="text- text-[#5B6B82] truncate mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <button className="hidden sm:flex w-10 h-10 rounded-xl bg-[#F6F7F9] border border-[#E8EBF0] items-center justify-center text- relative">
                🔔
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF5A1F] rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-2.5 pl-1">
                <div className="w-10 h-10 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-display font-bold text-sm">A</div>
                <div className="hidden md:block leading-tight">
                  <p className="text- font-semibold">Admin</p>
                  <p className="text- text-[#5B6B82]">admin@carcraft.in</p>
                </div>
              </div>
              {actions}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w- w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 pb-6 max-w- w-full mx-auto">
          <p className="text- text-[#94A3B8]">© 2026 CarCraft Dealership Suite • Built with Django + React • Secure JWT Auth</p>
        </footer>
      </div>
    </div>
  );
}