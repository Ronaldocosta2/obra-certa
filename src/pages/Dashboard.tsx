import { mockObras, formatCurrency, statusConfig } from "@/data/mockData";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { VirtualAssistant } from "@/components/VirtualAssistant";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const obrasAtivas = mockObras.filter(o => o.status === 'em_andamento');
const totalObras = mockObras.length;
const totalTarefasAtrasadas = mockObras.reduce((s, o) => s + o.tarefasAtrasadas, 0);
const totalCustoRealizado = mockObras.reduce((s, o) => s + o.custoRealizado, 0);
const totalValor = mockObras.reduce((s, o) => s + o.valorTotal, 0);
const progressoMedio = Math.round(mockObras.filter(o => o.status !== 'finalizada').reduce((s, o) => s + o.progresso, 0) / Math.max(mockObras.filter(o => o.status !== 'finalizada').length, 1));

const custoPorCategoria = [
  { name: 'Materiais', valor: 1530000 },
  { name: 'Mão de Obra', valor: 420000 },
  { name: 'Equipamentos', valor: 320000 },
  { name: 'Serviços', valor: 180000 },
];

const progressoObras = mockObras.filter(o => o.status !== 'finalizada').map(o => ({
  name: o.codigo,
  progresso: o.progresso,
}));

const PIE_COLORS = [
  'hsl(24, 95%, 53%)',
  'hsl(215, 25%, 15%)',
  'hsl(142, 71%, 45%)',
  'hsl(210, 100%, 52%)',
];

const stats = [
  {
    label: 'Total de Obras',
    value: totalObras,
    icon: Building2,
    sub: `${obrasAtivas.length} ativas`,
    trend: 'up' as const,
  },
  {
    label: 'Progresso Médio',
    value: `${progressoMedio}%`,
    icon: TrendingUp,
    sub: 'obras em andamento',
    trend: 'up' as const,
  },
  {
    label: 'Tarefas Atrasadas',
    value: totalTarefasAtrasadas,
    icon: AlertTriangle,
    sub: 'requerem atenção',
    trend: 'down' as const,
  },
  {
    label: 'Custo Realizado',
    value: formatCurrency(totalCustoRealizado),
    icon: DollarSign,
    sub: `de ${formatCurrency(totalValor)} planejado`,
    trend: 'up' as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral de todas as obras</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4.5 h-4.5 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{s.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {s.trend === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className="text-xs text-muted-foreground">{s.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress chart */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4">Progresso das Obras</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressoObras} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Progresso']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(215, 20%, 90%)' }}
                />
                <Bar dataKey="progresso" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost distribution */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4">Distribuição de Custos</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={custoPorCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="valor"
                  nameKey="name"
                  stroke="none"
                >
                  {custoPorCategoria.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(215, 20%, 90%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-4">
              {custoPorCategoria.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Obras list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Obras Recentes</h3>
          <Link to="/obras" className="text-xs text-primary font-medium hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-3">
          {mockObras.slice(0, 4).map((obra) => (
            <Link
              key={obra.id}
              to={`/obras/${obra.id}`}
              className="stat-card flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground font-mono">{obra.codigo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[obra.status].color}`}>
                    {statusConfig[obra.status].label}
                  </span>
                </div>
                <h4 className="font-semibold truncate">{obra.nome}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{obra.cliente} · {obra.responsavelTecnico}</p>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{obra.progresso}%</span>
                  </div>
                  <Progress value={obra.progresso} className="h-1.5" />
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{formatCurrency(obra.custoRealizado)}</p>
                  <p className="text-xs text-muted-foreground">de {formatCurrency(obra.valorTotal)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <VirtualAssistant />
    </div>
  );
}
