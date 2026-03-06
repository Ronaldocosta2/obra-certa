import { useParams, Link } from "react-router-dom";
import { mockObras, mockAtividades, mockDespesas, formatCurrency, formatDate, statusConfig } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, Calendar, User, DollarSign, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const tabs = ["Visão Geral", "Cronograma", "Financeiro", "Diário"] as const;

export default function ObraDetailPage() {
  const { id } = useParams();
  const obra = mockObras.find(o => o.id === id);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Visão Geral");

  if (!obra) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Obra não encontrada.</p>
        <Link to="/obras" className="text-primary text-sm hover:underline mt-2 inline-block">← Voltar</Link>
      </div>
    );
  }

  const initialAtividades = mockAtividades.filter(a => a.obraId === obra.id);
  const [atividades, setAtividades] = useState(initialAtividades);
  const despesas = mockDespesas.filter(d => d.obraId === obra.id);
  const desvio = ((obra.custoRealizado / obra.valorTotal) * 100 - obra.progresso).toFixed(1);

  // New states for form
  const [novaAtividade, setNovaAtividade] = useState({
    nome: "",
    responsavel: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleAddAtividade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaAtividade.nome || !novaAtividade.dataInicio || !novaAtividade.dataFim) return;

    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      obraId: obra.id,
      nome: novaAtividade.nome,
      descricao: "",
      responsavel: novaAtividade.responsavel || "Não definido",
      dataInicio: novaAtividade.dataInicio,
      dataFim: novaAtividade.dataFim,
      duracao: 0,
      percentualConcluido: 0,
      dependencias: [],
      status: "pendente" as const,
    };

    setAtividades([...atividades, newTask]);
    setNovaAtividade({ nome: "", responsavel: "", dataInicio: "", dataFim: "" });
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <Link to="/obras" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para obras
      </Link>

      <div className="stat-card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{obra.codigo}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[obra.status].color}`}>
                {statusConfig[obra.status].label}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-heading">{obra.nome}</h1>
            <p className="text-sm text-muted-foreground mt-1">{obra.descricao}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{obra.endereco}</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{obra.responsavelTecnico}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(obra.dataInicio)} - {formatDate(obra.dataPrevistaConclusao)}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold font-heading">{obra.progresso}%</p>
            <Progress value={obra.progresso} className="h-2 w-32 mt-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Visão Geral" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="stat-card text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold font-heading">{obra.tarefasConcluidas}</p>
            <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
          </div>
          <div className="stat-card text-center">
            <Clock className="w-8 h-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold font-heading">{obra.tarefasTotal - obra.tarefasConcluidas - obra.tarefasAtrasadas}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </div>
          <div className="stat-card text-center">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold font-heading">{obra.tarefasAtrasadas}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
          <div className="stat-card text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-heading">{desvio}%</p>
            <p className="text-xs text-muted-foreground">Desvio de Custo</p>
          </div>
        </div>
      )}

      {activeTab === "Cronograma" && (
        <div className="space-y-4">

          {/* Quick Add Form */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Adicionar Atividade
            </h3>
            <form onSubmit={handleAddAtividade} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Nome da Atividade *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Pintura interna"
                  className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={novaAtividade.nome}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Equipe A"
                  className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={novaAtividade.responsavel}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, responsavel: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Início *</label>
                <input
                  required
                  type="date"
                  className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={novaAtividade.dataInicio}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, dataInicio: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Fim *</label>
                <div className="flex gap-2 items-center">
                  <input
                    required
                    type="date"
                    className="w-full flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={novaAtividade.dataFim}
                    onChange={(e) => setNovaAtividade({ ...novaAtividade, dataFim: e.target.value })}
                  />
                  <button type="submit" className="h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Adicionar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {atividades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma atividade cadastrada. Crie a primeira acima!</p>
          ) : (
            <>
              {/* Simple Gantt-like view */}
              <div className="stat-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Atividade</th>
                      <th className="pb-3 font-medium text-muted-foreground">Responsável</th>
                      <th className="pb-3 font-medium text-muted-foreground">Início</th>
                      <th className="pb-3 font-medium text-muted-foreground">Fim</th>
                      <th className="pb-3 font-medium text-muted-foreground">Progresso</th>
                      <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atividades.map(a => {
                      const statusColors: Record<string, string> = {
                        pendente: 'bg-muted text-muted-foreground',
                        em_andamento: 'bg-info text-info-foreground',
                        concluida: 'bg-success text-success-foreground',
                        atrasada: 'bg-destructive text-destructive-foreground',
                      };
                      return (
                        <tr key={a.id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium">{a.nome}</td>
                          <td className="py-3 text-muted-foreground">{a.responsavel}</td>
                          <td className="py-3 text-muted-foreground">{formatDate(a.dataInicio)}</td>
                          <td className="py-3 text-muted-foreground">{formatDate(a.dataFim)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={a.percentualConcluido} className="h-1.5 w-16" />
                              <span className="text-xs font-medium">{a.percentualConcluido}%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status]}`}>
                              {a.status === 'em_andamento' ? 'Em Andamento' : a.status === 'concluida' ? 'Concluída' : a.status === 'atrasada' ? 'Atrasada' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gantt chart visualization */}
              <div className="stat-card">
                <h3 className="text-sm font-semibold mb-4">Gráfico de Gantt Simplificado</h3>
                <div className="space-y-2">
                  {atividades.map(a => {
                    const start = new Date(a.dataInicio).getTime();
                    const end = new Date(a.dataFim).getTime();
                    const projectStart = new Date(obra.dataInicio).getTime();
                    const projectEnd = new Date(obra.dataPrevistaConclusao).getTime();
                    const totalDuration = projectEnd - projectStart;
                    const leftPercent = ((start - projectStart) / totalDuration) * 100;
                    const widthPercent = ((end - start) / totalDuration) * 100;
                    const barColor = a.status === 'concluida' ? 'bg-success' : a.status === 'atrasada' ? 'bg-destructive' : a.status === 'em_andamento' ? 'bg-primary' : 'bg-muted';

                    return (
                      <div key={a.id} className="flex items-center gap-3">
                        <span className="text-xs w-36 truncate text-muted-foreground flex-shrink-0">{a.nome}</span>
                        <div className="flex-1 h-6 bg-muted rounded relative">
                          <div
                            className={`absolute h-full rounded ${barColor} opacity-80`}
                            style={{ left: `${Math.max(0, leftPercent)}%`, width: `${Math.min(widthPercent, 100 - leftPercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>{formatDate(obra.dataInicio)}</span>
                  <span>{formatDate(obra.dataPrevistaConclusao)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "Financeiro" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Orçamento Total</p>
              <p className="text-xl font-bold font-heading">{formatCurrency(obra.valorTotal)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Custo Realizado</p>
              <p className="text-xl font-bold font-heading">{formatCurrency(obra.custoRealizado)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Saldo Restante</p>
              <p className="text-xl font-bold font-heading">{formatCurrency(obra.valorTotal - obra.custoRealizado)}</p>
            </div>
          </div>

          {despesas.length > 0 && (
            <div className="stat-card">
              <h3 className="text-sm font-semibold mb-4">Despesas Registradas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="pb-3 font-medium text-muted-foreground">Fornecedor</th>
                      <th className="pb-3 font-medium text-muted-foreground">Categoria</th>
                      <th className="pb-3 font-medium text-muted-foreground">Data</th>
                      <th className="pb-3 font-medium text-muted-foreground text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map(d => (
                      <tr key={d.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium">{d.tipo}</td>
                        <td className="py-3 text-muted-foreground">{d.fornecedor}</td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                            {d.categoria.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatDate(d.data)}</td>
                        <td className="py-3 text-right font-semibold">{formatCurrency(d.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Diário" && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Diário de obra — em breve.</p>
          <p className="text-xs mt-1">Registre atividades diárias, condições climáticas e anexe fotos.</p>
        </div>
      )}
    </div>
  );
}
