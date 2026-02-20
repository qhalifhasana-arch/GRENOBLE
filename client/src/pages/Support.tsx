import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, MessageCircle, User, ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Setting } from "@shared/schema";
import { api } from "@shared/routes";

export default function Support() {
  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.settings.public.path],
  });

  const tgChannel = settings?.find(s => s.key === 'telegram_channel')?.value || "#";
  const tgGroup = settings?.find(s => s.key === 'telegram_group')?.value || "#";
  const customerService = settings?.find(s => s.key === 'customer_service_link')?.value || "#";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-primary px-6 pt-12 pb-12 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <MessageCircle className="w-48 h-48" />
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 p-0 h-auto font-bold gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-black font-display mb-1 relative z-10 text-white">Support & Aide</h1>
        <p className="text-green-100 text-sm relative z-10">Nous sommes là pour vous aider</p>
      </div>

      <div className="p-4 -mt-8 space-y-4 relative z-10">
        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-xl font-black text-slate-900">Assistance Officielle</CardTitle>
            <CardDescription>Choisissez votre moyen de contact préféré</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <a href={tgChannel} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-20 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white rounded-2xl flex items-center justify-start px-6 gap-4 group transition-all active:scale-95 shadow-lg shadow-[#0088cc]/20">
                <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Officiel</p>
                  <p className="text-lg font-black">Canal Telegram</p>
                </div>
              </Button>
            </a>

            <a href={tgGroup} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-20 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-2xl flex items-center justify-start px-6 gap-4 group transition-all active:scale-95 shadow-lg shadow-[#25D366]/20">
                <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Communauté</p>
                  <p className="text-lg font-black">Groupe de Discussion</p>
                </div>
              </Button>
            </a>

            <a href={customerService} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-2xl flex items-center justify-start px-6 gap-4 group transition-all active:scale-95 shadow-lg shadow-primary/20">
                <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Direct</p>
                  <p className="text-lg font-black">Service Client</p>
                </div>
              </Button>
            </a>
          </CardContent>
        </Card>

        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 text-center">
          <p className="text-amber-800 text-xs font-bold leading-relaxed">
            Notre équipe est disponible de 8h à 20h pour répondre à toutes vos questions concernant vos investissements et transactions.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
