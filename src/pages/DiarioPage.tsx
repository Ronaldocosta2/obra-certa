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
import { Plus, Cloud, Users, ClipboardList, AlertCircle, Calendar } from "lucide-react";
import { formatDate } from "@/data/mockData";

type CondicoesClimaticas = 'ensolarado' | 'nublado' | 'chuvoso' | 'ventoso' | 'ameno';

export default function DiarioPage() {
  const { diarios, addDiario, obras } = useAppContext();
  const [isNewDiarioOpen, setIsNewDiarioOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<string>("");

  const [novoDiario, setNovoDiario] = useState({
    obraId: '',
    data: new Date().toISOString().split('T')[0],
    responsavel: '',
    atividadesRealizadas: '',
    equipesPresentes: [] as string[],
    condicoesClimaticas: 'ensolarado' as CondicoesClimaticas,
    problemasOcorridos: '',
    observacoes: ''
  });

  const [novaEquipe, setNovaEquipe] = useState("");

  const handleCreateDiario = (e: React.FormEvent) => {
    e.preventDefault();
    addDiario({
      ...novoDiario,
      equipesPresentes: novoDiario.equipesPresentes
    });
    setIsNewDiarioOpen(false);
    setNovoDiario({
      obraId: '',
      data: new Date().toISOString().split('T')[0],
      responsavel: '',
      atividadesRealizadas: '',
      equipesPresentes: [],
      condicoesClimaticas: 'ensolarado',
      problemasOcorridos: '',
      observacoes: ''
    });
  };

  const addEquipe = () => {
    if (novaEquipe.trim()) {
      setNovoDiario({
        ...novoDiario,
        equipesPresentes: [...novoDiario.equipesPresentes, novaEquipe.trim()]
      });
      setNovaEquipe("");
    }
  };

  const removeEquipe = (index: number) => {
    setNovoDiario({
      ...novoDiario,
      equipesPresentes: novoDiario.equipesPresentes.filter((_, i) => i !== index)
    });
  };

  const diariosFiltrados = selectedObra 
    ? diarios.filter(d => d.obraId === selectedObra)
    : diarios;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading">Diário de Obra</h1>
          <p className="text-muted-foreground mt-1">{diarios.length} registros cadastrados</p>
        </div>
        <Dialog open={isNewDiarioOpen} onOpenChange={setIsNewDiarioOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro de Diário de Obra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDiario} className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Obra *</Label>
                <Select value={novoDiario.obraId} onValueChange={v => setNovoDiario({...novoDiario, obraId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>
                    {obras.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input required type="date" value={novoDiario.data} onChange={e => setNovoDiario({...novoDiario, data: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Responsável *</Label>
                <Input required value={novoDiario.responsavel} onChange={e => setNovoDiario({...novoDiario, responsavel: e.target.value})} placeholder="Nome do responsável" />
              </div>
              <div className="space-y-2">
                <Label>Condições Climáticas</Label>
                <Select value={novoDiario.condicoesClimaticas} onValueChange={v => setNovoDiario({...novoDiario, condicoesClimaticas: v as CondicoesClimaticas})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ensolarado">Ensolarado</SelectItem>
                    <SelectItem value="nublado">Nublado</SelectItem>
                    <SelectItem value="chuvoso">Chuvoso</SelectItem>
                    <SelectItem value="ventoso">Ventoso</SelectItem>
                    <SelectItem value="ameno">Ameno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Atividades Realizadas</Label>
                <Textarea value={novoDiario.atividadesRealizadas} onChange={e => setNovoDiario({...novoDiario, atividadesRealizadas: e.target.value})} placeholder="Descreva as atividades realizadas..." className="resize-none" rows={3} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Equipes Presentes</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={novaEquipe} onChange={e => setNovaEquipe(e.target.value)} placeholder="Nome da equipe" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEquipe())} />
                  <Button type="button" variant="outline" onClick={addEquipe}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {novoDiario.equipesPresentes.map((eq, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded">
                      {eq}
                      <button type="button" onClick={() => removeEquipe(i)} className="hover:text-destructive">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Problemas Ocorridos</Label>
                <Textarea value={novoDiario.problemasOcorridos} onChange={e => setNovoDiario({...novoDiario, problemasOcorridos: e.target.value})} placeholder="Descreva problemas ocorridos..." className="resize-none" rows={2} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Observações</Label>
                <Textarea value={novoDiario.observacoes} onChange={e => setNovoDiario({...novoDiario, observacoes: e.target.value})} placeholder="Observações adicionais..." className="resize-none" rows={2} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewDiarioOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Registro</Button>
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

      {diariosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registro de diário de obra encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Registro" para criar o primeiro.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="equipes">Equipes</TabsTrigger>
            <TabsTrigger value="problemas">Problemas</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            {diariosFiltrados.map(diario => {
              const obra = obras.find(o => o.id === diario.obraId);
              return (
                <Card key={diario.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{obra?.nome || 'Obra não encontrada'}</CardTitle>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(diario.data)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Clima</p>
                          <p className="text-sm font-medium capitalize">{diario.condicoesClimaticas}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Equipes</p>
                          <p className="text-sm font-medium">{diario.equipesPresentes.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Responsável</p>
                          <p className="text-sm font-medium">{diario.responsavel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Problemas</p>
                          <p className="text-sm font-medium">{diario.problemasOcorridos ? 'Sim' : 'Nenhum'}</p>
                        </div>
                      </div>
                    </div>
                    {diario.atividadesRealizadas && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Atividades Realizadas</p>
                        <p className="text-sm">{diario.atividadesRealizadas}</p>
                      </div>
                    )}
                    {diario.problemasOcorridos && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Problemas Ocorridos</p>
                        <p className="text-sm text-destructive">{diario.problemasOcorridos}</p>
                      </div>
                    )}
                    {diario.observacoes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm text-muted-foreground">{diario.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="atividades" className="space-y-4">
            {diariosFiltrados.filter(d => d.atividadesRealizadas).map(diario => {
              const obra = obras.find(o => o.id === diario.obraId);
              return (
                <Card key={diario.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{obra?.nome}</CardTitle>
                      <span className="text-xs text-muted-foreground">{formatDate(diario.data)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{diario.atividadesRealizadas}</p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="equipes" className="space-y-4">
            {diariosFiltrados.filter(d => d.equipesPresentes.length > 0).map(diario => {
              const obra = obras.find(o => o.id === diario.obraId);
              return (
                <Card key={diario.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{obra?.nome}</CardTitle>
                      <span className="text-xs text-muted-foreground">{formatDate(diario.data)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {diario.equipesPresentes.map((eq, i) => (
                        <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="problemas" className="space-y-4">
            {diariosFiltrados.filter(d => d.problemasOcorridos).map(diario => {
              const obra = obras.find(o => o.id === diario.obraId);
              return (
                <Card key={diario.id} className="border-destructive/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{obra?.nome}</CardTitle>
                      <span className="text-xs text-muted-foreground">{formatDate(diario.data)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">{diario.problemasOcorridos}</p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
