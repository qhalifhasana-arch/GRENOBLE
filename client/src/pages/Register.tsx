import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Phone, KeyRound, UserCircle, ChevronRight, ArrowLeft, Gift } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COUNTRIES, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";
import heroAgricultureImg from "@/assets/images/hero-agriculture.jpg";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  country: z.string().min(1, "Veuillez sélectionner un pays"),
  referralCode: z.string().optional(),
});

export default function Register() {
  const { register } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref") || "";

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      country: "",
      referralCode: refCode,
    },
  });

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    form.setValue("country", country.name);
  };

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex flex-col" data-testid="register-page">
      <div className="relative w-full h-44 sm:h-52 overflow-hidden">
        <img
          src={heroAgricultureImg}
          alt="Champs agricoles verdoyants"
          className="w-full h-full object-cover"
          data-testid="img-hero-agriculture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-green-900/50 to-green-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 mb-2 shadow-lg">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">GreenHarvest</h1>
          <p className="text-green-200/90 text-sm font-medium mt-1 drop-shadow">Investissement Agricole Durable</p>
          <div className="inline-flex items-center gap-2 bg-amber-500/25 backdrop-blur-md border border-amber-400/30 text-amber-200 px-4 py-2 rounded-full text-sm font-bold mt-2 shadow-lg">
            <Gift className="w-4 h-4" />
            Bonus d'inscription : 700 FCFA
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-5">
        <div className="w-full max-w-md lg:max-w-lg space-y-5">

          {!selectedCountry ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center mb-1">
                <h2 className="text-xl font-bold text-white mb-1">D'où venez-vous ?</h2>
                <p className="text-green-300/60 text-sm">Choisissez votre pays pour créer votre compte</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                    data-testid={`country-select-${country.code}`}
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform">{country.flag}</span>
                    <span className="text-white text-sm font-bold">{country.name}</span>
                    <span className="text-green-300/50 text-xs">{country.phonePrefix}</span>
                  </button>
                ))}
              </div>

              <div className="text-center pt-3">
                <Link href="/login">
                  <span className="text-base text-green-300/60 hover:text-green-200 cursor-pointer transition-colors" data-testid="link-login">
                    Déjà un compte ? <strong className="text-green-300">Se connecter</strong>
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => {
                  setSelectedCountry(null);
                  form.setValue("country", "");
                }}
                className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all"
                data-testid="button-change-country"
              >
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-base">{selectedCountry.name}</p>
                  <p className="text-green-300/60 text-sm">{selectedCountry.phonePrefix}</p>
                </div>
                <div className="flex items-center gap-1 text-green-300/40 text-sm font-medium">
                  <ArrowLeft className="w-3 h-3" />
                  Changer
                </div>
              </button>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/10 space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Prénom</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jean"
                                {...field}
                                className="h-14 rounded-xl bg-white/10 border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-firstname"
                              />
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
                            <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Nom</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Dupont"
                                {...field}
                                className="h-14 rounded-xl bg-white/10 border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-lastname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Téléphone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                              <Input
                                type="tel"
                                placeholder={`${selectedCountry.phonePrefix} ...`}
                                {...field}
                                className="pl-11 h-14 rounded-xl bg-white/10 border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                className="pl-11 h-14 rounded-xl bg-white/10 border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Code parrainage <span className="text-green-400/40 normal-case">(optionnel)</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                              <Input
                                placeholder="Code parrain"
                                {...field}
                                className="pl-11 h-14 rounded-xl bg-white/10 border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-referral"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-[56px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-green-900/40 mt-1 transition-all active:scale-[0.98]"
                      disabled={register.isPending}
                      data-testid="button-register"
                    >
                      {register.isPending ? (
                        <Loader2 className="animate-spin mr-2 w-5 h-5" />
                      ) : (
                        <>
                          Créer mon compte
                          <ChevronRight className="w-5 h-5 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="text-center pt-1 pb-8">
                <Link href="/login">
                  <Button variant="ghost" className="text-green-300/70 hover:text-green-200 hover:bg-white/5 font-bold rounded-xl h-14 w-full" data-testid="link-login">
                    Déjà un compte ? Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
