export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'CASH_ON_DELIVERY' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CARD';

export type DeliveryZone = 'DHAKA_CITY' | 'SUB_DHAKA' | 'OUTSIDE_DHAKA';

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  displayOrder: number;
  itemCount?: number;
  isActive?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userCity: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  discount?: number; // percentage
  sku: string;
  stock: number;
  sizes: string[];
  colors: string[];
  colorCodes?: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  fabric?: string;
  fabricDetails?: string;
  details?: string[];
  careInfo?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface ShippingAddressDetails {
  fullName: string;
  phone: string;
  altPhone?: string;
  division: string;
  district: string;
  upazila?: string;
  fullAddress: string;
  deliveryZone?: DeliveryZone;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productNameBn?: string;
  productImage: string;
  size: string;
  color: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
  totalPrice?: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  note: string;
  timestamp: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string | ShippingAddressDetails;
  division?: string;
  district?: string;
  upazila?: string;
  deliveryZone: DeliveryZone;
  deliveryNote?: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  discount?: number;
  couponCode?: string;
  grandTotal: number;
  totalAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  status: OrderStatus;
  trackingNumber: string;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  fullAddress: string;
  deliveryZone: DeliveryZone;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  addresses?: Address[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount: number;
  minOrder: number;
  maxDiscount?: number;
  description?: string;
  expiry?: string;
  expiresAt?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
}

export interface StoreSettings {
  brandName: string;
  brandTagline: string;
  brandTaglineBn: string;
  logo?: string;
  currency: string;
  currencySymbol: string;
  deliveryCharges: {
    dhakaCity: number;
    subDhaka: number;
    outsideDhaka: number;
  };
  supportPhone: string;
  supportEmail: string;
  showroomAddress: string;
  showroomAddressBn: string;
  noticeBanner: string;
  noticeBannerBn: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    whatsapp: string;
    youtube: string;
  };
  lowStockThreshold?: number;
  returnPolicy?: string;
  privacyPolicy?: string;
  termsAndConditions?: string;
}

export interface FlashSale {
  id: string;
  title: string;
  titleBn: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  discountPercentage: number;
  productIds: string[];
}

export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED';

export interface ReturnItem {
  productId: string;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: ReturnItem[];
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  recipientPhone: string;
  type: 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  message: string;
  status: 'SENT' | 'SIMULATED';
  sentAt: string;
}

export interface HeroSlide {
  id?: string;
  badgeBn?: string;
  badgeEn?: string;
  title?: string;
  titleBn: string;
  titleEn?: string;
  subtitle?: string;
  subtitleBn?: string;
  descBn?: string;
  descEn?: string;
  image?: string;
  imageUrl?: string;
  ctaBn?: string;
  ctaEn?: string;
  buttonText?: string;
  buttonLink?: string;
  link?: string;
  isActive?: boolean;
}

export interface HomepageSettings {
  heroSlides: HeroSlide[];
  heroHeading: string;
  heroHeadingBn?: string;
  heroDescription: string;
  heroDescriptionBn?: string;
  heroButtonText: string;
  heroButtonTextBn?: string;
  heroButtonLink: string;
  heroBannerImage?: string;
  showFeatured: boolean;
  showNewArrivals: boolean;
  showTrending: boolean;
  showBestSellers: boolean;
  showSale: boolean;
  announcementBar?: {
    enabled?: boolean;
    text?: string;
    textBn?: string;
  };
}

