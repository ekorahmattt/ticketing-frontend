import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import step1 from '../screenshot/konfirmasi.png';
import step2 from '../screenshot/form.png';
import step3 from '../screenshot/form detail.png';
import step4 from '../screenshot/form reported.png';
import bubbleDemo from '../screenshot/floating bubble.mp4';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  HelpCircle,
  MousePointer2,
  CheckCircle2,
  ClipboardList,
  FileEdit,
  Send,
  Lightbulb,
  MessageSquare,
  Monitor,
  AlertTriangle,
  Phone,
  Layout,
  StickyNote,
  Clock,
  Settings,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FileDown,
  Play,
  Youtube,
  ChevronDown,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Zap
} from 'lucide-react';

const StepCard = ({ number, title, description, icon: Icon, imagePlaceholder, image, video }) => (
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
          {number}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{description}</p>

        {/* Image Display Area with Zoom & Pan */}
        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
          {video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : image ? (
            <div className="w-full h-full cursor-grab active:cursor-grabbing">
              <TransformWrapper
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: false }}
                centerOnInit={true}
              >
                {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                  <React.Fragment>
                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => zoomIn()}
                        className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:text-blue-600 transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => zoomOut()}
                        className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:text-blue-600 transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:text-blue-600 transition-colors"
                        title="Reset"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hint Label */}
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white/90 font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        Scroll to Zoom
                      </span>
                    </div>

                    <TransformComponent
                      wrapperClassName="!w-full !h-full"
                      contentClassName="!w-full !h-full"
                    >
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </TransformComponent>
                  </React.Fragment>
                )}
              </TransformWrapper>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
              <Layout className="w-8 h-8 opacity-50" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                {imagePlaceholder || 'Screenshot Area'}
              </span>
            </div>
          )}
          {/* Subtle gradient overlay to make it look "premium" */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none -z-0"></div>
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ label, colorClass, statusLabel }) => (
  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
    <div className={`w-3 h-3 rounded-full ${colorClass} animate-pulse`}></div>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-20 uppercase tracking-wide">{label}</span>
    <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 italic">{statusLabel}</span>
  </div>
);

