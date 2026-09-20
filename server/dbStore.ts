import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initialCategories, initialProducts, initialReviews, initialCoupons, initialSettings, initialUsers, initialOrders } from './mockData.js';
import { 
  Category, 
  Product, 
  Review, 
  Coupon, 
  StoreSettings, 
  User, 
  Order, 
  Address,
  FlashSale,
  ReturnRequest,
  ReturnStatus,
  CustomerNotification,
  HomepageSettings
} from '../src/types.js';

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  users: (User & { passwordHash: string })[];
  orders: Order[];
  flashSale: FlashSale;
  returns: ReturnRequest[];
  notifications: CustomerNotification[];
  homepage: HomepageSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'lunara_salt_2026').digest('hex');
}

const defaultHomepage: HomepageSettings = {
  heroSlides: [
    {
      badgeBn: "বৈশাখ ও বসন্ত কালেকশন ২০২৬",
      badgeEn: "Festive Spring Collection 2026",
      titleBn: "আভিজাত্য ও ঐতিহ্যের সেরা মেলবন্ধন",
      titleEn: "Timeless Elegance & Handcrafted Luxury",
      descBn: "এক্সক্লুসিভ সুইস লন থ্রি-পিস, পিওর ঢাকাই জামদানি এবং ডিজাইনার আবায়ার অপূর্ব সমাহার। ক্যাশ অন ডেলিভারি সুবিধা দেশজুড়ে।",
      descEn: "Explore exclusive embroidered 3-piece ensembles, authentic Dhakai Jamdani sarees, and premium Dubai abayas.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=90",
      ctaBn: "নতুন কালেকশন দেখুন",
      ctaEn: "Shop New Arrivals",
      link: "/shop?new=true"
    },
    {
      badgeBn: "এক্সক্লুসিভ হ্যান্ডলুম শাড়ি",
      badgeEn: "Heritage Handloom Sarees",
      titleBn: "ঢাকাই জামদানি ও পিওর কাতান সিল্ক",
      titleEn: "Royal Dhakai Jamdani & Katan Silk",
      descBn: "বাংলার দক্ষ কারিগরদের বোনা বিশ্বখ্যাত ঐতিহ্যবাহী জামদানি ও বিয়ের পার্টির কাতান শাড়ি।",
      descEn: "Handcrafted masterworks by traditional Bangladeshi weavers, adorned with royal gold and copper zari.",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=90",
      ctaBn: "শাড়ির কালেকশন",
      ctaEn: "Explore Sarees",
      link: "/shop?category=saree"
    },
    {
      badgeBn: "মডার্ন মোডেস্ট ফ্যাশন",
      badgeEn: "Contemporary Modest Couture",
      titleBn: "দুবাই নিদাহ আবায়া ও প্রিমিয়াম হিজাব",
      titleEn: "Dubai Nidha Abayas & Silk Hijabs",
      descBn: "নন-স্লিপ বাবল ক্রিঙ্কল হিজাব, ক্রিস্টাল ওয়ার্ক কিমোনো বোরকা ও পার্টি আবায়া।",
      descEn: "Breathable, wrinkle-resistant and effortlessly draped modest wear for modern women.",
      image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600&q=90",
      ctaBn: "আবায়া ও হিজাব দেখুন",
      ctaEn: "View Abayas & Hijabs",
      link: "/shop?category=abaya"
    }
  ],
  heroHeading: "Elegance in Every Thread",
  heroHeadingBn: "প্রতিটি সুতোয় আভিজাত্যের ছোঁয়া",
  heroDescription: "Exclusive women's ethnic & modest couture crafted in Dhaka, delivered across Bangladesh.",
  heroDescriptionBn: "প্রিমিয়াম থ্রি-পিস, ঢাকাই জামদানি, আবায়া ও গহনার বিশ্বস্ত ফ্যাশন হাউস।",
  heroButtonText: "Explore Collections",
  heroButtonTextBn: "কালেকশন দেখুন",
  heroButtonLink: "/shop",
  heroBannerImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=90",
  showFeatured: true,
  showNewArrivals: true,
  showTrending: true,
  showBestSellers: true,
  showSale: true
};

const defaultFlashSale: FlashSale = {
  id: "flash-1",
  title: "Eid & Spring Mega Flash Sale",
  titleBn: "ঈদ ও বসন্ত মেগা ফ্ল্যাশ সেল",
  isActive: true,
  startTime: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
  endTime: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
  discountPercentage: 20,
  productIds: ["prod-1", "prod-3", "prod-7"]
};

