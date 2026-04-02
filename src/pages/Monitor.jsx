import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../utils/api';
import newTicketSound from '../sounds/new ticket.mp3';
import denahLight from '../maps/Denah RS.png';
import denahDark from '../maps/Denah RS Dark.png';

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

    const mapContainerRef = useRef(null);
    const mapWrapperRef = useRef(null);
    const listContainerRef = useRef(null);

    useEffect(() => {
        // Priority: 1. A ticket marked as 'isNew', 2. Newest 'open' ticket, 3. Newest 'process' ticket
        const focusTicket =
            tickets.find(t => t.isNew && t.coordX != null && t.coordY != null) ||
            tickets.find(t => t.status === 'open' && t.coordX != null && t.coordY != null) ||
            tickets.find(t => t.status === 'process' && t.coordX != null && t.coordY != null);

        if (focusTicket && mapContainerRef.current && mapWrapperRef.current) {
            const container = mapContainerRef.current;
            const wrapper = mapWrapperRef.current;

            const targetX = (parseFloat(focusTicket.coordX) / 100) * wrapper.offsetWidth;
            const targetY = (parseFloat(focusTicket.coordY) / 100) * wrapper.offsetHeight;

            container.scrollTo({
                left: targetX - container.offsetWidth / 2,
                top: targetY - container.offsetHeight / 2,
                behavior: 'smooth'
            });
        }
    }, [tickets]);

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
                        title: d.title || '',
                        coordX: d.coord_x,
                        coordY: d.coord_y,
                        createdAt: new Date(d.created_at).getTime(),
                        createdAtStr: d.created_at,
                        isNew: String(d.id) === String(highlightNewDbId),
                        reporter: d.reporter_name || '-'
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
            // Scroll list to top when new ticket arrives
            if (listContainerRef.current) {
                listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }

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

                            <div className="mt-6 space-y-4 overflow-y-auto pr-2 min-h-0" ref={listContainerRef}>
                                {sortedTickets.map(t => {
                                    const cfg = getStatusConfig(t.status);
                                    const isNewClass = t.isNew ? (t.status === "open" ? "ticket-glow-open" : "animate-pulse") : "";
                                    const timeText = t.createdAt ? formatTimeHHmm(t.createdAt) : "";

                                    return (
                                        <div key={t.id} className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg p-6 min-h-[120px] border border-gray-200 dark:border-white/10 transition-colors duration-300 ${isNewClass}`}>
                                            <div className={`absolute right-0 top-0 h-full w-3 ${cfg.gradientClass}`}></div>

                                            <div className="flex items-center justify-between pr-6">
                                                <div className="font-bold text-xl tracking-tight text-gray-800 dark:text-white/90">{t.id}</div>
                                                <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full shadow-sm ${cfg.badgeClass}`}>
                                                    {String(t.status).toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between pr-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-black uppercase tracking-wide text-gray-800 dark:text-white leading-tight">
                                                        {t.unit}
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight text-right">
                                                    {t.reporter}
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

                        <div className="mt-6 flex-1 min-h-0 bg-gray-100 dark:bg-gray-800 rounded-2xl relative border border-gray-200 dark:border-white/10 overflow-auto scrollbar-hide" ref={mapContainerRef}>
                            <div className="relative min-w-[2000px] transition-all duration-500 shadow-inner" ref={mapWrapperRef}>
                                <img
                                    src={isDarkMode ? denahDark : denahLight}
                                    alt="Denah Rumah Sakit"
                                    className="w-full h-auto block pointer-events-none"
                                />
                                <div className="absolute inset-0">
                                    {ticketsToday.filter(t => t.coordX != null && t.coordY != null).map(t => {
                                        const isFocus = t.status === 'open' || t.status === 'process';
                                        const cfg = getStatusConfig(t.status);

                                        // Specific colors for map points
                                        let pointBg = "bg-gray-400";
                                        let rippleColor = "bg-gray-400";
                                        let ringColor = "ring-gray-200";

                                        if (t.status === 'open') {
                                            pointBg = "bg-red-500";
                                            rippleColor = "bg-red-500";
                                            ringColor = "ring-red-400/50";
                                        } else if (t.status === 'process') {
                                            pointBg = "bg-yellow-500";
                                            rippleColor = "bg-yellow-500";
                                            ringColor = "ring-yellow-400/50";
                                        } else if (t.status === 'done') {
                                            pointBg = "bg-green-500";
                                            rippleColor = "bg-green-500";
                                            ringColor = "ring-green-400/50";
                                        }

                                        return (
                                            <div
                                                key={t.id}
                                                className={`absolute group transition-all duration-500 ${isFocus ? 'z-20' : 'z-10'}`}
                                                style={{
                                                    left: `${t.coordX}%`,
                                                    top: `${t.coordY}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            >
                                                <div className="relative">
                                                    {/* Ripple effect for open & process tickets */}
                                                    {isFocus && (
                                                        <div className={`absolute inset-0 w-8 h-8 -m-2 rounded-full ${rippleColor} animate-ping opacity-75`}></div>
                                                    )}

                                                    {/* Point */}
                                                    <div className={`w-5 h-5 rounded-full ${pointBg} border-4 border-white dark:border-gray-900 shadow-xl relative z-20 cursor-pointer ${t.isNew ? 'animate-bounce' : ''}`}>
                                                    </div>

                                                    {/* Bubble Chat (Visible for active, show on hover for done) */}
                                                    <div 
                                                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 z-30 transition-all duration-300 
                                                            ${t.status !== 'done' 
                                                                ? (isFocus ? 'opacity-100 scale-100' : 'opacity-80 scale-90 group-hover:opacity-100 group-hover:scale-100') 
                                                                : 'opacity-0 scale-50 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                                                            }`}
                                                    >
                                                        <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-2xl shadow-2xl border ${t.status !== 'done' ? (isFocus ? 'border-indigo-500/50 ring-2 ring-indigo-500/10' : 'border-gray-200 dark:border-white/20') : 'border-green-500/30'} text-sm`}>
                                                            <div className="flex justify-between items-start mb-1.5">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-tight">{t.unit}</span>
                                                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 leading-tight">{t.reporter}</span>
                                                                </div>
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${cfg.badgeClass}`}>
                                                                    {t.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="font-bold text-base leading-snug line-clamp-2">{t.title}</div>
                                                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/10 text-[11px] text-gray-500 dark:text-gray-400 flex justify-between items-center">
                                                                <span>ID: {t.id}</span>
                                                                <span className="font-bold text-gray-400">{formatTimeHHmm(t.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className={`w-4 h-4 bg-white dark:bg-gray-800 border-r border-b ${t.status !== 'done' ? (isFocus ? 'border-indigo-500/50' : 'border-gray-200 dark:border-white/20') : 'border-green-500/30'} rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
