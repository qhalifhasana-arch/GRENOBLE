import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wallet, CheckCircle2, ChevronRight, Info, ExternalLink, ArrowLeft, Sprout } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Setting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { COUNTRIES, getPaymentMethodsForCountry, getFlagForCountry, type Country } from "@/lib/countries";
import depositBg from "@/assets/images/deposit-farming.png";

const AMOUNTS = [3000, 5000, 10000, 20000, 50000, 100000];

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
      toast({ variant: "destructive", title: "Erreur", description: error.message });
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
    return getPaymentMethodsForCountry(selectedCountry);
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
    if (paymentLink) window.open(paymentLink, '_blank');
  };

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="relative overflow-hidden rounded-b-[2rem]">
          <img src={depositBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/70 to-emerald-900/90" />
          <div className="relative px-5 pt-12 pb-10 text-center">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white" data-testid="text-payment-title">Effectuer le Paiement</h1>
            <p className="text-green-100/80 text-sm mt-1">Suivez les instructions ci-dessous</p>
          </div>
        </div>

        <div className="px-5 -mt-6 max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-green-50 border-b border-green-100/50 p-6 text-center">
              <CardTitle className="text-lg font-extrabold text-gray-900">Demande enregistrée</CardTitle>
              <CardDescription>Dépôt de <span className="font-extrabold text-primary">{submittedValues?.amount?.toLocaleString()} FCFA</span></CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/80 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-amber-900">Instructions :</p>
                    <ol className="text-sm text-amber-800 leading-relaxed space-y-1 list-decimal list-inside">
                      <li>Cliquez pour ouvrir la page de paiement</li>
                      <li>Payez exactement <span className="font-bold">{submittedValues?.amount?.toLocaleString()} FCFA</span></li>
                      <li>Méthode : <span className="font-bold">{submittedValues?.method}</span></li>
                      <li>Validation sous peu par l'administrateur</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {paymentLink ? (
                  <Button
                    onClick={openPaymentLink}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md gap-2 transition-all active:scale-[0.98]"
                    data-testid="button-open-payment"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Procéder au paiement
                  </Button>
                ) : (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                    <p className="text-sm font-bold text-red-700">Lien de paiement non configuré</p>
                    <p className="text-xs text-red-600 mt-1">Contactez le support.</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => { setStep('form'); setSubmittedValues(null); }}
                  className="w-full h-11 text-gray-500 font-semibold rounded-xl border-gray-200"
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
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="relative overflow-hidden rounded-b-[2rem]">
          <img src={depositBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/70 to-emerald-900/90" />
          <div className="relative px-5 pt-12 pb-10 text-center">
            <h1 className="text-2xl font-extrabold text-white">Récapitulatif</h1>
            <p className="text-green-100/80 text-sm mt-1">Vérifiez avant de confirmer</p>
          </div>
        </div>

        <div className="px-5 -mt-6 max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-green-50 border-b border-green-100/50 p-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg font-extrabold text-gray-900">Vérifiez vos informations</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pays</span>
                  <span className="font-bold text-gray-900 flex items-center gap-2">
                    <span>{getFlagForCountry(submittedValues.country)}</span>
                    {submittedValues.country}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Paiement</span>
                  <Badge className="bg-primary/10 text-primary border-0 font-bold px-3 py-1">{submittedValues.method}</Badge>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Investisseur</span>
                  <span className="font-bold text-gray-900">{submittedValues.firstName} {submittedValues.lastName}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-primary/5 rounded-xl px-4 -mx-1">
                  <span className="text-primary text-sm font-bold uppercase tracking-wider">Montant</span>
                  <span className="text-2xl font-extrabold text-primary">{submittedValues.amount.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={confirmAndSubmit}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                  disabled={depositMutation.isPending}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirmer et payer"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('form')}
                  className="w-full h-11 text-gray-500 font-semibold rounded-xl"
                >
                  Modifier
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
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="relative overflow-hidden rounded-b-[2rem]">
        <img src={depositBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/70 to-emerald-900/90" />
        <div className="relative px-5 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm w-11 h-11 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Effectuer un Dépôt</h1>
              <p className="text-green-100/80 text-sm">Investissez dans l'agriculture</p>
            </div>
          </div>
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-green-100/70 text-xs font-semibold uppercase tracking-wider">Solde actuel</p>
              <p className="text-white text-2xl font-extrabold">{user?.balance?.toLocaleString()} <span className="text-base font-bold text-green-200/80">FCFA</span></p>
            </div>
            <Wallet className="w-8 h-8 text-green-200/50" />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4 max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPreSubmit)} className="space-y-4">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="px-5 py-4 border-b border-gray-50">
                <CardTitle className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">🌍</span> Votre pays
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                field.onChange(c.name);
                                form.setValue("method", "");
                              }}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all active:scale-95",
                                field.value === c.name
                                  ? "bg-primary/10 border-primary/30 shadow-sm"
                                  : "bg-gray-50 border-gray-100 hover:border-gray-200"
                              )}
                              data-testid={`deposit-country-${c.code}`}
                            >
                              <span className="text-3xl">{c.flag}</span>
                              <span className={cn(
                                "text-xs font-bold leading-tight text-center",
                                field.value === c.name ? "text-primary" : "text-gray-600"
                              )}>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {selectedCountry && availableMethods.length > 0 && (
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white animate-in slide-in-from-bottom-2 duration-200">
                <CardHeader className="px-5 py-4 border-b border-gray-50">
                  <CardTitle className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" /> Mode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            {availableMethods.map((method) => (
                              <FormItem key={method} className="flex items-center space-x-3 space-y-0 rounded-xl border border-gray-100 p-5 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                                <FormControl>
                                  <RadioGroupItem value={method} className="border-primary text-primary" />
                                </FormControl>
                                <FormLabel className="font-semibold flex-1 cursor-pointer text-gray-800 text-base">
                                  {method}
                                </FormLabel>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
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

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="px-5 py-4 border-b border-gray-50">
                <CardTitle className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">💰</span> Montant & Identité
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Montant rapide</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          "py-3.5 rounded-xl border text-base font-bold transition-all active:scale-95",
                          selectedAmount === amount
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200"
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
                      <FormLabel className="text-sm font-semibold text-gray-500">Montant personnalisé (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-xl h-13 bg-gray-50 border-gray-100 font-bold text-base px-4" data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-500">Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12 bg-gray-50 border-gray-100 font-medium" data-testid="input-firstname" />
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
                        <FormLabel className="text-sm font-semibold text-gray-500">Nom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12 bg-gray-50 border-gray-100 font-medium" data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-[0.98] mt-2"
                  data-testid="button-continue"
                >
                  Continuer
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