const HelpPage = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 lg:px-8">
        {/* Header */}
        <header className="mb-16 text-center animate-fade-in relative">
          {/* Back Button */}
          <div className="absolute top-0 left-0 hidden md:block">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Kembali Lapor</span>
            </Link>
          </div>

          {/* Mobile Back Button */}
          <div className="md:hidden mb-8 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Halaman Lapor</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-900/30">
            <HelpCircle className="w-4 h-4" />
            <span>Pusat Bantuan Sistem</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Panduan Lapor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Gangguan IT</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Pusat dokumentasi terintegrasi untuk membantu Anda melaporkan kendala teknis dan memantau penyelesaiannya secara real-time.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Steps Section */}
            <section id="how-to" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">Cara Melaporkan Gangguan</h2>
              </div>

              <div className="space-y-6">
                <StepCard
                  number="1"
                  title="Klik Tombol 'Laporkan Gangguan!'"
                  description="Gunakan fitur widget melayang (floating button) di pojok kiri bawah layar. Tombol ini bersifat 'draggable' yang bisa Anda geser sesuai kenyamanan. Jika mengganggu, Anda dapat menyembunyikannya melalui fitur 'Hide Widget' di menu profil dan memunculkannya kembali dari sana."
                  icon={MousePointer2}
                  video={bubbleDemo}
                  imagePlaceholder="Tampilan Widget Lapor & Drag Demo"
                />

                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -z-10"></div>
                  <div className="space-y-6 pt-6">
                    <StepCard
                      number="2"
                      title="Konfirmasi Laporan"
                      description="Setelah tombol diklik, modal konfirmasi akan muncul. Pastikan Anda benar-benar ingin membuat laporan baru sebelum melanjutkan ke form pengisian."
                      icon={CheckCircle2}
                      image={step1}
                      imagePlaceholder="Modal Konfirmasi Laporan"
                    />
                    <StepCard
                      number="3"
                      title="Isi Data Utama"
                      description="Pilih kategori gangguan (Software, Hardware, Jaringan, dsb) dan sub-kategori yang sesuai. Identitas Anda dan unit atau ruangan Anda akan otomatis terdeteksi jika sistem mengenali perangkat Anda."
                      icon={ClipboardList}
                      image={step2}
                      imagePlaceholder="Form Input Kategori & Unit"
                    />
                    <StepCard
                      number="4"
                      title="Lengkapi Detail Gangguan"
                      description="Berikan deskripsi singkat tentang kendala yang dialami. Informasi yang detail (seperti langkah-langkah yang dilakukan sebelum error) akan sangat membantu tim IT mendiagnosa lebih cepat."
                      icon={FileEdit}
                      image={step3}
                      imagePlaceholder="Textarea Deskripsi Keluhan"
                    />
                    <StepCard
                      number="5"
                      title="Kirim Laporan"
                      description="Klik tombol 'Kirim Sekarang'. Laporan Anda akan segera masuk ke antrean Tim IT dan Anda akan mendapatkan nomor tiket digital."
                      icon={Send}
                      image={step4}
                      imagePlaceholder="Bukti Laporan Berhasil Terkirim"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Video Tutorial Section */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-500">
              <button
                onClick={() => setIsVideoOpen(!isVideoOpen)}
                className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Video Tutorial</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Simak panduan visual penggunaan sistem.</p>
                  </div>
                </div>
                <div className={`p-2 rounded-full border border-slate-200 dark:border-slate-700 transition-transform duration-300 ${isVideoOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </button>

              <div className={`transition-all duration-500 overflow-hidden ${isVideoOpen ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-800' : 'max-h-0'}`}>
                <div className="p-6 md:p-8 space-y-6">
                  {/* YouTube Embed Placeholder */}
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl">
                    {isVideoOpen && (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/d-3O1LKRm8s?autoplay=1&mute=1&loop=1&playlist=d-3O1LKRm8s"
                        title="Tutorial Sistem Pelaporan IT"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://youtu.be/d-3O1LKRm8s"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Youtube className="w-5 h-5 text-red-600" />
                      Tonton di YouTube
                    </a>
                    <a
                      href="/docs/Panduan Pengguna.mp4"
                      download
                      className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-black/10"
                    >
                      <Download className="w-5 h-5" />
                      Download Video
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Tips */}
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <Lightbulb className="w-32 h-32" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Tips Cepat</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold mb-1">Cek Status Real-time</h4>
                    <p className="text-sm text-blue-50 opacity-80">Gunakan Dashboard Monitoring untuk melihat antrean IT secara transparan.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold mb-1">Sertifikasi Perangkat</h4>
                    <p className="text-sm text-blue-50 opacity-80">Sistem mendeteksi Hostname perangkat untuk mempercepat pelacakan lokasi.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar (Right) */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Download Manual Book */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border border-slate-700 rounded-2xl p-6 shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FileDown className="w-24 h-24 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <FileDown className="w-5 h-5 text-blue-400" />
                Download Manual
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Butuh versi cetak atau ingin membaca secara offline? Download panduan lengkap dalam format PDF.
              </p>
              <a
                href="\docs\Panduan Pengguna Sistem Lapor Gangguan Layanan TI.pdf"
                download
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.98]"
              >
                Download PDF (Manual Book)
                <FileDown className="w-4 h-4" />
              </a>
            </section>

            {/* Status Indicators */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Indikator Status
              </h3>
              <div className="space-y-4">
                <StatusBadge label="Open" colorClass="bg-red-500" statusLabel="Laporan baru menunggu verifikasi IT" />
                <StatusBadge label="Process" colorClass="bg-yellow-500" statusLabel="Petugas sedang dalam perjalanan/pengerjaan" />
                <StatusBadge label="Done" colorClass="bg-green-500" statusLabel="Masalah telah selesai ditangani" />
                <StatusBadge label="On Hold" colorClass="bg-blue-500" statusLabel="Menunggu sparepart atau pihak ke-3" />
                <StatusBadge label="Canceled" colorClass="bg-slate-400" statusLabel="Laporan dibatalkan/duplikat" />
              </div>
            </section>

            {/* IT Direct Chat */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Chat dengan IT
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Butuh koordinasi lebih lanjut? Anda dapat berkomunikasi langsung dengan teknisi yang menangani laporan Anda melalui fitur <span className="font-bold text-slate-900 dark:text-white">Direct Message</span> setelah tiket terkirim.
              </p>
            </section>

            {/* Device Info */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-emerald-500" />
                Informasi Perangkat
              </h3>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Setiap laporan akan merekam <b>Hostname</b> dan <b>IP Address</b> perangkat secara otomatis untuk autentikasi keamanan.</span>
                </p>
              </div>
            </section>

            {/* Cannot Access */}
            <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Tidak Bisa Akses?
              </h3>
              <div className="space-y-4 text-sm text-red-600 dark:text-red-300/80">
                <p>Jika perangkat Anda mati total dan tidak bisa membuka web ini:</p>
                <ol className="list-decimal list-inside space-y-2 font-medium">
                  <li>Gunakan perangkat rekan/kantor lain.</li>
                  <li>Hubungi Tim IT SIMRS di <span className="font-bold text-red-700 dark:text-red-400">212 / WhatsApp Group</span>.</li>
                </ol>
                <div className="p-3 bg-white dark:bg-red-950/40 rounded-lg text-xs italic border border-red-200 dark:border-red-900/40">
                  <p><b>Note:</b> Admin IT akan tetap menginput data Anda ke sistem ini meskipun laporan dikirim via telepon/WA.</p>
                </div>
              </div>
            </section>

            {/* Important Note */}
            <section className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-slate-300 border border-slate-800">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                Catatan Penting
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Pastikan koneksi jaringan aktif (LAN/Wi-Fi Rumah Sakit) agar sistem sinkron.</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Dilarang menyalahgunakan sistem pelaporan untuk hal di luar kendala IT.</span>
                </li>
              </ul>
            </section>

          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-95"
            >
              Mulai Buat Laporan Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; 2026 Tim IT Infrastructure. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HelpPage;
