import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, Users, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: ShoppingBag, label: "Produits", href: "/products" },
    { icon: Users, label: "Équipe", href: "/team" },
    { icon: User, label: "Compte", href: "/account" },
    ...(user?.isAdmin ? [{ icon: Shield, label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100/80 pb-safe" data-testid="bottom-nav">
      <div className="flex justify-around items-center h-[72px] max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )} data-testid={`nav-${item.label.toLowerCase()}`}>
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-[3px] bg-primary rounded-full" />
              )}
              <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-xs", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
