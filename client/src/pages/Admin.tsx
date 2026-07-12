import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle,
  Package, Settings, FileText, LogOut, Menu, X, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminDeposits } from "./admin/AdminDeposits";
import { AdminWithdrawals } from "./admin/AdminWithdrawals";
import { AdminProducts } from "./admin/AdminProducts";
import { AdminSettings } from "./admin/AdminSettings";
import { AdminLogs } from "./admin/AdminLogs";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "deposits", label: "Dépôts", icon: ArrowDownCircle },
  { id: "withdrawals", label: "Retraits", icon: ArrowUpCircle },
  { id: "products", label: "Produits VIP", icon: Package },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "logs", label: "Journal", icon: FileText },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <AdminDashboard />;
      case "users": return <AdminUsers />;
      case "deposits": return <AdminDeposits />;
      case "withdrawals": return <AdminWithdrawals />;
      case "products": return <AdminProducts />;
      case "settings": return <AdminSettings />;
      case "logs": return <AdminLogs />;
      default: return <AdminDashboard />;
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === section);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">GREENIX</span>
          </div>
          <p className="text-slate-500 text-xs font-medium pl-10">Administration</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                section === item.id
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-slate-500 text-xs truncate">{user.phoneNumber}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-950 hover:text-red-400 transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-white font-black text-lg">GREENIX Admin</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                    section === item.id ? "bg-green-600/20 text-green-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />{item.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={() => logout.mutate()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 text-sm font-semibold">
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {currentNav && <currentNav.icon className="w-4 h-4 text-green-400" />}
            <h1 className="text-white font-bold text-base">{currentNav?.label}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:block text-slate-400 text-xs font-medium">{user.firstName} {user.lastName}</span>
            <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.firstName[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {renderSection()}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex flex-shrink-0">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-bold transition-all",
                section === item.id ? "text-green-400" : "text-slate-500"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="truncate w-full text-center px-0.5">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
