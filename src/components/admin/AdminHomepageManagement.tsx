import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Bell,
  Sparkles,
  Layers
} from 'lucide-react';
import { HomepageSettings, Category, Product } from '../../types.js';
import { fetchHomepageSettings, updateHomepageSettingsApi } from '../../lib/api.js';

interface AdminHomepageManagementProps {
  categories: Category[];
  products: Product[];
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminHomepageManagement: React.FC<AdminHomepageManagementProps> = ({
  categories,
  products,
  showToast
}) => {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchHomepageSettings();
      setSettings(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load homepage settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleAddHeroSlide = () => {
    if (!settings) return;
    const newSlide = {
      id: `hero-${Date.now()}`,
      title: 'Royal Eid Festive Collection 2026',
      titleBn: 'রাজকীয় ঈদ উৎসব কালেকশন ২০২৬',
      subtitle: 'Exclusive handcrafted 3-piece, chiffon dupattas & luxury abayas',
      subtitleBn: 'হস্তশিল্পের অনন্য থ্রি-পিস, শিফন দোপাট্টা এবং লাক্সারি আবায়া',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
      buttonText: 'Shop New Arrivals',
      buttonLink: '/shop?tag=new',
      isActive: true
    };
    setSettings({
      ...settings,
      heroSlides: [...settings.heroSlides, newSlide]
    });
  };

  const handleRemoveHeroSlide = (idx: number) => {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    slides.splice(idx, 1);
    setSettings({ ...settings, heroSlides: slides });
  };

  const handleUpdateSlide = (idx: number, field: string, value: any) => {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    slides[idx] = { ...slides[idx], [field]: value };
    setSettings({ ...settings, heroSlides: slides });
  };

  const handleSlideImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === 'string') {
        handleUpdateSlide(idx, 'imageUrl', uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateHomepageSettingsApi(settings);
      setSettings(updated);
      showToast('Homepage banners & layouts updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-600" />
            <span>Homepage & Banner Management</span>
          </h2>
          <p className="text-xs text-stone-500">
            Customize hero slider carousel, announcement bar, and featured storefront collections
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Announcement Bar Section */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">Top Header Announcement Bar</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementBar?.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  announcementBar: {
                    ...settings.announcementBar,
                    enabled: e.target.checked
                  }
                })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Display Announcement Bar</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Announcement Text (English)
              </label>
              <input
                type="text"
                value={settings.announcementBar?.text || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  announcementBar: {
                    ...settings.announcementBar,
                    text: e.target.value
                  }
                })}
                placeholder="Free delivery nationwide on orders above ৳3,000..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Announcement Text (বাংলা)
              </label>
              <input
                type="text"
                value={settings.announcementBar?.textBn || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  announcementBar: {
                    ...settings.announcementBar,
                    textBn: e.target.value
                  }
                })}
                placeholder="৩,০০০ টাকার অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bangla focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Slider Carousel Section */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Hero Banners ({settings.heroSlides.length} slides)</h3>
              <p className="text-[11px] text-stone-500">
                Primary homepage full-width hero slides, headlines, and call-to-action buttons
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddHeroSlide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {settings.heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Slide #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.isActive !== false}
                        onChange={(e) => handleUpdateSlide(idx, 'isActive', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveHeroSlide(idx)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner Image Preview & Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-200 relative group">
                    <img src={slide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity text-xs font-semibold gap-1">
                      <Upload className="w-4 h-4" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSlideImageUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Image URL</label>
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => handleUpdateSlide(idx, 'imageUrl', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Button Text</label>
                        <input
                          type="text"
                          value={slide.buttonText}
                          onChange={(e) => handleUpdateSlide(idx, 'buttonText', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Button Link</label>
                        <input
                          type="text"
                          value={slide.buttonLink}
                          onChange={(e) => handleUpdateSlide(idx, 'buttonLink', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Title (English)</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Title (বাংলা)</label>
                    <input
                      type="text"
                      value={slide.titleBn || ''}
                      onChange={(e) => handleUpdateSlide(idx, 'titleBn', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-bangla"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Subtitle (English)</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Subtitle (বাংলা)</label>
                    <input
                      type="text"
                      value={slide.subtitleBn || ''}
                      onChange={(e) => handleUpdateSlide(idx, 'subtitleBn', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-bangla"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
