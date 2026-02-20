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
    <div className="min-h-screen bg-gray-50 pb-28" data-testid="support-page">
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 px-5 pt-12 pb-14 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <MessageCircle className="w-40 h-40 text-white" />
        </div>
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/80 hover:bg-white/10 mb-3 p-0 h-auto font-semibold gap-1.5 text-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-white relative z-10">Support & Aide</h1>
          <p className="text-green-200/60 text-sm relative z-10 mt-1">Nous sommes là pour vous aider</p>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4 relative z-10 max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-5 text-center">
            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-green-700" />
            </div>
            <CardTitle className="text-lg font-extrabold text-gray-900">Assistance Officielle</CardTitle>
            <CardDescription className="text-sm">Choisissez votre moyen de contact</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <a href={tgChannel} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-telegram-channel">
              <div className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Officiel</p>
                  <p className="text-lg font-extrabold">Canal Telegram</p>
                </div>
              </div>
            </a>

            <a href={tgGroup} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-telegram-group">
              <div className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm">
                <div className="bg-white/20 p-3 rounded-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Communauté</p>
                  <p className="text-lg font-extrabold">Groupe de Discussion</p>
                </div>
              </div>
            </a>

            <a href={customerService} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-customer-service">
              <div className="bg-green-700 hover:bg-green-800 text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm">
                <div className="bg-white/20 p-3 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Direct</p>
                  <p className="text-lg font-extrabold">Service Client</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100/80 text-center">
          <p className="text-amber-800 text-sm font-semibold leading-relaxed">
            Notre équipe est disponible de 8h à 20h pour répondre à toutes vos questions.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
