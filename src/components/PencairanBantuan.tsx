import React, { useState } from 'react';
import { 
  DollarSign, Landmark, CheckCircle2, AlertCircle, Search, 
  Filter, Calendar, RefreshCw, ChevronDown, Check, Save, CreditCard, Clock,
  Paperclip, AlertTriangle, FileText
} from 'lucide-react';
import { StudentApplicant, Disbursement } from '../types';

interface PencairanBantuanProps {
  applicants: StudentApplicant[];
  disbursements: Disbursement[];
  onUpdateDisbursement: (updated: Disbursement) => void;
}

export default function PencairanBantuan({
  applicants,
  disbursements,
  onUpdateDisbursement
}: PencairanBantuanProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUkt, setFilterUkt] = useState('Semua');
  const [filterBiayaHidup, setFilterBiayaHidup] = useState('Semua');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);

  // Editing form states
  const [statusUkt, setStatusUkt] = useState<Disbursement['statusUkt']>('Belum Proses');
  const [statusBiayaHidup, setStatusBiayaHidup] = useState<Disbursement['statusBiayaHidup']>('Belum Proses');
  const [tglCairUkt, setTglCairUkt] = useState('');
  const [tglCairBiayaHidup, setTglCairBiayaHidup] = useState('');
  const [bankPenerima, setBankPenerima] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [lpjStatus, setLpjStatus] = useState<Disbursement['lpjStatus']>('Belum Diisi');
  const [lpjCatatan, setLpjCatatan] = useState('');

  // 1. Calculate Financial Summary
  const totalAllocatedUkt = disbursements.reduce((acc, d) => acc + d.nominalUkt, 0);
  const totalAllocatedBiayaHidup = disbursements.reduce((acc, d) => acc + d.nominalBiayaHidup, 0);
  const grandTotalAllocated = totalAllocatedUkt + totalAllocatedBiayaHidup;

  const totalCairUkt = disbursements.filter(d => d.statusUkt === 'Cair').reduce((acc, d) => acc + d.nominalUkt, 0);
  const totalCairBiayaHidup = disbursements.filter(d => d.statusBiayaHidup === 'Cair').reduce((acc, d) => acc + d.nominalBiayaHidup, 0);
  const grandTotalCair = totalCairUkt + totalCairBiayaHidup;

  const totalProsesUkt = disbursements.filter(d => d.statusUkt === 'Diproses').reduce((acc, d) => acc + d.nominalUkt, 0);
  const totalProsesBiayaHidup = disbursements.filter(d => d.statusBiayaHidup === 'Diproses').reduce((acc, d) => acc + d.nominalBiayaHidup, 0);
  const grandTotalProses = totalProsesUkt + totalProsesBiayaHidup;

  const grandTotalBelum = grandTotalAllocated - grandTotalCair - grandTotalProses;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter disbursements
  const filteredDisbursements = disbursements.filter(item => {
    const matchesSearch = item.studentNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.studentNim.includes(searchQuery);
    const matchesUkt = filterUkt === 'Semua' || item.statusUkt === filterUkt;
    const matchesBiayaHidup = filterBiayaHidup === 'Semua' || item.statusBiayaHidup === filterBiayaHidup;

    return matchesSearch && matchesUkt && matchesBiayaHidup;
  });

  const getNormalizedBank = (rawBank: string | undefined): string => {
    if (!rawBank) return 'Bank BSI';
    const b = rawBank.toLowerCase();
    if (b.includes('bsi') || b.includes('syariah')) return 'Bank BSI';
    if (b.includes('mandiri')) return 'Bank Mandiri';
    if (b.includes('bni')) return 'Bank BNI';
    return 'Bank BSI';
  };

  const handleEditClick = (d: Disbursement) => {
    setSelectedDisbursement(d);
    setStatusUkt(d.statusUkt);
    setStatusBiayaHidup(d.statusBiayaHidup);
    setTglCairUkt(d.tanggalCairUkt || new Date().toISOString().split('T')[0]);
    setTglCairBiayaHidup(d.tanggalCairBiayaHidup || new Date().toISOString().split('T')[0]);
    setBankPenerima(getNormalizedBank(d.bankPenerima));
    setNoRekening(d.noRekening || '');
    setLpjStatus(d.lpjStatus || 'Belum Diisi');
    setLpjCatatan(d.lpjCatatan || '');
  };

  const handleSaveDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisbursement) return;

    const updated: Disbursement = {
      ...selectedDisbursement,
      statusUkt,
      statusBiayaHidup,
      tanggalCairUkt: statusUkt === 'Cair' ? tglCairUkt : undefined,
      tanggalCairBiayaHidup: statusBiayaHidup === 'Cair' ? tglCairBiayaHidup : undefined,
      bankPenerima,
      noRekening,
      lpjStatus,
      lpjCatatan: lpjStatus === 'Revisi' || lpjStatus === 'Diterima' ? lpjCatatan : undefined
    };

    onUpdateDisbursement(updated);
    setSelectedDisbursement(null);
  };

  return (
    <div className="space-y-6">
      {/* Financial Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Alokasi */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pagu Alokasi</p>
            <h3 className="text-lg font-bold text-slate-800 mt-1 font-mono">{formatRupiah(grandTotalAllocated)}</h3>
            <span className="text-[9px] text-slate-400">UKT + Bantuan Hidup</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <Landmark size={20} />
          </div>
        </div>

        {/* Total Cair */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telah Dicairkan (Cair)</p>
            <h3 className="text-lg font-bold text-emerald-700 mt-1 font-mono">{formatRupiah(grandTotalCair)}</h3>
            <span className="text-[9px] text-emerald-600 font-semibold">
              Realisasi: {Math.round((grandTotalCair / (grandTotalAllocated || 1)) * 100)}%
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Sedang Diproses */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Diproses SP2D</p>
            <h3 className="text-lg font-bold text-amber-600 mt-1 font-mono">{formatRupiah(grandTotalProses)}</h3>
            <span className="text-[9px] text-slate-400">Menunggu Verifikasi Bank</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={20} />
          </div>
        </div>

        {/* Sisa Belum Cair */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Diproses</p>
            <h3 className="text-lg font-bold text-slate-500 mt-1 font-mono">{formatRupiah(grandTotalBelum)}</h3>
            <span className="text-[9px] text-slate-400">Antrean Tahap Berikutnya</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Editing Modal / Overlay */}
      {selectedDisbursement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm">Update Status & Rekening Pencairan</h3>
                <p className="text-[10px] text-emerald-200">Mahasiswa: {selectedDisbursement.studentNama} • Sem {selectedDisbursement.semester}</p>
              </div>
              <button 
                onClick={() => setSelectedDisbursement(null)}
                className="text-emerald-100 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="p-6 space-y-4">
              {/* Bank Details section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CreditCard size={12} className="text-emerald-700" />
                  Rincian Bank Penyalur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Nama Bank Penerima</label>
                    <select 
                      required
                      value={bankPenerima}
                      onChange={e => setBankPenerima(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank BSI">Bank BSI</option>
                      <option value="Bank BNI">Bank BNI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Nomor Rekening</label>
                    <input 
                      type="text" required
                      value={noRekening}
                      onChange={e => setNoRekening(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UKT status */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Biaya Pendidikan (UKT)</label>
                  <select
                    value={statusUkt}
                    onChange={e => setStatusUkt(e.target.value as Disbursement['statusUkt'])}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="Belum Proses">Belum Proses</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Cair">Dicairkan (Cair)</option>
                    <option value="Ditunda">Ditunda</option>
                  </select>

                  {statusUkt === 'Cair' && (
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-1">Tanggal Cair UKT</label>
                      <input 
                        type="date" required
                        value={tglCairUkt}
                        onChange={e => setTglCairUkt(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Living allowance status */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Bantuan Biaya Hidup</label>
                  <select
                    value={statusBiayaHidup}
                    onChange={e => setStatusBiayaHidup(e.target.value as Disbursement['statusBiayaHidup'])}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="Belum Proses">Belum Proses</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Cair">Dicairkan (Cair)</option>
                    <option value="Ditunda">Ditunda</option>
                  </select>

                  {statusBiayaHidup === 'Cair' && (
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-1">Tanggal Cair Biaya Hidup</label>
                      <input 
                        type="date" required
                        value={tglCairBiayaHidup}
                        onChange={e => setTglCairBiayaHidup(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* LPJ VERIFICATION SECTION */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 border-b border-slate-200 pb-1.5">
                  <FileText size={12} className="text-emerald-700" />
                  Verifikasi LPJ Beasiswa Mahasiswa
                </h4>

                {selectedDisbursement.lpjPdfUrl ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-3 rounded border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Diserahkan: {selectedDisbursement.lpjTanggalSubmit}</span>
                        <span>File: {selectedDisbursement.lpjPdfSize}</span>
                      </div>
                      
                      <div>
                        <span className="block font-bold text-slate-600 text-[10px]">Deskripsi Penggunaan Dana:</span>
                        <p className="italic text-slate-700 font-medium leading-normal mt-0.5">
                          "{selectedDisbursement.lpjPernyataan}"
                        </p>
                      </div>

                      <div className="pt-1.5 flex justify-start">
                        <a 
                          href={selectedDisbursement.lpjPdfUrl} 
                          download={selectedDisbursement.lpjPdfName}
                          referrerPolicy="no-referrer"
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded flex items-center gap-1.5 transition-colors"
                        >
                          <Paperclip size={11} /> Unduh Berkas PDF LPJ
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded border border-amber-100 text-xs font-medium flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Mahasiswa belum mengunggah Laporan Pertanggungjawaban (LPJ) untuk semester ini.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Validasi LPJ</label>
                    <select
                      value={lpjStatus}
                      onChange={e => setLpjStatus(e.target.value as Disbursement['lpjStatus'])}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="Belum Diisi">Belum Diisi</option>
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Diterima">Disetujui / Diterima</option>
                      <option value="Revisi">Perlu Revisi (Revisi)</option>
                    </select>
                  </div>

                  {(lpjStatus === 'Revisi' || lpjStatus === 'Diterima') && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Catatan / Feedback untuk Mahasiswa {lpjStatus === 'Revisi' ? '*' : '(Opsional)'}
                      </label>
                      <textarea
                        required={lpjStatus === 'Revisi'}
                        rows={2}
                        value={lpjCatatan}
                        onChange={e => setLpjCatatan(e.target.value)}
                        placeholder={lpjStatus === 'Revisi' 
                          ? "Tuliskan alasan revisi detail agar dipahami oleh mahasiswa..." 
                          : "Tuliskan catatan persetujuan jika diperlukan..."
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none text-slate-800 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDisbursement(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Simpan Status Pencairan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Database Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input 
              type="text"
              placeholder="Cari penerima dana..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status UKT */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Status UKT:</span>
              <select
                value={filterUkt}
                onChange={e => setFilterUkt(e.target.value)}
                className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
              >
                <option value="Semua">Semua</option>
                <option value="Belum Proses">Belum Proses</option>
                <option value="Diproses">Diproses</option>
                <option value="Cair">Cair</option>
                <option value="Ditunda">Ditunda</option>
              </select>
            </div>

            {/* Status Biaya Hidup */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Status Saku:</span>
              <select
                value={filterBiayaHidup}
                onChange={e => setFilterBiayaHidup(e.target.value)}
                className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
              >
                <option value="Semua">Semua</option>
                <option value="Belum Proses">Belum Proses</option>
                <option value="Diproses">Diproses</option>
                <option value="Cair">Cair</option>
                <option value="Ditunda">Ditunda</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disbursements Table */}
        {filteredDisbursements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-5">Penerima Beasiswa</th>
                  <th className="py-3.5 px-4 text-center">Semester</th>
                  <th className="py-3.5 px-4">Detail Rekening BSI</th>
                  <th className="py-3.5 px-4 text-right">UKT Kuliah</th>
                  <th className="py-3.5 px-4 text-center">Status UKT</th>
                  <th className="py-3.5 px-4 text-right">Biaya Hidup</th>
                  <th className="py-3.5 px-4 text-center">Status Biaya Hidup</th>
                  <th className="py-3.5 px-4 text-center">Status LPJ</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDisbursements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Student Info */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900">{item.studentNama}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.studentNim} • {item.prodi.split(' (')[1]?.replace(')', '') || item.prodi}</div>
                    </td>

                    {/* Semester */}
                    <td className="py-4 px-4 text-center font-medium text-slate-700">
                      Sem {item.semester}
                    </td>

                    {/* Bank account details */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Landmark size={12} className="text-emerald-700 shrink-0" />
                        <span>BSI</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.noRekening || 'Belum Terdaftar'}</span>
                    </td>

                    {/* UKT Amount */}
                    <td className="py-4 px-4 text-right font-medium text-slate-800 font-mono">
                      {formatRupiah(item.nominalUkt)}
                    </td>

                    {/* Status UKT */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.statusUkt === 'Cair' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.statusUkt === 'Diproses' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        item.statusUkt === 'Ditunda' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}>
                        {item.statusUkt}
                      </span>
                      {item.tanggalCairUkt && item.statusUkt === 'Cair' && (
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{item.tanggalCairUkt}</span>
                      )}
                    </td>

                    {/* Biaya Hidup Amount */}
                    <td className="py-4 px-4 text-right font-medium text-slate-800 font-mono">
                      {formatRupiah(item.nominalBiayaHidup)}
                    </td>

                    {/* Status Biaya Hidup */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.statusBiayaHidup === 'Cair' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.statusBiayaHidup === 'Diproses' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        item.statusBiayaHidup === 'Ditunda' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}>
                        {item.statusBiayaHidup}
                      </span>
                      {item.tanggalCairBiayaHidup && item.statusBiayaHidup === 'Cair' && (
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{item.tanggalCairBiayaHidup}</span>
                      )}
                    </td>

                    {/* Status LPJ */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        (item.lpjStatus || 'Belum Diisi') === 'Diterima' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        (item.lpjStatus || 'Belum Diisi') === 'Menunggu Verifikasi' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        (item.lpjStatus || 'Belum Diisi') === 'Revisi' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}>
                        {item.lpjStatus || 'Belum Diisi'}
                      </span>
                    </td>

                    {/* Update button */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada pencairan ditemukan</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status pencairan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
