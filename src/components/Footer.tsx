import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard,
  Facebook,
  Instagram,
  Youtube,
  Send,
  CheckCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';
import { formatBDT } from '../lib/utils.js';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, language } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#181614] text-stone-300 pt-14 pb-20 md:pb-12 border-t border-stone-800">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 border-b border-stone-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-bangla">
                {language === 'bn' ? 'দেশব্যাপী দ্রুত ডেলিভারি' : 'Fast Delivery Across BD'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 font-bangla">
                {language === 'bn' 
                  ? `ঢাকা মাত্র ${formatBDT(settings.deliveryCharges.dhakaCity)} | বাইরে ${formatBDT(settings.deliveryCharges.outsideDhaka)}`
                  : `Dhaka only ${formatBDT(settings.deliveryCharges.dhakaCity)} | Outside ${formatBDT(settings.deliveryCharges.outsideDhaka)}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-bangla">
                {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 font-bangla">
                {language === 'bn' ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' : 'Pay when parcel arrives at your door'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-bangla">
                {language === 'bn' ? '৭ দিনের সহজ এক্সচেঞ্জ' : '7 Days Easy Exchange'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 font-bangla">
                {language === 'bn' ? 'সাইজ বা ফিটিং সমস্যায় সহজ পরিবর্তন' : 'Hassle-free size and defect replacement'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-bangla">
                {language === 'bn' ? '১০০% অরিজিনাল ফেব্রিক' : '100% Authentic Fabric'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 font-bangla">
                {language === 'bn' ? 'প্রিমিয়াম সুতি, লন, জামদানি ও সিল্ক' : 'Guaranteed premium luxury craftsmanship'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-widest text-white">
                LUNARA
              </span>
              <span className="text-xs text-amber-400 font-semibold tracking-widest uppercase">
                Fashion
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-bangla max-w-sm">
              {language === 'bn'
                ? 'লুনারা ফ্যাশন বাংলাদেশের নারীদের জন্য ঐতিহ্যবাহী ও আধুনিক পোশাকের সেরা সংগ্রহ। আমাদের জামদানি, থ্রি-পিস, কুর্তি, আবায়া ও এক্সক্লুসিভ গহনায় ফুটিয়ে তুলুন আপনার স্বকীয়তা।'
                : "Lunara Fashion is Bangladesh's premier women's fashion destination. Curating timeless Jamdani sarees, lawn three-pieces, comfortable kurtis, luxury abayas, and royal bridal jewellery."}
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-400 font-bangla">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{language === 'bn' ? settings.showroomAddressBn : settings.showroomAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-amber-300">
                  {settings.supportPhone} (10 AM - 10 PM)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-amber-300">
                  {settings.supportEmail}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href={settings.socialLinks.facebook} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-600 hover:text-white flex items-center justify-center text-stone-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={settings.socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-600 hover:text-white flex items-center justify-center text-stone-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={settings.socialLinks.youtube} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-600 hover:text-white flex items-center justify-center text-stone-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-3.5 font-bangla">
              {language === 'bn' ? 'প্রধান ক্যাটাগরি' : 'Categories'}
            </h5>
            <ul className="space-y-2 text-xs font-bangla text-stone-400">
              <li><button onClick={() => navigate('/category/3-piece')} className="hover:text-amber-300">3 Piece (থ্রি-পিস)</button></li>
              <li><button onClick={() => navigate('/category/saree')} className="hover:text-amber-300">Saree (শাড়ি ও জামদানি)</button></li>
              <li><button onClick={() => navigate('/category/kameez')} className="hover:text-amber-300">Kameez (কামিজ)</button></li>
              <li><button onClick={() => navigate('/category/abaya')} className="hover:text-amber-300">Abaya & Borka (আবায়া)</button></li>
              <li><button onClick={() => navigate('/category/hijab')} className="hover:text-amber-300">Hijabs (প্রিমিয়াম হিজাব)</button></li>
              <li><button onClick={() => navigate('/category/kurti')} className="hover:text-amber-300">Kurti (কুর্তি)</button></li>
              <li><button onClick={() => navigate('/category/jewellery')} className="hover:text-amber-300">Jewellery (গহনা)</button></li>
              <li><button onClick={() => navigate('/category/bags')} className="hover:text-amber-300">Bags & Clutches (ব্যাগ)</button></li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-3.5 font-bangla">
              {language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Care'}
            </h5>
            <ul className="space-y-2 text-xs font-bangla text-stone-400">
              <li><button onClick={() => navigate('/track-order')} className="hover:text-amber-300">Track Order (অর্ডার ট্র্যাক)</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-amber-300">New Arrivals (নতুন পোশাক)</button></li>
              <li><button onClick={() => navigate('/wishlist')} className="hover:text-amber-300">Wishlist (পছন্দের তালিকা)</button></li>
              <li><button onClick={() => navigate('/cart')} className="hover:text-amber-300">Shopping Bag (শপিং ব্যাগ)</button></li>
              <li><button onClick={() => navigate('/account')} className="hover:text-amber-300">My Account (আমার একাউন্ট)</button></li>
              <li><button onClick={() => navigate('/admin')} className="text-purple-400 hover:text-purple-300">Admin Portal (এডমিন প্যানেল)</button></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-3.5 font-bangla">
              {language === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
            </h5>
            <p className="text-xs text-stone-400 mb-3 font-bangla">
              {language === 'bn' 
                ? 'ঈদ ও বৈশাখী উৎসবের নতুন কালেকশন এবং স্পেশাল ডিসকাউন্ট কোড পেতে ইমেইল দিন।'
                : 'Subscribe to receive private sale invitations, Eid edits, and new arrivals.'}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs flex items-center justify-center transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bangla">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।</span>
                </div>
              )}
            </form>

            <div className="mt-4 pt-3 border-t border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1.5">Accepted Payment Methods:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-stone-300">
                <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700">Cash on Delivery</span>
                <span className="bg-[#E2136E] text-white px-2 py-0.5 rounded">bKash</span>
                <span className="bg-[#F7921E] text-white px-2 py-0.5 rounded">Nagad</span>
                <span className="bg-[#8B1A72] text-white px-2 py-0.5 rounded">Rocket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
        <p className="font-bangla">
          © 2026 {settings.brandName}. All rights reserved. Made for Women in Bangladesh.
        </p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Dhaka, Bangladesh</span>
          <span>•</span>
          <span>Currency: BDT (৳)</span>
        </div>
      </div>
    </footer>
  );
};
