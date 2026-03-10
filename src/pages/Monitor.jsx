import React, { useState, useEffect } from 'react';

const statusPriority = {
    open: 0,
    process: 1,
    done: 2
};

function formatTimeHHmm(dateOrTs) {
    const d = typeof dateOrTs === "number" ? new Date(dateOrTs) : dateOrTs;
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function todayTimestampFromHHmm(hhmm) {
    const [h, m] = String(hhmm).split(":").map((v) => Number(v));
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
    return d.getTime();
}

function createTicketId() {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replaceAll("-", "");
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `TCK-${ymd}-${seq}`;
}

const INITIAL_TICKETS = [
    {
        id: "TCK-20260221-009",
        status: "open",
        unit: "IGD",
        category: "HARDWARE",
        subcategory: "PRINTER TIDAK BISA CETAK",
        createdAt: todayTimestampFromHHmm("22:45"),
        isNew: true
    },
    {
        id: "TCK-20260221-010",
        status: "process",
        unit: "RAWAT INAP",
        category: "NETWORK",
        subcategory: "JARINGAN LAMBAT",
        createdAt: todayTimestampFromHHmm("22:50"),
        isNew: false
    },
    {
        id: "TCK-20260221-011",
        status: "process",
        unit: "LAB",
        category: "APPLICATION",
        subcategory: "SIMRS ERROR LOGIN",
        createdAt: todayTimestampFromHHmm("23:02"),
        isNew: false
    },
    {
        id: "TCK-20260221-012",
        status: "done",
        unit: "RADIOLOGI",
        category: "HARDWARE",
        subcategory: "PC TIDAK MENYALA",
        createdAt: todayTimestampFromHHmm("23:10"),
        isNew: false
    },
    {
        id: "TCK-20260221-013",
        status: "open",
        unit: "FARMASI",
        category: "NETWORK",
        subcategory: "WIFI PUTUS-SAMBUNG",
        createdAt: todayTimestampFromHHmm("23:18"),
        isNew: false
    },
    {
        id: "TCK-20260221-014",
        status: "process",
        unit: "POLIKLINIK",
        category: "APPLICATION",
        subcategory: "SIMPUS LAMBAT",
        createdAt: todayTimestampFromHHmm("23:26"),
        isNew: false
    },
    {
        id: "TCK-20260221-015",
        status: "done",
        unit: "ICU",
        category: "NETWORK",
        subcategory: "LAN NORMAL KEMBALI",
        createdAt: todayTimestampFromHHmm("23:31"),
        isNew: false
    }
];

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
                gradientClass: "bg-gradient-to-b from-gray-600 to-gray-700",
                badgeClass: "bg-gray-700 text-white",
            };
    }
}

