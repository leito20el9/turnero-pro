"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Reserva = {
  name: string;
  phone: string;
  service: string;
  duration: number;
  price: number;
  date: string;
  time: string;

  // 🔒 token real (UUID) - NO lo mostramos
  cancelToken: string;

  // 🙂 código corto para mostrar
  publicCode: string;
};

export default function ConfirmarPage() {
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("reserva");
    if (data) setReserva(JSON.parse(data));
  }, []);

  if (!reserva) {
    return <p className="p-6 text-white">Cargando reserva...</p>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">¡Reserva confirmada!</h1>

      {/* Detalles */}
      <div className="border border-gray-600 rounded p-4 space-y-2 mb-6 bg-transparent text-white">
        <p><strong>Nombre:</strong> {reserva.name}</p>
        <p><strong>Celular:</strong> {reserva.phone}</p>
        <p><strong>Servicio:</strong> {reserva.service}</p>
        <p><strong>Duración:</strong> {reserva.duration} min</p>
        <p><strong>Fecha:</strong> {reserva.date}</p>
        <p><strong>Hora:</strong> {reserva.time}</p>
        <p><strong>Precio:</strong> ${reserva.price}</p>
      </div>

      {/* Código (MOSTRAR SOLO EL CORTO) */}
      <div className="border border-gray-600 rounded p-4 bg-[#626262] text-black mb-6">
        <p className="font-semibold">Código de cancelación</p>
        <p className="text-2xl font-mono mt-2">{reserva.publicCode}</p>
      </div>

      <button
        onClick={() => router.push("/")}
        className="w-full border border-gray-600 py-3 rounded text-white hover:bg-[#626262] hover:text-black transition"
      >
        Volver al inicio
      </button>
    </main>
  );
}
