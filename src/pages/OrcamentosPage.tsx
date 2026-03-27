import { useAppContext } from "@/contexts/AppContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, CheckCircle, Clock, Phone, TrendingUp, Users, FileText, Lock, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/data/mockData";

export type StatusOrcamento = 'novo' | 'em_negociacao' | 'aprovado' | 'reprovado' | 'expirado' | 'convertido';

export interface Orcamento {
  id: string;
  cliente: string;
  telefone: string;
  email: string;
  obraId?: string;
  valor: number;
  dataCriacao: string;
  dataValidade: string;
  descricao: string;
  status: StatusOrcamento;
  observacoes: string;
  diasSemContato: number;
}

const PLAN_KEY = 'obra_plano_ativo';
const CHAVE_CORRETA = 'OBRA-CERTA-2024';

function verificarPlanoAtivo(): boolean {
  const plano = localStorage.getItem(PLAN_KEY);
  return plano === 'premium';
}

export default function OrcamentosPage() {
  const { addObra, obras } = useAppContext();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    const saved = localStorage.getItem('orcamentos');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNewOrcamentoOpen, setIsNewOrcamentoOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusOrcamento | "todos">("todos");
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [chaveInput, setChaveInput] = useState("");
  const [chaveErro, setChaveErro] = useState("");

  const [novoOrcamento, setNovoOrcamento] = useState({
    cliente: '',
    telefone: '',
    email: '',
    valor: 0,
    dataValidade: '',
    descricao: '',
    observacoes: ''
  });

  const saveOrcamentos = (newOrcamentos: Orcamento[]) => {
    setOrcamentos(newOrcamentos);
    localStorage.setItem('orcamentos', JSON.stringify(newOrcamentos));
  };

  const handleCreateOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    const orcamento: Orcamento = {
      id: crypto.randomUUID(),
      ...novoOrcamento,
      dataCriacao: new Date().toISOString().split('T')[0],
      status: 'novo',
      diasSemContato: 0
    };
    saveOrcamentos([...orcamentos, orcamento]);
    setIsNewOrcamentoOpen(false);
    setNovoOrcamento({
      cliente: '',
      telefone: '',
      email: '',
      valor: 0,
      dataValidade: '',
      descricao: '',
      observacoes: ''
    });
  };

  const updateStatus = (id: string, status: StatusOrcamento) => {
    const updated = orcamentos.map(o => o.id === id ? { ...o, status } : o);
    saveOrcamentos(updated);
  };

  const deleteOrcamento = (id: string) => {
    saveOrcamentos(orcamentos.filter(o => o.id !== id));
  };

  const handleNovaOrcamentoClick = () => {
    const planoAtivo = verificarPlanoAtivo();
    const limite = planoAtivo ? Infinity : 20;
    
    if (orcamentos.length >= limite) {
      setShowActivationDialog(true);
    } else {
      setIsNewOrcamentoOpen(true);
    }
  };

  const ativarPlano = () => {
    if (chaveInput.trim().toUpperCase() === CHAVE_CORRETA) {
      localStorage.setItem(PLAN_KEY, 'premium');
      setShowActivationDialog(false);
      setChaveInput("");
      setChaveErro("");
      setIsNewOrcamentoOpen(true);
    } else {
      setChaveErro("Chave de ativação inválida. Entre em contato para obter sua chave.");
    }
  };

  const leadsPendentes = orcamentos.filter(o => 
    o.status === 'novo' || o.status === 'em_negociacao'
  );

  const leadsConvertidos = orcamentos.filter(o => 
    o.status === 'convertido' || o.status === 'aprovado'
  );

  const orcamentosExpirados = orcamentos.filter(o => {
    if (!o.dataValidade) return false;
    return new Date(o.dataValidade) < new Date() && o.status !== 'convertido' && o.status !== 'reprovado';
  });

  const orcamentosFiltrados = orcamentos.filter(o => 
    statusFilter === "todos" || o.status === statusFilter
  );

  const getStatusLabel = (status: StatusOrcamento) => {
    const labels: Record<StatusOrcamento, string> = {
      novo: 'Novo',
      em_negociacao: 'Em Negociação',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      expirado: 'Expirado',
      convertido: 'Convertido'
    };
    return labels[status];
  };

  const getStatusColor = (status: StatusOrcamento) => {
    const colors: Record<StatusOrcamento, string> = {
      novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      em_negociacao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      aprovado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      reprovado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      expirado: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      convertido: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
    };
    return colors[status];
  };

  const getAlerta = (orcamento: Orcamento) => {
    const diasSemContato = orcamento.diasSemContato;
    
    if (orcamento.status === 'expirado') {
      return { tipo: 'expirado', msg: 'Orçamento expirado', urgente: true };
    }
    if (diasSemContato >= 7) {
      return { tipo: 'urgente', msg: `${diasSemContato} dias sem contato`, urgente: true };
    }
    if (diasSemContato >= 3) {
      return { tipo: 'atencao', msg: `${diasSemContato} dias sem contato`, urgente: false };
    }
    return null;
  };

  const valorTotalConvertido = orcamentos
    .filter(o => o.status === 'convertido' || o.status === 'aprovado')
    .reduce((acc, o) => acc + o.valor, 0);

  const valorTotalPendente = orcamentos
    .filter(o => o.status === 'novo' || o.status === 'em_negociacao')
    .reduce((acc, o) => acc + o.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">{orcamentos.length} orçamentos cadastrados</p>
        </div>
        <Dialog open={isNewOrcamentoOpen} onOpenChange={setIsNewOrcamentoOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNovaOrcamentoClick} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrcamento} className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Input required value={novoOrcamento.cliente} onChange={e => setNovoOrcamento({...novoOrcamento, cliente: e.target.value})} placeholder="Nome do cliente" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={novoOrcamento.telefone} onChange={e => setNovoOrcamento({...novoOrcamento, telefone: e.target.value})} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={novoOrcamento.email} onChange={e => setNovoOrcamento({...novoOrcamento, email: e.target.value})} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" min="0" step="0.01" value={novoOrcamento.valor || ''} onChange={e => setNovoOrcamento({...novoOrcamento, valor: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input type="date" value={novoOrcamento.dataValidade} onChange={e => setNovoOrcamento({...novoOrcamento, dataValidade: e.target.value})} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={novoOrcamento.descricao} onChange={e => setNovoOrcamento({...novoOrcamento, descricao: e.target.value})} placeholder="Descrição do orçamento..." className="resize-none" rows={3} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Observações</Label>
                <Textarea value={novoOrcamento.observacoes} onChange={e => setNovoOrcamento({...novoOrcamento, observacoes: e.target.value})} placeholder="Observações..." className="resize-none" rows={2} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewOrcamentoOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Orçamento</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {orcamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Orçamento" para criar o primeiro.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className={leadsPendentes.length > 0 ? "border-yellow-500" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Leads Pendentes</CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leadsPendentes.length}</div>
                <p className="text-xs text-muted-foreground">Aguardando retorno</p>
              </CardContent>
            </Card>

            <Card className={orcamentosExpirados.length > 0 ? "border-red-500" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expirados</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orcamentosExpirados.length}</div>
                <p className="text-xs text-muted-foreground">Precisa revisar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Convertidos</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leadsConvertidos.length}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(valorTotalConvertido)} em contratos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Negociação</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(valorTotalPendente)}</div>
                <p className="text-xs text-muted-foreground">Potencial</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="todos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="convertidos">Convertidos</TabsTrigger>
              <TabsTrigger value="alertas">Alertas ({leadsPendentes.filter(o => getAlerta(o)?.urgente).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["todos", "novo", "em_negociacao", "aprovado", "convertido", "reprovado", "expirado"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {s === "todos" ? "Todos" : getStatusLabel(s as StatusOrcamento)}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {orcamentosFiltrados.map(orcamento => {
                  const alerta = getAlerta(orcamento);
                  return (
                    <Card key={orcamento.id} className={alerta?.urgente ? "border-red-500 dark:border-red-700" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{orcamento.cliente}</CardTitle>
                            <p className="text-xs text-muted-foreground">{formatDate(orcamento.dataCriacao)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {alerta && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {alerta.msg}
                              </Badge>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                              {getStatusLabel(orcamento.status)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-3">
                          {orcamento.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{orcamento.telefone}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Valor</p>
                            <p className="text-sm font-semibold">{formatCurrency(orcamento.valor)}</p>
                          </div>
                          {orcamento.dataValidade && (
                            <div>
                              <p className="text-xs text-muted-foreground">Validade</p>
                              <p className="text-sm">{formatDate(orcamento.dataValidade)}</p>
                            </div>
                          )}
                        </div>
                        {orcamento.descricao && (
                          <p className="text-sm text-muted-foreground">{orcamento.descricao}</p>
                        )}
                        <div className="flex gap-2 pt-2 border-t">
                          <Select value={orcamento.status} onValueChange={(v) => updateStatus(orcamento.id, v as StatusOrcamento)}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="novo">Novo</SelectItem>
                              <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="convertido">Convertido em Obra</SelectItem>
                              <SelectItem value="reprovado">Reprovado</SelectItem>
                              <SelectItem value="expirado">Expirado</SelectItem>
                            </SelectContent>
                          </Select>
                          {orcamento.status === 'aprovado' && (
                            <Button size="sm" onClick={() => {
                              const novaObra = {
                                nome: `Obra - ${orcamento.cliente}`,
                                codigo: `OBR-${new Date().getFullYear()}-${String(orcamentos.length + 1).padStart(3, '0')}`,
                                cliente: orcamento.cliente,
                                endereco: '',
                                dataInicio: new Date().toISOString().split('T')[0],
                                dataPrevistaConclusao: '',
                                valorTotal: orcamento.valor,
                                responsavelTecnico: '',
                                status: 'planejamento' as const,
                                areaConstruida: 0,
                                tipoObra: 'residencial' as const,
                                descricao: orcamento.descricao
                              };
                              addObra(novaObra);
                              updateStatus(orcamento.id, 'convertido');
                            }}>
                              Converter em Obra
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteOrcamento(orcamento.id)} className="text-destructive hover:text-destructive ml-auto">
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="pendentes" className="space-y-4">
              <div className="grid gap-4">
                {leadsPendentes.map(orcamento => {
                  const alerta = getAlerta(orcamento);
                  return (
                    <Card key={orcamento.id} className={alerta?.urgente ? "border-red-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{orcamento.cliente}</CardTitle>
                            <p className="text-xs text-muted-foreground">{formatDate(orcamento.dataCriacao)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {alerta && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {alerta.msg}
                              </Badge>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                              {getStatusLabel(orcamento.status)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold">{formatCurrency(orcamento.valor)}</p>
                            {orcamento.telefone && <p className="text-sm text-muted-foreground">{orcamento.telefone}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Select value={orcamento.status} onValueChange={(v) => updateStatus(orcamento.id, v as StatusOrcamento)}>
                              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="novo">Novo</SelectItem>
                                <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                                <SelectItem value="aprovado">Aprovado</SelectItem>
                                <SelectItem value="reprovado">Reprovado</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={() => {
                              const updated = orcamentos.map(o => 
                                o.id === orcamento.id ? { ...o, diasSemContato: 0 } : o
                              );
                              saveOrcamentos(updated);
                            }}>
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {leadsPendentes.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum lead pendente.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="convertidos" className="space-y-4">
              <div className="grid gap-4">
                {leadsConvertidos.map(orcamento => (
                  <Card key={orcamento.id} className="border-green-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{orcamento.cliente}</CardTitle>
                          <p className="text-xs text-muted-foreground">{formatDate(orcamento.dataCriacao)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                          {getStatusLabel(orcamento.status)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(orcamento.valor)}</p>
                    </CardContent>
                  </Card>
                ))}
                {leadsConvertidos.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum lead convertido.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alertas" className="space-y-4">
              <div className="grid gap-4">
                {orcamentos
                  .filter(o => getAlerta(o)?.urgente)
                  .map(orcamento => (
                    <Card key={orcamento.id} className="border-red-500 bg-red-50 dark:bg-red-950">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <CardTitle className="text-base">{orcamento.cliente}</CardTitle>
                          </div>
                          <span className="text-sm font-semibold text-red-600">{getAlerta(orcamento)?.msg}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">{formatCurrency(orcamento.valor)}</p>
                            {orcamento.telefone && <p className="text-sm text-muted-foreground">{orcamento.telefone}</p>}
                          </div>
                          <Button onClick={() => {
                            const updated = orcamentos.map(o => 
                              o.id === orcamento.id ? { ...o, diasSemContato: 0, status: 'em_negociacao' as const } : o
                            );
                            saveOrcamentos(updated);
                          }}>
                            <Phone className="w-4 h-4 mr-2" />
                            Contatar Agora
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {leadsPendentes.filter(o => getAlerta(o)?.urgente).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum alerta urgente.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
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
                Você atingiu o limite de 20 orçamentos do plano gratuito.
              </p>
              <p className="text-sm text-muted-foreground">
                Para continuar adicionando orçamentos, ative o plano premium.
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