export default function Monitor() {
    const [tickets, setTickets] = useState(INITIAL_TICKETS);
    const [timeString, setTimeString] = useState("");

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
        // Automatically mark new initial tickets as not new after 6s
        const initialToUpdate = tickets.filter(t => t.isNew);
        if (initialToUpdate.length > 0) {
            const timerId = setTimeout(() => {
                setTickets(prev => prev.map(t => initialToUpdate.find(it => it.id === t.id) ? { ...t, isNew: false } : t));
            }, 6000);
            return () => clearTimeout(timerId);
        }
    }, [tickets]);

    useEffect(() => {
        const simulateNewTicket = () => {
            const now = Date.now();
            const pick = Math.random();
            const status = pick < 0.55 ? "open" : pick < 0.85 ? "process" : "done";
            const units = ["IGD", "RAWAT INAP", "LAB", "RADIOLOGI", "FARMASI", "ICU", "POLIKLINIK", "GIZI"];
            const issues = [
                { category: "NETWORK", subcategory: "WIFI PUTUS-SAMBUNG" },
                { category: "HARDWARE", subcategory: "PRINTER MACET" },
                { category: "APPLICATION", subcategory: "SIMRS TIDAK BISA LOGIN" },
                { category: "HARDWARE", subcategory: "PC BLUE SCREEN" },
                { category: "NETWORK", subcategory: "JARINGAN LAMBAT" }
            ];

            const unit = units[Math.floor(Math.random() * units.length)];
            const issue = issues[Math.floor(Math.random() * issues.length)];

            const newTicket = {
                id: createTicketId(),
                status,
                unit,
                category: issue.category,
                subcategory: issue.subcategory,
                createdAt: now,
                isNew: true
            };

            setTickets(prev => [newTicket, ...prev]);

            // Remove new status after 7s
            setTimeout(() => {
                setTickets(prev => prev.map(t => t.id === newTicket.id ? { ...t, isNew: false } : t));
            }, 7000);
        };

        const intervalId = setInterval(simulateNewTicket, 8000);
        return () => clearInterval(intervalId);
    }, []);

    const sortedTickets = [...tickets].sort((a, b) => {
        const pa = statusPriority[a.status] ?? 99;
        const pb = statusPriority[b.status] ?? 99;
        if (pa !== pb) return pa - pb;
        const ta = Number(a.createdAt || 0);
        const tb = Number(b.createdAt || 0);
        return tb - ta;
    });

    const openCount = tickets.filter(t => t.status === "open").length;
    const processCount = tickets.filter(t => t.status === "process").length;
    const doneCount = tickets.filter(t => t.status === "done").length;
    const totalCount = tickets.length;

    return (
        <div className="bg-gray-950 text-white h-screen overflow-hidden flex flex-col">
            {/* HEADER */}
            <header className="w-full bg-gray-900/80 border-b border-white/10 px-10 py-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            IT Service Monitoring Center
                        </h1>
                        <p className="text-base text-white/70">
                            RSUD - Monitoring Gangguan Realtime
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-base text-white/70">Waktu</p>
                        <p className="text-3xl font-bold tabular-nums tracking-tight">{timeString}</p>
                    </div>
                </div>
            </header>

            {/* LIST TICKETS + MAP */}
            <main className="flex-1 min-h-0 p-8">
                <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                    {/* STATISTICS + LIST TICKETS (LEFT) */}
                    <section className="col-span-5 flex flex-col min-h-0">
                        {/* STATISTICS */}
                        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 shrink-0">
                            <div className="grid grid-cols-4 gap-4 items-stretch">
                                <div className="bg-gray-800 rounded-xl shadow-lg px-4 py-6 border border-white/10 h-full flex flex-col items-center justify-center">
                                    <div className="text-6xl font-bold text-red-400 tabular-nums drop-shadow-md">{openCount}</div>
                                    <div className="mt-2 text-sm font-medium text-white/70 uppercase tracking-widest">Open</div>
                                </div>
                                <div className="bg-gray-800 rounded-xl shadow-lg px-4 py-6 border border-white/10 h-full flex flex-col items-center justify-center">
                                    <div className="text-6xl font-bold text-yellow-300 tabular-nums drop-shadow-md">{processCount}</div>
                                    <div className="mt-2 text-sm font-medium text-white/70 uppercase tracking-widest">Process</div>
                                </div>
                                <div className="bg-gray-800 rounded-xl shadow-lg px-4 py-6 border border-white/10 h-full flex flex-col items-center justify-center">
                                    <div className="text-6xl font-bold text-green-400 tabular-nums drop-shadow-md">{doneCount}</div>
                                    <div className="mt-2 text-sm font-medium text-white/70 uppercase tracking-widest">Done</div>
                                </div>
                                <div className="bg-gray-800 rounded-xl shadow-lg px-4 py-6 border border-white/10 h-full flex flex-col items-center justify-center">
                                    <div className="text-6xl font-bold text-blue-400 tabular-nums drop-shadow-md">{totalCount}</div>
                                    <div className="mt-2 text-sm font-medium text-white/70 uppercase tracking-widest">Total</div>
                                </div>
                            </div>
                        </div>

                        {/* LIST TICKETS */}
                        <section className="mt-4 bg-gray-900/60 border border-white/10 rounded-2xl p-6 flex flex-col min-h-0">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                                <h2 className="text-2xl font-bold tracking-tight">Daftar Laporan Masuk</h2>
                                <div className="text-base text-white/70">Live</div>
                            </div>

                            <div className="mt-6 space-y-4 overflow-y-auto pr-2 min-h-0">
                                {sortedTickets.map(t => {
                                    const cfg = getStatusConfig(t.status);
                                    const isNewClass = t.isNew ? (t.status === "open" ? "ticket-glow-open" : "animate-pulse") : "";
                                    const timeText = t.createdAt ? formatTimeHHmm(t.createdAt) : "";

                                    return (
                                        <div key={t.id} className={`relative overflow-hidden bg-gray-800 rounded-xl shadow-lg p-6 min-h-[120px] border border-white/10 ${isNewClass}`}>
                                            <div className={`absolute right-0 top-0 h-full w-3 ${cfg.gradientClass}`}></div>

                                            <div className="flex items-start justify-between gap-6 pr-6">
                                                <div className="font-semibold text-lg tracking-tight text-white/90">{t.id}</div>
                                                <div className="shrink-0">
                                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-extrabold rounded-full ${cfg.badgeClass}`}>
                                                        {String(t.status).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-2xl font-bold uppercase tracking-wide pr-6">
                                                {t.unit}
                                            </div>

                                            <div className="mt-4 flex items-end justify-between gap-6 pr-6">
                                                <div className="text-lg text-gray-200">
                                                    {t.category} - {t.subcategory}
                                                </div>
                                                <div className="text-sm opacity-70 tabular-nums">
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
                    <section className="col-span-7 bg-gray-900/60 border border-white/10 rounded-2xl p-6 flex flex-col min-h-0">
                        <div className="pb-4 border-b border-white/10 shrink-0">
                            <h2 className="text-2xl font-bold tracking-tight">Denah / Monitoring Map</h2>
                        </div>

                        <div className="mt-6 flex-1 min-h-0">
                            <div
                                className="relative h-full w-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 overflow-hidden">
                                <div className="absolute inset-0 opacity-20"
                                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.12) 1px, transparent 0)', backgroundSize: '28px 28px' }}>
                                </div>

                                <div className="absolute top-16 left-20">
                                    <div
                                        className="w-5 h-5 rounded-full bg-red-500 shadow-lg shadow-red-500/30 ring-2 ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm text-white/80">IGD</div>
                                </div>

                                <div className="absolute top-28 right-32">
                                    <div
                                        className="w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/30 ring-2 ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm text-white/80">RAWAT INAP</div>
                                </div>

                                <div className="absolute bottom-28 left-24">
                                    <div
                                        className="w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-500/30 ring-2 ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm text-white/80">LAB</div>
                                </div>

                                <div className="absolute bottom-20 right-24">
                                    <div
                                        className="w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-500/30 ring-2 ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm text-white/80">RADIOLOGI</div>
                                </div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div
                                        className="w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/30 ring-2 ring-white/20">
                                    </div>
                                    <div className="mt-2 text-sm text-white/80 text-center">FARMASI</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