const defaultReturns: ReturnRequest[] = [
  {
    id: "ret-1",
    returnNumber: "RET-1092",
    orderId: "ord-1",
    orderNumber: "LN-84921",
    customerName: "Sumaiya Haque",
    customerPhone: "01819223344",
    customerEmail: "sumaiya@gmail.com",
    items: [
      {
        productId: "prod-6",
        productName: "Meher Turkish Georgette Crinkle Hijab",
        size: "Standard Maxi (85 x 200 cm)",
        color: "Muted Almond",
        quantity: 1,
        price: 520
      }
    ],
    reason: "Color tone appears slightly different under room lighting",
    status: "REQUESTED",
    refundAmount: 520,
    adminNotes: "Customer contacted via phone. Replacement or refund being arranged.",
    createdAt: "2026-03-19T10:15:00Z",
    updatedAt: "2026-03-19T10:15:00Z"
  }
];

const defaultNotifications: CustomerNotification[] = [
  {
    id: "notif-1",
    orderId: "ord-1",
    orderNumber: "LN-84921",
    customerName: "Sumaiya Haque",
    recipientPhone: "01819223344",
    type: "ORDER_CONFIRMED",
    channel: "SMS",
    message: "প্রিয় Sumaiya Haque, Lunara Fashion-এ আপনার অর্ডার LN-84921 নিশ্চিত হয়েছে। মোট মূল্য: ৳৪,৭৬০। শীঘ্রই ডেলিভারি প্রক্রিয়া শুরু হবে।",
    status: "SENT",
    sentAt: "2026-03-18T14:25:00Z"
  },
  {
    id: "notif-2",
    orderId: "ord-2",
    orderNumber: "LN-52190",
    customerName: "Tanzila Rahman",
    recipientPhone: "01712998877",
    type: "ORDER_SHIPPED",
    channel: "SMS",
    message: "প্রিয় Tanzila Rahman, আপনার অর্ডার LN-52190 কুরিয়ার এজেন্টের কাছে হস্তান্তর করা হয়েছে (ট্র্যাকিং: STEADFAST-991823)।",
    status: "SENT",
    sentAt: "2026-03-15T10:05:00Z"
  }
];

