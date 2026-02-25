import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Deposit from "@/pages/Deposit";
import Withdraw from "@/pages/Withdraw";
import Team from "@/pages/Team";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-400 font-semibold">Chargement...</p>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Erreur d'affichage</h2>
            <p className="text-sm text-gray-500 mb-4">Une erreur est survenue. Veuillez rafraîchir la page.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
              data-testid="button-reload"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ component: Comp, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary>
      <Comp />
    </ErrorBoundary>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Register} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/products">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/deposit">
        <ProtectedRoute component={Deposit} />
      </Route>
      <Route path="/withdraw">
        <ProtectedRoute component={Withdraw} />
      </Route>
      <Route path="/team">
        <ProtectedRoute component={Team} />
      </Route>
      <Route path="/account">
        <ProtectedRoute component={Account} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={Admin} adminOnly />
      </Route>
      <Route path="/support">
        <ProtectedRoute component={Support} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
