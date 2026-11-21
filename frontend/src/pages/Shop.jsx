import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../layouts/AdminLayout';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('parts'); // parts | cart | orders | shipments | reviews
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Part Form - PART MODEL MATCH
  const [partForm, setPartForm] = useState({
    part_name: '', category: '', compatible_model: '', price: '',
    stock_quantity: '', supplier: '', sku: '', image_url: '',
  });

  // Order Form - ORDER MODEL MATCH
  const [orderForm, setOrderForm] = useState({
    customer: '', payment_method: 'COD', shipping_address: '', status: 'Placed',
  });

  // Shipment Form - SHIPMENT MODEL MATCH
  const [shipmentForm, setShipmentForm] = useState({
    order: '', courier_name: '【entity-Delhivery¦canonical_name=Delhivery】', tracking_number: '', shipped_date: '', estimated_delivery: '', status: 'Pending',
  });

  // Review Form - REVIEW MODEL MATCH
  const [reviewForm, setReviewForm] = useState({ part: '', customer: '', rating: '5', comment: '' });

  // Cart customer select karne ke liye
  const [cartCustomer, setCartCustomer] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('parts/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('categories/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('cart-items/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => api.get('cart/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => [])),
      api.get('orders/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('shipments/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('reviews/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
      api.get('customers/').then(r => Array.isArray(r.data) ? r.data : r.data.results || []).catch(() => []),
    ]).then(([p, cat, cartData, o, s, r, c]) => {
      setParts(p); setCategories(cat); setCart(cartData); setOrders(o); setShipments(s); setReviews(r); setCustomersList(c);
    }).finally(() => setLoading(false));
  }, []);

  const getCustomerName = (id) => {
    const f = customersList.find(c => c.id === id);
    return f ? f.full_name : `Customer #${id}`;
  };
  const getPartName = (id) => {
    const f = parts.find(p => p.id === id);
    return f ? f.part_name : `Part #${id}`;
  };
  const getPartPrice = (id) => {
    const f = parts.find(p => p.id === id);
    return f ? Number(f.price) : 0;
  };
  const getCategoryName = (id) => {
    const f = categories.find(c => c.id === id);
    return f ? f.name : '—';
  };

  const filteredParts = parts.filter(p => p.part_name?.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((s, item) => s + (getPartPrice(item.part) * Number(item.quantity || 1)), 0);

  // ===== CATEGORY =====
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) { alert('Category Name zaroori hai'); return; }
    try {
      await api.post('categories/', { name: categoryForm.name, description: categoryForm.description || null });
      alert('Category add ho gayi!');
      setShowCategoryModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Category pehle se hai?'));
    }
  };

  // ===== PART =====
  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partForm.part_name || !partForm.category || !partForm.price || !partForm.sku) {
      alert('Part Name, Category, Price aur SKU zaroori hai'); return;
    }
    try {
      await api.post('parts/', {
        part_name: partForm.part_name,
        category: Number(partForm.category),
        compatible_model: partForm.compatible_model || null,
        price: Number(partForm.price),
        stock_quantity: partForm.stock_quantity ? Number(partForm.stock_quantity) : 0,
        supplier: partForm.supplier || null,
        sku: partForm.sku,
        image_url: partForm.image_url || null,
      });
      alert('Part add ho gaya!');
      setShowPartModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'SKU pehle se hai?'));
    }
  };

  // ===== CART =====
  const addToCart = async (part) => {
    if (!cartCustomer) { alert('Pehle Cart ke liye Customer select kar - upar dropdown me'); setActiveTab('cart'); return; }
    try {
      await api.post('cart-items/', { customer: Number(cartCustomer), part: part.id, quantity: 1 })
        .catch(async (err) => {
          if (err.response?.status === 404) return await api.post('cart/', { customer: Number(cartCustomer), part: part.id, quantity: 1 });
          // Agar pehle se cart me hai to quantity badha do
          if (JSON.stringify(err.response?.data).includes('unique') || err.response?.status === 400) {
            const existing = cart.find(c => c.part === part.id && c.customer == cartCustomer);
            if (existing) {
              await api.patch(`cart-items/${existing.id}/`, { quantity: Number(existing.quantity) + 1 });
              return { data: existing };
            }
          }
          throw err;
        });
      alert(`${part.part_name} Cart me add ho gaya!`);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  const removeFromCart = async (item) => {
    try {
      await api.delete(`cart-items/${item.id}/`).catch(() => api.delete(`cart/${item.id}/`));
      setCart(prev => prev.filter(c => c.id !== item.id));
    } catch (err) { console.log(err.response?.data); }
  };

  // ===== ORDER - Order + OrderItems =====
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const customerId = orderForm.customer || cartCustomer;
    if (!customerId) { alert('Customer select kar'); return; }
    if (cart.length === 0) { alert('Cart khali hai - pehle Parts se Add to Cart kar'); return; }
    const total = cartTotal;
    try {
      // 1. Order banao
      const orderRes = await api.post('orders/', {
        customer: Number(customerId),
        total_amount: total,
        status: orderForm.status,
        payment_method: orderForm.payment_method,
        shipping_address: orderForm.shipping_address || null,
      });
      const orderId = orderRes.data.id;
      // 2. Har Cart Item ke liye OrderItem banao
      for (const item of cart) {
        await api.post('order-items/', {
          order: orderId,
          part: item.part,
          quantity: Number(item.quantity),
          unit_price: getPartPrice(item.part),
        }).catch(async (err) => {
          if (err.response?.status === 404) return await api.post('orders/' + orderId + '/items/', { part: item.part, quantity: Number(item.quantity), unit_price: getPartPrice(item.part) });
          throw err;
        });
      }
      // 3. Cart khali kar do
      for (const item of cart) {
        await api.delete(`cart-items/${item.id}/`).catch(() => {});
      }
      alert(`Order #${orderId} ban gaya! Total ₹ ${total.toLocaleString('en-IN')}`);
      setShowOrderModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Check Backend'));
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    try {
      await api.patch(`orders/${order.id}/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data));
    }
  };

  // ===== SHIPMENT =====
  const openShipment = (order) => {
    setSelectedOrder(order);
    const today = new Date().toISOString().split('T')[0];
    const est = new Date(); est.setDate(est.getDate() + 4);
    setShipmentForm({ order: order.id, courier_name: '【entity-Delhivery¦canonical_name=Delhivery】', tracking_number: `TRK${Date.now().toString().slice(-8)}`, shipped_date: today, estimated_delivery: est.toISOString().split('T')[0], status: 'Pending' });
    setShowShipmentModal(true);
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    if (!shipmentForm.order || !shipmentForm.courier_name || !shipmentForm.tracking_number) { alert('Order, Courier aur Tracking zaroori hai'); return; }
    try {
      await api.post('shipments/', {
        order: Number(shipmentForm.order),
        courier_name: shipmentForm.courier_name,
        tracking_number: shipmentForm.tracking_number,
        shipped_date: shipmentForm.shipped_date || null,
        estimated_delivery: shipmentForm.estimated_delivery || null,
        status: shipmentForm.status,
      });
      alert('Shipment add ho gayi!');
      setShowShipmentModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Is Order ki Shipment pehle se hai? OneToOne hai'));
    }
  };

  const updateShipmentStatus = async (s, newStatus) => {
    try {
      await api.patch(`shipments/${s.id}/`, { status: newStatus });
      setShipments(prev => prev.map(x => x.id === s.id ? { ...x, status: newStatus } : x));
    } catch (err) { console.log(err.response?.data); alert('Failed: ' + JSON.stringify(err.response?.data)); }
  };

  // ===== REVIEW =====
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.part || !reviewForm.customer) { alert('Part aur Customer zaroori hai'); return; }
    try {
      await api.post('reviews/', {
        part: Number(reviewForm.part),
        customer: Number(reviewForm.customer),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment || null,
      });
      alert('Review add ho gayi!');
      setShowReviewModal(false);
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert('Failed: ' + JSON.stringify(err.response?.data || 'Is Customer ne is Part ko review pehle se diya hai?'));
    }
  };

  return (
    <AdminLayout title="Shop & Parts" subtitle="Parts, Cart, Orders, Shipments & Reviews">
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setActiveTab('parts')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'parts' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Parts ({parts.length})</button>
        <button onClick={() => setActiveTab('cart')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'cart' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Cart ({cart.length})</button>
        <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'orders' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Orders ({orders.length})</button>
        <button onClick={() => setActiveTab('shipments')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'shipments' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Shipments ({shipments.length})</button>
        <button onClick={() => setActiveTab('reviews')} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'reviews' ? 'bg-[#0A1628] text-white' : 'bg-white border border-[#E8EBF0]'}`}>Reviews ({reviews.length})</button>
      </div>

      {/* Cart ke liye Customer select - hamesha dikhega */}
      <div className="bg-white border border-[#E8EBF0] rounded- p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <p className="text-sm font-semibold">Shopping as Customer:</p>
        <select value={cartCustomer} onChange={e => setCartCustomer(e.target.value)} className="bg-[#F6F7F9] border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none w-full sm:w-">
          <option value="">Select Customer for Cart / Order</option>
          {customersList.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
        </select>
      </div>

      {/* ===== PARTS ===== */}
      {activeTab === 'parts' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search part..." className="bg-white border border-[#E8EBF0] rounded-xl px-4 py-2.5 text-sm w- outline-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowCategoryModal(true)} className="bg-white border border-[#E8EBF0] px-4 py-2.5 rounded-xl text-sm font-semibold">+ Category</button>
              <button onClick={() => setShowPartModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Add Part</button>
            </div>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Parts</h3>
            <p className="text- text-[#5B6B82]">Categories: {categories.map(c => c.name).join(', ') || 'Koi category nahi'}</p>
            {loading ? <p className="text-sm text-[#5B6B82] py-8 text-center">Loading...</p>
            : filteredParts.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi part nahi hai. + Add Part se add kar.</p>
            : <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{filteredParts.map(p => (
              <div key={p.id} className="bg-[#F6F7F9] rounded-2xl p-4">
                {p.image_url && <img src={p.image_url} alt={p.part_name} className="w-full h- object-cover rounded-xl mb-3" />}
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 rounded-full text- font-semibold bg-white border border-[#E8EBF0]">{getCategoryName(p.category)}</span>
                  <span className={`px-2 py-1 rounded-full text- font-semibold ${p.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{p.stock_quantity > 0 ? `Stock: ${p.stock_quantity}` : 'Out of Stock'}</span>
                </div>
                <p className="font-semibold text- mt-3">{p.part_name}</p>
                <p className="text- text-[#5B6B82]">SKU: {p.sku} • {p.compatible_model || 'Any Model'} • Supplier: {p.supplier || '—'}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="font-bold text-">₹ {Number(p.price).toLocaleString('en-IN')}</p>
                  <button onClick={() => addToCart(p)} className="bg-[#0A1628] text-white px-3 py-1.5 rounded-lg text- font-semibold">Add to Cart →</button>
                </div>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== CART ===== */}
      {activeTab === 'cart' && (
        <>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">Cart {cartCustomer ? `— ${getCustomerName(Number(cartCustomer))}` : ''}</h3>
            {cart.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Cart khali hai. Parts se Add to Cart kar.</p>
            : <>
              <div className="mt-5 space-y-3">{cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                  <div className="w-10 h-10 bg-white border border-[#E8EBF0] rounded-xl flex items-center justify-center text-lg">🔩</div>
                  <div className="flex-1">
                    <p className="font-semibold text-">{getPartName(item.part)}</p>
                    <p className="text- text-[#5B6B82]">₹ {getPartPrice(item.part).toLocaleString('en-IN')} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm">₹ {(getPartPrice(item.part) * Number(item.quantity)).toLocaleString('en-IN')}</p>
                  <button onClick={() => removeFromCart(item)} className="bg-white border border-[#E8EBF0] px-3 py-1.5 rounded-lg text- font-semibold text-red-600">Remove</button>
                </div>
              ))}</div>
              <div className="flex justify-between items-center mt-5 bg-[#0A1628] text-white rounded-2xl p-4">
                <p className="font-semibold">Total: ₹ {cartTotal.toLocaleString('en-IN')}</p>
                <button onClick={() => setShowOrderModal(true)} className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold">Checkout →</button>
              </div>
            </>}
          </div>
        </>
      )}

      {/* ===== ORDERS ===== */}
      {activeTab === 'orders' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowOrderModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Checkout / New Order</button>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Orders</h3>
            {orders.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi order nahi hai. Cart se Checkout kar.</p>
            : <div className="mt-5 space-y-3">{orders.map(o => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-white border border-[#E8EBF0] rounded-xl flex items-center justify-center text-lg shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-">Order #{o.id} — {getCustomerName(o.customer)}</p>
                  <p className="text- text-[#5B6B82]">{o.order_date} • Payment: {o.payment_method} • {o.shipping_address || 'No address'}</p>
                </div>
                <p className="font-bold text-sm">₹ {Number(o.total_amount).toLocaleString('en-IN')}</p>
                <select value={o.status} onChange={e => updateOrderStatus(o, e.target.value)} className="bg-white border border-[#E8EBF0] rounded-lg px-2 py-1.5 text- font-semibold outline-none">
                  <option>Placed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                </select>
                <button onClick={() => openShipment(o)} className="bg-white border border-[#E8EBF0] px-3 py-1.5 rounded-lg text- font-semibold">+ Shipment →</button>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== SHIPMENTS ===== */}
      {activeTab === 'shipments' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setSelectedOrder(null); const today = new Date().toISOString().split('T')[0]; const est = new Date(); est.setDate(est.getDate() + 4); setShipmentForm({ order: '', courier_name: 'Delhivery', tracking_number: `TRK${Date.now().toString().slice(-8)}`, shipped_date: today, estimated_delivery: est.toISOString().split('T')[0], status: 'Pending' }); setShowShipmentModal(true); }} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Add Shipment</button>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Shipments</h3>
            {shipments.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi shipment nahi hai. Order se + Shipment dabaa.</p>
            : <div className="mt-5 space-y-3">{shipments.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F7F9] rounded-2xl p-4">
                <div className="w-10 h-10 bg-white border border-[#E8EBF0] rounded-xl flex items-center justify-center text-lg shrink-0">🚚</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-">Order #{s.order} — {s.tracking_number}</p>
                  <p className="text- text-[#5B6B82]">Courier: {s.courier_name} • Shipped: {s.shipped_date || '—'} • ETA: {s.estimated_delivery || '—'}</p>
                </div>
                <select value={s.status} onChange={e => updateShipmentStatus(s, e.target.value)} className="bg-white border border-[#E8EBF0] rounded-lg px-2 py-1.5 text- font-semibold outline-none">
                  <option>Pending</option><option>Packed</option><option>Shipped</option><option>OutForDelivery</option><option>Delivered</option>
                </select>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== REVIEWS ===== */}
      {activeTab === 'reviews' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowReviewModal(true)} className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">+ Add Review</button>
          </div>
          <div className="bg-white border border-[#E8EBF0] rounded- p-6">
            <h3 className="font-display font-bold text-">All Reviews</h3>
            {reviews.length === 0 ? <p className="text-sm text-[#5B6B82] py-8 text-center">Koi review nahi hai.</p>
            : <div className="mt-5 space-y-3">{reviews.map(r => (
              <div key={r.id} className="bg-[#F6F7F9] rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-">{getCustomerName(r.customer)} — {getPartName(r.part)}</p>
                  <p className="text-">{'⭐'.repeat(Number(r.rating || 5))} <span className="text- text-[#5B6B82]">({r.rating}/5)</span></p>
                </div>
                <p className="text- text-[#5B6B82] mt-1">{r.comment || ''}</p>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {/* ===== CATEGORY MODAL ===== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddCategory} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center"><h3 className="font-display font-bold text-lg">Add Category</h3><button type="button" onClick={() => setShowCategoryModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button></div>
            <label className="block text- font-medium mt-4">Category Name *</label>
            <input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Engine" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Description</label>
            <input value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="e.g. Engine parts" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm">Add Category →</button>
          </form>
        </div>
      )}

      {/* ===== PART MODAL ===== */}
      {showPartModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddPart} className="bg-white rounded- w-full max-w- p-6 max-h- overflow-y-auto">
            <div className="flex justify-between items-center"><h3 className="font-display font-bold text-lg">Add Part</h3><button type="button" onClick={() => setShowPartModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button></div>
            <label className="block text- font-medium mt-4">Part Name *</label>
            <input value={partForm.part_name} onChange={e => setPartForm({ ...partForm, part_name: e.target.value })} placeholder="e.g. Brake Pad" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Category *</label>
                <select value={partForm.category} onChange={e => setPartForm({ ...partForm, category: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && <p className="text- text-red-500 mt-1">Pehle Category bana.</p>}</div>
              <div><label className="text- font-medium">SKU * (Unique)</label><input value={partForm.sku} onChange={e => setPartForm({ ...partForm, sku: e.target.value })} placeholder="e.g. BRK-001" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Price (₹) *</label><input type="number" value={partForm.price} onChange={e => setPartForm({ ...partForm, price: e.target.value })} placeholder="1500" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Stock Quantity</label><input type="number" value={partForm.stock_quantity} onChange={e => setPartForm({ ...partForm, stock_quantity: e.target.value })} placeholder="20" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Compatible Model</label><input value={partForm.compatible_model} onChange={e => setPartForm({ ...partForm, compatible_model: e.target.value })} placeholder="e.g. Swift, Baleno" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Supplier</label><input value={partForm.supplier} onChange={e => setPartForm({ ...partForm, supplier: e.target.value })} placeholder="e.g. Bosch" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <label className="block text- font-medium mt-4">Image URL (optional)</label>
            <input value={partForm.image_url} onChange={e => setPartForm({ ...partForm, image_url: e.target.value })} placeholder="https://..." className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm">Add Part →</button>
          </form>
        </div>
      )}

      {/* ===== ORDER / CHECKOUT MODAL ===== */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateOrder} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center"><h3 className="font-display font-bold text-lg">Checkout</h3><button type="button" onClick={() => setShowOrderModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button></div>
            <p className="text- text-[#5B6B82] mt-2">Cart Total: ₹ {cartTotal.toLocaleString('en-IN')} • Items: {cart.length}</p>
            <label className="block text- font-medium mt-4">Customer *</label>
            <select value={orderForm.customer || cartCustomer} onChange={e => { setOrderForm({ ...orderForm, customer: e.target.value }); setCartCustomer(e.target.value); }} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Customer</option>
              {customersList.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Payment Method</label>
                <select value={orderForm.payment_method} onChange={e => setOrderForm({ ...orderForm, payment_method: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>UPI</option><option>Card</option><option>COD</option><option>NetBanking</option>
                </select></div>
              <div><label className="text- font-medium">Status</label>
                <select value={orderForm.status} onChange={e => setOrderForm({ ...orderForm, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Placed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                </select></div>
            </div>
            <label className="block text- font-medium mt-4">Shipping Address</label>
            <textarea value={orderForm.shipping_address} onChange={e => setOrderForm({ ...orderForm, shipping_address: e.target.value })} placeholder="Full delivery address..." className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={2} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm">Place Order → ₹ {cartTotal.toLocaleString('en-IN')}</button>
          </form>
        </div>
      )}

      {/* ===== SHIPMENT MODAL ===== */}
      {showShipmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddShipment} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center"><h3 className="font-display font-bold text-lg">Add Shipment</h3><button type="button" onClick={() => setShowShipmentModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button></div>
            <label className="block text- font-medium mt-4">Order *</label>
            <select value={shipmentForm.order} onChange={e => setShipmentForm({ ...shipmentForm, order: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Order</option>
              {orders.map(o => <option key={o.id} value={o.id}>Order #{o.id} — {getCustomerName(o.customer)} — ₹ {Number(o.total_amount).toLocaleString('en-IN')}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Courier Name *</label>
            <input value={shipmentForm.courier_name} onChange={e => setShipmentForm({ ...shipmentForm, courier_name: e.target.value })} placeholder="Delhivery" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <label className="block text- font-medium mt-4">Tracking Number *</label>
            <input value={shipmentForm.tracking_number} onChange={e => setShipmentForm({ ...shipmentForm, tracking_number: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text- font-medium">Shipped Date</label><input type="date" value={shipmentForm.shipped_date} onChange={e => setShipmentForm({ ...shipmentForm, shipped_date: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
              <div><label className="text- font-medium">Estimated Delivery</label><input type="date" value={shipmentForm.estimated_delivery} onChange={e => setShipmentForm({ ...shipmentForm, estimated_delivery: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
            </div>
            <label className="block text- font-medium mt-4">Status</label>
            <select value={shipmentForm.status} onChange={e => setShipmentForm({ ...shipmentForm, status: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>Pending</option><option>Packed</option><option>Shipped</option><option>OutForDelivery</option><option>Delivered</option>
            </select>
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm">Add Shipment →</button>
          </form>
        </div>
      )}

      {/* ===== REVIEW MODAL ===== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddReview} className="bg-white rounded- w-full max-w- p-6">
            <div className="flex justify-between items-center"><h3 className="font-display font-bold text-lg">Add Review</h3><button type="button" onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-lg bg-[#F6F7F9]">✕</button></div>
            <label className="block text- font-medium mt-4">Part *</label>
            <select value={reviewForm.part} onChange={e => setReviewForm({ ...reviewForm, part: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Part</option>
              {parts.map(p => <option key={p.id} value={p.id}>{p.part_name} — ₹ {Number(p.price).toLocaleString('en-IN')}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Customer *</label>
            <select value={reviewForm.customer} onChange={e => setReviewForm({ ...reviewForm, customer: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">Select Customer</option>
              {customersList.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
            <label className="block text- font-medium mt-4">Rating</label>
            <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })} className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
            </select>
            <label className="block text- font-medium mt-4">Comment</label>
            <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="e.g. Genuine part, fit perfectly" className="w-full mt-1 border border-[#E8EBF0] rounded-xl px-3 py-2.5 text-sm outline-none" rows={3} />
            <button type="submit" className="w-full mt-5 bg-[#0A1628] text-white py-3 rounded-xl font-semibold text-sm">Add Review →</button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}