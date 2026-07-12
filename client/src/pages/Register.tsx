import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Phone, KeyRound, UserCircle, ChevronRight, ArrowLeft, Gift, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { COUNTRIES, type Country } from "@/lib/countries";
import heroAgricultureImg from "@/assets/images/hero-agriculture.jpg";

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"country" | "form">("country");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const refCode = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get("ref") || "";
    } catch {
      return "";
    }
  }, []);

  const [referralCode, setReferralCode] = useState(refCode);

  const registerMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      password: string;
      country: string;
      referralCode?: string;
    }) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Échec de l'inscription";
        try {
          const error = await res.json();
          message = error.message || message;
        } catch {}
        throw new Error(message);
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Compte créé avec succès ! Connectez-vous." });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setStep("form");
  }, []);

  const handleBack = useCallback(() => {
    setStep("country");
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstName.trim() || firstName.trim().length < 2) {
      toast({ variant: "destructive", title: "Erreur", description: "Le prénom doit contenir au moins 2 caractères" });
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom doit contenir au moins 2 caractères" });
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      toast({ variant: "destructive", title: "Erreur", description: "Numéro de téléphone invalide (min. 8 chiffres)" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    if (!selectedCountry) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner un pays" });
      return;
    }

    registerMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      country: selectedCountry.name,
      referralCode: referralCode.trim() || undefined,
    });
  }, [firstName, lastName, phoneNumber, password, selectedCountry, referralCode, registerMutation, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950" data-testid="register-page">
      <div className="relative w-full h-40 sm:h-48 overflow-hidden">
        <img
          src={heroAgricultureImg}
          alt="Champs agricoles verdoyants"
          className="w-full h-full object-cover"
          loading="eager"
          data-testid="img-hero-agriculture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-green-900/50 to-green-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 mb-2 shadow-lg">
            <span className="text-xl">🌱</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">GREENIX</h1>
          <p className="text-green-200/90 text-xs sm:text-sm font-medium mt-1">Investissement Agricole Durable</p>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/25 border border-amber-400/30 text-amber-200 px-3 py-1.5 rounded-full text-xs font-bold mt-2">
            <Gift className="w-3.5 h-3.5" />
            Bonus d'inscription : 700 FCFA
          </div>
        </div>
      </div>

      <div className="px-4 py-5 pb-12">
        <div className="w-full max-w-md mx-auto">

          {refCode && step === "country" && (
            <div className="flex items-center gap-2 bg-green-800/60 border border-green-600/30 rounded-xl px-4 py-3 mb-4" data-testid="referral-badge">
              <Gift className="w-4 h-4 text-green-300 flex-shrink-0" />
              <p className="text-green-200 text-sm font-medium">
                Invité avec le code : <span className="text-white font-bold">{refCode}</span>
              </p>
            </div>
          )}

          <div style={{ display: step === "country" ? "block" : "none" }}>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">D'où venez-vous ?</h2>
              <p className="text-green-300/70 text-sm">Choisissez votre pays pour créer votre compte</p>
            </div>

            <div className="grid grid-cols-2 gap-3" data-testid="country-grid">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="bg-green-800/50 border-2 border-green-600/30 hover:bg-green-700/60 hover:border-green-500/50 rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-colors"
                  data-testid={`country-select-${country.code}`}
                >
                  <span className="text-4xl leading-none">{country.flag}</span>
                  <span className="text-white text-sm font-bold">{country.name}</span>
                  <span className="text-green-300 text-xs font-semibold">{country.phonePrefix}</span>
                </button>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link href="/login">
                <span className="text-sm text-green-300/60 hover:text-green-200 cursor-pointer" data-testid="link-login-country">
                  Déjà un compte ? <strong className="text-green-300">Se connecter</strong>
                </span>
              </Link>
            </div>
          </div>

          <div style={{ display: step === "form" ? "block" : "none" }}>
            {selectedCountry && (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-3 w-full bg-green-800/50 border-2 border-green-600/30 rounded-2xl p-4 mb-4 hover:bg-green-700/60 transition-colors"
                  data-testid="button-change-country"
                >
                  <span className="text-3xl">{selectedCountry.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold">{selectedCountry.name}</p>
                    <p className="text-green-300 text-sm font-semibold">{selectedCountry.phonePrefix}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-300/50 text-sm font-medium">
                    <ArrowLeft className="w-3 h-3" />
                    Changer
                  </div>
                </button>

                <form onSubmit={handleSubmit} className="bg-green-800/40 rounded-2xl p-5 border border-green-600/20 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-green-200/80 text-xs font-bold uppercase tracking-wider mb-1.5">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jean"
                        autoComplete="given-name"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 focus:outline-none px-4"
                        data-testid="input-firstname"
                      />
                    </div>
                    <div>
                      <label className="block text-green-200/80 text-xs font-bold uppercase tracking-wider mb-1.5">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont"
                        autoComplete="family-name"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 focus:outline-none px-4"
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-green-200/80 text-xs font-bold uppercase tracking-wider mb-1.5">Téléphone</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 bg-green-700/50 border border-green-600/40 rounded-xl px-3 h-12 flex-shrink-0" data-testid="phone-prefix">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-white font-bold text-sm">{selectedCountry.phonePrefix}</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60 pointer-events-none" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="90 00 00 00"
                          autoComplete="tel"
                          inputMode="tel"
                          className="w-full h-12 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 focus:outline-none pl-10 pr-4"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-green-200/80 text-xs font-bold uppercase tracking-wider mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 focus:outline-none pl-10 pr-12"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/60 hover:text-green-300 transition-colors"
                        data-testid="toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-green-200/80 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Code parrainage <span className="text-green-400/40 normal-case">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60 pointer-events-none" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Code parrain"
                        autoComplete="off"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/10 text-base text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 focus:outline-none pl-10 pr-4"
                        data-testid="input-referral"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-[52px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-base font-bold shadow-lg shadow-green-900/40 mt-1"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2 w-5 h-5" />
                    ) : (
                      <>
                        Créer mon compte
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-4 pb-6">
                  <Link href="/login">
                    <Button variant="ghost" className="text-green-300/70 hover:text-green-200 hover:bg-white/5 font-bold rounded-xl h-12 w-full" data-testid="link-login">
                      Déjà un compte ? Se connecter
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
