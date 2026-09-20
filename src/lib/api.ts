import { 
  Product, 
  Category, 
  Order, 
  Review, 
  Coupon, 
  StoreSettings, 
  User,
  FlashSale,
  ReturnRequest,
  CustomerNotification,
  HomepageSettings
} from '../types.js';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('lunara_admin_token');
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem('lunara_admin_token', token);
  } else {
    localStorage.removeItem('lunara_admin_token');
  }
}

export function getAdminHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['x-admin-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  // also add user id fallback if exists in lunara_admin_user
  const savedUser = localStorage.getItem('lunara_admin_user');
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      if (u?.id) headers['x-user-id'] = u.id;
    } catch {}
  }
  return headers;
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

export async function adminLoginApi(email: string, pass: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Admin login failed');
  setAdminToken(data.token);
  localStorage.setItem('lunara_admin_user', JSON.stringify(data.user));
  return data;
}

export async function adminLogoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
  } catch {}
  setAdminToken(null);
  localStorage.removeItem('lunara_admin_user');
}

export async function adminGetMeApi(): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/me`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Session expired or unauthorized');
  return res.json();
}

export async function adminUpdateProfileApi(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update admin profile');
  if (body.user) {
    localStorage.setItem('lunara_admin_user', JSON.stringify(body.user));
  }
  return body.user;
}

// ==========================================
// CATEGORIES
// ==========================================

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function createCategoryApi(category: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(category)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create category');
  return data;
}

export async function updateCategoryApi(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update category');
  return data;
}

export async function toggleCategoryApi(id: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}/toggle`, {
    method: 'PATCH',
    headers: getAdminHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle category');
  return data;
}

export async function deleteCategoryApi(id: string, force = false): Promise<{ success: boolean; error?: string; count?: number }> {
  const res = await fetch(`${API_BASE}/categories/${id}?force=${force}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete category');
  }
  return data;
}

// ==========================================
// PRODUCTS
// ==========================================

export async function fetchProducts(params: Record<string, any> = {}): Promise<Product[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function saveProductApi(product: any, id?: string, _userId = ''): Promise<Product> {
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
  const res = await fetch(url, {
    method,
    headers: getAdminHeaders(),
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save product');
  return data;
}

export async function deleteProductApi(id: string, _userId = ''): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  return res.ok;
}

export async function duplicateProductApi(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/duplicate`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to duplicate product');
  return data;
}

// ==========================================
// INVENTORY
// ==========================================

export async function fetchAdminInventory(threshold?: number): Promise<any[]> {
  const url = threshold !== undefined ? `${API_BASE}/admin/inventory?threshold=${threshold}` : `${API_BASE}/admin/inventory`;
  const res = await fetch(url, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function updateAdminInventoryStock(id: string, stock: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/inventory/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ stock })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update stock');
  return data;
}

// ==========================================
// ORDERS
// ==========================================

export async function fetchOrders(userId?: string): Promise<Order[]> {
  const url = userId ? `${API_BASE}/orders?userId=${userId}` : `${API_BASE}/orders`;
  const res = await fetch(url, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function createOrderApi(orderData: any): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit order');
  }
  return res.json();
}

export async function updateOrderStatusApi(orderId: string, status: string, note?: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status, note })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

// ==========================================
// CUSTOMERS
// ==========================================

