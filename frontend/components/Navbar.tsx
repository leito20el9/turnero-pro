"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/mis-reservas", label: "Mis reservas" },
    { href: "/admin/login", label: "Admin" },
  ];

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* IZQUIERDA – Identidad */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
  ✂️ Turnero Pro – Barbería
</h1>
          <p className="text-sm text-gray-400">
            Sistema de gestión de turnos
          </p>
        </div>

        {/* DERECHA – Navegación */}
        <nav className="flex gap-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${
                  active
                    ? "text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
