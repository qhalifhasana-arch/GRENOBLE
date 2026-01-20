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
import { Loader2, CheckCircle, XCircle, Ban, Unlock, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dépôts & Retraits</CardTitle>
                <CardDescription>Validez ou refusez les demandes des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">ID: {tx.userId}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                            {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </Badge>
                        </TableCell>
                        <TableCell>{tx.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>{tx.method}</TableCell>
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
                        <TableCell>
                          {tx.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                onClick={() => updateTransactionMutation.mutate({ id: tx.id, status: 'completed' })}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-8 px-2"
                                onClick={() => updateTransactionMutation.mutate({ id: tx.id, status: 'rejected' })}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
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
        </Tabs>
      </div>
    </div>
  );
}