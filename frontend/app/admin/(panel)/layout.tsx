"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/bloqueos", label: "Bloqueos" },
  { href: "/admin/horarios", label: "Horarios" },
];

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 🔒 Si no hay token, no entra al panel
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/admin/login");
  }, [router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-gray-700 p-4">
          <h1 className="text-xl font-bold mb-6">Panel Admin</h1>

          <nav className="space-y-2">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded border border-gray-700 transition
                    ${
                      active
                        ? "bg-[#626262] text-black"
                        : "hover:bg-[#626262] hover:text-black"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-6 w-full border border-gray-700 rounded py-2 hover:bg-[#626262] hover:text-black transition"
          >
            Cerrar sesión
          </button>
        </aside>

        {/* Contenido */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

