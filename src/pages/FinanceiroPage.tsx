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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpDown, Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/data/mockData";

type Categoria = 'mao_de_obra' | 'materiais' | 'equipamentos' | 'servicos_terceirizados';

export default function FinanceiroPage() {
  const { despesas, addDespesa, updateDespesa, obras, deleteDespesa } = useAppContext();
  const [selectedObra, setSelectedObra] = useState<string>("");
  const [isNewDespesaOpen, setIsNewDespesaOpen] = useState(false);
  const [isEditDespesaOpen, setIsEditDespesaOpen] = useState(false);
  const [despesaEmEdicao, setDespesaEmEdicao] = useState<any>(null);
  const [categoriaFilter, setCategoriaFilter] = useState<Categoria | "todos">("todos");
  const [sortField, setSortField] = useState<"data" | "valor">("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [novaDespesa, setNovaDespesa] = useState({
    obraId: '',
    tipo: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    fornecedor: '',
    categoria: 'materiais' as Categoria,
    parcelasContratadas: 1,
    parcelasPagas: 0
  });

  const handleCreateDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const despesaData = {
      ...novaDespesa,
      parcelasContratadas: novaDespesa.parcelasContratadas || 1,
      parcelasPagas: novaDespesa.parcelasPagas || 0
    };
    addDespesa(despesaData);
    setIsNewDespesaOpen(false);
    setNovaDespesa({
      obraId: '',
      tipo: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      fornecedor: '',
      categoria: 'materiais',
      parcelasContratadas: 1,
      parcelasPagas: 0
    });
  };

  const despesasFiltradas = despesas
    .filter(d => !selectedObra || d.obraId === selectedObra)
    .filter(d => categoriaFilter === "todos" || d.categoria === categoriaFilter)
    .sort((a, b) => {
      if (sortField === "data") {
        return sortOrder === "asc" 
          ? new Date(a.data).getTime() - new Date(b.data).getTime()
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      } else {
        return sortOrder === "asc" ? a.valor - b.valor : b.valor - a.valor;
      }
    });

  const toggleSort = (field: "data" | "valor") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);
  const totalPago = despesasFiltradas.reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0);
  
  const totalPorCategoria = {
    mao_de_obra: despesasFiltradas.filter(d => d.categoria === 'mao_de_obra').reduce((acc, d) => acc + d.valor, 0),
    materiais: despesasFiltradas.filter(d => d.categoria === 'materiais').reduce((acc, d) => acc + d.valor, 0),
    equipamentos: despesasFiltradas.filter(d => d.categoria === 'equipamentos').reduce((acc, d) => acc + d.valor, 0),
    servicos_terceirizados: despesasFiltradas.filter(d => d.categoria === 'servicos_terceirizados').reduce((acc, d) => acc + d.valor, 0),
  };

  const totalPagoPorCategoria = {
    mao_de_obra: despesasFiltradas.filter(d => d.categoria === 'mao_de_obra').reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0),
    materiais: despesasFiltradas.filter(d => d.categoria === 'materiais').reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0),
    equipamentos: despesasFiltradas.filter(d => d.categoria === 'equipamentos').reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0),
    servicos_terceirizados: despesasFiltradas.filter(d => d.categoria === 'servicos_terceirizados').reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0),
  };

  const obrasComDespesas = obras.filter(o => despesas.some(d => d.obraId === o.id));
  const ObraSelecionada = obras.find(o => o.id === selectedObra);
  const despesaObra = ObraSelecionada ? despesas.filter(d => d.obraId === ObraSelecionada.id).reduce((acc, d) => acc + (d.valor * (d.parcelasPagas / d.parcelasContratadas)), 0) : 0;

  const getCategoriaLabel = (cat: Categoria) => {
    const labels: Record<Categoria, string> = {
      mao_de_obra: 'Mão de Obra',
      materiais: 'Materiais',
      equipamentos: 'Equipamentos',
      servicos_terceirizados: 'Serviços Terceirizados'
    };
    return labels[cat];
  };

  const getCategoriaColor = (cat: Categoria) => {
    const colors: Record<Categoria, string> = {
      mao_de_obra: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      materiais: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      equipamentos: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      servicos_terceirizados: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
    };
    return colors[cat];
  };

  const openEditDialog = (despesa: any) => {
    setDespesaEmEdicao(despesa);
    setIsEditDespesaOpen(true);
  };

  const handleUpdateDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (despesaEmEdicao) {
      updateDespesa(despesaEmEdicao.id, {
        parcelasPagas: Number(despesaEmEdicao.parcelasPagas),
        parcelasContratadas: Number(despesaEmEdicao.parcelasContratadas),
        valor: Number(despesaEmEdicao.valor),
        tipo: despesaEmEdicao.tipo,
        fornecedor: despesaEmEdicao.fornecedor,
        categoria: despesaEmEdicao.categoria,
      });
      setIsEditDespesaOpen(false);
      setDespesaEmEdicao(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Financeiro</h1>
          <p className="text-muted-foreground mt-1">{despesas.length} despesas cadastradas</p>
        </div>
        <Dialog open={isNewDespesaOpen} onOpenChange={setIsNewDespesaOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDespesa} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Obra *</Label>
                <Select value={novaDespesa.obraId} onValueChange={v => setNovaDespesa({...novaDespesa, obraId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>
                    {obras.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Despesa *</Label>
                <Input required value={novaDespesa.tipo} onChange={e => setNovaDespesa({...novaDespesa, tipo: e.target.value})} placeholder="Ex: Concreto Usinado" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input required type="number" min="0" step="0.01" value={novaDespesa.valor || ''} onChange={e => setNovaDespesa({...novaDespesa, valor: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input required type="date" value={novaDespesa.data} onChange={e => setNovaDespesa({...novaDespesa, data: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={novaDespesa.fornecedor} onChange={e => setNovaDespesa({...novaDespesa, fornecedor: e.target.value})} placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={novaDespesa.categoria} onValueChange={v => setNovaDespesa({...novaDespesa, categoria: v as Categoria})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
                    <SelectItem value="materiais">Materiais</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="servicos_terceirizados">Serviços Terceirizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parcelas Contratadas</Label>
                  <Input type="number" min="1" value={novaDespesa.parcelasContratadas || ''} onChange={e => setNovaDespesa({...novaDespesa, parcelasContratadas: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas Pagas</Label>
                  <Input type="number" min="0" max={novaDespesa.parcelasContratadas} value={novaDespesa.parcelasPagas || ''} onChange={e => setNovaDespesa({...novaDespesa, parcelasPagas: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewDespesaOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Despesa</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {obras.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedObra("")}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedObra === "" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Todas as Obras
          </button>
          {obras.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedObra(o.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedObra === o.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {o.nome}
            </button>
          ))}
        </div>
      )}

      {obras.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma obra cadastrada.</p>
            <p className="text-xs text-muted-foreground mt-1">Cadastre uma obra primeiro para registrar despesas.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Contratado</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalDespesas)}</div>
                <p className="text-xs text-muted-foreground">{despesasFiltradas.length} transações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
                <p className="text-xs text-muted-foreground">{(totalPago / totalDespesas * 100).toFixed(1)}% do total</p>
              </CardContent>
            </Card>

            {selectedObra && ObraSelecionada && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Obra</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(ObraSelecionada.valorTotal)}</div>
                    <p className="text-xs text-muted-foreground">Planejado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Despesas da Obra</CardTitle>
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(despesaObra)}</div>
                    <p className="text-xs text-muted-foreground">Realizado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Restante</CardTitle>
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(ObraSelecionada.valorTotal - despesaObra)}</div>
                    <p className="text-xs text-muted-foreground">Disponível</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {selectedObra && ObraSelecionada && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolução Financeira - {ObraSelecionada.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all" 
                    style={{ width: `${Math.min((despesaObra / ObraSelecionada.valorTotal) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilizado: {formatCurrency(despesaObra)}</span>
                  <span className="text-muted-foreground">Orçamento: {formatCurrency(ObraSelecionada.valorTotal)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="despesas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
              <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
            </TabsList>

            <TabsContent value="despesas" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["todos", "mao_de_obra", "materiais", "equipamentos", "servicos_terceirizados"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFilter(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      categoriaFilter === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {cat === "todos" ? "Todos" : getCategoriaLabel(cat as Categoria)}
                  </button>
                ))}
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort("data")}>
                        <div className="flex items-center gap-1">
                          Data <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-center">Parcelas</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhuma despesa encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      despesasFiltradas.map((despesa) => {
                        const obra = obras.find(o => o.id === despesa.obraId);
                        const valorPago = despesa.valor * (despesa.parcelasPagas / despesa.parcelasContratadas);
                        return (
                          <TableRow key={despesa.id}>
                            <TableCell>{formatDate(despesa.data)}</TableCell>
                            <TableCell>{despesa.tipo}</TableCell>
                            <TableCell>{despesa.fornecedor || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoriaColor(despesa.categoria)}`}>
                                {getCategoriaLabel(despesa.categoria)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(despesa.valor)}</TableCell>
                            <TableCell className="text-center">{despesa.parcelasPagas}/{despesa.parcelasContratadas}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">{formatCurrency(valorPago)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(despesa)}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteDespesa(despesa.id)} className="text-destructive hover:text-destructive">
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="categorias" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(totalPorCategoria).map(([cat, valor]) => (
                  <Card key={cat}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">{getCategoriaLabel(cat as Categoria)}</CardTitle>
                      <PieChart className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatCurrency(valor)}</div>
                      <div className="text-sm text-green-600 mt-1">
                        Pago: {formatCurrency(totalPagoPorCategoria[cat as Categoria])}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {despesasFiltradas.filter(d => d.categoria === cat).length} despesas
                      </p>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getCategoriaColor(cat as Categoria).split(' ')[0].replace('bg-', 'bg-')}`}
                          style={{ width: `${totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0}%`, backgroundColor: cat === 'mao_de_obra' ? '#3b82f6' : cat === 'materiais' ? '#22c55e' : cat === 'equipamentos' ? '#f97316' : '#a855f7' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={isEditDespesaOpen} onOpenChange={setIsEditDespesaOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          {despesaEmEdicao && (
            <form onSubmit={handleUpdateDespesa} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Despesa</Label>
                <Input value={despesaEmEdicao.tipo} onChange={e => setDespesaEmEdicao({...despesaEmEdicao, tipo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input type="number" min="0" step="0.01" value={despesaEmEdicao.valor} onChange={e => setDespesaEmEdicao({...despesaEmEdicao, valor: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas Contratadas</Label>
                  <Input type="number" min="1" value={despesaEmEdicao.parcelasContratadas} onChange={e => setDespesaEmEdicao({...despesaEmEdicao, parcelasContratadas: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parcelas Pagas</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max={despesaEmEdicao.parcelasContratadas} 
                  value={despesaEmEdicao.parcelasPagas} 
                  onChange={e => setDespesaEmEdicao({...despesaEmEdicao, parcelasPagas: Number(e.target.value)})} 
                />
                <p className="text-xs text-muted-foreground">
                  Valor pago: {formatCurrency(despesaEmEdicao.valor * (despesaEmEdicao.parcelasPagas / despesaEmEdicao.parcelasContratadas))}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={despesaEmEdicao.fornecedor} onChange={e => setDespesaEmEdicao({...despesaEmEdicao, fornecedor: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={despesaEmEdicao.categoria} onValueChange={v => setDespesaEmEdicao({...despesaEmEdicao, categoria: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
                    <SelectItem value="materiais">Materiais</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="servicos_terceirizados">Serviços Terceirizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDespesaOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
