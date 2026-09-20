import React from 'react';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useSettings } from '../context/SettingsContext.js';

interface MobileBottomNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute, navigate }) => {
  const { totalItems, openDrawer } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { language } = useSettings();

  const navItems = [
    { label: language === 'bn' ? 'হোম' : 'Home', path: '/', icon: Home },
    { label: language === 'bn' ? 'শপ' : 'Shop', path: '/shop', icon: Grid },
    { 
      label: language === 'bn' ? 'উইশলিস্ট' : 'Wishlist', 
      path: '/wishlist', 
      icon: Heart, 
      badge: totalWishlistItems 
    },
    { 
      label: language === 'bn' ? 'কার্ট' : 'Cart', 
      action: openDrawer, 
      icon: ShoppingBag, 
      badge: totalItems 
    },
    { label: language === 'bn' ? 'একাউন্ট' : 'Account', path: '/account', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item, idx) => {
        const isActive = item.path ? currentRoute === item.path : false;
        const Icon = item.icon;

        return (
          <button
            key={idx}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center justify-center relative py-1 px-3 min-w-[56px] transition-colors ${
              isActive ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-stone-900' : 'stroke-[1.75px]'}`} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-1 font-bangla">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
