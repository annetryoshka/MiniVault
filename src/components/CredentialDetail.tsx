import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Credential } from "@/pages/Dashboard";

interface Props {
  credential: Credential | null;
  onClose: () => void;
}

const CredentialDetail = ({ credential, onClose }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!credential) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <Dialog open={!!credential} onOpenChange={() => { onClose(); setShowPassword(false); }}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">{credential.service_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DetailRow label="Usuario/Email">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{credential.account_username}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(credential.account_username, "Usuario")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DetailRow>

          <DetailRow label="Contraseña">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {showPassword ? credential.password : "••••••••••"}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(credential.password, "Contraseña")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DetailRow>

          {credential.url && (
            <DetailRow label="URL">
              <a href={credential.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                <ExternalLink className="h-3.5 w-3.5" /> {credential.url}
              </a>
            </DetailRow>
          )}

          {credential.notes && (
            <DetailRow label="Notas">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{credential.notes}</p>
            </DetailRow>
          )}

          <DetailRow label="Última actualización">
            <span className="text-sm text-muted-foreground">
              {format(new Date(credential.updated_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
            </span>
          </DetailRow>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    {children}
  </div>
);

export default CredentialDetail;
