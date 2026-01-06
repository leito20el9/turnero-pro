"use client";

import { useEffect, useState } from "react";

type Day = {
  id: number;
  dayOfWeek: number; // 1..7
  closed: boolean;
  openTime?: string;
  closeTime?: string;
};

const DAY_LABEL: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export default function AdminHorariosPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const [items, setItems] = useState<Day[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const token = () => localStorage.getItem("admin_token") || "";

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${api}/hours`);
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setMsg(data?.message || "Error cargando horarios.");
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
  }, []);

  const update = (dayOfWeek: number, patch: Partial<Day>) => {
    setItems((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    );
  };

  const save = async () => {
    setMsg("");
    const t = token();
    if (!t) return setMsg("No hay token admin. Inicia sesión otra vez.");

    if (items.length !== 7) return setMsg("Faltan días. Refresca la página.");

    // validación rápida
    for (const d of items) {
      if (!d.closed) {
        if (!d.openTime || !d.closeTime) return setMsg("Completa horas en los días abiertos.");
        if (d.closeTime <= d.openTime) return setMsg("La hora de cierre debe ser mayor a la de apertura.");
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}/hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(
          items
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((d) => ({
              dayOfWeek: d.dayOfWeek,
              closed: d.closed,
              openTime: d.closed ? undefined : d.openTime,
              closeTime: d.closed ? undefined : d.closeTime,
            })),
        ),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "No se pudo guardar.");
        return;
      }

      setMsg("✅ Horarios guardados.");
      setItems(Array.isArray(data) ? data : items);
    } catch (e) {
      console.error(e);
      setMsg("Error de conexión al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Horarios de atención</h1>
          <p className="text-sm text-gray-300 mt-1">
            Configura apertura/cierre por día (se usará luego en Availability).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </div>

      {msg && <p className="text-sm text-gray-300 mt-4">{msg}</p>}

      <div className="border border-gray-700 rounded p-4 mt-6">
        {items.length === 0 ? (
          <p className="text-gray-300">No hay datos todavía.</p>
        ) : (
          <div className="grid gap-3">
            {items
              .slice()
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((d) => (
                <div
                  key={d.dayOfWeek}
                  className="border border-gray-700 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="font-semibold text-lg">{DAY_LABEL[d.dayOfWeek]}</div>

                  <div className="flex items-center gap-2">
                    <input
                      id={`closed-${d.dayOfWeek}`}
                      type="checkbox"
                      checked={d.closed}
                      onChange={(e) =>
                        update(d.dayOfWeek, {
                          closed: e.target.checked,
                          openTime: e.target.checked ? undefined : d.openTime ?? "09:00",
                          closeTime: e.target.checked ? undefined : d.closeTime ?? "18:00",
                        })
                      }
                    />
                    <label htmlFor={`closed-${d.dayOfWeek}`} className="text-sm text-gray-300">
                      Cerrado
                    </label>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div>
                      <label className="text-sm text-gray-400">Apertura</label>
                      <input
                        type="time"
                        disabled={d.closed}
                        value={d.openTime ?? "09:00"}
                        onChange={(e) => update(d.dayOfWeek, { openTime: e.target.value })}
                        className="block rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Cierre</label>
                      <input
                        type="time"
                        disabled={d.closed}
                        value={d.closeTime ?? "18:00"}
                        onChange={(e) => update(d.dayOfWeek, { closeTime: e.target.value })}
                        className="block rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
