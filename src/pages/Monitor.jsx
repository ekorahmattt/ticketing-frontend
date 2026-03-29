import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../utils/api';
import newTicketSound from '../sounds/new ticket.mp3';

const statusPriority = {
    open: 0,
    process: 1,
    done: 2
};

function formatTimeHHmm(dateOrTs) {
    const d = typeof dateOrTs === "number" ? new Date(dateOrTs) : dateOrTs;
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getStatusConfig(status) {
    switch (status) {
        case "open":
            return {
                gradientClass: "bg-gradient-to-b from-red-500 to-red-700",
                badgeClass: "bg-red-600 text-white",
            };
        case "process":
            return {
                gradientClass: "bg-gradient-to-b from-yellow-400 to-yellow-600",
                badgeClass: "bg-yellow-500 text-black",
            };
        case "done":
            return {
                gradientClass: "bg-gradient-to-b from-green-500 to-green-700",
                badgeClass: "bg-green-600 text-white",
            };
        default:
            return {
                gradientClass: "bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700",
                badgeClass: "bg-gray-500 text-white dark:bg-gray-700",
            };
    }
}

export default function Monitor() {
    const [tickets, setTickets] = useState([]);
    const [timeString, setTimeString] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    const fetchTickets = async (highlightNewDbId = null) => {
        try {
            const res = await fetch(`${API_BASE}/api/tickets`);
            const json = await res.json();
            if (json.status === 'success') {
                const mappedData = json.data.map(d => {
                    let status = 'open';
                    if (d.status === 'baru' || d.status === 'open') status = 'open';
                    else if (d.status === 'proses' || d.status === 'diproses' || d.status === 'process') status = 'process';
                    else if (d.status === 'selesai' || d.status === 'done' || d.status === 'closed') status = 'done';
                    else if (d.status === 'on hold' || d.status === 'hold' || d.status === 'on_hold') status = 'on_hold';
                    else if (d.status === 'canceled' || d.status === 'batal' || d.status === 'cancelled') status = 'cancelled';

                    return {
                        id: d.code || `TCK-${d.id}`,
                        dbId: String(d.id),
                        status: status,
                        unit: d.reporter_unit || '-',
                        category: d.category || '-',
                        subcategory: d.subcategory || '-',
                        createdAt: new Date(d.created_at).getTime(),
                        createdAtStr: d.created_at,
                        isNew: String(d.id) === String(highlightNewDbId)
                    };
                });
                setTickets(mappedData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            const dayName = days[now.getDay()];
            const day = now.getDate();
            const month = months[now.getMonth()];
            const year = now.getFullYear();
            const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

            setTimeString(`${dayName}, ${day} ${month} ${year} ${time}`);
        };
        updateClock();
        const intervalId = setInterval(updateClock, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const initialToUpdate = tickets.filter(t => t.isNew);
        if (initialToUpdate.length > 0) {
            const timerId = setTimeout(() => {
                setTickets(prev => prev.map(t => initialToUpdate.find(it => it.id === t.id) ? { ...t, isNew: false } : t));
            }, 6000);
            return () => clearTimeout(timerId);
        }
    }, [tickets]);

    useEffect(() => {
        fetchTickets();

        const socket = io(SOCKET_URL);
        socket.on('ticketUpdated', (payload) => {
            let newId = null;
            if (payload?.event === 'ticket_created') {
                newId = payload?.data?.ticket_id;
                try {
                    const audio = new Audio(newTicketSound);
                    audio.play().catch(e => console.error("Audio block play failed:", e));
                } catch (err) { }
            }
            fetchTickets(newId);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newTheme = !prev;
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return newTheme;
        });
    };

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const ticketsToday = tickets.filter(t => t.createdAtStr && t.createdAtStr.startsWith(todayStr));

    const sortedTickets = [...ticketsToday].sort((a, b) => {
        const pa = statusPriority[a.status] ?? 99;
        const pb = statusPriority[b.status] ?? 99;
        if (pa !== pb) return pa - pb;
        const ta = Number(a.createdAt || 0);
        const tb = Number(b.createdAt || 0);
        return tb - ta;
    });

    const openCount = ticketsToday.filter(t => t.status === "open").length;
    const processCount = ticketsToday.filter(t => t.status === "process").length;
    const doneCount = ticketsToday.filter(t => t.status === "done").length;
    const totalCount = ticketsToday.length;

    return (
        <div className="bg-slate-100 dark:bg-gray-950 text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col transition-colors duration-300">
            {/* HEADER */}
            <header className="w-full bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-white/10 px-10 py-6 shrink-0 transition-colors duration-300 shadow-sm dark:shadow-none min-h-[105px]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            RAPB IT Monitoring Center
                        </h1>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition ring-1 ring-gray-200 dark:ring-white/10"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                            )}
                        </button>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-white/70 uppercase tracking-widest block pb-1">Waktu</p>
                            <p className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white leading-none">{timeString}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* LIST TICKETS + MAP */}
            <main className="flex-1 min-h-0 p-8">
                <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                    {/* STATISTICS + LIST TICKETS (LEFT) */}
                    <section className="col-span-5 flex flex-col min-h-0">
                        {/* STATISTICS */}
                        <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-2xl p-4 shrink-0 shadow-sm dark:shadow-none transition-colors duration-300">
                            <div className="grid grid-cols-4 gap-4 items-stretch">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg px-4 py-6 border border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center transition-colors duration-300">
                                    <div className="text-6xl font-bold text-red-500 dark:text-red-400 tabular-nums drop-shadow-sm">{openCount}</div>
                                    <div className="mt-2 text-sm font-bold text-gray-500 dark:text-white/70 uppercase tracking-widest">Open</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg px-4 py-6 border border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center transition-colors duration-300">
                                    <div className="text-6xl font-bold text-yellow-500 dark:text-yellow-300 tabular-nums drop-shadow-sm">{processCount}</div>
                                    <div className="mt-2 text-sm font-bold text-gray-500 dark:text-white/70 uppercase tracking-widest">Process</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg px-4 py-6 border border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center transition-colors duration-300">
                                    <div className="text-6xl font-bold text-green-500 dark:text-green-400 tabular-nums drop-shadow-sm">{doneCount}</div>
                                    <div className="mt-2 text-sm font-bold text-gray-500 dark:text-white/70 uppercase tracking-widest">Done</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg px-4 py-6 border border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center transition-colors duration-300">
                                    <div className="text-6xl font-bold text-blue-500 dark:text-blue-400 tabular-nums drop-shadow-sm">{totalCount}</div>
                                    <div className="mt-2 text-sm font-bold text-gray-500 dark:text-white/70 uppercase tracking-widest">Total</div>
                                </div>
                            </div>
                        </div>

                        {/* LIST TICKETS */}
                        <section className="mt-4 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col min-h-0 shadow-sm dark:shadow-none transition-colors duration-300">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Daftar Laporan Masuk</h2>
                                <div className="text-xs font-bold uppercase tracking-widest bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full animate-pulse border border-red-200 dark:border-red-500/30">Live</div>
                            </div>

                            <div className="mt-6 space-y-4 overflow-y-auto pr-2 min-h-0">
                                {sortedTickets.map(t => {
                                    const cfg = getStatusConfig(t.status);
                                    const isNewClass = t.isNew ? (t.status === "open" ? "ticket-glow-open" : "animate-pulse") : "";
                                    const timeText = t.createdAt ? formatTimeHHmm(t.createdAt) : "";

                                    return (
                                        <div key={t.id} className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg p-6 min-h-[120px] border border-gray-200 dark:border-white/10 transition-colors duration-300 ${isNewClass}`}>
                                            <div className={`absolute right-0 top-0 h-full w-3 ${cfg.gradientClass}`}></div>

                                            <div className="flex items-start justify-between gap-6 pr-6">
                                                <div className="font-bold text-xl tracking-tight text-gray-800 dark:text-white/90">{t.id}</div>
                                                <div className="shrink-0">
                                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full shadow-sm ${cfg.badgeClass}`}>
                                                        {String(t.status).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="text-xl font-black uppercase tracking-wide text-gray-800 dark:text-white">
                                                    {t.unit}
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10 flex items-end justify-between gap-6 pr-6">
                                                <div className="text-base text-gray-600 dark:text-gray-300 font-semibold line-clamp-2">
                                                    {t.category} — {t.subcategory}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-white/60 tabular-nums font-bold flex items-center gap-1.5 shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    {timeText}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </section>

                    {/* MAP */}
                    <section className="col-span-7 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col min-h-0 shadow-sm dark:shadow-none transition-colors duration-300">
                        <div className="pb-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Denah / Monitoring Map</h2>
                        </div>

                        <div className="mt-6 flex-1 min-h-0">
                            <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-white/10 overflow-hidden transition-colors duration-300 shadow-inner">
                                {/* Light Pattern */}
                                <div className="absolute inset-0 dark:hidden opacity-[0.05]"
                                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e3a8a 2px, transparent 0)', backgroundSize: '32px 32px' }}>
                                </div>
                                {/* Dark Pattern */}
                                <div className="absolute inset-0 hidden dark:block opacity-20"
                                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.12) 1px, transparent 0)', backgroundSize: '28px 28px' }}>
                                </div>

                                <div className="absolute top-16 left-20">
                                    <div className="w-5 h-5 rounded-full bg-red-500 shadow-lg shadow-red-500/40 ring-4 ring-white/50 dark:ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-gray-700 dark:text-white/80 drop-shadow-sm">IGD</div>
                                </div>

                                <div className="absolute top-32 right-40">
                                    <div className="w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/40 ring-4 ring-white/50 dark:ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-gray-700 dark:text-white/80 drop-shadow-sm text-center">RAWAT<br />INAP</div>
                                </div>

                                <div className="absolute bottom-32 left-32">
                                    <div className="w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-500/40 ring-4 ring-white/50 dark:ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-gray-700 dark:text-white/80 drop-shadow-sm">LAB</div>
                                </div>

                                <div className="absolute bottom-28 right-32">
                                    <div className="w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-500/40 ring-4 ring-white/50 dark:ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-gray-700 dark:text-white/80 drop-shadow-sm">RADIOLOGI</div>
                                </div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/40 ring-4 ring-white/50 dark:ring-white/20 mx-auto">
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-gray-700 dark:text-white/80 drop-shadow-sm text-center">FARMASI</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
