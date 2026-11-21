import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [leadForm, setLeadForm] = useState({
    full_name: '', phone: '', email: '', city: '', state: '', address: '',
    driving_license_no: '', interested_vehicle: '', source: 'Walk-in',
    status: 'New', follow_up_date: '', notes: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    quoted_price: '',
    valid_until: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('leads/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('vehicles/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([l, c, v]) => { setLeads(l); setCustomers(c); setVehiclesList(v); }).finally(() => setLoading(false));
  }, []);

  const getCustomerName = (lead) => {
    if (lead.customer_name) return lead.customer_name;
    const found = customers.find(c => c.id === lead.customer);
    return found ? found.full_name : `Customer #${lead.customer}`;
  };

  const getVehicleName = (lead) => {
    const found = vehiclesList.find(v => v.id === lead.interested_vehicle);
    return found ? `${found.model_name} ${found.variant || ''}` : '—';
  };

  const filtered = leads.filter(l => {
    const matchSearch = getCustomerName(l).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!leadForm.full_name || !leadForm.phone || !leadForm.email || !leadForm.city || !leadForm.state) {
      alert('Name, Phone, Email, City aur State zaroori hai');
      return;
    }
    try {
      const custRes = await api.post('customers/', {
        full_name: leadForm.full_name, phone: leadForm.phone, email: leadForm.email,
        city: leadForm.city, state: leadForm.state,
        address: leadForm.address || null,
        driving_license_no: leadForm.driving_license_no || null,
      });
      await api.post('leads/', {
        customer: custRes.data.id,
        interested_vehicle: leadForm.interested_vehicle ? Number(leadForm.interested_vehicle) : null,
        source: leadForm.source, status: leadForm.status,
        follow_up_date: leadForm.follow_up_date || null,
        notes: leadForm.notes || null,
      });
      alert('Lead Database me save ho gaya!');
      setShowLeadModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  // --- Create Quote - QUOTATION MODEL MATCH ---
  const handleQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.quoted_price) {
      alert('Quoted Price zaroori hai');
      return;
    }
    const customerId = selectedLead.customer;
    const vehicleId = selectedLead.interested_vehicle;
    if (!customerId) { alert('Is Lead ka Customer nahi mila'); return; }
    if (!vehicleId) { alert('Is Lead me Interested Vehicle select nahi hai. Pehle Lead me Vehicle select kar.'); return; }
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);
    const validUntilStr = validUntil.toISOString().split('T')[0];
    try {
      await api.post('quotations/', {
        customer: customerId,
        vehicle: vehicleId,
        quoted_price: Number(quoteForm.quoted_price),
        valid_until: quoteForm.valid_until || validUntilStr,
        notes: quoteForm.notes || null,
        status: 'Sent',
      });
      alert('Quote ban gayi aur save ho gayi!');
      setShowQuoteModal(false);
      setQuoteForm({ quoted_price: '', valid_until: '', notes: '' });
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  const openQuote = (lead) => {
    setSelectedLead(lead);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setQuoteForm({ quoted_price: '', valid_until: d.toISOString().split('T')[0], notes: '' });
    setShowQuoteModal(true);
  };

  return (
    <AdminLayout title="Leads & Customers" subtitle="Follow up, convert, close deals">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name..." className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-2.5 text-sm w- outline-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
            <option>All</option><option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option>
          </select>
        </div>
        <button onClick={() => setShowLeadModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition">+ New Lead</button>
      </div>

      <div className="bg-white border border-[#E8EBF0] rounded- p-6">
        <h3 className="font-display font-bold text-">All Leads ({filtered.length})</h3>
        {loading ? <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
        : filtered.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">No leads found. + New Lead se add kar.</p>
        : (
          <div className="mt-5 space-y-3">
            {filtered.map(l => (
              <div key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-[#0A1628] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{getCustomerName(l)[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text- truncate">{getCustomerName(l)}</p>
                  <p className="text- text-[#5B6B82] truncate">Interested: {getVehicleName(l)} • Source: {l.source} • Follow-up: {l.follow_up_date || '—'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text- font-semibold bg-amber-100 text-amber-700 shrink-0">{l.status}</span>
                <button onClick={() => openQuote(l)} className="bg-white border border-[#E8EBF0] px-4 py-2 rounded-xl text- font-semibold hover:bg-[#0A1628] hover:text-white transition shrink-0">New Quote →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddLead} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Add New Lead</h3>
              <button type="button" onClick={() => setShowLeadModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <label className="block text- font-medium mt-4">Full Name *</label>
            <input value={leadForm.full_name} onChange={e => setLeadForm({ ...leadForm, full_name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Phone *</label><input value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="9876543210" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Email *</label><input type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="rahul@gmail.com" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">City *</label><input value={leadForm.city} onChange={e => setLeadForm({ ...leadForm, city: e.target.value })} placeholder="e.g. Ghaziabad" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">State *</label>
                <select value={leadForm.state} onChange={e => setLeadForm({ ...leadForm, state: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option value="">Select State</option><option>Uttar Pradesh</option><option>Delhi</option><option>Haryana</option><option>Rajasthan</option><option>Punjab</option><option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>West Bengal</option><option>Gujarat</option><option>Other</option>
                </select></div>
            </div>
            <label className="block text- font-medium mt-4">Address (optional)</label>
            <input value={leadForm.address} onChange={e => setLeadForm({ ...leadForm, address: e.target.value })} placeholder="Full address..." className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Driving License No. (optional)</label>
            <input value={leadForm.driving_license_no} onChange={e => setLeadForm({ ...leadForm, driving_license_no: e.target.value })} placeholder="e.g. UP14 20201234567" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Interested Vehicle</label>
            <select value={leadForm.interested_vehicle} onChange={e => setLeadForm({ ...leadForm, interested_vehicle: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Vehicle (optional)</option>
              {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.model_name} {v.variant || ''} — ₹ {Number(v.price).toLocaleString('en-IN')}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Source</label>
                <select value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Walk-in</option><option>Website</option><option>Referral</option><option>Phone</option><option>Instagram</option>
                </select></div>
              <div><label className="text- font-medium">Status</label>
                <select value={leadForm.status} onChange={e => setLeadForm({ ...leadForm, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option>
                </select></div>
            </div>
            <label className="block text- font-medium mt-4">Follow-up Date</label>
            <input type="date" value={leadForm.follow_up_date} onChange={e => setLeadForm({ ...leadForm, follow_up_date: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={leadForm.notes} onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="e.g. Kal test drive chahiye" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Save Lead →</button>
          </form>
        </div>
      )}

      {/* NEW QUOTE MODAL - MODEL MATCH */}
      {showQuoteModal && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleQuote} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">New Quote</h3>
              <button type="button" onClick={() => setShowQuoteModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button>
            </div>
            <p className="text- text-[#5B6B82] mt-2">For: {getCustomerName(selectedLead)}</p>
            <p className="text- text-[#5B6B82]">Vehicle: {getVehicleName(selectedLead)}</p>
            <label className="block text- font-medium mt-4">Quoted Price (₹) *</label>
            <input type="number" value={quoteForm.quoted_price} onChange={e => setQuoteForm({ ...quoteForm, quoted_price: e.target.value })} placeholder="e.g. 750000" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Valid Until *</label>
            <input type="date" value={quoteForm.valid_until} onChange={e => setQuoteForm({ ...quoteForm, valid_until: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Notes</label>
            <textarea value={quoteForm.notes} onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })} placeholder="e.g. Free accessories included" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition">Send Quote →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}