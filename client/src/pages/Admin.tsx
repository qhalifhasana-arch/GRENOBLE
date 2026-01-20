import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Transaction, Setting } from "@shared/schema";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Ban, Unlock, ShieldCheck, UserPlus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: adminStats } = useQuery<{ registrationsToday: number; depositsToday: number }>({
    queryKey: [api.admin.stats.path],
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: [api.admin.users.path],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: [api.admin.transactions.path],
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.transactions.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Transaction mise à jour" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      toast({ title: "Utilisateur mis à jour" });
    },
  });

  if (loadingUsers || loadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingDeposits = transactions?.filter(tx => tx.type === 'deposit' && tx.status === 'pending') || [];
  const pendingWithdrawals = transactions?.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending') || [];
  const processedTransactions = transactions?.filter(tx => tx.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panneau Admin</h1>
            <p className="text-muted-foreground">Gestion de la plateforme GREENIX</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Retour au Dashboard</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inscriptions d'Aujourd'hui</p>
                  <h3 className="text-3xl font-bold mt-1">{adminStats?.registrationsToday || 0}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <UserPlus className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dépôts d'Aujourd'hui</p>
                  <h3 className="text-3xl font-bold mt-1">{adminStats?.depositsToday || 0}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
            <TabsTrigger value="deposits">Dépôts ({pendingDeposits.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Retraits ({pendingWithdrawals.length})</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Validation des Dépôts</CardTitle>
                <CardDescription>Validez les nouveaux investissements</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable 
                  transactions={pendingDeposits} 
                  onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Validation des Retraits</CardTitle>
                <CardDescription>Gérez les demandes de retrait Mobile Money</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable 
                  transactions={pendingWithdrawals} 
                  onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Utilisateurs</CardTitle>
                <CardDescription>Gérez les comptes et les permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Solde</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.firstName} {u.lastName}</TableCell>
                        <TableCell>{u.phoneNumber}</TableCell>
                        <TableCell>{u.balance.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          {u.isAdmin ? <Badge className="bg-purple-100 text-purple-700">Admin</Badge> : 'Utilisateur'}
                        </TableCell>
                        <TableCell>
                          {u.isBanned ? <Badge variant="destructive">Banni</Badge> : <Badge className="bg-green-100 text-green-700">Actif</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2"
                              onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isBanned: !u.isBanned } })}
                            >
                              {u.isBanned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4 text-red-500" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2"
                              onClick={() => updateUserMutation.mutate({ id: u.id, updates: { withdrawalBlocked: !u.withdrawalBlocked } })}
                              title={u.withdrawalBlocked ? "Débloquer Retraits" : "Bloquer Retraits"}
                            >
                              <ShieldCheck className={`w-4 h-4 ${u.withdrawalBlocked ? 'text-red-500' : 'text-green-500'}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique Complet</CardTitle>
                <CardDescription>Toutes les transactions traitées</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={processedTransactions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TransactionTable({ transactions, onUpdate }: { transactions: Transaction[], onUpdate?: (id: number, status: string) => void }) {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground italic">
        Aucune transaction à afficher
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Util.</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Méthode / Détails</TableHead>
          <TableHead>Statut</TableHead>
          {onUpdate && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium">{tx.userId}</TableCell>
            <TableCell>
              <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
              </Badge>
            </TableCell>
            <TableCell className="font-bold">{tx.amount.toLocaleString()} FCFA</TableCell>
            <TableCell>
              <div className="text-xs">
                <span className="font-semibold">{tx.method}</span>
                {tx.mobileDetails && <div className="text-muted-foreground mt-1">{tx.mobileDetails}</div>}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                className={
                  tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  'bg-red-100 text-red-700'
                }
              >
                {tx.status}
              </Badge>
            </TableCell>
            {onUpdate && (
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 h-8 px-2"
                    onClick={() => onUpdate(tx.id, 'completed')}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8 px-2"
                    onClick={() => onUpdate(tx.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}