export async function fetchAdminCustomers() {
  const res = await fetch(`${API_BASE}/admin/customers`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load customers');
  return res.json();
}

export async function fetchAdminCustomerDetails(id: string) {
  const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load customer details');
  return res.json();
}

// ==========================================
// COUPONS
// ==========================================

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/coupons`);
  if (!res.ok) throw new Error('Failed to load coupons');
  return res.json();
}

export async function validateCouponApi(code: string, subtotal: number) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  return res.json();
}

export async function saveCouponApi(couponData: Partial<Coupon>, id?: string): Promise<Coupon> {
  const url = id ? `${API_BASE}/coupons/${id}` : `${API_BASE}/coupons`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: getAdminHeaders(),
    body: JSON.stringify(couponData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save coupon');
  return data;
}

export async function deleteCouponApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  return res.ok;
}

// ==========================================
// FLASH SALE
// ==========================================

export async function fetchFlashSale(): Promise<FlashSale> {
  const res = await fetch(`${API_BASE}/flash-sale`);
  if (!res.ok) throw new Error('Failed to load flash sale');
  return res.json();
}

export async function updateFlashSaleApi(data: Partial<FlashSale>): Promise<FlashSale> {
  const res = await fetch(`${API_BASE}/admin/flash-sale`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update flash sale');
  return body;
}

// ==========================================
// REVIEWS
// ==========================================

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/reviews/${productId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function submitProductReview(data: {
  productId: string;
  userName: string;
  userCity: string;
  rating: number;
  comment: string;
  userId?: string;
}): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to post review');
  return res.json();
}

export async function fetchAdminReviews(): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/admin/reviews`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
}

export async function approveReviewApi(id: string, isApproved: boolean): Promise<Review> {
  const res = await fetch(`${API_BASE}/admin/reviews/${id}/approve`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ isApproved })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update review');
  return data;
}

export async function deleteReviewApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  return res.ok;
}

// ==========================================
// RETURNS & REFUNDS
// ==========================================

export async function fetchAdminReturns(): Promise<ReturnRequest[]> {
  const res = await fetch(`${API_BASE}/admin/returns`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load return requests');
  return res.json();
}

export async function createReturnApi(data: Partial<ReturnRequest>): Promise<ReturnRequest> {
  const res = await fetch(`${API_BASE}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to submit return request');
  return body;
}

export async function updateReturnStatusApi(id: string, status: string, adminNotes?: string): Promise<ReturnRequest> {
  const res = await fetch(`${API_BASE}/admin/returns/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status, adminNotes })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update return status');
  return body;
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function fetchAdminNotifications(): Promise<CustomerNotification[]> {
  const res = await fetch(`${API_BASE}/admin/notifications`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

export async function sendAdminNotificationApi(data: Partial<CustomerNotification>): Promise<CustomerNotification> {
  const res = await fetch(`${API_BASE}/admin/notifications/send`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to send notification');
  return body;
}

// ==========================================
// HOMEPAGE MANAGEMENT
// ==========================================

export async function fetchHomepageSettings(): Promise<HomepageSettings> {
  const res = await fetch(`${API_BASE}/homepage`);
  if (!res.ok) throw new Error('Failed to load homepage settings');
  return res.json();
}

export async function updateHomepageSettingsApi(data: Partial<HomepageSettings>): Promise<HomepageSettings> {
  const res = await fetch(`${API_BASE}/admin/homepage`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update homepage settings');
  return body;
}

// ==========================================
// SETTINGS
// ==========================================

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettingsApi(settings: Partial<StoreSettings>, _userId = ''): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load admin stats');
  return res.json();
}

// ==========================================
// ALIAS EXPORTS FOR ADMIN COMPONENTS
// ==========================================

export async function updateAdminReviewStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Review> {
  return approveReviewApi(id, status === 'APPROVED');
}

export const deleteAdminReview = deleteReviewApi;

export async function updateAdminReturnRequest(id: string, data: { status: string; adminNotes?: string; refundAmount?: number }): Promise<ReturnRequest> {
  return updateReturnStatusApi(id, data.status, data.adminNotes);
}

export const updateStoreSettingsApi = updateSettingsApi;

export async function updateAdminProfileApi(name: string, email: string): Promise<User> {
  return adminUpdateProfileApi({ name, email });
}

export async function changeAdminPasswordApi(currentPassword: string, newPassword: string): Promise<User> {
  return adminUpdateProfileApi({ currentPassword, newPassword });
}
