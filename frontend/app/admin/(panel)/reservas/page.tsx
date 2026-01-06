"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  serviceId: number;
  status: "CONFIRMED" | "CANCELLED" | "NO_SHOW" | string;
  cancelToken: string;
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  NO_SHOW: "No asistió",
};

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-600/20 text-green-300 border-green-700",
  CANCELLED: "bg-red-600/20 text-red-300 border-red-700",
  NO_SHOW: "bg-orange-600/20 text-orange-300 border-orange-700",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toYMD(dt);
}

// Semana (Lun-Dom)
function weekRangeFrom(dateYmd: string) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0 dom, 1 lun...
  const diffToMon = (day + 6) % 7; // 0 si ya es lun
  const monday = new Date(dt);
  monday.setDate(dt.getDate() - diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toYMD(monday), to: toYMD(sunday) };
}

export default function AdminReservasPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [mode, setMode] = useState<"DAY" | "WEEK">("DAY");
  const [baseDate, setBaseDate] = useState<string>(toYMD(new Date()));

  const range = useMemo(() => {
    if (mode === "DAY") return { from: baseDate, to: baseDate };
    return weekRangeFrom(baseDate);
  }, [mode, baseDate]);

  const [items, setItems] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const token = () => localStorage.getItem("admin_token") || "";

  const load = async () => {
    setMsg("");
    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    setLoading(true);
    try {
      const res = await fetch(
        `${api}/bookings/admin?from=${range.from}&to=${range.to}`,
        { headers: { Authorization: `Bearer ${t}` } }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "Error cargando reservas.");
        setItems([]);
        setSelectedId(null);
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setItems(list);

      if (selectedId && !list.some((b) => b.id === selectedId)) {
        setSelectedId(null);
      }
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
  }, [range.from, range.to]);

  const selected = useMemo(
    () => items.find((b) => b.id === selectedId) || null,
    [items, selectedId]
  );

  const setStatus = async (id: number, status: Booking["status"]) => {
    setMsg("");
    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    // update optimista
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

    try {
      const res = await fetch(`${api}/bookings/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "No se pudo actualizar el estado.");
        await load();
        return;
      }

      setMsg("✅ Estado actualizado.");
    } catch (e) {
      console.error(e);
      setMsg("Error de conexión al actualizar estado.");
      await load();
    }
  };

  const badgeClass = (status: string) =>
    `inline-flex items-center px-2 py-1 rounded border text-xs font-semibold ${
      STATUS_BADGE[status] ?? "bg-gray-600/20 text-gray-200 border-gray-700"
    }`;

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Reservas</h1>

      {/* Filtros */}
      <div className="border border-gray-700 rounded p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("DAY")}
              className={`border border-gray-700 rounded px-3 py-2 transition ${
                mode === "DAY"
                  ? "bg-[#626262] text-black"
                  : "hover:bg-[#626262] hover:text-black"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setMode("WEEK")}
              className={`border border-gray-700 rounded px-3 py-2 transition ${
                mode === "WEEK"
                  ? "bg-[#626262] text-black"
                  : "hover:bg-[#626262] hover:text-black"
              }`}
            >
              Semana
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div>
              <label className="text-sm text-gray-400">
                {mode === "DAY" ? "Fecha" : "Semana (elige un día)"}
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
              />
              <div className="text-xs text-gray-400 mt-1">
                Rango: {range.from} → {range.to}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setBaseDate(addDays(baseDate, mode === "DAY" ? -1 : -7))
                }
                className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  setBaseDate(addDays(baseDate, mode === "DAY" ? 1 : 7))
                }
                className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition"
              >
                ▶
              </button>
              <button
                onClick={load}
                disabled={loading}
                className="border border-gray-700 rounded px-3 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </div>
        </div>

        {msg && <p className="text-sm text-gray-300 mt-3">{msg}</p>}
      </div>

      {/* Lista + detalle */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-bold mb-3">Lista</h2>

          {items.length === 0 ? (
            <p className="text-gray-300">No hay reservas en este rango.</p>
          ) : (
            <div className="grid gap-3">
              {items.map((b) => {
                const active = b.id === selectedId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`text-left border border-gray-700 rounded p-4 transition ${
                      active
                        ? "bg-[#626262] text-black"
                        : "hover:bg-[#626262] hover:text-black"
                    }`}
                  >
                    <div className="flex justify-between gap-3 items-start">
                      <div className="font-semibold">
                        {b.date} • {b.startTime}-{b.endTime}
                      </div>
                      <span className={badgeClass(b.status)}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      {b.name} • {b.phone} • Servicio #{b.serviceId}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalle */}
        <div className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-bold mb-3">Detalle</h2>

          {!selected ? (
            <p className="text-gray-300">
              Selecciona una reserva de la lista para ver detalles.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="border border-gray-700 rounded p-3">
                <p>
                  <strong>Cliente:</strong> {selected.name}
                </p>
                <p>
                  <strong>Celular:</strong> {selected.phone}
                </p>
                <p>
                  <strong>Fecha:</strong> {selected.date}
                </p>
                <p>
                  <strong>Hora:</strong> {selected.startTime} - {selected.endTime}
                </p>
                <p>
                  <strong>Servicio:</strong> #{selected.serviceId}
                </p>
                <div className="mt-2">
                  <strong>Estado:</strong>{" "}
                  <span className={badgeClass(selected.status)}>
                    {STATUS_LABELS[selected.status] ?? selected.status}
                  </span>
                </div>
              </div>

              <div className="border border-gray-700 rounded p-3">
                <label className="text-sm text-gray-400">Cambiar estado</label>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    setStatus(selected.id, e.target.value as Booking["status"])
                  }
                  className="mt-1 w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
                >
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">No asistió</option>
                </select>
              </div>

              <div className="border border-gray-700 rounded p-3">
                <label className="text-sm text-gray-400">
                  Token de cancelación (solo referencia)
                </label>
                <div className="mt-1 font-mono break-all text-sm">
                  {selected.cancelToken}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
