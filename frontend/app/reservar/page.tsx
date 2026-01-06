"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Service = {
  id: number;
  name: string;
  duration: number;
  price: number;
};

export default function ReservarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/services`
      );

      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error("Error cargando servicios", error);
      setServices([]);
    }
  };

  fetchServices();
}, []);


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !phone || !selectedService) {
    alert("Completa todos los campos");
    return;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          serviceId: selectedService.id,
          date,
          time,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Error al crear la reserva");
    }

    const response = await res.json();

    // 👉 DATOS QUE GUARDAMOS EN FRONTEND
    const reserva = {
      name,
      phone,
      service: selectedService.name,
      duration: selectedService.duration,
      price: selectedService.price,
      date,
      time,

      // 🔒 token real (UUID)
      cancelToken: response.cancelToken,

      // 🙂 código corto para el cliente
      publicCode: response.cancelToken
        .substring(0, 6)
        .toUpperCase(),
    };

    localStorage.setItem("reserva", JSON.stringify(reserva));
    router.push("/confirmar");

  } catch (error) {
    console.error(error);
    alert("No se pudo crear la reserva");
  }
};


  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reservar turno</h1>

      {/* Fecha y hora */}
      <div className="mb-6 border border-gray-600 rounded p-4 bg-[#626262] text-black">
        <p className="mb-1">
          <strong>Fecha:</strong> {date}
        </p>
        <p>
          <strong>Hora:</strong> {time}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full rounded border border-gray-600
            bg-transparent text-white
            px-3 py-2
            placeholder:text-gray-400
            focus:outline-none
          "
        />

        {/* Celular */}
        <input
          type="text"
          placeholder="Celular"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="
            w-full rounded border border-gray-600
            bg-transparent text-white
            px-3 py-2
            placeholder:text-gray-400
            focus:outline-none
          "
        />

        {/* Servicios */}
        <div>
          <label className="block mb-2 font-semibold">Selecciona un servicio</label>

          <ul className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;

              return (
                <li
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`
                    border border-gray-600 rounded p-4 cursor-pointer transition
                    ${isSelected ? "bg-[#626262] text-black" : "bg-transparent text-white hover:bg-[#626262] hover:text-black"}
                  `}
                >
                  <div className="flex justify-between font-semibold">
                    <span>{service.name}</span>
                    <span>${service.price}</span>
                  </div>

                  <small className={isSelected ? "text-black/80" : "text-gray-400"}>
                    Duración: {service.duration} min
                  </small>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Resumen */}
        {selectedService && (
          <div className="border border-gray-600 rounded p-4 bg-[#626262] text-black">
            <p>
              <strong>Servicio:</strong> {selectedService.name}
            </p>
            <p>
              <strong>Duración:</strong> {selectedService.duration} min
            </p>
            <p>
              <strong>Precio:</strong> ${selectedService.price}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full border border-gray-600 py-3 rounded text-white hover:bg-[#626262] hover:text-black transition"
        >
          Confirmar reserva
        </button>
      </form>
    </main>
  );
}
