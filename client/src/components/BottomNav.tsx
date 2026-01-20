import { Link, useLocation } from "wouter";
import { Home, Sprout, Wallet, ArrowDownUp, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: Sprout, label: "Produits", href: "/products" },
    { icon: Wallet, label: "Dépôt", href: "/deposit" },
    { icon: ArrowDownUp, label: "Retrait", href: "/withdraw" },
    { icon: Users, label: "Équipe", href: "/team" },
    { icon: User, label: "Compte", href: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}>
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
