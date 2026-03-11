import { useState, useMemo, useCallback } from "react";
import { mockObras, mockAtividades, formatDate, type Atividade, type Obra } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  GripVertical,
  Trash2,
  Link2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

type TaskStatus = Atividade["status"];

const statusLabels: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  atrasada: "Atrasada",
};

const statusColors: Record<TaskStatus, string> = {
  pendente: "bg-muted text-muted-foreground",
  em_andamento: "bg-info text-info-foreground",
  concluida: "bg-success text-success-foreground",
  atrasada: "bg-destructive text-destructive-foreground",
};

const ganttBarColors: Record<TaskStatus, string> = {
  pendente: "bg-muted-foreground/40",
  em_andamento: "bg-info",
  concluida: "bg-success",
  atrasada: "bg-destructive",
};

function diffDays(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function autoDetectStatus(task: Atividade): TaskStatus {
  if (task.percentualConcluido >= 100) return "concluida";
  const today = new Date().toISOString().slice(0, 10);
  if (task.dataFim < today && task.percentualConcluido < 100) return "atrasada";
  if (task.percentualConcluido > 0) return "em_andamento";
  return "pendente";
}

const CronogramaPage = () => {
  const [selectedObraId, setSelectedObraId] = useState<string>(mockObras[0]?.id || "");
  const [atividades, setAtividades] = useState<Atividade[]>(
    mockAtividades.map((a, i) => ({ ...a, ordem: a.ordem ?? i }))
  );
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterResponsavel, setFilterResponsavel] = useState<string>("all");
  const [filterAtrasadas, setFilterAtrasadas] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);

  const obra = mockObras.find((o) => o.id === selectedObraId);

  const obraAtividades = useMemo(() => {
    let tasks = atividades
      .filter((a) => a.obraId === selectedObraId)
      .sort((a, b) => a.ordem - b.ordem);

    if (filterStatus !== "all") tasks = tasks.filter((t) => t.status === filterStatus);
    if (filterResponsavel !== "all") tasks = tasks.filter((t) => t.responsavel === filterResponsavel);
    if (filterAtrasadas) tasks = tasks.filter((t) => t.status === "atrasada");

    return tasks;
  }, [atividades, selectedObraId, filterStatus, filterResponsavel, filterAtrasadas]);

  const rootTasks = useMemo(() => obraAtividades.filter((t) => !t.parentId), [obraAtividades]);
  const getSubtasks = useCallback(
    (parentId: string) => obraAtividades.filter((t) => t.parentId === parentId),
    [obraAtividades]
  );

  const responsaveis = useMemo(() => {
    const set = new Set(atividades.filter((a) => a.obraId === selectedObraId).map((a) => a.responsavel));
    return Array.from(set);
  }, [atividades, selectedObraId]);

  // Gantt date range
  const ganttRange = useMemo(() => {
    if (!obra) return { start: "", end: "", totalDays: 1 };
    const allTasks = atividades.filter((a) => a.obraId === selectedObraId);
    if (allTasks.length === 0) {
      const startD = new Date(obra.dataInicio);
      const endD = new Date(obra.dataPrevistaConclusao);
      startD.setDate(startD.getDate() - 7);
      endD.setDate(endD.getDate() + 14);
      return { 
        start: startD.toISOString().slice(0, 10), 
        end: endD.toISOString().slice(0, 10), 
        totalDays: diffDays(startD.toISOString().slice(0, 10), endD.toISOString().slice(0, 10)) || 1 
      };
    }
    const starts = allTasks.map((t) => t.dataInicio).sort();
    const ends = allTasks.map((t) => t.dataFim).sort();
    
    // Create base dates and add padding for the visual chart (7 days before, 14 days after)
    const rawStart = starts[0] < obra.dataInicio ? starts[0] : obra.dataInicio;
    const rawEnd = ends[ends.length - 1] > obra.dataPrevistaConclusao ? ends[ends.length - 1] : obra.dataPrevistaConclusao;
    
    const startObj = new Date(rawStart);
    const endObj = new Date(rawEnd);
    startObj.setDate(startObj.getDate() - 7);
    endObj.setDate(endObj.getDate() + 14);

    const start = startObj.toISOString().slice(0, 10);
    const end = endObj.toISOString().slice(0, 10);

    return { start, end, totalDays: diffDays(start, end) || 1 };
  }, [obra, atividades, selectedObraId]);

  // Month markers for Gantt
  const monthMarkers = useMemo(() => {
    const markers: { label: string; leftPercent: number }[] = [];
    const startDate = new Date(ganttRange.start);
    const endDate = new Date(ganttRange.end);
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      const dayOffset = diffDays(ganttRange.start, current.toISOString().slice(0, 10));
      if (dayOffset >= 0 && dayOffset <= ganttRange.totalDays) {
        markers.push({
          label: current.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          leftPercent: (dayOffset / ganttRange.totalDays) * 100,
        });
      }
      current.setMonth(current.getMonth() + 1);
    }
    return markers;
  }, [ganttRange]);

  const updateTask = (id: string, updates: Partial<Atividade>) => {
    setAtividades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.dataInicio || updates.dataFim) {
          updated.duracao = diffDays(updated.dataInicio, updated.dataFim);
        }
        updated.status = autoDetectStatus(updated);
        return updated;
      })
    );
    setEditingCell(null);
  };

  const addTask = () => {
    const newTask: Atividade = {
      id: crypto.randomUUID(),
      obraId: selectedObraId,
      nome: "Nova Atividade",
      descricao: "",
      responsavel: "Não definido",
      dataInicio: new Date().toISOString().slice(0, 10),
      dataFim: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      duracao: 7,
      percentualConcluido: 0,
      dependencias: [],
      status: "pendente",
      ordem: atividades.length,
    };
    setAtividades((prev) => [...prev, newTask]);
    setEditingCell({ id: newTask.id, field: "nome" });
    toast.success("Atividade criada");
  };

  const addSubtask = (parentId: string) => {
    const parent = atividades.find((t) => t.id === parentId);
    if (!parent) return;
    const newTask: Atividade = {
      id: crypto.randomUUID(),
      obraId: selectedObraId,
      nome: "Nova Subtarefa",
      descricao: "",
      responsavel: parent.responsavel,
      dataInicio: parent.dataInicio,
      dataFim: parent.dataFim,
      duracao: parent.duracao,
      percentualConcluido: 0,
      dependencias: [],
      status: "pendente",
      parentId,
      ordem: atividades.length,
    };
    setAtividades((prev) => [...prev, newTask]);
    setExpandedTasks((prev) => new Set(prev).add(parentId));
    setEditingCell({ id: newTask.id, field: "nome" });
    setAddingSubtaskFor(null);
    toast.success("Subtarefa criada");
  };

  const deleteTask = (id: string) => {
    setAtividades((prev) => prev.filter((t) => t.id !== id && t.parentId !== id));
    toast.success("Atividade removida");
  };

  const addDependency = (taskId: string, depId: string) => {
    if (taskId === depId) return;
    setAtividades((prev) =>
      prev.map((t) =>
        t.id === taskId && !t.dependencias.includes(depId)
          ? { ...t, dependencias: [...t.dependencias, depId] }
          : t
      )
    );
    toast.success("Dependência adicionada");
  };

  const removeDependency = (taskId: string, depId: string) => {
    setAtividades((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, dependencias: t.dependencias.filter((d) => d !== depId) } : t
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderEditableCell = (task: Atividade, field: keyof Atividade, type: string = "text") => {
    const isEditing = editingCell?.id === task.id && editingCell?.field === field;
    const value = task[field] as string | number;

    if (isEditing) {
      return (
        <Input
          autoFocus
          type={type}
          defaultValue={value}
          className="h-7 text-xs w-full min-w-0"
          onBlur={(e) => {
            const newVal = type === "number" ? Number(e.target.value) : e.target.value;
            updateTask(task.id, { [field]: newVal } as Partial<Atividade>);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditingCell(null);
          }}
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-accent/30 px-1 py-0.5 rounded text-xs truncate block"
        onClick={() => setEditingCell({ id: task.id, field })}
      >
        {type === "date" ? formatDate(value as string) : value}
      </span>
    );
  };

  const renderTaskRow = (task: Atividade, depth: number = 0) => {
    const subtasks = getSubtasks(task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isNearDeadline =
      task.status !== "concluida" &&
      task.status !== "atrasada" &&
      diffDays(new Date().toISOString().slice(0, 10), task.dataFim) <= 7 &&
      diffDays(new Date().toISOString().slice(0, 10), task.dataFim) >= 0;

    // Gantt bar calculations
    const leftPercent = (diffDays(ganttRange.start, task.dataInicio) / ganttRange.totalDays) * 100;
    const widthPercent = (diffDays(task.dataInicio, task.dataFim) / ganttRange.totalDays) * 100;
    const barColor = isNearDeadline ? "bg-warning" : ganttBarColors[task.status];

    return (
      <div key={task.id}>
        <div className="flex border-b border-border/40 hover:bg-accent/5 group min-h-[40px]">
          {/* Task list side */}
          <div 
            className="flex items-center gap-1 flex-shrink-0 bg-background z-20 relative sticky left-0 border-r border-border/40 pl-2 lg:pl-0" 
            style={{ width: 550 }}
          >
            <div className="w-6 flex items-center justify-center opacity-0 group-hover:opacity-60 cursor-grab">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <div style={{ width: depth * 20 }} />
            <button
              onClick={() => hasSubtasks && toggleExpand(task.id)}
              className={`w-5 h-5 flex items-center justify-center rounded ${hasSubtasks ? "hover:bg-accent/30 cursor-pointer" : ""}`}
            >
              {hasSubtasks ? (
                isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              )}
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-1 pr-1">
              <div className="min-w-[140px] flex-1">{renderEditableCell(task, "nome")}</div>
              <div className="w-[100px] flex-shrink-0">{renderEditableCell(task, "responsavel")}</div>
              <div className="w-[90px] flex-shrink-0">{renderEditableCell(task, "dataInicio", "date")}</div>
              <div className="w-[90px] flex-shrink-0">{renderEditableCell(task, "dataFim", "date")}</div>
              <div className="w-[50px] flex-shrink-0">
                {renderEditableCell(task, "percentualConcluido", "number")}
              </div>
              <div className="w-[80px] flex-shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isNearDeadline ? "bg-warning text-warning-foreground" : statusColors[task.status]}`}>
                  {isNearDeadline ? "Prazo Próx." : statusLabels[task.status]}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                <button
                  onClick={() => addSubtask(task.id)}
                  className="p-1 rounded hover:bg-accent/30"
                  title="Adicionar subtarefa"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded hover:bg-destructive/20 text-destructive"
                  title="Remover"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Gantt side */}
          <div className="flex-1 relative min-w-[500px] overflow-hidden">
            {/* Month grid lines */}
            {monthMarkers.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-border/20"
                style={{ left: `${m.leftPercent}%` }}
              />
            ))}
            {/* Today line */}
            {(() => {
              const todayOffset = diffDays(ganttRange.start, new Date().toISOString().slice(0, 10));
              const todayPercent = (todayOffset / ganttRange.totalDays) * 100;
              if (todayPercent >= 0 && todayPercent <= 100) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive/50 z-10"
                    style={{ left: `${todayPercent}%` }}
                  />
                );
              }
              return null;
            })()}
            {/* Bar */}
            <div className="absolute inset-0 flex items-center px-1">
              <div
                className={`h-6 rounded-md shadow-sm ${barColor} absolute group/bar cursor-pointer transition-all hover:brightness-110 hover:shadow-md border border-black/10`}
                style={{
                  left: `${Math.max(0, Math.min(leftPercent, 100))}%`,
                  width: `${Math.max(1, Math.min(widthPercent, 100 - Math.max(0, leftPercent)))}%`,
                }}
                title={`${task.nome}: ${formatDate(task.dataInicio)} → ${formatDate(task.dataFim)} (${task.percentualConcluido}%)`}
              >
                {/* Progress inside bar */}
                {task.percentualConcluido > 0 && task.percentualConcluido < 100 && (
                  <div
                    className="absolute top-0 left-0 h-full rounded-l-sm bg-black/20"
                    style={{ width: `${task.percentualConcluido}%` }}
                  />
                )}
                {widthPercent > 5 && (
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-semibold text-white truncate drop-shadow-md z-10">
                    {task.nome}
                  </span>
                )}
              </div>
            </div>
            {/* Dependency arrows */}
            {task.dependencias.map((depId) => {
              const dep = atividades.find((t) => t.id === depId);
              if (!dep) return null;
              
              const depEnd = (diffDays(ganttRange.start, dep.dataFim) / ganttRange.totalDays) * 100;
              const taskStart = leftPercent;
              
              // Only draw simple connecting line if task starts roughly after dependency
              if (taskStart >= depEnd) {
                return (
                  <div
                    key={depId}
                    className="absolute top-1/2 h-[1px] border-t border-dashed border-muted-foreground/50 z-5"
                    style={{
                      left: `${depEnd}%`,
                      width: `${taskStart - depEnd}%`,
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Subtasks */}
        {hasSubtasks && isExpanded && subtasks.map((sub) => renderTaskRow(sub, depth + 1))}
      </div>
    );
  };

  // Stats
  const stats = useMemo(() => {
    const all = atividades.filter((a) => a.obraId === selectedObraId);
    return {
      total: all.length,
      concluidas: all.filter((t) => t.status === "concluida").length,
      atrasadas: all.filter((t) => t.status === "atrasada").length,
      emAndamento: all.filter((t) => t.status === "em_andamento").length,
      progressoMedio: all.length
        ? Math.round(all.reduce((sum, t) => sum + t.percentualConcluido, 0) / all.length)
        : 0,
    };
  }, [atividades, selectedObraId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Cronograma</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Planeje e acompanhe as atividades do projeto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedObraId} onValueChange={setSelectedObraId}>
            <SelectTrigger className="w-[240px] h-9 text-sm">
              <SelectValue placeholder="Selecione uma obra" />
            </SelectTrigger>
            <SelectContent>
              {mockObras.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.codigo} — {o.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="stat-card py-3 px-4 text-center">
          <p className="text-lg font-bold font-heading">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="stat-card py-3 px-4 text-center">
          <p className="text-lg font-bold font-heading text-[hsl(var(--success))]">{stats.concluidas}</p>
          <p className="text-[10px] text-muted-foreground">Concluídas</p>
        </div>
        <div className="stat-card py-3 px-4 text-center">
          <p className="text-lg font-bold font-heading text-[hsl(var(--info))]">{stats.emAndamento}</p>
          <p className="text-[10px] text-muted-foreground">Em Andamento</p>
        </div>
        <div className="stat-card py-3 px-4 text-center">
          <p className="text-lg font-bold font-heading text-[hsl(var(--destructive))]">{stats.atrasadas}</p>
          <p className="text-[10px] text-muted-foreground">Atrasadas</p>
        </div>
        <div className="stat-card py-3 px-4 text-center">
          <p className="text-lg font-bold font-heading">{stats.progressoMedio}%</p>
          <p className="text-[10px] text-muted-foreground">Progresso Médio</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={addTask} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nova Atividade
        </Button>
        <Button
          size="sm"
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Filter className="w-3.5 h-3.5" /> Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="stat-card py-3 px-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Responsável:</span>
            <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {responsaveis.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filterAtrasadas}
              onChange={(e) => setFilterAtrasadas(e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-xs text-muted-foreground">Apenas atrasadas</span>
          </label>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7"
            onClick={() => {
              setFilterStatus("all");
              setFilterResponsavel("all");
              setFilterAtrasadas(false);
            }}
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Gantt + Table hybrid */}
      <div className="stat-card p-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="flex border-b border-border bg-muted/80 min-h-[40px] isolate w-max sm:w-full min-w-max">
            <div
              className="flex items-center gap-1 flex-shrink-0 px-2 bg-muted/80 backdrop-blur-sm z-30 sticky left-0 border-r border-border/40"
              style={{ width: 550 }}
            >
              <div className="w-6" />
              <div className="w-5" />
              <div className="flex-1 min-w-0 flex items-center gap-1 pr-1">
                <span className="min-w-[140px] flex-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Atividade
                </span>
                <span className="w-[100px] flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Responsável
                </span>
                <span className="w-[90px] flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Início
                </span>
                <span className="w-[90px] flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Fim
                </span>
                <span className="w-[50px] flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  %
                </span>
                <span className="w-[80px] flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </span>
                <div className="w-[52px] flex-shrink-0" />
              </div>
            </div>
            {/* Gantt header - month markers */}
            <div className="flex-1 relative min-w-[500px] bg-muted/80">
              {monthMarkers.map((m, i) => (
                 <span
                  key={i}
                   className="absolute top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-medium"
                   style={{ left: `${m.leftPercent}%`, paddingLeft: 4 }}
                 >
                   {m.label}
                 </span>
               ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative w-max sm:w-full min-w-max z-0 flex flex-col">
            {rootTasks.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground text-sm">
                 Nenhuma atividade cadastrada. Clique em "Nova Atividade" para começar.
               </div>
             ) : (
               <div className="w-full">{rootTasks.map((task) => renderTaskRow(task))}</div>
             )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-success" /> Concluída
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-info" /> Em Andamento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-destructive" /> Atrasada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-warning" /> Prazo Próximo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-muted-foreground/40" /> Pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 bg-destructive/50" /> Hoje
        </span>
      </div>
    </div>
  );
};

export default CronogramaPage;
