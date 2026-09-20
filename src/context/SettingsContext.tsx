import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types.js';
import { fetchSettings } from '../lib/api.js';

interface SettingsContextType {
  settings: StoreSettings;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  toggleLanguage: () => void;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getDeliveryCharge: (zone: string) => number;
}

const defaultSettings: StoreSettings = {
  brandName: "LUNARA FASHION",
  brandTagline: "Elegance in Every Thread",
  brandTaglineBn: "প্রতিটি সুতোয় আভিজাত্যের ছোঁয়া",
  currency: "BDT",
  currencySymbol: "৳",
  deliveryCharges: {
    dhakaCity: 70,
    subDhaka: 100,
    outsideDhaka: 120
  },
  supportPhone: "+880 1712-345678",
  supportEmail: "support@lunarafashion.com",
  showroomAddress: "House 42, Road 11, Block D, Banani, Dhaka-1213",
  showroomAddressBn: "বাড়ি ৪২, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩",
  noticeBanner: "🎉 Spring Festive Offer: Use code LUNARA10 for 10% off! Cash on Delivery across all 64 districts.",
  noticeBannerBn: "🎉 বসন্ত উৎসব অফার: LUNARA10 কুপন কোডে ১০% ছাড়! ৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা।",
  socialLinks: {
    facebook: "https://facebook.com/lunarafashion",
    instagram: "https://instagram.com/lunarafashion",
    whatsapp: "https://wa.me/8801712345678",
    youtube: "https://youtube.com/@lunarafashion"
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [language, setLanguageState] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('lunara_lang') as 'bn' | 'en') || 'bn';
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Using local default store settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const setLanguage = (lang: 'bn' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('lunara_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const getDeliveryCharge = (zone: string): number => {
    if (zone === 'DHAKA_CITY') return settings.deliveryCharges.dhakaCity;
    if (zone === 'SUB_DHAKA') return settings.deliveryCharges.subDhaka;
    return settings.deliveryCharges.outsideDhaka;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        language,
        setLanguage,
        toggleLanguage,
        loading,
        refreshSettings: loadSettings,
        getDeliveryCharge
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
