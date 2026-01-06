"use client";

import { useState } from "react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceId: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | string;
  cancelToken: string; // UUID real (para cancelar)
};

export default function MisReservasPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [msg, setMsg] = useState("");

  const fetchBookings = async () => {
    setMsg("");
    setSelected(null);
    setBookings([]);
    setCodeInput("");

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setMsg("Escribe tu número de celular.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings?phone=${encodeURIComponent(cleanPhone)}`
      );

      if (!res.ok) throw new Error("No se pudo obtener reservas");

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.bookings;

      setBookings(list || []);
      if (!list || list.length === 0) setMsg("No se encontraron reservas para ese celular.");
    } catch (e) {
      console.error(e);
      setMsg("Error cargando reservas.");
    } finally {
      setLoading(false);
    }
  };

  const shortCodeOf = (cancelToken: string) =>
    (cancelToken || "").substring(0, 6).toUpperCase();

  const handleCancel = async () => {
    if (!selected) return;

    const expected = shortCodeOf(selected.cancelToken);
    const typed = codeInput.trim().toUpperCase();

    if (!typed) {
      setMsg("Escribe el código de cancelación.");
      return;
    }

    if (typed !== expected) {
      setMsg("Código incorrecto para esa reserva.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${selected.cancelToken}/cancel`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("No se pudo cancelar");

      // Actualizamos lista (marcar cancelada o quitar)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selected.id ? { ...b, status: "CANCELLED" } : b
        )
      );

      setSelected((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      setMsg("✅ Reserva cancelada.");
      setCodeInput("");
    } catch (e) {
      console.error(e);
      setMsg("Error al cancelar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Mis reservas</h1>

      {/* Buscar por celular */}
      <div className="border border-gray-600 rounded p-4 mb-6">
        <label className="block mb-2 font-semibold">Número de celular</label>
        <div className="flex gap-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 78452365"
            className="
              flex-1 rounded border border-gray-600
              bg-transparent text-white
              px-3 py-2
              placeholder:text-gray-400
              focus:outline-none
            "
          />
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="border border-gray-600 px-4 py-2 rounded hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {msg && <p className="mt-3 text-sm text-gray-300">{msg}</p>}
      </div>

      {/* Lista de reservas */}
      {bookings.length > 0 && (
        <div className="grid gap-3 mb-6">
          {bookings.map((b) => {
            const isSelected = selected?.id === b.id;
            const isCancelled = b.status === "CANCELLED";

            return (
              <div
                key={b.id}
                onClick={() => setSelected(b)}
                className={`
                  border border-gray-600 rounded p-4 cursor-pointer transition
                  ${isSelected ? "bg-[#626262] text-black" : "bg-transparent text-white hover:bg-[#626262] hover:text-black"}
                  ${isCancelled ? "opacity-60" : ""}
                `}
              >
                <div className="flex justify-between font-semibold">
                  <span>
                    {b.date} • {b.startTime} - {b.endTime}
                  </span>
                  <span>{b.status}</span>
                </div>

                <div className={`mt-2 text-sm ${isSelected ? "text-black/80" : "text-gray-300"}`}>
                  <span className="mr-4">Cliente: {b.name}</span>
                  <span>Código: {shortCodeOf(b.cancelToken)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel de cancelación */}
      {selected && (
        <div className="border border-gray-600 rounded p-4">
          <h2 className="text-xl font-bold mb-3">Cancelar reserva</h2>

          <div className="mb-3 text-gray-300">
            Seleccionada: <span className="text-white">{selected.date} {selected.startTime}</span> • Código:
            <span className="ml-2 font-mono text-white">{shortCodeOf(selected.cancelToken)}</span>
          </div>

          {selected.status === "CANCELLED" ? (
            <p className="text-gray-300">Esta reserva ya está cancelada.</p>
          ) : (
            <>
              <label className="block mb-2 font-semibold">Ingresa el código de cancelación</label>
              <div className="flex gap-3">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Ej: A9F3KQ"
                  className="
                    flex-1 rounded border border-gray-600
                    bg-transparent text-white
                    px-3 py-2
                    placeholder:text-gray-400
                    focus:outline-none
                    font-mono
                  "
                />
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="border border-gray-600 px-4 py-2 rounded hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
                >
                  {loading ? "Cancelando..." : "Cancelar reserva"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
