import React, { useState } from 'react';
import { 
  Megaphone, Pin, Calendar, User, Search, Plus, Edit2, Trash2, 
  Tag, Users, CheckCircle, AlertCircle, Info, ChevronDown, Check, X, ShieldAlert
} from 'lucide-react';
import { Announcement } from '../types';

interface PengumumanProps {
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  onUpdateAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function Pengumuman({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement
}: PengumumanProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedAudience, setSelectedAudience] = useState<string>('Semua');
  
  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    author: 'Bagian Kemahasiswaan',
    category: 'Umum' as Announcement['category'],
    isPinned: false,
    targetAudience: 'Semua' as Announcement['targetAudience']
  });

  // Open form for creation
  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormState({
      title: '',
      content: '',
      author: 'Bagian Kemahasiswaan',
      category: 'Umum',
      isPinned: false,
      targetAudience: 'Semua'
    });
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormState({
      title: ann.title,
      content: ann.content,
      author: ann.author,
      category: ann.category,
      isPinned: ann.isPinned,
      targetAudience: ann.targetAudience
    });
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.content.trim()) return;

    if (editingAnnouncement) {
      onUpdateAnnouncement({
        ...editingAnnouncement,
        title: formState.title,
        content: formState.content,
        author: formState.author,
        category: formState.category,
        isPinned: formState.isPinned,
        targetAudience: formState.targetAudience
      });
    } else {
      onAddAnnouncement({
        title: formState.title,
        content: formState.content,
        author: formState.author,
        category: formState.category,
        isPinned: formState.isPinned,
        targetAudience: formState.targetAudience
      });
    }
    setIsFormOpen(false);
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      onDeleteAnnouncement(id);
    }
  };

  // Helpers
  const getCategoryColor = (category: Announcement['category']) => {
    switch (category) {
      case 'Akademik': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pencairan': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Seleksi': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: Announcement['category']) => {
    switch (category) {
      case 'Akademik': return <Info size={14} className="text-blue-500" />;
      case 'Pencairan': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'Seleksi': return <AlertCircle size={14} className="text-amber-500" />;
      default: return <Megaphone size={14} className="text-slate-500" />;
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ann.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || ann.category === selectedCategory;
    const matchesAudience = selectedAudience === 'Semua' || ann.targetAudience === selectedAudience;
    
    return matchesSearch && matchesCategory && matchesAudience;
  });

  // Group announcements: Pinned vs Normal (sorted by date desc)
  const pinnedAnnouncements = filteredAnnouncements
    .filter(ann => ann.isPinned)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const normalAnnouncements = filteredAnnouncements
    .filter(ann => !ann.isPinned)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      
      {/* Upper Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Megaphone size={20} className="text-emerald-600 animate-bounce" />
            Papan Pengumuman Resmi Portal KIP-K
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Media publikasi maklumat, instruksi akademis, dan jadwal penting beasiswa STID Al-Biruni.
          </p>
        </div>
        
        {/* Toggle Admin Control & Add button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isAdminMode 
                ? 'bg-emerald-950 text-white border-emerald-950' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert size={14} />
            {isAdminMode ? 'Keluar Mode Operator' : 'Mode Operator / Admin'}
          </button>

          {isAdminMode && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Buat Pengumuman
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar Widget */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari judul, konten, atau instansi pembuat..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-700"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Akademik">Kategori: Akademik</option>
            <option value="Pencairan">Kategori: Pencairan</option>
            <option value="Seleksi">Kategori: Seleksi</option>
            <option value="Umum">Kategori: Umum</option>
          </select>
        </div>

        {/* Audience Filter */}
        <div>
          <select
            value={selectedAudience}
            onChange={e => setSelectedAudience(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-700"
          >
            <option value="Semua">Semua Sasaran</option>
            <option value="Mahasiswa">Sasaran: Mahasiswa</option>
            <option value="Dosen Wali">Sasaran: Dosen Wali</option>
            <option value="Semua">Sasaran: Umum / Semua</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Megaphone size={20} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada pengumuman ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada pengumuman yang sesuai dengan kriteria filter pencarian atau kategori Anda saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* PINNED ANNOUNCEMENTS (If any exist) */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Pin size={11} className="fill-amber-500 text-amber-500" /> Pengumuman Semat Utama (Pinned)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedAnnouncements.map(ann => (
                  <div 
                    key={ann.id} 
                    className="bg-gradient-to-br from-amber-50/70 to-white rounded-xl border border-amber-200 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow transition-all"
                  >
                    {/* Corner Ribbon accent */}
                    <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                      <div className="absolute top-2 right-[-14px] bg-amber-500 text-white text-[8px] font-bold py-0.5 px-4 rotate-45 flex items-center justify-center shadow-sm">
                        PIN
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(ann.category)}`}>
                          {getCategoryIcon(ann.category)}
                          {ann.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <Users size={10} />
                          Untuk: {ann.targetAudience}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-sans font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">
                          {ann.content}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><User size={11} /> {ann.author}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} /> {ann.date}</span>
                      </div>

                      {isAdminMode && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(ann)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NORMAL ANNOUNCEMENTS */}
          {normalAnnouncements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                Pengumuman Terbaru
              </h3>

              <div className="space-y-4">
                {normalAnnouncements.map(ann => (
                  <div 
                    key={ann.id} 
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(ann.category)}`}>
                            {getCategoryIcon(ann.category)}
                            {ann.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <Users size={10} />
                            Untuk: {ann.targetAudience}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono"><Calendar size={11} /> {ann.date}</span>
                      </div>

                      <div>
                        <h4 className="font-sans font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2.5 whitespace-pre-wrap">
                          {ann.content}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium"><User size={11} /> Penerbit: <strong className="text-slate-600 font-semibold">{ann.author}</strong></span>
                      
                      {isAdminMode && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(ann)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL CREATION/EDIT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-emerald-400" />
                <h3 className="font-serif font-bold text-sm tracking-tight">
                  {editingAnnouncement ? 'Edit Pengumuman Beasiswa' : 'Buat Pengumuman Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={e => setFormState({ ...formState, title: e.target.value })}
                  placeholder="Misal: Batas Akhir Registrasi KIP-K Semester Ganjil"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                />
              </div>

              {/* Grid 1: Category & Audience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Kategori Pengumuman *
                  </label>
                  <select
                    value={formState.category}
                    onChange={e => setFormState({ ...formState, category: e.target.value as Announcement['category'] })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-700"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Pencairan">Pencairan</option>
                    <option value="Seleksi">Seleksi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sasaran Pembaca *
                  </label>
                  <select
                    value={formState.targetAudience}
                    onChange={e => setFormState({ ...formState, targetAudience: e.target.value as Announcement['targetAudience'] })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-700"
                  >
                    <option value="Semua">Semua Pihak</option>
                    <option value="Mahasiswa">Khusus Mahasiswa</option>
                    <option value="Dosen Wali">Khusus Dosen Wali / Akademik</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Author */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Penerbit / Pembuat Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={formState.author}
                  onChange={e => setFormState({ ...formState, author: e.target.value })}
                  placeholder="Misal: Bagian Kemahasiswaan, Rektorat"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-700"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Konten / Isi Maklumat *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formState.content}
                  onChange={e => setFormState({ ...formState, content: e.target.value })}
                  placeholder="Ketik rincian pengumuman secara formal dan lengkap..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 text-slate-700 leading-relaxed"
                />
              </div>

              {/* Pinned Checkbox */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={formState.isPinned}
                    onChange={e => setFormState({ ...formState, isPinned: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 border-slate-300"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-800">Sematkan di Atas (Pin Announcement)</span>
                    <span className="block text-[10px] text-slate-500">Menjadikan pengumuman ini highlight utama yang selalu berada di baris teratas.</span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Check size={14} /> {editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
