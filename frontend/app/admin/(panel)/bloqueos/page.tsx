"use client";

import { useEffect, useMemo, useState } from "react";

type Block = {
  id: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
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

// semana (Lun-Dom)
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

export default function AdminBloqueosPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [mode, setMode] = useState<"DAY" | "WEEK">("DAY");
  const [baseDate, setBaseDate] = useState<string>(toYMD(new Date()));

  const range = useMemo(() => {
    if (mode === "DAY") return { from: baseDate, to: baseDate };
    return weekRangeFrom(baseDate);
  }, [mode, baseDate]);

  const [items, setItems] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form
  const [date, setDate] = useState<string>(toYMD(new Date()));
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("11:00");
  const [reason, setReason] = useState<string>("");

  const token = () => localStorage.getItem("admin_token") || "";

  const load = async () => {
    setMsg("");
    setLoading(true);

    try {
      const url =
        mode === "DAY"
          ? `${api}/blocks?date=${range.from}`
          : `${api}/blocks/range?from=${range.from}&to=${range.to}`;

      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.message || "Error cargando bloqueos.");
        setItems([]);
        return;
      }

      setItems(Array.isArray(data) ? data : []);
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
  }, [range.from, range.to, mode]);

  const create = async () => {
    setMsg("");

    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    if (!date || !startTime || !endTime) return setMsg("Completa fecha y horas.");
    if (endTime <= startTime) return setMsg("La hora fin debe ser mayor a la hora inicio.");

    setLoading(true);
    try {
      const res = await fetch(`${api}/blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "No se pudo crear el bloqueo.");
        return;
      }

      setMsg("✅ Bloqueo creado.");
      setReason("");

      // si estás viendo otro día/semana, igual recarga
      await load();
    } catch (e) {
      console.error(e);
      setMsg("Error de conexión al crear bloqueo.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    setMsg("");

    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    // optimista
    setItems((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`${api}/blocks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "No se pudo eliminar el bloqueo.");
        await load();
        return;
      }

      setMsg("✅ Bloqueo eliminado.");
    } catch (e) {
      console.error(e);
      setMsg("Error de conexión al eliminar bloqueo.");
      await load();
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Bloqueos</h1>

      {/* Crear bloqueo */}
      <div className="border border-gray-700 rounded p-4 mb-6">
        <h2 className="text-xl font-bold mb-3">Crear bloqueo</h2>

        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-gray-400">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Motivo (opcional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Almuerzo"
              className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={create}
          disabled={loading}
          className="mt-4 border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Crear bloqueo"}
        </button>

        {msg && <p className="text-sm text-gray-300 mt-3">{msg}</p>}
      </div>

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
      </div>

      {/* Lista */}
      <div className="border border-gray-700 rounded p-4">
        <h2 className="text-xl font-bold mb-3">Lista de bloqueos</h2>

        {items.length === 0 ? (
          <p className="text-gray-300">No hay bloqueos en este rango.</p>
        ) : (
          <div className="grid gap-3">
            {items.map((b) => (
              <div
                key={b.id}
                className="border border-gray-700 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-[#626262] hover:text-black transition"
              >
                <div>
                  <div className="font-semibold">
                    {b.date} • {b.startTime} - {b.endTime}
                  </div>
                  <div className="text-sm opacity-80">
                    {b.reason ? b.reason : "Sin motivo"}
                  </div>
                </div>

                <button
                  onClick={() => remove(b.id)}
                  className="border border-gray-700 rounded px-3 py-2"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
