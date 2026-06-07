import { useState } from "react";
import {
  Home,
  DollarSign,
  Coffee,
  Package,
  History,
  FileBarChart,
  LogOut,
  ChevronLeft,
  Menu as MenuIcon,
  X
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logoMesombang from "../assets/logo.png";

function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const menus = [
    { text: "Beranda", icon: <Home size={20} />, path: "/dashboard" },
    { text: "Menu Kafe", icon: <Coffee size={20} />, path: "/dashboard/menu" },
    { text: "Transaksi", icon: <DollarSign size={20} />, path: "/dashboard/transaksi" },
    { text: "Stok Menu", icon: <Package size={20} />, path: "/dashboard/stok" },
    { text: "Laporan", icon: <FileBarChart size={20} />, path: "/dashboard/laporan" },
  ];

  return (
    <>
      {/* ================= SIDEBAR MOBILE ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-68
          bg-[#4a2e28] text-white
          shadow-2xl transition-transform duration-300 ease-in-out
          md:hidden flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Mobile */}
        <div className="p-5 border-b border-[#36211d] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoMesombang} alt="Mesombang Logo" className="w-10 h-10 object-contain min-w-[40px]"/>
            <h1 className="font-serif text-xl font-bold tracking-wide text-[#f4ece1]">
              Mesombang Cafe
            </h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-[#36211d] rounded-lg transition-colors text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Mobile */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col gap-1.5">
            {menus.map((item, index) => (
              <MenuItem
                key={index}
                to={item.path}
                icon={item.icon}
                text={item.text}
                mobile
                setOpen={setOpen}
              />
            ))}
          </nav>
        </div>

        {/* Footer Mobile */}
        <div className="p-4 border-t border-[#36211d] bg-[#3e2621]">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 p-3 w-full rounded-xl text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>


      {/* ================= SIDEBAR DESKTOP ================= */}
      <aside
        className={`
          hidden md:flex fixed top-0 left-0 flex-col
          bg-[#4a2e28] text-white h-screen
          border-r border-[#36211d] shadow-lg
          transition-all duration-300 ease-in-out z-40 select-none
          ${open ? "w-64" : "w-20"}
        `}
      >
        {/* Header Desktop */}
        <div className="p-4 border-b border-[#36211d] h-[73px] flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 px-2">
            <img src={logoMesombang} alt="Mesombang Logo" className="w-10 h-10 object-contain min-w-[40px]"/>
            {open && (
              <h1 className="font-serif text-lg font-bold tracking-wide text-[#f4ece1] whitespace-nowrap animate-fade-in">
                Mesombang Cafe
              </h1>
            )}
          </div>

          {/* Tombol Toggle Collapse (Kecilkan/Besarkan Sidebar) */}
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-[#36211d] rounded-md text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Menu Desktop */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col gap-1.5">
            {menus.map((item, index) => (
              <MenuItem
                key={index}
                to={item.path}
                icon={item.icon}
                text={open ? item.text : ""}
              />
            ))}
          </nav>
        </div>

        {/* Footer Desktop */}
        <div className="p-3 border-t border-[#36211d] bg-[#3e2621]">
          <button
            onClick={() => navigate("/login")}
            className={`
              flex items-center rounded-xl text-red-300 hover:bg-red-500/10 
              transition-all duration-200 text-sm font-medium p-3 w-full
              ${open ? "gap-3 justify-start" : "justify-center"}
            `}
            title="Keluar Akun"
          >
            <LogOut size={18} className="shrink-0" />
            {open && <span className="animate-fade-in">Keluar Akun</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// Sub-Komponen Item Menu (Reusable)
function MenuItem({ to, icon, text, mobile = false, setOpen }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={() => {
        if (mobile && setOpen) setOpen(false);
      }}
      className={({ isActive }) => `
        flex items-center p-3 rounded-xl
        transition-all duration-200 w-full group relative font-medium text-sm
        ${isActive
          ? "bg-[#dac2b1] text-[#36211d] font-semibold shadow-md shadow-black/10"
          : "text-[#d1c2bd] hover:bg-[#36211d] hover:text-white"
        }
        ${!text ? "justify-center" : "gap-3"}
      `}
      title={!text ? mobile ? "" : to.split("/").pop() : ""}
    >
      {/* Icon Wrapper */}
      <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>

      {/* Text Menu */}
      {text && (
        <span className="tracking-wide truncate block animate-fade-in">
          {text}
        </span>
      )}

      {/* Tooltip kecil saat sidebar desktop dikecilkan */}
      {!text && !mobile && (
        <div className="absolute left-24 scale-0 group-hover:scale-100 transition-all bg-[#36211d] text-white text-xs px-2.5 py-1.5 rounded-md shadow-md whitespace-nowrap z-50 pointer-events-none origin-left">
          {to === "/dashboard" ? "Beranda" : to.split("/").pop()}
        </div>
      )}
    </NavLink>
  );
}

export default Sidebar;