class Store {
  private data: DatabaseSchema;
  // In-memory active admin sessions: token -> session info
  private adminSessions: Map<string, { userId: string; user: User; expiresAt: number }> = new Map();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lunarafashion.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.products.length > 0) {
          // Fill missing schema fields safely
          if (!parsed.flashSale) parsed.flashSale = defaultFlashSale;
          if (!parsed.returns) parsed.returns = defaultReturns;
          if (!parsed.notifications) parsed.notifications = defaultNotifications;
          if (!parsed.homepage) parsed.homepage = defaultHomepage;
          if (!parsed.settings) parsed.settings = initialSettings;
          if (parsed.settings.lowStockThreshold === undefined) parsed.settings.lowStockThreshold = 5;

          // Ensure admin user exists with correct role
          const adminIdx = parsed.users.findIndex((u: any) => u.email.toLowerCase() === adminEmail || u.role === 'ADMIN');
          if (adminIdx === -1) {
            parsed.users.unshift({
              id: 'user-admin-1',
              name: 'Lunara Admin',
              email: adminEmail,
              phone: '+880 1711-000111',
              role: 'ADMIN',
              createdAt: '2026-01-01T00:00:00Z',
              passwordHash: hashPassword(adminPass)
            });
          } else {
            // Keep role strictly ADMIN
            parsed.users[adminIdx].role = 'ADMIN';
          }

          return parsed as DatabaseSchema;
        }
      }
    } catch (err) {
      console.warn("Could not load stored database file, seeding defaults:", err);
    }

    // Default Seed
    const defaultData: DatabaseSchema = {
      categories: initialCategories,
      products: initialProducts,
      reviews: initialReviews,
      coupons: initialCoupons,
      settings: {
        ...initialSettings,
        lowStockThreshold: 5,
        returnPolicy: "Easy 7-day hassle-free exchange & return policy for any size or manufacturing defect.",
        privacyPolicy: "We safeguard your personal data and do not share your contact details with external third parties.",
        termsAndConditions: "All prices are in BDT. Orders are delivered nationwide across all 64 districts of Bangladesh."
      },
      users: [
        {
          ...initialUsers[0],
          email: adminEmail,
          passwordHash: hashPassword(adminPass)
        },
        {
          ...initialUsers[1],
          passwordHash: hashPassword('customer123')
        }
      ],
      orders: initialOrders,
      flashSale: defaultFlashSale,
      returns: defaultReturns,
      notifications: defaultNotifications,
      homepage: defaultHomepage
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to save database file:", err);
    }
  }

  // ==========================================
  // ADMIN AUTH & SESSION MANAGEMENT
  // ==========================================

  loginAdmin(email: string, pass: string): { token: string; user: User } | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    const hash = hashPassword(pass);
    if (user.passwordHash !== hash) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const { passwordHash: _, ...safeUser } = user;

    this.adminSessions.set(token, {
      userId: user.id,
      user: safeUser,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days session
    });

    return { token, user: safeUser };
  }

  verifyAdminSession(token: string): User | null {
    if (!token) return null;
    const session = this.adminSessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.adminSessions.delete(token);
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user || user.role !== 'ADMIN') {
      this.adminSessions.delete(token);
      return null;
    }

    return user;
  }

  logoutAdmin(token: string): boolean {
    if (!token) return false;
    return this.adminSessions.delete(token);
  }

  updateAdminProfile(userId: string, data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): { success: boolean; error?: string; user?: User } {
    const user = this.data.users.find(u => u.id === userId && u.role === 'ADMIN');
    if (!user) return { success: false, error: 'Administrator record not found' };

    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, error: 'Current password is required to change password' };
      }
      const currentHash = hashPassword(data.currentPassword);
      if (user.passwordHash !== currentHash) {
        return { success: false, error: 'Current password does not match' };
      }
      user.passwordHash = hashPassword(data.newPassword);
    }

    if (data.name && data.name.trim()) {
      user.name = data.name.trim();
    }

    if (data.email && data.email.trim() && data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const cleanEmail = data.email.trim().toLowerCase();
      const existing = this.data.users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== userId);
      if (existing) {
        return { success: false, error: 'This email is already registered to another account' };
      }
      user.email = cleanEmail;
    }

    this.saveData();
    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================

  getCategories(): Category[] {
    return this.data.categories.map(cat => ({
      ...cat,
      isActive: cat.isActive !== false,
      itemCount: this.data.products.filter(p => p.categoryId === cat.id || p.categorySlug === cat.slug).length
    }));
  }

  getCategoryBySlug(slug: string): Category | undefined {
    const cat = this.data.categories.find(c => c.slug === slug || c.id === slug);
    if (!cat) return undefined;
    return {
      ...cat,
      isActive: cat.isActive !== false,
      itemCount: this.data.products.filter(p => p.categoryId === cat.id || p.categorySlug === cat.slug).length
    };
  }

  createCategory(cat: Omit<Category, 'id'>): Category {
    const id = `cat-${cat.slug || Date.now()}`;
    const newCategory: Category = {
      ...cat,
      id,
      isActive: cat.isActive !== false,
      displayOrder: cat.displayOrder || this.data.categories.length + 1
    };
    this.data.categories.push(newCategory);
    this.saveData();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const existing = this.data.categories[idx];
    const updated = { ...existing, ...updates };
    this.data.categories[idx] = updated;

    // Sync categoryName and categorySlug in products if category changed name or slug
    if (updates.name || updates.slug) {
      for (const prod of this.data.products) {
        if (prod.categoryId === id) {
          if (updates.name) prod.categoryName = updates.name;
          if (updates.slug) prod.categorySlug = updates.slug;
        }
      }
    }

    this.saveData();
    return updated;
  }

  deleteCategory(id: string, force = false): { success: boolean; error?: string; count?: number } {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) {
      return { success: false, error: 'Category not found' };
    }

    const assignedCount = this.data.products.filter(p => p.categoryId === id || p.categorySlug === cat.slug).length;
    if (assignedCount > 0 && !force) {
      return { 
        success: false, 
        error: `Cannot delete: ${assignedCount} product(s) are currently assigned to this category. Please reassign or delete them first, or confirm force delete.`,
        count: assignedCount
      };
    }

    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData();
    return { success: true, count: assignedCount };
  }

  toggleCategory(id: string): Category | null {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;
    cat.isActive = cat.isActive === false ? true : false;
    this.saveData();
    return cat;
  }

  // ==========================================
  // PRODUCTS MANAGEMENT
  // ==========================================

  getProducts(filters: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    trending?: boolean;
    sale?: boolean;
    tag?: string;
  } = {}): Product[] {
    let list = [...this.data.products];

    if (filters.category) {
      const cat = this.data.categories.find(c => c.slug === filters.category || c.id === filters.category || c.name.toLowerCase() === filters.category?.toLowerCase());
      if (cat) {
        list = list.filter(p => p.categoryId === cat.id || p.categorySlug === cat.slug);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameBn && p.nameBn.includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters.minPrice !== undefined) {
      list = list.filter(p => (p.salePrice ?? p.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      list = list.filter(p => (p.salePrice ?? p.price) <= filters.maxPrice!);
    }

    if (filters.size) {
      list = list.filter(p => p.sizes.includes(filters.size!));
    }

    if (filters.color) {
      list = list.filter(p => p.colors.some(c => c.toLowerCase() === filters.color?.toLowerCase()));
    }

    if (filters.featured) list = list.filter(p => p.isFeatured);
    if (filters.newArrival) list = list.filter(p => p.isNewArrival);
    if (filters.bestSeller) list = list.filter(p => p.isBestSeller);
    if (filters.trending) list = list.filter(p => p.isTrending);
    if (filters.sale) list = list.filter(p => p.isOnSale || (p.salePrice && p.salePrice < p.price));
    if (filters.tag) list = list.filter(p => p.tags.includes(filters.tag!));

    // Sorting
    switch (filters.sort) {
      case 'price-asc':
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'popular':
        list.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return list;
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug || p.id === slug);
  }

  createProduct(item: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...item,
      id,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveData();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.products[idx];
    const updated = { ...existing, ...updates };
    this.data.products[idx] = updated;
    this.saveData();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    const cleanId = (id || '').trim();
    const lowerId = cleanId.toLowerCase();
    this.data.products = this.data.products.filter(p => 
      p.id !== cleanId && 
      p.id.toLowerCase() !== lowerId &&
      p.slug?.toLowerCase() !== lowerId
    );
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  duplicateProduct(id: string): Product | null {
    const original = this.data.products.find(p => p.id === id);
    if (!original) return null;

    const rand = Math.floor(100 + Math.random() * 900);
    const newId = `prod-${Date.now()}`;
    const newSku = `${original.sku}-COPY-${rand}`;
    const newSlug = `${original.slug}-copy-${rand}`;

    const duplicate: Product = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      nameBn: `${original.nameBn} (কপি)`,
      slug: newSlug,
      sku: newSku,
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      rating: 5.0
    };

    this.data.products.unshift(duplicate);
    this.saveData();
    return duplicate;
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================

  getInventory(threshold?: number) {
    const limit = threshold !== undefined ? threshold : (this.data.settings.lowStockThreshold || 5);
    return this.data.products.map(p => {
      let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      if (p.stock === 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (p.stock <= limit) {
        stockStatus = 'LOW_STOCK';
      }
      return {
        id: p.id,
        name: p.name,
        nameBn: p.nameBn,
        sku: p.sku,
        categoryName: p.categoryName,
        price: p.price,
        salePrice: p.salePrice,
        stock: p.stock,
        stockStatus,
        image: p.images?.[0] || '',
        isOnSale: p.isOnSale
      };
    });
  }

  updateStock(id: string, newStock: number): Product | null {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) return null;
    prod.stock = Math.max(0, Number(newStock));
    this.saveData();
    return prod;
  }

  // ==========================================
  // REVIEWS & MODERATION
  // ==========================================

  getReviews(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId && r.isApproved);
  }

  getAllReviews(): Review[] {
    return this.data.reviews;
  }

  addReview(data: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
    const id = `rev-${Date.now()}`;
    const newReview: Review = {
      ...data,
      id,
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);

    // Recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === data.productId && r.isApproved);
    const avg = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / (prodReviews.length || 1);
    const prod = this.data.products.find(p => p.id === data.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    this.saveData();
    return newReview;
  }

  approveReview(id: string, isApproved: boolean): Review | null {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.isApproved = isApproved;

    // Recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === rev.productId && r.isApproved);
    const avg = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / (prodReviews.length || 1);
    const prod = this.data.products.find(p => p.id === rev.productId);
    if (prod) {
      prod.rating = prodReviews.length ? Number(avg.toFixed(1)) : 5.0;
      prod.reviewCount = prodReviews.length;
    }

    this.saveData();
    return rev;
  }

  deleteReview(id: string): boolean {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return false;
    const productId = rev.productId;

    this.data.reviews = this.data.reviews.filter(r => r.id !== id);

    // Recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === productId && r.isApproved);
    const avg = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / (prodReviews.length || 1);
    const prod = this.data.products.find(p => p.id === productId);
    if (prod) {
      prod.rating = prodReviews.length ? Number(avg.toFixed(1)) : 5.0;
      prod.reviewCount = prodReviews.length;
    }

    this.saveData();
    return true;
  }

  // ==========================================
  // COUPONS
  // ==========================================

  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } {
    const normalized = code.trim().toUpperCase();
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === normalized && c.isActive);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: "Invalid or expired coupon code" };
    }

    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order amount of ৳${coupon.minOrder.toLocaleString()} required for this coupon`
      };
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.discount) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discount;
    }

    return {
      valid: true,
      discountAmount: discount,
      message: `Coupon applied successfully! ৳${discount} saved.`,
      coupon
    };
  }

  createCoupon(couponData: Omit<Coupon, 'id' | 'timesUsed'>): Coupon {
    const id = `coup-${Date.now()}`;
    const newCoupon: Coupon = {
      ...couponData,
      id,
      code: couponData.code.toUpperCase(),
      timesUsed: 0
    };
    this.data.coupons.push(newCoupon);
    this.saveData();
    return newCoupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...this.data.coupons[idx], ...updates };
    if (updates.code) updated.code = updates.code.toUpperCase();
    this.data.coupons[idx] = updated;
    this.saveData();
    return updated;
  }

  deleteCoupon(id: string): boolean {
    const len = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id && c.code !== id);
    if (this.data.coupons.length !== len) {
      this.saveData();
      return true;
    }
    return false;
  }

  // ==========================================
  // FLASH SALE
  // ==========================================

  getFlashSale(): FlashSale {
    return this.data.flashSale || defaultFlashSale;
  }

  updateFlashSale(updates: Partial<FlashSale>): FlashSale {
    this.data.flashSale = { ...this.getFlashSale(), ...updates };
    this.saveData();
    return this.data.flashSale;
  }

  // ==========================================
  // RETURNS & REFUNDS
  // ==========================================

  getReturns(): ReturnRequest[] {
    return this.data.returns || [];
  }

  getReturnById(id: string): ReturnRequest | undefined {
    return (this.data.returns || []).find(r => r.id === id || r.returnNumber === id);
  }

  createReturn(data: Omit<ReturnRequest, 'id' | 'returnNumber' | 'createdAt' | 'updatedAt'>): ReturnRequest {
    if (!this.data.returns) this.data.returns = [];
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newReturn: ReturnRequest = {
      ...data,
      id: `ret-${Date.now()}`,
      returnNumber: `RET-${rand}`,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.returns.unshift(newReturn);
    this.saveData();
    return newReturn;
  }

  updateReturnStatus(id: string, status: ReturnStatus, adminNotes?: string): ReturnRequest | null {
    if (!this.data.returns) return null;
    const req = this.data.returns.find(r => r.id === id || r.returnNumber === id);
    if (!req) return null;

    req.status = status;
    if (adminNotes !== undefined) req.adminNotes = adminNotes;
    req.updatedAt = new Date().toISOString();
    this.saveData();
    return req;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  getNotifications(): CustomerNotification[] {
    return this.data.notifications || [];
  }

  logNotification(notif: Omit<CustomerNotification, 'id' | 'sentAt'>): CustomerNotification {
    if (!this.data.notifications) this.data.notifications = [];
    const entry: CustomerNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    this.data.notifications.unshift(entry);
    this.saveData();
    return entry;
  }

  // ==========================================
  // HOMEPAGE MANAGEMENT
  // ==========================================

  getHomepageSettings(): HomepageSettings {
    return this.data.homepage || defaultHomepage;
  }

  updateHomepageSettings(updates: Partial<HomepageSettings>): HomepageSettings {
    this.data.homepage = { ...this.getHomepageSettings(), ...updates };
    this.saveData();
    return this.data.homepage;
  }

  // ==========================================
  // STORE SETTINGS
  // ==========================================

  getSettings(): StoreSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // ==========================================
  // USERS & CUSTOMERS
  // ==========================================

  findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  createUser(name: string, email: string, password: string, phone?: string): User {
    const id = `user-${Date.now()}`;
    const newUser = {
      id,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role: 'CUSTOMER' as const,
      passwordHash: hashPassword(password),
      addresses: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();

    const { passwordHash: _, ...safe } = newUser;
    return safe;
  }

  verifyUser(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const hash = hashPassword(password);
    if (user.passwordHash === hash) {
      const { passwordHash: _, ...safe } = user;
      return safe;
    }
    return null;
  }

  updateUserProfile(userId: string, updates: { name?: string; phone?: string; address?: Address }): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;

    if (updates.name) user.name = updates.name;
    if (updates.phone) user.phone = updates.phone;
    if (updates.address) {
      if (!user.addresses) user.addresses = [];
      const idx = user.addresses.findIndex(a => a.id === updates.address!.id);
      if (idx !== -1) {
        user.addresses[idx] = updates.address;
      } else {
        user.addresses.push(updates.address);
      }
    }
    this.saveData();
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  getAllCustomers() {
    return this.data.users
      .filter(u => u.role === 'CUSTOMER')
      .map(u => {
        const userOrders = this.data.orders.filter(o => o.userId === u.id || (o.customerPhone && o.customerPhone === u.phone));
        const totalSpent = userOrders
          .filter(o => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          orderCount: userOrders.length,
          totalSpent,
          addresses: u.addresses || [],
          createdAt: u.createdAt
        };
      });
  }

  getCustomerDetails(id: string) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;

    const orders = this.data.orders.filter(o => o.userId === user.id || (user.phone && o.customerPhone === user.phone));
    const totalSpent = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);

    const { passwordHash: _, ...safeUser } = user;
    return {
      ...safeUser,
      totalSpent,
      orderCount: orders.length,
      orders
    };
  }

  // ==========================================
  // ORDERS
  // ==========================================

  getOrders(filter?: { userId?: string; status?: string }): Order[] {
    let list = [...this.data.orders];
    if (filter?.userId) {
      list = list.filter(o => o.userId === filter.userId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(o => o.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(idOrNumber: string): Order | undefined {
    return this.data.orders.find(o =>
      o.id === idOrNumber ||
      o.orderNumber.toLowerCase() === idOrNumber.toLowerCase() ||
      o.trackingNumber.toLowerCase() === idOrNumber.toLowerCase()
    );
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory' | 'trackingNumber'>): Order {
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LN-${randNum}`;
    const id = `ord-${Date.now()}`;
    const trackingNumber = `PATHAO-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      trackingNumber,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'PENDING',
          note: 'Order successfully placed via website. Awaiting confirmation.',
          timestamp: new Date().toISOString(),
          updatedBy: 'System'
        }
      ]
    };

    this.data.orders.unshift(newOrder);

    // Deduct stock for ordered items
    for (const itm of newOrder.items) {
      const prod = this.data.products.find(p => p.id === itm.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - itm.quantity);
      }
    }

    // If coupon used, increment timesUsed
    if (orderData.couponCode) {
      const cp = this.data.coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase());
      if (cp) {
        cp.timesUsed = (cp.timesUsed || 0) + 1;
      }
    }

    // Auto-log order confirmation notification
    this.logNotification({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      recipientPhone: newOrder.customerPhone,
      type: 'ORDER_CONFIRMED',
      channel: 'SMS',
      message: `প্রিয় ${newOrder.customerName}, Lunara Fashion-এ আপনার অর্ডার ${newOrder.orderNumber} সফলভাবে গ্রহণ করা হয়েছে। মোট: ৳${newOrder.grandTotal.toLocaleString()}। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।`,
      status: 'SENT'
    });

    this.saveData();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], note?: string, updatedBy = 'Admin'): Order | null {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    order.statusHistory.push({
      id: `sh-${Date.now()}`,
      status,
      note: note || `Order status updated from ${previousStatus} to ${status}.`,
      timestamp: new Date().toISOString(),
      updatedBy
    });

    // Automatically trigger and log customer notification for major status updates
    if (status === 'CONFIRMED') {
      this.logNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        recipientPhone: order.customerPhone,
        type: 'ORDER_CONFIRMED',
        channel: 'SMS',
        message: `প্রিয় ${order.customerName}, আপনার অর্ডার ${order.orderNumber} নিশ্চিত হয়েছে। মোট মূল্য: ৳${order.grandTotal.toLocaleString()}।`,
        status: 'SENT'
      });
    } else if (status === 'SHIPPED') {
      this.logNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        recipientPhone: order.customerPhone,
        type: 'ORDER_SHIPPED',
        channel: 'SMS',
        message: `প্রিয় ${order.customerName}, আপনার পার্সেল (${order.orderNumber}) কুরিয়ারে হস্তান্তর করা হয়েছে। ট্র্যাকিং নং: ${order.trackingNumber}।`,
        status: 'SENT'
      });
    } else if (status === 'DELIVERED') {
      this.logNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        recipientPhone: order.customerPhone,
        type: 'ORDER_DELIVERED',
        channel: 'SMS',
        message: `প্রিয় ${order.customerName}, আপনার অর্ডার ${order.orderNumber} সফলভাবে ডেলিভারি করা হয়েছে। Lunara Fashion-এর সাথে থাকার জন্য ধন্যবাদ!`,
        status: 'SENT'
      });
    } else if (status === 'CANCELLED') {
      this.logNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        recipientPhone: order.customerPhone,
        type: 'ORDER_CANCELLED',
        channel: 'SMS',
        message: `প্রিয় ${order.customerName}, আপনার অর্ডার ${order.orderNumber} বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে কল করুন: ${this.data.settings.supportPhone}।`,
        status: 'SENT'
      });
    }

    this.saveData();
    return order;
  }

  // ==========================================
  // COMPREHENSIVE ADMIN ANALYTICS & STATS
  // ==========================================

  getAdminStats() {
    const nonCancelledOrders = this.data.orders.filter(o => o.status !== 'CANCELLED');
    const totalSales = nonCancelledOrders.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthPrefix = now.toISOString().slice(0, 7);

    const todayOrders = nonCancelledOrders.filter(o => o.createdAt.slice(0, 10) === todayStr);
    const todaySales = todayOrders.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

    const thisMonthOrders = nonCancelledOrders.filter(o => o.createdAt.slice(0, 7) === thisMonthPrefix);
    const thisMonthSales = thisMonthOrders.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

    const totalOrders = this.data.orders.length;
    const pendingOrders = this.data.orders.filter(o => o.status === 'PENDING').length;
    const confirmedOrders = this.data.orders.filter(o => o.status === 'CONFIRMED').length;
    const processingOrders = this.data.orders.filter(o => o.status === 'PROCESSING').length;
    const shippedOrders = this.data.orders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = this.data.orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = this.data.orders.filter(o => o.status === 'CANCELLED').length;

    const totalCustomers = this.data.users.filter(u => u.role === 'CUSTOMER').length;
    const totalProducts = this.data.products.length;

    const threshold = this.data.settings.lowStockThreshold || 5;
    const lowStockProducts = this.data.products.filter(p => p.stock <= threshold);
    const lowStockCount = lowStockProducts.length;

    // Daily Sales (last 7 days)
    const dailySales: { date: string; label: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const dayOrders = nonCancelledOrders.filter(o => o.createdAt.slice(0, 10) === dStr);
      const daySales = dayOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailySales.push({ date: dStr, label, sales: daySales, orders: dayOrders.length });
    }

    // Monthly Sales (last 6 months)
    const monthlySales: { month: string; label: string; sales: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7);
      const mOrders = nonCancelledOrders.filter(o => o.createdAt.slice(0, 7) === mStr);
      const mSales = mOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlySales.push({ month: mStr, label, sales: mSales, orders: mOrders.length });
    }

    // Best-selling products (from actual order items)
    const productSalesMap: Record<string, { id: string; name: string; image: string; unitsSold: number; revenue: number }> = {};
    for (const ord of nonCancelledOrders) {
      for (const itm of ord.items) {
        if (!productSalesMap[itm.productId]) {
          productSalesMap[itm.productId] = {
            id: itm.productId,
            name: itm.productName,
            image: itm.productImage || '',
            unitsSold: 0,
            revenue: 0
          };
        }
        productSalesMap[itm.productId].unitsSold += itm.quantity;
        productSalesMap[itm.productId].revenue += (itm.price || itm.unitPrice || 0) * itm.quantity;
      }
    }
    const bestSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const recentOrders = this.data.orders.slice(0, 8);

    return {
      totalSales,
      todaySales,
      thisMonthSales,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      dailySales,
      monthlySales,
      bestSellingProducts,
      recentOrders,
      lowStockProducts: lowStockProducts.slice(0, 10)
    };
  }
}

export const db = new Store();
