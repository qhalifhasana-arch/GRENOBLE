import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wallet, Globe, CheckCircle2, ChevronRight, Info, ExternalLink, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Setting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const AMOUNTS = [3000, 5000, 10000, 20000, 50000, 100000];

const PAYMENT_METHODS: Record<string, string[]> = {
  "Togo": ["TMoney", "Flooz"],
  "Bénin": ["MTN MoMo", "Moov Money"],
  "Sénégal": ["Orange Money", "Wave"],
  "Côte d'Ivoire": ["Orange Money", "MTN MoMo", "Moov Money", "Wave"],
  "Burkina Faso": ["Orange Money", "MTN MoMo", "Moov Money"],
  "Mali": ["Orange Money", "Moov Money"],
  "Congo-Brazzaville": ["Mobile Money Congo"],
};

const depositSchema = z.object({
  amount: z.coerce.number().min(3000, "Minimum 3000 FCFA"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  country: z.string().min(1, "Veuillez choisir votre pays"),
  method: z.string().min(1, "Veuillez choisir un moyen de paiement"),
});

export default function Deposit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [step, setStep] = useState<'form' | 'summary' | 'payment'>('form');
  const [submittedValues, setSubmittedValues] = useState<z.infer<typeof depositSchema> | null>(null);

  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.settings.public.path],
  });

  const paymentLink = settings?.find(s => s.key === 'payment_link')?.value || '';

  const depositMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.transactions.deposit.path, data);
      if (!res.ok) throw new Error("Dépôt échoué");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setStep('payment');
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 3000,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      country: user?.country || "",
      method: "",
    },
  });

  const selectedCountry = form.watch("country");
  const availableMethods = useMemo(() => {
    return selectedCountry ? PAYMENT_METHODS[selectedCountry] || [] : [];
  }, [selectedCountry]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount);
  };

  const onPreSubmit = (values: z.infer<typeof depositSchema>) => {
    setSubmittedValues(values);
    setStep('summary');
  };

  const confirmAndSubmit = () => {
    if (!submittedValues) return;
    depositMutation.mutate(submittedValues);
  };

  const openPaymentLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
          <h1 className="text-2xl font-bold text-white font-display mb-1 text-center" data-testid="text-payment-title">Effectuer le Paiement</h1>
          <p className="text-green-100 text-sm text-center">Suivez les instructions ci-dessous</p>
        </div>

        <div className="p-4 -mt-6">
          <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-green-50/50 border-b border-green-100 p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl font-black text-slate-900">Demande enregistrée !</CardTitle>
              <CardDescription className="text-sm">Votre demande de dépôt de <span className="font-black text-primary">{submittedValues?.amount?.toLocaleString()} FCFA</span> a été enregistrée.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-amber-900">Instructions de paiement :</p>
                    <ol className="text-xs text-amber-800 leading-relaxed space-y-1 list-decimal list-inside">
                      <li>Cliquez sur le bouton ci-dessous pour ouvrir la page de paiement</li>
                      <li>Effectuez le paiement du montant exact : <span className="font-black">{submittedValues?.amount?.toLocaleString()} FCFA</span></li>
                      <li>Utilisez la méthode : <span className="font-black">{submittedValues?.method}</span></li>
                      <li>Votre dépôt sera validé par l'administrateur sous peu</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {paymentLink ? (
                  <Button
                    onClick={openPaymentLink}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] gap-3"
                    data-testid="button-open-payment"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Procéder au paiement
                  </Button>
                ) : (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                    <p className="text-sm font-bold text-red-700">Lien de paiement non configuré</p>
                    <p className="text-xs text-red-600 mt-1">Veuillez contacter le support pour effectuer votre paiement.</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('form');
                    setSubmittedValues(null);
                  }}
                  className="w-full h-12 text-muted-foreground font-bold rounded-2xl"
                  data-testid="button-new-deposit"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Nouveau dépôt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === 'summary' && submittedValues) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
          <h1 className="text-2xl font-bold text-white font-display mb-1 text-center">Récapitulatif de Paiement</h1>
        </div>

        <div className="p-4 -mt-6">
          <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-green-50/50 border-b border-green-100 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl font-black text-slate-900">Vérifiez vos informations</CardTitle>
              <CardDescription>Confirmez avant de procéder au paiement</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Pays choisi</span>
                  <span className="font-black text-slate-900">{submittedValues.country}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Moyen de paiement</span>
                  <Badge className="bg-primary/10 text-primary border-0 font-black px-3 py-1">{submittedValues.method}</Badge>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Investisseur</span>
                  <span className="font-black text-slate-900">{submittedValues.firstName} {submittedValues.lastName}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-primary/5 rounded-2xl px-4">
                  <span className="text-primary text-sm font-black uppercase tracking-widest">Montant à payer</span>
                  <span className="text-xl font-black text-primary">{submittedValues.amount.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  En confirmant, vous serez redirigé vers la page de paiement sécurisée pour effectuer votre transfert.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={confirmAndSubmit}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={depositMutation.isPending}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirmer et payer"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('form')}
                  className="w-full h-12 text-muted-foreground font-bold hover:bg-gray-100 rounded-2xl"
                >
                  Modifier les informations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
        <h1 className="text-2xl font-bold text-white font-display mb-1">Effectuer un Dépôt</h1>
        <p className="text-green-100 text-sm">Rechargez votre compte en toute sécurité</p>
      </div>

      <div className="p-4 -mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPreSubmit)} className="space-y-6">
            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black">Localisation</CardTitle>
                    <CardDescription>Étape 1 : Choisissez votre pays</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Choisir votre pays</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl h-14 bg-gray-50 border-gray-100 font-bold text-lg" data-testid="select-country">
                            <SelectValue placeholder="Sélectionnez un pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                          {Object.keys(PAYMENT_METHODS).map(country => (
                            <SelectItem key={country} value={country} className="py-3 font-bold text-base">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {selectedCountry && (
              <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black">Mode de Paiement</CardTitle>
                      <CardDescription>Étape 2 : Moyens disponibles au {selectedCountry}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-3"
                          >
                            {availableMethods.map((method) => (
                              <FormItem key={method} className="flex items-center space-x-3 space-y-0 rounded-2xl border border-gray-100 p-5 bg-gray-50/30 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group">
                                <FormControl>
                                  <RadioGroupItem value={method} className="border-primary text-primary" />
                                </FormControl>
                                <FormLabel className="font-bold flex-1 cursor-pointer text-slate-900 group-hover:text-primary transition-colors">
                                  {method}
                                </FormLabel>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black">Montant & Identité</CardTitle>
                    <CardDescription>Étape 3 : Détails de la transaction</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sélectionner un montant rapide</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          "py-4 rounded-2xl border text-sm font-black transition-all active:scale-95",
                          selectedAmount === amount 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-white border-gray-100 text-gray-700 hover:border-primary/50"
                        )}
                        data-testid={`button-amount-${amount}`}
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant personnalisé (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-2xl h-14 bg-gray-50 border-gray-100 text-lg font-bold px-6" data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-medium" data-testid="input-firstname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-medium" data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-[1.5rem] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
                  data-testid="button-continue"
                >
                  Continuer vers le récapitulatif
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
      <BottomNav />
    </div>
  );
}
