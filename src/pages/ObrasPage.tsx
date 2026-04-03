import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, statusConfig, type ObraStatus } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";



export default function ObrasPage() {
  const { obras, addObra } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") as ObraStatus | "todos" | null;
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ObraStatus | "todos">(statusParam || "todos");
  const [isNewObraOpen, setIsNewObraOpen] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [chaveInput, setChaveInput] = useState("");
  const [chaveErro, setChaveErro] = useState("");

  // New Obra Form State
  const [newObra, setNewObra] = useState({
    nome: '',
    codigo: '',
    cliente: '',
    endereco: '',
    dataInicio: '',
    dataPrevistaConclusao: '',
    valorTotal: 0,
    responsavelTecnico: '',
    status: 'planejamento' as ObraStatus,
    areaConstruida: 0,
    tipoObra: 'residencial' as 'residencial' | 'comercial' | 'industrial',
    descricao: ''
  });

  // Update URL params when status changes
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

  const handleCreateObra = (e: React.FormEvent) => {
    e.preventDefault();
    const obraData = {
      ...newObra,
      valorTotal: newObra.valorTotal || 0,
      areaConstruida: newObra.areaConstruida || 0,
    };
    addObra(obraData);
    setIsNewObraOpen(false);
    setNewObra({
      nome: '', codigo: '', cliente: '', endereco: '', dataInicio: '', dataPrevistaConclusao: '',
      valorTotal: 0, responsavelTecnico: '', status: 'planejamento', areaConstruida: 0,
      tipoObra: 'residencial', descricao: ''
    });
  };

  const handleNovaObraClick = () => {
    const planoAtivo = verificarPlanoAtivo();
    const limite = planoAtivo ? Infinity : 2;
    
    if (obras.length >= limite) {
      setShowActivationDialog(true);
    } else {
      setIsNewObraOpen(true);
    }
  };

  const ativarPlano = () => {
    if (chaveInput.trim().toUpperCase() === CHAVE_CORRETA) {
      localStorage.setItem(PLAN_KEY, 'premium');
      localStorage.setItem(ACTIVATION_KEY, chaveInput.trim());
      setShowActivationDialog(false);
      setChaveInput("");
      setChaveErro("");
      setIsNewObraOpen(true);
    } else {
      setChaveErro("Chave de ativação inválida. Entre em contato para obter sua chave.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Obras</h1>
          <p className="text-muted-foreground mt-1">{obras.length} obras cadastradas</p>
        </div>
        <Dialog open={isNewObraOpen} onOpenChange={setIsNewObraOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNovaObraClick} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Nova obra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar nova obra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateObra} className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código da Obra</Label>
                <Input value={newObra.codigo} onChange={e => setNewObra({...newObra, codigo: e.target.value})} placeholder="Ex: OBR-2024-001" />
              </div>
              <div className="space-y-2">
                <Label>Nome da Obra</Label>
                <Input value={newObra.nome} onChange={e => setNewObra({...newObra, nome: e.target.value})} placeholder="Ex: Edifício Aurora" />
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={newObra.cliente} onChange={e => setNewObra({...newObra, cliente: e.target.value})} placeholder="Nome do cliente" />
              </div>
              <div className="space-y-2">
                <Label>Responsável técnico</Label>
                <Input value={newObra.responsavelTecnico} onChange={e => setNewObra({...newObra, responsavelTecnico: e.target.value})} placeholder="Eng. responsável" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Endereço</Label>
                <Input value={newObra.endereco} onChange={e => setNewObra({...newObra, endereco: e.target.value})} placeholder="Endereço completo" />
              </div>
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Input type="date" value={newObra.dataInicio} onChange={e => setNewObra({...newObra, dataInicio: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Data prevista de conclusão</Label>
                <Input type="date" value={newObra.dataPrevistaConclusao} onChange={e => setNewObra({...newObra, dataPrevistaConclusao: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Valor Planejado (R$)</Label>
                <Input type="number" min="0" step="0.01" value={newObra.valorTotal || ''} onChange={e => setNewObra({...newObra, valorTotal: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Área construída (m²)</Label>
                <Input type="number" min="0" step="0.01" value={newObra.areaConstruida || ''} onChange={e => setNewObra({...newObra, areaConstruida: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de obra</Label>
                <Select value={newObra.tipoObra} onValueChange={v => setNewObra({...newObra, tipoObra: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newObra.status} onValueChange={v => setNewObra({...newObra, status: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição / escopo</Label>
                <Textarea value={newObra.descricao} onChange={e => setNewObra({...newObra, descricao: e.target.value})} placeholder="Detalhes do projeto..." className="resize-none" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewObraOpen(false)}>Cancelar</Button>
                <Button type="submit">Avançar e Criar Obra</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <Link
            key={obra.id}
            to={`/obras/${obra.id}`}
            className="stat-card flex flex-col gap-4 group"
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
              Plano Premium Necessário
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="text-center space-y-2">
              <CreditCard className="w-12 h-12 mx-auto text-primary" />
              <p className="text-muted-foreground">
                Você atingiu o limite de 2 obras do plano gratuito.
              </p>
              <p className="text-sm text-muted-foreground">
                Para continuar adicionando obras, Ative o plano premium.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Chave de Ativação</Label>
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
    </div>
  );
}
