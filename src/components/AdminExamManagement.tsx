import React, { useState } from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle2, Award, Calendar, Search, 
  HelpCircle, Eye, RefreshCw, Save, X, BookOpen, Clock, Check, ListChecks
} from 'lucide-react';
import { ExamQuestion, StudentApplicant } from '../types';

interface AdminExamManagementProps {
  questions: ExamQuestion[];
  applicants: StudentApplicant[];
  onSaveQuestions: (updatedQuestions: ExamQuestion[]) => void;
  onUpdateApplicant: (updated: StudentApplicant) => void;
}

export default function AdminExamManagement({
  questions,
  applicants,
  onSaveQuestions,
  onUpdateApplicant
}: AdminExamManagementProps) {
  // Tabs: 'soal' (manage questions) or 'hasil' (view scores)
  const [activeSubTab, setActiveSubTab] = useState<'soal' | 'hasil'>('soal');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing or adding state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [formError, setFormError] = useState('');

  // Filter applicants who have completed the test
  const examResults = applicants
    .filter(student => student.examResult !== undefined)
    .map(student => ({
      ...student,
      result: student.examResult!
    }))
    .sort((a, b) => b.result.score - a.result.score); // Highest score first

  const filteredResults = examResults.filter(student => 
    student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nim.includes(searchTerm) ||
    student.prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleOpenAdd = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectOptionIndex(0);
    setFormError('');
    setIsAdding(true);
    setEditingId(null);
  };

  const handleOpenEdit = (q: ExamQuestion) => {
    setQuestionText(q.questionText);
    setOptions([...q.options]);
    setCorrectOptionIndex(q.correctOptionIndex);
    setFormError('');
    setEditingId(q.id);
    setIsAdding(false);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!questionText.trim()) {
      setFormError('Pertanyaan tidak boleh kosong.');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      setFormError('Semua pilihan jawaban (A, B, C, D) harus diisi.');
      return;
    }

    if (isAdding) {
      const newQuestion: ExamQuestion = {
        id: 'q_' + Math.random().toString(36).substr(2, 9),
        questionText: questionText.trim(),
        options: options.map(opt => opt.trim()),
        correctOptionIndex
      };
      const updated = [...questions, newQuestion];
      onSaveQuestions(updated);
      setIsAdding(false);
    } else if (editingId) {
      const updated = questions.map(q => {
        if (q.id === editingId) {
          return {
            ...q,
            questionText: questionText.trim(),
            options: options.map(opt => opt.trim()),
            correctOptionIndex
          };
        }
        return q;
      });
      onSaveQuestions(updated);
      setEditingId(null);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini dari daftar ujian?')) {
      const updated = questions.filter(q => q.id !== id);
      onSaveQuestions(updated);
    }
  };

  // Helper to get Option Letter (A, B, C, D)
  const getLetter = (idx: number) => {
    return ['A', 'B', 'C', 'D'][idx] || '';
  };

  return (
    <div className="space-y-6" id="admin-exam-management">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ListChecks className="text-emerald-600" size={22} />
            Pengelolaan Ujian Seleksi Beasiswa
          </h2>
          <p className="text-xs text-slate-500">
            Kelola soal ujian seleksi masuk untuk calon penerima KIP Kuliah STID Al-Biruni Cirebon, dan pantau skor kelulusan secara seketika.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('soal')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'soal'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daftar Soal ({questions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hasil')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'hasil'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Skor & Hasil Ujian ({examResults.length})
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeSubTab === 'soal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question List Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Butir Pertanyaan Ujian Aktif
              </h3>
              {!isAdding && !editingId && (
                <button
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus size={14} /> Tambah Soal Baru
                </button>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <HelpCircle className="mx-auto text-slate-300 mb-3" size={36} />
                <p className="text-sm font-semibold">Ujian Seleksi belum memiliki soal.</p>
                <p className="text-xs mt-1 text-slate-400">Klik "Tambah Soal Baru" untuk membuat lembar pertanyaan ujian perdana.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, qIndex) => (
                  <div 
                    key={q.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      editingId === q.id 
                        ? 'border-emerald-500 ring-2 ring-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded-md">
                          SOAL #{qIndex + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 leading-relaxed pt-1">
                          {q.questionText}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                          title="Edit Soal"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md transition-colors"
                          title="Hapus Soal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Options list preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctOptionIndex === oIdx;
                        return (
                          <div 
                            key={oIdx}
                            className={`p-2 px-3 rounded-lg border text-xs flex items-center justify-between ${
                              isCorrect 
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-bold' 
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                isCorrect 
                                  ? 'bg-emerald-200 text-emerald-800' 
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {getLetter(oIdx)}
                              </span>
                              <span>{opt}</span>
                            </span>
                            {isCorrect && <CheckCircle2 size={13} className="text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Creator / Editor Column */}
          <div className="lg:col-span-1">
            {isAdding || editingId ? (
              <form 
                onSubmit={handleSaveQuestion}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-6 animate-fadeIn"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-emerald-600" />
                    {isAdding ? 'Buat Soal Baru' : 'Edit Pertanyaan'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                {formError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-lg text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Question Textarea */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Isi Pertanyaan *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    placeholder="Tulis butir pertanyaan ujian di sini..."
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-800"
                  />
                </div>

                {/* Multiple choices inputs */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Pilihan Jawaban (A-D) *
                  </label>
                  {options.map((opt, oIdx) => (
                    <div key={oIdx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 w-6 h-6 rounded-md flex items-center justify-center">
                          {getLetter(oIdx)}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={e => handleOptionChange(oIdx, e.target.value)}
                          placeholder={`Jawaban Pilihan ${getLetter(oIdx)}...`}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Correct answer index selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Kunci Jawaban yang Benar *
                  </label>
                  <select
                    value={correctOptionIndex}
                    onChange={e => setCorrectOptionIndex(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-slate-800"
                  >
                    {options.map((_, oIdx) => (
                      <option key={oIdx} value={oIdx}>
                        Pilihan {getLetter(oIdx)} (Kunci Jawaban)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Save size={14} /> Simpan Soal
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 sticky top-6 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                  Panduan Pembuatan Soal
                </h4>
                <p>
                  1. Masukkan pertanyaan yang menguji wawasan keislaman, wawasan umum, atau motivasi pendaftar program KIP Kuliah.
                </p>
                <p>
                  2. Buatlah 4 alternatif pilihan jawaban (pilihan A, B, C, D) yang bervariasi.
                </p>
                <p>
                  3. Tentukan pilihan mana yang merupakan kunci jawaban yang benar dengan memilih drop-down kunci jawaban.
                </p>
                <p>
                  4. Mahasiswa akan langsung dinilai berdasarkan persentase jawaban yang benar setelah menekan tombol Kirim.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleOpenAdd}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center shadow-sm block transition-all"
                  >
                    + Buat Soal Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'hasil' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Hasil Ujian Seleksi Calon Mahasiswa</h3>
              <p className="text-[11px] text-slate-400">Total {filteredResults.length} mahasiswa telah menyelesaikan ujian ini.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama mahasiswa..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium w-full md:w-60"
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Calon Mahasiswa</th>
                  <th className="py-3 px-4 text-center">NIM / No Daftar</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center">Skor Ujian (100)</th>
                  <th className="py-3 px-4 text-center">Tanggal Selesai</th>
                  <th className="py-3 px-4 text-right">Rincian Jawaban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredResults.length > 0 ? (
                  filteredResults.map(student => {
                    const score = student.result.score;
                    let badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                    if (score >= 80) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else if (score >= 60) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{student.nama}</span>
                          <span className="text-[10px] text-slate-400">{student.email}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">
                          {student.nim}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {student.prodi}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-12 py-1 rounded-md font-bold font-mono text-xs border ${badgeClass}`}>
                            {score}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-medium">
                          {student.result.completedAt}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Benar: {Math.round(score / 100 * questions.length)} dari {questions.length} Soal
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Belum ada calon mahasiswa yang menyelesaikan ujian seleksi dengan pencarian ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
