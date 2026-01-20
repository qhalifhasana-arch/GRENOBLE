import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="bg-amber-100 p-6 rounded-full mb-6">
         <AlertTriangle className="h-12 w-12 text-amber-600" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-display mb-2">404</h1>
      <p className="text-muted-foreground mb-8">La page que vous recherchez n'existe pas.</p>
      
      <Link href="/">
        <Button className="rounded-xl px-8 h-12 font-semibold">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
}
