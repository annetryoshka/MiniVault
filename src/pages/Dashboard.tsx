import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Search, LogOut, Shield, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import CredentialDialog from "@/components/CredentialDialog";
import CredentialDetail from "@/components/CredentialDetail";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface Credential {
  id: string;
  service_name: string;
  account_username: string;
  password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = "http://localhost:3000";

const Dashboard = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [detailCredential, setDetailCredential] = useState<Credential | null>(null);

  const fetchCredentials = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/credentials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Error al cargar credenciales:", response.statusText);
        toast.error("Error al cargar credenciales");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const mapped: Credential[] = (data || []).map((item: any) => ({
        id: String(item.id_c),
        service_name: item.service,
        account_username: item.account_username,
        password: "", // la API no devuelve la contraseña en texto plano
        url: item.url,
        notes: item.notas,
        created_at: item.created_date,
        updated_at: item.update_date,
      }));

      setCredentials(mapped);
    } catch (error) {
      console.error("Error al cargar credenciales:", error);
      toast.error("Error al cargar credenciales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/credentials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Error al eliminar credencial:", response.statusText);
        toast.error("Error al eliminar");
        return;
      }

      toast.success("Credencial eliminada");
      fetchCredentials();
    } catch (error) {
      console.error("Error al eliminar credencial:", error);
      toast.error("Error al eliminar");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await supabase.auth.signOut();
  };

  const filtered = credentials.filter((c) =>
    c.service_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gradient">KeyVault</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setEditingCredential(null); setDialogOpen(true); }} className="gradient-primary text-primary-foreground font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Nueva Credencial
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {search ? "No se encontraron resultados" : "Aún no tienes credenciales guardadas"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden animate-fade-in">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Servicio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Usuario/Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">URL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Última Actualización</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cred, i) => (
                    <tr key={cred.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="px-4 py-3 font-medium">{cred.service_name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-sm">{cred.account_username}</td>
                      <td className="px-4 py-3">
                        {cred.url ? (
                          <a href={cred.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                            <ExternalLink className="h-3 w-3" /> Abrir
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(cred.updated_at), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setDetailCredential(cred)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingCredential(cred); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cred.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((cred) => (
                <div key={cred.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{cred.service_name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(cred.updated_at), "dd/MM/yy")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{cred.account_username}</p>
                  <div className="flex gap-1 pt-1">
                    <Button variant="ghost" size="sm" onClick={() => setDetailCredential(cred)}><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingCredential(cred); setDialogOpen(true); }}><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
                    <Button variant="ghost" size="sm" className="hover:text-destructive" onClick={() => handleDelete(cred.id)}><Trash2 className="h-4 w-4 mr-1" /> Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <CredentialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        credential={editingCredential}
        onSaved={fetchCredentials}
      />

      <CredentialDetail
        credential={detailCredential}
        onClose={() => setDetailCredential(null)}
      />
    </div>
  );
};

export default Dashboard;
