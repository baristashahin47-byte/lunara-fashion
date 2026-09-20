import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/dbStore.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON and urlencoded with 20MB limit for multiple base64 product image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Regular user authentication helper
  const getUserFromHeader = (req: express.Request) => {
    const adminToken = (req.headers['x-admin-token'] as string) || req.headers['authorization']?.replace('Bearer ', '');
    if (adminToken) {
      const admin = db.verifyAdminSession(adminToken);
      if (admin) return admin;
    }
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return null;
    return db.findUserById(userId) || null;
  };

  // Strict Admin Authentication Middleware
  // Normal customers or unauthenticated users are rejected with 403
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminToken = (req.headers['x-admin-token'] as string) || req.headers['authorization']?.replace('Bearer ', '');
    if (adminToken) {
      const admin = db.verifyAdminSession(adminToken);
      if (admin && admin.role === 'ADMIN') {
        (req as any).adminUser = admin;
        return next();
      }
    }

    // Support x-user-id fallback ONLY if role is verified ADMIN in database
    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      const user = db.findUserById(userId);
      if (user && user.role === 'ADMIN') {
        (req as any).adminUser = user;
        return next();
      }
    }

    return res.status(403).json({
      error: 'Access denied: Administrator privileges required to access this resource.'
    });
  };

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', brand: 'LUNARA FASHION', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // ADMIN AUTHENTICATION ENDPOINTS
  // ==========================================

  app.post('/api/admin/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = db.loginAdmin(email, password);
      if (!result) {
        return res.status(401).json({
          error: 'Invalid administrator credentials. Access restricted to authorized store managers.'
        });
      }

      res.json({
        token: result.token,
        user: result.user,
        message: 'Admin authentication successful.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    const adminToken = (req.headers['x-admin-token'] as string) || req.headers['authorization']?.replace('Bearer ', '');
    if (adminToken) {
      db.logoutAdmin(adminToken);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.get('/api/admin/me', requireAdmin, (req, res) => {
    res.json((req as any).adminUser);
  });

  app.put('/api/admin/profile', requireAdmin, (req, res) => {
    try {
      const admin = (req as any).adminUser;
      const result = db.updateAdminProfile(admin.id, req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ user: result.user, message: 'Admin profile updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CATEGORIES
  // ==========================================

  app.get('/api/categories', (_req, res) => {
    try {
      const categories = db.getCategories();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/categories', requireAdmin, (req, res) => {
    try {
      const { name, nameBn, slug, description, image, featured, displayOrder } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Category name and slug are required.' });
      }
      const category = db.createCategory({
        name,
        nameBn: nameBn || name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        featured: !!featured,
        displayOrder: Number(displayOrder) || 1
      });
      res.status(201).json(category);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    try {
      const updated = db.updateCategory(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/categories/:id/toggle', requireAdmin, (req, res) => {
    try {
      const updated = db.toggleCategory(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    try {
      const force = req.query.force === 'true';
      const result = db.deleteCategory(req.params.id, force);
      if (!result.success) {
        return res.status(400).json({ error: result.error, count: result.count });
      }
      res.json({ success: true, message: 'Category deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // PRODUCTS
  // ==========================================

  app.get('/api/products', (req, res) => {
    try {
      const {
        category,
        search,
        sort,
        minPrice,
        maxPrice,
        size,
        color,
        featured,
        newArrival,
        bestSeller,
        trending,
        sale,
        tag
      } = req.query;

      const products = db.getProducts({
        category: category as string,
        search: search as string,
        sort: sort as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        size: size as string,
        color: color as string,
        featured: featured === 'true',
        newArrival: newArrival === 'true',
        bestSeller: bestSeller === 'true',
        trending: trending === 'true',
        sale: sale === 'true',
        tag: tag as string,
      });

      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products/:slug', (req, res) => {
    try {
      const product = db.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', requireAdmin, (req, res) => {
    try {
      const product = db.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', requireAdmin, (req, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', requireAdmin, (req, res) => {
    try {
      const id = decodeURIComponent(req.params.id);
      const deleted = db.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products/:id/duplicate', requireAdmin, (req, res) => {
    try {
      const duplicated = db.duplicateProduct(req.params.id);
      if (!duplicated) {
        return res.status(404).json({ error: 'Original product not found' });
      }
      res.status(201).json(duplicated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // INVENTORY
  // ==========================================

  app.get('/api/admin/inventory', requireAdmin, (req, res) => {
    try {
      const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
      const inventory = db.getInventory(threshold);
      res.json(inventory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/inventory/:id', requireAdmin, (req, res) => {
    try {
      const { stock } = req.body;
      if (stock === undefined || isNaN(Number(stock))) {
        return res.status(400).json({ error: 'Valid stock number required' });
      }
      const updated = db.updateStock(req.params.id, Number(stock));
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // FLASH SALE
  // ==========================================

  app.get('/api/flash-sale', (_req, res) => {
    try {
      const flashSale = db.getFlashSale();
      res.json(flashSale);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/flash-sale', requireAdmin, (req, res) => {
    try {
      const updated = db.updateFlashSale(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HOMEPAGE SETTINGS
  // ==========================================

  app.get('/api/homepage', (_req, res) => {
    try {
      const hp = db.getHomepageSettings();
      res.json(hp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/homepage', requireAdmin, (req, res) => {
    try {
      const updated = db.updateHomepageSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // REVIEWS & MODERATION
  // ==========================================

  app.get('/api/reviews/:productId', (req, res) => {
    try {
      const reviews = db.getReviews(req.params.productId);
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { productId, userName, userCity, rating, comment, userId } = req.body;
      if (!productId || !userName || !rating || !comment) {
        return res.status(400).json({ error: 'Missing required review fields' });
      }

      const review = db.addReview({
        productId,
        userName,
        userCity: userCity || 'Dhaka',
        rating: Number(rating),
        comment,
        userId: userId || undefined,
        isVerified: true
      });

      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/admin/reviews', requireAdmin, (_req, res) => {
    try {
      const reviews = db.getAllReviews();
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', requireAdmin, (req, res) => {
    try {
      const { isApproved } = req.body;
      const updated = db.approveReview(req.params.id, !!isApproved);
      if (!updated) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
    try {
      const ok = db.deleteReview(req.params.id);
      if (!ok) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json({ success: true, message: 'Review deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // RETURNS & REFUNDS
  // ==========================================

  app.get('/api/admin/returns', requireAdmin, (_req, res) => {
    try {
      const returns = db.getReturns();
      res.json(returns);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/returns', (req, res) => {
    try {
      const newReturn = db.createReturn(req.body);
      res.status(201).json(newReturn);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/admin/returns/:id/status', requireAdmin, (req, res) => {
    try {
      const { status, adminNotes } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = db.updateReturnStatus(req.params.id, status, adminNotes);
      if (!updated) {
        return res.status(404).json({ error: 'Return request not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // NOTIFICATIONS ARCHITECTURE
  // ==========================================

  app.get('/api/admin/notifications', requireAdmin, (_req, res) => {
    try {
      const notifs = db.getNotifications();
      res.json(notifs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/notifications/send', requireAdmin, (req, res) => {
    try {
      const entry = db.logNotification(req.body);
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // COUPONS
  // ==========================================

  app.get('/api/coupons', (_req, res) => {
    try {
      const coupons = db.getCoupons();
      res.json(coupons);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/coupons/validate', (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, message: 'Coupon code required' });
      }
      const result = db.validateCoupon(code, Number(subtotal) || 0);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/coupons', requireAdmin, (req, res) => {
    try {
      const coupon = db.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/coupons/:id', requireAdmin, (req, res) => {
    try {
      const updated = db.updateCoupon(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/coupons/:id', requireAdmin, (req, res) => {
    try {
      const ok = db.deleteCoupon(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // STORE SETTINGS & DELIVERY CHARGES
  // ==========================================

  app.get('/api/settings', (_req, res) => {
    try {
      const settings = db.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // ORDERS
  // ==========================================

  app.get('/api/orders', (req, res) => {
    try {
      const { userId, status } = req.query;
      const orders = db.getOrders({
        userId: userId as string,
        status: status as string
      });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders/:id', (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        division,
        district,
        upazila,
        deliveryZone,
        deliveryNote,
        items,
        subtotal,
        deliveryFee,
        discountAmount,
        couponCode,
        grandTotal,
        paymentMethod,
        userId
      } = req.body;

      if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required checkout information' });
      }

      const newOrder = db.createOrder({
        userId: userId || undefined,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        shippingAddress,
        division: division || 'Dhaka',
        district: district || 'Dhaka',
        upazila: upazila || '',
        deliveryZone: deliveryZone || 'DHAKA_CITY',
        deliveryNote: deliveryNote || undefined,
        items,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode || undefined,
        grandTotal: Number(grandTotal || req.body.totalAmount || 0),
        totalAmount: Number(grandTotal || req.body.totalAmount || 0),
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: 'UNPAID',
        status: 'PENDING'
      });

      res.status(201).json(newOrder);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
    try {
      const { status, note, updatedBy } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = db.updateOrderStatus(req.params.id, status, note, updatedBy || 'Admin');
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // CUSTOMER AUTH & PROFILES
  // ==========================================

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const user = db.createUser(name, email, password, phone);
      res.status(201).json({ user, message: 'Registration successful' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = db.verifyUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.json({ user, message: 'Login successful' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    try {
      const user = getUserFromHeader(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/auth/profile', (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const updated = db.updateUserProfile(userId, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD ANALYTICS & CUSTOMERS
  // ==========================================

  app.get('/api/admin/stats', requireAdmin, (_req, res) => {
    try {
      const stats = db.getAdminStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/customers', requireAdmin, (_req, res) => {
    try {
      const customers = db.getAllCustomers();
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/customers/:id', requireAdmin, (req, res) => {
    try {
      const details = db.getCustomerDetails(req.params.id);
      if (!details) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(details);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC SERVE
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUNARA FASHION backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
