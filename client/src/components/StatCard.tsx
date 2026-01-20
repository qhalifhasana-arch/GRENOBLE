import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: "default" | "primary" | "secondary";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, variant = "default", className }: StatCardProps) {
  const variants = {
    default: "bg-white border border-gray-100 text-foreground",
    primary: "bg-gradient-green text-white shadow-lg shadow-primary/20",
    secondary: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/20",
  };

  return (
    <div className={cn("rounded-2xl p-5 flex flex-col justify-between", variants[variant], className)}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-sm font-medium opacity-90", variant === "default" ? "text-muted-foreground" : "text-white/90")}>
          {label}
        </span>
        {Icon && <Icon className="w-5 h-5 opacity-80" />}
      </div>
      <div className="text-2xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}
