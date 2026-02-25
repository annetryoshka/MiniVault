import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { Credential } from "@/pages/Dashboard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credential: Credential | null;
  onSaved: () => void;
}

const CredentialDialog = ({ open, onOpenChange, credential, onSaved }: Props) => {
  const [serviceName, setServiceName] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (credential) {
      setServiceName(credential.service_name);
      setAccountUsername(credential.account_username);
      setPassword(credential.password);
      setUrl(credential.url || "");
      setNotes(credential.notes || "");
    } else {
      setServiceName("");
      setAccountUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
    }
    setErrors({});
    setShowPassword(false);
  }, [credential, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!serviceName.trim()) e.serviceName = "Nombre del servicio obligatorio";
    if (!accountUsername.trim()) e.accountUsername = "Usuario/email obligatorio";
    if (!password.trim()) e.password = "Contraseña obligatoria";
    if (url && !/^https?:\/\/.+/.test(url)) e.url = "URL inválida (debe empezar con http)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("No autenticado"); setLoading(false); return; }

    const payload = {
      service_name: serviceName.trim(),
      account_username: accountUsername.trim(),
      password: password,
      url: url.trim() || null,
      notes: notes.trim() || null,
      user_id: user.id,
    };

    let error;
    if (credential) {
      ({ error } = await supabase.from("credentials").update(payload).eq("id", credential.id));
    } else {
      ({ error } = await supabase.from("credentials").insert(payload));
    }

    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success(credential ? "Credencial actualizada" : "Credencial creada");
      onOpenChange(false);
      onSaved();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">{credential ? "Editar Credencial" : "Nueva Credencial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del Servicio *</Label>
            <Input placeholder='Ej. "Netflix"' value={serviceName} onChange={(e) => setServiceName(e.target.value)} className={errors.serviceName ? "border-destructive" : ""} />
            {errors.serviceName && <p className="text-sm text-destructive">{errors.serviceName}</p>}
          </div>

          <div className="space-y-2">
            <Label>Usuario/Email del Servicio *</Label>
            <Input placeholder="correo@ejemplo.com" value={accountUsername} onChange={(e) => setAccountUsername(e.target.value)} className={errors.accountUsername ? "border-destructive" : ""} />
            {errors.accountUsername && <p className="text-sm text-destructive">{errors.accountUsername}</p>}
          </div>

          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pr-10 font-mono ${errors.password ? "border-destructive" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label>URL <span className="text-muted-foreground">(opcional)</span></Label>
            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className={errors.url ? "border-destructive" : ""} />
            {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-2">
            <Label>Notas <span className="text-muted-foreground">(opcional)</span></Label>
            <Textarea placeholder="Notas adicionales..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {credential ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialDialog;
