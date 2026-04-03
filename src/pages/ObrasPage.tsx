import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, statusConfig, type ObraStatus } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Lock, CreditCard, Edit2, Trash2, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ObraFormDialog from "@/components/ObraFormDialog";



export default function ObrasPage() {
  const { obras, addObra, updateObra, deleteObra } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") as ObraStatus | "todos" | null;
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ObraStatus | "todos">(statusParam || "todos");
  const [isNewObraOpen, setIsNewObraOpen] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [chaveInput, setChaveInput] = useState("");
  const [chaveErro, setChaveErro] = useState("");
  const [editingObraId, setEditingObraId] = useState<string | null>(null);
  const [deletingObraId, setDeletingObraId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = (s: ObraStatus | "todos") => {
    setStatusFilter(s);
    if (s === "todos") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", s);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filtered = useMemo(() => {
    const list = obras.filter((o) => {
      const matchSearch = o.nome.toLowerCase().includes(search.toLowerCase()) ||
        o.codigo.toLowerCase().includes(search.toLowerCase()) ||
        o.cliente.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });

    // Ordenação: obras que concluem antes (data menor) ficam no topo.
    return list.sort((a, b) => new Date(a.dataPrevistaConclusao).getTime() - new Date(b.dataPrevistaConclusao).getTime());
  }, [obras, search, statusFilter]);

  const handleCreateObra = (data: any) => {
    addObra(data);
    setIsNewObraOpen(false);
  };

  const handleEditObra = (id: string, data: any) => {
    updateObra(id, data);
    setEditingObraId(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingObraId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingObraId) {
      deleteObra(deletingObraId);
      setShowDeleteConfirm(false);
      setDeletingObraId(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Obras</h1>
          <p className="text-muted-foreground mt-1">{obras.length} obras cadastradas</p>
        </div>
        <ObraFormDialog
          mode="create"
          open={isNewObraOpen}
          onOpenChange={setIsNewObraOpen}
          onSubmit={handleCreateObra}
          trigger={
            <Button onClick={handleNovaObraClick} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Nova obra
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["todos", "em_andamento", "planejamento", "pausada", "finalizada"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s === "todos" ? "Todos" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((obra) => (
          <div key={obra.id} className="stat-card flex flex-col gap-4 group relative">
            <Link
              to={`/obras/${obra.id}`}
              className="flex flex-col gap-4 h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{obra.codigo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[obra.status].color}`}>
                    {statusConfig[obra.status].label}
                  </span>
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{obra.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">{obra.cliente}</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold">{obra.progresso}%</span>
                </div>
                <Progress value={obra.progresso} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Custo Realizado</p>
                  <p className="text-sm font-semibold">{formatCurrency(obra.custoRealizado)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor total</p>
                  <p className="text-sm font-semibold">{formatCurrency(obra.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Área</p>
                  <p className="text-sm font-semibold">{obra.areaConstruida.toLocaleString('pt-BR')} m²</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-semibold capitalize">{obra.tipoObra}</p>
                </div>
              </div>
            </Link>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <ObraFormDialog
                mode="edit"
                initialData={obra}
                open={editingObraId === obra.id}
                onOpenChange={(open) => setEditingObraId(open ? obra.id : null)}
                onSubmit={(data) => handleEditObra(obra.id, data)}
                trigger={
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                    title="Editar obra"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                }
              />
              <button
                onClick={() => handleDeleteClick(obra.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium transition-colors"
                title="Excluir obra"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma obra encontrada.</p>
        </div>
      )}

      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Plano Premium necessário
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="text-center space-y-2">
              <CreditCard className="w-12 h-12 mx-auto text-primary" />
              <p className="text-muted-foreground">
                Você atingiu o limite de 2 obras do plano gratuito.
              </p>
              <p className="text-sm text-muted-foreground">
                Para continuar adicionando obras, ative o plano premium.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Chave de ativação</Label>
              <Input 
                value={chaveInput} 
                onChange={e => setChaveInput(e.target.value)}
                placeholder="Digite sua chave de ativação"
                onKeyDown={e => e.key === 'Enter' && ativarPlano()}
              />
              {chaveErro && <p className="text-sm text-destructive">{chaveErro}</p>}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowActivationDialog(false);
                setChaveInput("");
                setChaveErro("");
              }}>
                Cancelar
              </Button>
              <Button onClick={ativarPlano}>
                Ativar Plano Premium
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm text-muted-foreground">
              Todos os dados associados a esta obra (cronograma, despesas, diários, documentos) também serão removidos.
            </p>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingObraId(null);
              }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Excluir Obra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
