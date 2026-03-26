import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export default function DocumentosPage() {
  const { obras, documentos, addDocumento, deleteDocumento } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoDoc, setNovoDoc] = useState({ obraId: "", nome: "", arquivo: null as File | null });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDoc.obraId || !novoDoc.arquivo) return;

    // Simulate upload and size parsing
    const size = novoDoc.arquivo.size;
    const sizeString = size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : `${(size / 1024).toFixed(0)} KB`;
    
    addDocumento({
      obraId: novoDoc.obraId,
      nome: novoDoc.nome || novoDoc.arquivo.name,
      tamanho: sizeString,
      tipo: novoDoc.arquivo.type || "Desconhecido",
      dataUpload: new Date().toISOString()
    });

    toast.success("Documento anexado com sucesso!");
    setIsDialogOpen(false);
    setNovoDoc({ obraId: "", nome: "", arquivo: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Documentos</h1>
          <p className="text-muted-foreground mt-1">Gestão de documentos das obras ({documentos.length} arquivos)</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Anexar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anexar Novo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Obra Relacionada *</Label>
                <Select required value={novoDoc.obraId} onValueChange={v => setNovoDoc({...novoDoc, obraId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {obras.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.codigo} - {o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome Alternativo (Opcional)</Label>
                <Input value={novoDoc.nome} onChange={e => setNovoDoc({...novoDoc, nome: e.target.value})} placeholder="Ex: Planta Baixa Revisada" />
              </div>
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <Input required type="file" onChange={e => setNovoDoc({...novoDoc, arquivo: e.target.files?.[0] || null})} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit">Fazer Upload</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        {documentos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum documento anexado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium text-muted-foreground">Nome do Arquivo</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Obra</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Tamanho</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map(doc => {
                  const obra = obras.find(o => o.id === doc.obraId);
                  return (
                    <tr key={doc.id} className="border-b border-border/50 last:border-0 hover:bg-accent/10">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-medium">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">{doc.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {obra ? <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{obra.codigo}</span> : "-"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{doc.tamanho}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{formatDate(doc.dataUpload)}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center" title="Baixar (Simulação)">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDocumento(doc.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive inline-flex items-center" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
