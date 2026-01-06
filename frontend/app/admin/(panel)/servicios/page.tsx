"use client";

import { useEffect, useState } from "react";

type Service = {
  id: number;
  name: string;
  duration: number;
  price: number;
};

export default function AdminServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30); // ⏱️ minutos
  const [price, setPrice] = useState<number>(20); // 💰 dinero

  const [editing, setEditing] = useState<Service | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () => localStorage.getItem("admin_token") || "";

  const loadServices = async () => {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${api}/services`);
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data) ? data : data.services || [];
      setServices(list);
    } catch (e) {
      console.error(e);
      setMsg("Error cargando servicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setName("");
    setDuration(30);
    setPrice(20);
    setEditing(null);
    setMsg("");
  };

  const submit = async () => {
    setMsg("");

    if (!name.trim()) return setMsg("Nombre requerido.");
    if (duration <= 0) return setMsg("Duración debe ser mayor a 0.");
    if (price < 0) return setMsg("Precio no puede ser negativo.");

    const token = getToken();
    if (!token) return setMsg("No hay token admin. Inicia sesión otra vez.");

    setLoading(true);
    try {
      const isEdit = !!editing;

      const res = await fetch(
        `${api}/services${isEdit ? `/${editing!.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            duration: Number(duration),
            price: Number(price),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "Error guardando servicio.");
        return;
      }

      setMsg(isEdit ? "✅ Servicio actualizado." : "✅ Servicio creado.");
      resetForm();
      await loadServices();
    } catch (e) {
      console.error(e);
      setMsg("Error conectando con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    setDuration(s.duration); // ⏱️ duración
    setPrice(s.price); // 💰 precio
    setMsg("");
  };

  const remove = async (s: Service) => {
    setMsg("");

    const token = getToken();
    if (!token) return setMsg("No hay token admin. Inicia sesión otra vez.");

    setLoading(true);
    try {
      const res = await fetch(`${api}/services/${s.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "Error eliminando servicio.");
        return;
      }

      setMsg("✅ Servicio eliminado.");
      await loadServices();
    } catch (e) {
      console.error(e);
      setMsg("Error conectando con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Servicios</h1>

      {/* Formulario */}
      <div className="border border-gray-700 rounded p-4 mb-6">
        <h2 className="text-xl font-bold mb-3">
          {editing ? "Editar servicio" : "Crear servicio"}
        </h2>

        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-400">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte + barba"
              className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* ✅ AQUÍ queda claro cuál es duración y cuál es precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">Duración (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Ej: 30"
                className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Precio (Bs)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Ej: 20"
                className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 focus:outline-none"
              />
            </div>
          </div>

          {msg && <p className="text-sm text-gray-300">{msg}</p>}

          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={loading}
              className="border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
            >
              {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
            </button>

            {editing && (
              <button
                onClick={resetForm}
                className="border border-gray-700 rounded px-4 py-2 hover:bg-[#626262] hover:text-black transition"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="border border-gray-700 rounded p-4">
        <h2 className="text-xl font-bold mb-3">Lista de servicios</h2>

        {services.length === 0 ? (
          <p className="text-gray-300">No hay servicios.</p>
        ) : (
          <div className="grid gap-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="border border-gray-700 rounded p-4 flex justify-between items-center hover:bg-[#626262] hover:text-black transition"
              >
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm opacity-80">
  {s.duration} min • Bs {s.price}
</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(s)}
                    className="border border-gray-700 rounded px-3 py-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="border border-gray-700 rounded px-3 py-2"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
