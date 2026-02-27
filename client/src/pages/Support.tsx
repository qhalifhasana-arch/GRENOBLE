import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, MessageCircle, User, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Setting } from "@shared/schema";
import { api } from "@shared/routes";

export default function Support() {
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: [api.settings.public.path],
    staleTime: 5000,
  });

  const tgChannel = settings?.find(s => s.key === 'telegram_channel')?.value || "";
  const tgGroup = settings?.find(s => s.key === 'telegram_group')?.value || "";
  const customerService = settings?.find(s => s.key === 'customer_service_link')?.value || "";

  const handleLinkClick = (url: string, label: string) => {
    if (!url || url === "#") {
      alert("Le lien " + label + " n'est pas encore configuré. Veuillez contacter l'administrateur.");
      return;
    }
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://") && !finalUrl.startsWith("tg://")) {
      finalUrl = "https://" + finalUrl;
    }
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

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
            <button
              onClick={() => handleLinkClick(tgChannel, "Canal Telegram")}
              className="block w-full text-left"
              data-testid="link-telegram-channel"
            >
              <div className={`${tgChannel ? 'bg-sky-500 hover:bg-sky-600' : 'bg-sky-300'} text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm`}>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Officiel</p>
                  <p className="text-lg font-extrabold">Canal Telegram</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick(tgGroup, "Groupe de Discussion")}
              className="block w-full text-left"
              data-testid="link-telegram-group"
            >
              <div className={`${tgGroup ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-300'} text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm`}>
                <div className="bg-white/20 p-3 rounded-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Communauté</p>
                  <p className="text-lg font-extrabold">Groupe de Discussion</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick(customerService, "Service Client")}
              className="block w-full text-left"
              data-testid="link-customer-service"
            >
              <div className={`${customerService ? 'bg-green-700 hover:bg-green-800' : 'bg-green-400'} text-white rounded-xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm`}>
                <div className="bg-white/20 p-3 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Direct</p>
                  <p className="text-lg font-extrabold">Service Client</p>
                </div>
              </div>
            </button>

            {(!tgChannel && !tgGroup && !customerService) && !isLoading && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-sm font-medium">
                  Les liens de contact seront bientôt disponibles.
                </p>
              </div>
            )}
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
