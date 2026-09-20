import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, WishlistItem } from '../types.js';
import { useCart } from './CartContext.js';

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  moveToCart: (product: Product, size?: string, color?: string) => void;
  clearWishlist: () => void;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('lunara_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lunara_wishlist', JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      setItems(prev => [
        ...prev,
        {
          id: `wish-${Date.now()}-${product.id}`,
          productId: product.id,
          product,
          addedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const moveToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, size, color, 1);
    removeFromWishlist(product.id);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
        totalWishlistItems: items.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
