import { mockObras, formatCurrency, statusConfig, type ObraStatus } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function ObrasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ObraStatus | "todos">("todos");

  const filtered = mockObras.filter((o) => {
    const matchSearch = o.nome.toLowerCase().includes(search.toLowerCase()) ||
      o.codigo.toLowerCase().includes(search.toLowerCase()) ||
      o.cliente.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Obras</h1>
          <p className="text-muted-foreground mt-1">{mockObras.length} obras cadastradas</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Nova Obra
        </button>
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
              onClick={() => setStatusFilter(s)}
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
                <p className="text-xs text-muted-foreground">Valor Total</p>
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
    </div>
  );
}
