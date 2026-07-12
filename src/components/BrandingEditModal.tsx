import React, { useState } from 'react';
import { X, Save, RotateCcw, Palette } from 'lucide-react';
import AlBiruniLogo from './AlBiruniLogo';

export interface BrandingConfig {
  abbreviation: string;
  bgColor: string;
  title: string;
  subtitle: string;
  logoType?: 'default' | 'custom';
  customLogoUrl?: string;
}

interface BrandingEditModalProps {
  branding: BrandingConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBranding: BrandingConfig) => void;
}

const COLOR_PRESETS = [
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Blue', class: 'bg-blue-600' },
  { name: 'Indigo', class: 'bg-indigo-600' },
  { name: 'Violet', class: 'bg-violet-600' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Dark Slate', class: 'bg-slate-700' },
  { name: 'Cyan', class: 'bg-cyan-500' },
];

export default function BrandingEditModal({
  branding,
  isOpen,
  onClose,
  onSave
}: BrandingEditModalProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState<BrandingConfig>({ ...branding });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm({
      abbreviation: 'KIP',
      bgColor: 'bg-emerald-500',
      title: 'STID Al-Biruni',
      subtitle: 'Portal Beasiswa',
      logoType: 'default',
      customLogoUrl: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-emerald-400" />
            <h3 className="font-serif font-bold text-sm tracking-tight">Edit Logo & Branding Portal</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

         {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Live Preview Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              PREVIEW LOGO BARU
            </span>
            <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-all duration-300">
                <AlBiruniLogo 
                  className="w-full h-full" 
                  logoType={form.logoType || 'default'} 
                  customUrl={form.customLogoUrl} 
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold leading-none tracking-tight text-sm truncate">{form.title || 'STID Al-Biruni'}</h4>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 block mt-1 truncate">{form.subtitle || 'Portal Beasiswa'}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Pilih Jenis Logo Portal
              </label>
              <div className="flex gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoType: 'default' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    (form.logoType || 'default') === 'default'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Logo Default (Vector)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoType: 'custom' })}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    form.logoType === 'custom'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Logo Kustom (Unggah)
                </button>
              </div>

              {form.logoType === 'custom' && (
                <div className="p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                    Unggah File Logo Baru
                  </span>
                  <div className="flex items-center gap-3">
                    {form.customLogoUrl ? (
                      <div className="w-12 h-12 bg-white shrink-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src={form.customLogoUrl} 
                          alt="Custom logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded shrink-0 flex items-center justify-center text-slate-400 text-xs">
                        Kosong
                      </div>
                    )}
                    
                    <input 
                      type="file"
                      id="custom-logo-file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setForm({ 
                              ...form, 
                              logoType: 'custom', 
                              customLogoUrl: ev.target?.result as string 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="custom-logo-file"
                      className="cursor-pointer px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Pilih Gambar
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Singkatan Logo (Max 5 Huruf)
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={form.abbreviation}
                onChange={e => setForm({ ...form, abbreviation: e.target.value })}
                placeholder="Misal: KIP, STID, UNU"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Warna Background Logo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, bgColor: p.class })}
                    className={`h-8 rounded text-[10px] font-semibold text-white flex items-center justify-center transition-all ${p.class} ${
                      form.bgColor === p.class 
                        ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-sm' 
                        : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    {form.bgColor === p.class ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nama Lembaga / Judul Portal
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Misal: STID Al-Biruni"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sub-Label / Keterangan
              </label>
              <input
                type="text"
                required
                value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Misal: Portal Beasiswa"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-600"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded"
            >
              <RotateCcw size={13} /> Reset Default
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save size={13} /> Simpan
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
