"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Block = {
  id: number;
  date: string;
  startTime: string; // HH:mm o HH:mm:ss
  endTime: string;   // HH:mm o HH:mm:ss
  reason?: string;
};

export default function HomePage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ carga disponibilidad + bloqueos al cambiar fecha
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [availRes, blocksRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability?date=${date}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks?date=${date}`),
        ]);

        const availData = await availRes.json().catch(() => ({}));
        const blocksData = await blocksRes.json().catch(() => ([]));

        setSlots(availData.availableSlots || []);
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      } catch (err) {
        console.error("Error fetching availability/blocks", err);
        setSlots([]);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [date]);

  // ✅ helper: formatear HH:mm (sirve si viene HH:mm:ss)
  const toHHmm = (time: string) => time?.slice(0, 5);

  // ✅ función para saber si un slot cae dentro de un bloqueo
  const isBlocked = (time: string) => {
    const t = toHHmm(time);
    return blocks.some((b) => t >= toHHmm(b.startTime) && t < toHHmm(b.endTime));
  };

  // ✅ FILTRAR (no mostrar bloqueados)
  const visibleSlots = useMemo(() => {
    return slots.filter((s) => !isBlocked(s));
  }, [slots, blocks]);

  const handleSelectSlot = (time: string) => {
    if (isBlocked(time)) return; // seguridad extra
    router.push(`/reservar?date=${date}&time=${toHHmm(time)}`);
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Disponibilidad</h1>

      {/* Textos informativos */}
      <p className="text-gray-300 mb-1">Selecciona la hora para tu turno.</p>

      <p className="text-gray-400 text-sm mb-1">
        El horario de atención de la barbería es de <strong>09:00 a 18:00</strong>.
      </p>

      <p className="text-gray-500 text-sm mb-6">
        Las horas que no se ven son las que ya están reservadas o bloqueadas.
      </p>

      {/* Selector de fecha */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Seleccionar fecha</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="
            bg-[#626262]
            text-black
            border border-gray-500
            rounded
            px-3
            py-2
            focus:outline-none
          "
        />
      </div>

      {loading ? (
        <p>Cargando horarios...</p>
      ) : visibleSlots.length === 0 ? (
        <p>No hay horarios disponibles</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {visibleSlots.map((slot) => (
            <li
              key={slot}
              onClick={() => handleSelectSlot(slot)}
              className="
                border
                rounded
                p-4
                text-center
                cursor-pointer
                bg-transparent
                text-white
                hover:bg-[#626262]
                hover:text-black
                transition
              "
            >
              {toHHmm(slot)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
