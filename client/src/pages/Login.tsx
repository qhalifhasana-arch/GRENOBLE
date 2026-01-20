import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Lock } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function Login() {
  const { login } = useAuth();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-extrabold text-primary">GREENIX</h1>
           <p className="text-muted-foreground font-medium">Connexion Sécurisée</p>
        </div>

        <Alert className="bg-blue-50 border-blue-100 text-blue-800">
           <Lock className="h-4 w-4" />
           <AlertDescription>
             Seules les personnes ayant créé un compte peuvent se connecter.
           </AlertDescription>
        </Alert>

        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-center text-xl">Bienvenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+228..." {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white py-6" />
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
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white py-6" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-primary/30 mt-6"
                  disabled={login.isPending}
                >
                  {login.isPending ? <Loader2 className="animate-spin mr-2" /> : "Se connecter"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <Link href="/">
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  Pas encore de compte ? <strong className="text-primary">Inscrivez-vous</strong>
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
