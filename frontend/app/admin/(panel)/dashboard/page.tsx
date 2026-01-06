"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceId: number;
  status: string;
};

type Block = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function weekRangeFrom(dateYmd: string) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0 dom
  const diffToMon = (day + 6) % 7;
  const monday = new Date(dt);
  monday.setDate(dt.getDate() - diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toYMD(monday), to: toYMD(sunday) };
}

export default function AdminDashboardPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [todayBlocks, setTodayBlocks] = useState<Block[]>([]);

  const today = useMemo(() => toYMD(new Date()), []);
  const week = useMemo(() => weekRangeFrom(today), [today]);

  const token = () => localStorage.getItem("admin_token") || "";

  const load = async () => {
    setMsg("");
    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    setLoading(true);
    try {
      const [todayRes, weekRes, blocksRes] = await Promise.all([
        fetch(`${api}/bookings/admin?from=${today}&to=${today}`, {
          headers: { Authorization: `Bearer ${t}` },
        }),
        fetch(`${api}/bookings/admin?from=${week.from}&to=${week.to}`, {
          headers: { Authorization: `Bearer ${t}` },
        }),
        fetch(`${api}/blocks?date=${today}`),
      ]);

      const todayData = await todayRes.json().catch(() => []);
      const weekData = await weekRes.json().catch(() => []);
      const blocksData = await blocksRes.json().catch(() => []);

      if (!todayRes.ok) setMsg(todayData?.message || "Error cargando reservas de hoy.");
      if (!weekRes.ok) setMsg(weekData?.message || "Error cargando reservas de semana.");

      setTodayBookings(Array.isArray(todayData) ? todayData : []);
      setWeekBookings(Array.isArray(weekData) ? weekData : []);
      setTodayBlocks(Array.isArray(blocksData) ? blocksData : []);
    } catch (e) {
      console.error(e);
      setMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmedToday = todayBookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelledToday = todayBookings.filter((b) => b.status === "CANCELLED").length;
  const noShowToday = todayBookings.filter((b) => b.status === "NO_SHOW").length;

  const next = [...todayBookings]
    .filter((b) => b.status === "CONFIRMED")
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  return (
    <div className="text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-300 mt-1">
            Hoy: <span className="font-semibold">{today}</span> • Semana: {week.from} → {week.to}
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {msg && <p className="text-sm text-gray-300 mt-4">{msg}</p>}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="border border-gray-700 rounded p-4">
          <div className="text-sm text-gray-300">Reservas hoy</div>
          <div className="text-3xl font-bold mt-1">{todayBookings.length}</div>
          <div className="text-sm text-gray-300 mt-2">
            Confirmadas: {confirmedToday} • Canceladas: {cancelledToday} • No asistió: {noShowToday}
          </div>
        </div>

        <div className="border border-gray-700 rounded p-4">
          <div className="text-sm text-gray-300">Reservas esta semana</div>
          <div className="text-3xl font-bold mt-1">{weekBookings.length}</div>
          <div className="text-sm text-gray-300 mt-2">
            (Rango {week.from} → {week.to})
          </div>
        </div>

        <div className="border border-gray-700 rounded p-4">
          <div className="text-sm text-gray-300">Bloqueos hoy</div>
          <div className="text-3xl font-bold mt-1">{todayBlocks.length}</div>
          <div className="text-sm text-gray-300 mt-2">
            Se ocultan en disponibilidad automáticamente.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-bold mb-3">Próximas (hoy)</h2>
          {next.length === 0 ? (
            <p className="text-gray-300">No hay reservas confirmadas para hoy.</p>
          ) : (
            <div className="grid gap-3">
              {next.map((b) => (
                <div key={b.id} className="border border-gray-700 rounded p-3">
                  <div className="font-semibold">
                    {b.startTime}-{b.endTime} • {b.name}
                  </div>
                  <div className="text-sm text-gray-300">
                    {b.phone} • Servicio #{b.serviceId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-bold mb-3">Accesos rápidos</h2>
          <div className="grid gap-2">
            <a className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition" href="/admin/reservas">
              Ver Reservas
            </a>
            <a className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition" href="/admin/bloqueos">
              Bloqueos
            </a>
            <a className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition" href="/admin/servicios">
              Servicios
            </a>
            <a className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition" href="/admin/horarios">
              Horarios de atención
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
