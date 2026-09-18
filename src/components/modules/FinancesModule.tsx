import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentBill } from '../../types';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  X,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const FinancesModule: React.FC = () => {
  const { bills, students, payBill, addBill, schoolProfile, logAction } = useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState<PaymentBill | null>(null);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<PaymentBill | null>(null);

  // Form Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer Bank' | 'Virtual Account'>('Virtual Account');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form New Bill State
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [newBillData, setNewBillData] = useState({
    studentId: students[0]?.id || '',
    title: 'SPP Bulan Oktober 2026',
    type: 'SPP' as const,
    amount: 500000,
    dueDate: '2026-10-10',
  });

  const handleOpenPay = (bill: PaymentBill) => {
    setSelectedBillForPay(bill);
    setPaymentMethod('Transfer Bank');
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay) return;

    payBill(selectedBillForPay.id, paymentMethod, paymentNotes);
    logAction(
      'RECORD_PAYMENT',
      'Keuangan',
      `Menerima pembayaran ${selectedBillForPay.title} an. ${selectedBillForPay.studentName}`,
      currentUser!
    );
    setShowPayModal(false);
    setSelectedBillForReceipt(selectedBillForPay);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === newBillData.studentId);
    if (!std) return;

    addBill({
      ...newBillData,
      studentName: std.name,
      className: std.className,
      status: 'Belum Lunas',
      academicYear: '2026/2027',
    });

    logAction('CREATE_BILL', 'Keuangan', `Membuat tagihan ${newBillData.title} an. ${std.name}`, currentUser!);
    setShowAddBillModal(false);
  };

  // KPIs
  const totalCollected = bills.filter((b) => b.status === 'Lunas').reduce((acc, b) => acc + b.amount, 0);
  const totalPending = bills.filter((b) => b.status === 'Belum Lunas').reduce((acc, b) => acc + b.amount, 0);
  const paidCount = bills.filter((b) => b.status === 'Lunas').length;

  const filteredBills = bills.filter((b) => {
    const matchSearch =
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.className.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Manajemen SPP & Keuangan Sekolah</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan tagihan bulanan, pencatatan transaksi kuitansi digital, dan arus kas masuk
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'kepsek') && (
          <button
            onClick={() => setShowAddBillModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tagihan SPP</span>
          </button>
        )}
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Total Kas Masuk Terverifikasi</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-black text-teal-800">
              Rp {totalCollected.toLocaleString('id-ID')}
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {paidCount} Tagihan Lunas
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Total Piutang Belum Terbayar</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-black text-amber-700">
              Rp {totalPending.toLocaleString('id-ID')}
            </h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Tertunda
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Tingkat Kepatuhan Pembayaran</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-xl font-black text-slate-800">
              {bills.length ? Math.round((paidCount / bills.length) * 100) : 0}%
            </h3>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              Target 95%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, kelas, atau jenis tagihan..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
        >
          <option value="ALL">Semua Status Tagihan</option>
          <option value="Lunas">Lunas</option>
          <option value="Belum Lunas">Belum Lunas</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Jenis Tagihan</th>
                <th className="py-3 px-3">Nominal (Rp)</th>
                <th className="py-3 px-3">Tenggat Waktu</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">{b.studentName}</td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{b.className}</td>
                  <td className="py-3 px-3 font-medium text-teal-800">{b.title}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    Rp {b.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{b.dueDate}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {b.status === 'Lunas' ? (
                        <button
                          onClick={() => setSelectedBillForReceipt(b)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Kuitansi</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPay(b)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Catat Pembayaran SPP</h3>
              <button onClick={() => setShowPayModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl mb-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Siswa:</span>
                <strong className="text-slate-800">{selectedBillForPay.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tagihan:</span>
                <span className="text-slate-700">{selectedBillForPay.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal:</span>
                <span className="text-teal-800 font-bold font-mono">
                  Rp {selectedBillForPay.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Transfer Bank">Transfer Bank (BCA / Mandiri / BNI)</option>
                  <option value="Virtual Account">Virtual Account Otomatis</option>
                  <option value="Tunai">Tunai / Loket Tata Usaha</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Transaksi / No. Referensi</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Contoh: Ref TRF-882910 via BCA Mobile"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Konfirmasi Lunas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Buat Tagihan Biaya Sekolah</h3>
              <button onClick={() => setShowAddBillModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={newBillData.studentId}
                  onChange={(e) => setNewBillData({ ...newBillData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  value={newBillData.title}
                  onChange={(e) => setNewBillData({ ...newBillData, title: e.target.value })}
                  placeholder="Contoh: SPP Bulan November 2026"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newBillData.amount}
                    onChange={(e) => setNewBillData({ ...newBillData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batas Tenggat</label>
                  <input
                    type="date"
                    required
                    value={newBillData.dueDate}
                    onChange={(e) => setNewBillData({ ...newBillData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Terbitkan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedBillForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:p-0">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 text-slate-800 print:shadow-none print:border-none print:w-full">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-4">
              <div>
                <h3 className="font-extrabold text-sm uppercase text-slate-900">{schoolProfile.name}</h3>
                <p className="text-[10px] text-slate-500">{schoolProfile.address}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                LUNAS
              </span>
            </div>

            <div className="text-center my-3">
              <h4 className="text-sm font-black uppercase tracking-wider underline">KUITANSI PEMBAYARAN RESMI</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                NO. BUKTI: KWT/{selectedBillForReceipt.id}/2026
              </p>
            </div>

            <div className="space-y-2 py-3 text-xs border-y border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Telah diterima dari:</span>
                <strong className="text-slate-800">{selectedBillForReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas / Rombel:</span>
                <span>{selectedBillForReceipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Untuk Pembayaran:</span>
                <span>{selectedBillForReceipt.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span>{selectedBillForReceipt.paymentMethod || 'Transfer Bank'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span>{selectedBillForReceipt.paidAt || '18 September 2026'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <span className="font-bold text-slate-800">Jumlah Pembayaran:</span>
                <strong className="text-teal-800 font-mono">
                  Rp {selectedBillForReceipt.amount.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>

            <div className="flex justify-between items-end pt-6 text-xs">
              <div className="text-[10px] text-slate-400">
                <p>* Bukti pembayaran sah digital</p>
                <p>* Simpan tanda terima ini</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-500">Bendahara Sekolah,</p>
                <div className="h-10 flex items-center justify-center font-bold text-teal-800 italic">
                  [STEMPEL RESMI]
                </div>
                <p className="font-bold underline text-slate-800">Sri Wahyuni, S.E.</p>
                <p className="text-[10px] text-slate-500">NIP. 199008232014022003</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-slate-100 print:hidden mt-4">
              <button
                onClick={() => setSelectedBillForReceipt(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kuitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
