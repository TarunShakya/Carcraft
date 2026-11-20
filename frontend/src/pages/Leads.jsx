import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [leadForm, setLeadForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    interest: 'Swift ZXI',
    source: 'Walk-in',
    status: 'New',
    notes: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    vehicle_model: '',
    price: '',
    discount: '0',
    notes: '',
  });

  // --- Load Data ---
  useEffect(() => {
    Promise.all([
      api.get('leads/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([l, c]) => {
      setLeads(l);
      setCustomers(c);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l => {
    const matchSearch = (l.customer_name || l.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search);
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // --- Add Lead ---
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!leadForm.full_name || !leadForm.phone) {
      alert('Name aur Phone zaroori hai');
      return;
    }
    try {
      // 1. Pehle Customer banao
      const custRes = await api.post('customers/', {
        full_name: leadForm.full_name,
        phone: leadForm.phone,
        email: leadForm.email || `${leadForm.phone}@carcraft.in`,
      });
      const customerId = custRes.data.id;

      // 2. Fir Lead banao us Customer se link karke
      await api.post('leads/', {
        customer: customerId,
        interest: leadForm.interest,
        source: leadForm.source,
        status: leadForm.status,
        notes: leadForm.notes,
      });

      alert('Lead Database me save ho gaya!');
      setShowLeadModal(false);
      setLeadForm({ full_name: '', phone: '', email: '', interest: 'Swift ZXI', source: 'Walk-in', status: 'New', notes: '' });
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  // --- Create Quote ---
  const handleQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.vehicle_model || !quoteForm.price) {
      alert('Vehicle Model aur Price zaroori hai');
      return;
    }
    try {
      await api.post('quotations/', {
        lead: selectedLead.id,
        vehicle_model: quoteForm.vehicle_model,
        price: Number(quoteForm.price),
        discount: Number(quoteForm.discount || 0),
        total: Number(quoteForm.price) - Number(quoteForm.discount || 0),
        notes: quoteForm.notes,
        status: 'Sent',
      });
      alert('Quote ban gayi aur save ho gayi!');
      setShowQuoteModal(false);
      setQuoteForm({ vehicle_model: '', price: '', discount: '0', notes: '' });
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  const openQuote = (lead) => {
    setSelectedLead(lead);
    setQuoteForm({ vehicle_model: lead.interest || '', price: '', discount: '0', notes: '' });
    setShowQuoteModal(true);
  };

  return (
    <AdminLayout title="Leads & Customers" subtitle="Follow up, convert, close deals">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone..." className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-2.5 text-sm w- outline-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
            <option>All</option><option>New</option><option>Contacted</option><option>Interested</option><option>Converted</option><option>Lost</option>
          </select>
        </div>
        <button onClick={() => setShowLeadModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition">+ New Lead</button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#E8EBF0] rounded- p-5"><p className="text- text-[#5B6B82]">Total Leads</p><p className="font-display text- font-bold mt-1">{leads.length}</p></div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-5"><p className="text- text-[#5B6B82]">New</p><p className="font-display text- font-bold mt-1">{leads.filter(l => l.status === 'New').length}</p></div>
        <div className="bg-white border border-[#E8EBF0] rounded- p-5"><p className="text- text-[#5B6B82]">Interested</p><p className="font-display text- font-bold mt-1">{leads.filter(l => l.status === 'Interested').length}</p></div>
        <div className="bg-[#0A1628] text-white rounded- p-5"><p className="text- text-white/60">Converted</p><p className="font-display text- font-bold mt-1">{leads.filter(l => l.status === 'Converted').length}</p></div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#E8EBF0] rounded- p-6">
        <h3 className="font-display font-bold text-">All Leads</h3>
        <p className="text- text-[#5B6B82]">Click New Quote to send quotation</p>
        {loading ? (
          <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#5B6B82] py-8 text-center">No leads found. + New Lead se add kar.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {filtered.map(l => (
              <div key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{(l.customer_name || l.full_name || 'L')[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text- truncate">{l.customer_name || l.full_name || `Customer #${l.customer}`}</p>
                  <p className="text- text-[#5B6B82] truncate">{l.phone || '—'} • Interested in: {l.interest || '—'} • Source: {l.source || 'Walk-in'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text- font-semibold shrink-0 ${l.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' : l.status === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
                <button onClick={() => openQuote(l)} className="bg-white border border-[#E8EBF0] px-4 py-2 rounded-xl text- font-semibold hover:bg-[#0A1628] hover:text-white transition shrink-0">New Quote →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== NEW LEAD MODAL ===== */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddLead} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add New Lead</h3>
              <button type="button" onClick={() => setShowLeadModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-5">Full Name *</label>
            <input value={leadForm.full_name} onChange={e => setLeadForm({ ...leadForm, full_name: e.target.value })} placeholder="e.g. 【entity-Rahul Sharma¦canonical_name=Rahul Sharma】" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Phone *</label><input value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="9876543210" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Email</label><input value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="rahul@gmail.com" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Interested In</label><input value={leadForm.interest} onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })} placeholder="Swift ZXI" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Source</label>
                <select value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Walk-in</option><option>Website</option><option>Phone</option><option>Referral</option><option>Social Media</option>
                </select></div>
            </div>
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={leadForm.notes} onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="e.g. Kal test drive chahiye" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Lead →</button>
          </form>
        </div>
      )}

      {/* ===== NEW QUOTE MODAL ===== */}
      {showQuoteModal && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleQuote} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">New Quote</h3>
              <button type="button" onClick={() => setShowQuoteModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <p className="text- text-[#5B6B82] mt-2">For: {selectedLead.customer_name || selectedLead.full_name || `Lead #${selectedLead.id}`}</p>
            <label className="block text- font-medium mt-4">Vehicle Model *</label>
            <input value={quoteForm.vehicle_model} onChange={e => setQuoteForm({ ...quoteForm, vehicle_model: e.target.value })} placeholder="e.g. Swift ZXI" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Price (₹) *</label><input type="number" value={quoteForm.price} onChange={e => setQuoteForm({ ...quoteForm, price: e.target.value })} placeholder="750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Discount (₹)</label><input type="number" value={quoteForm.discount} onChange={e => setQuoteForm({ ...quoteForm, discount: e.target.value })} placeholder="0" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <div className="bg-[#F6F7F9] rounded-xl p-3 mt-4 flex justify-between text-sm">
              <span>Total Payable</span><span className="font-bold">₹ {((Number(quoteForm.price) || 0) - (Number(quoteForm.discount) || 0)).toLocaleString('en-IN')}</span>
            </div>
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={quoteForm.notes} onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })} placeholder="e.g. Free accessories included" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Send Quote →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}