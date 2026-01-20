import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Shield, User, Settings, CreditCard, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Account() {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: User, label: "Informations Personnelles" },
    { icon: CreditCard, label: "Gestion Bancaire" },
    { icon: Shield, label: "Sécurité" },
    { icon: Settings, label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 pt-12 text-center border-b">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-50 shadow-lg">
          <AvatarFallback className="bg-primary text-white text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-gray-900 font-display">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-muted-foreground text-sm">{user?.phoneNumber}</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
          {user?.isAdmin ? "Administrateur" : "Utilisateur Vérifié"}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
           <CardContent className="p-0">
             {menuItems.map((item, index) => (
               <div 
                 key={index} 
                 className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-0 border-gray-50"
               >
                 <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                       <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">{item.label}</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
               </div>
             ))}
           </CardContent>
        </Card>

        {user?.isAdmin && (
           <Button variant="outline" className="w-full bg-black text-white hover:bg-gray-800 h-12 rounded-xl">
              Accéder au Panel Admin
           </Button>
        )}

        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-0 shadow-none"
          onClick={() => logout.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
