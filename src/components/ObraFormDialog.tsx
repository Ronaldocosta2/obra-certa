import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Obra, ObraStatus } from "@/data/mockData";
import { useState, cloneElement, isValidElement } from "react";

interface ObraFormDialogProps {
  mode: 'create' | 'edit';
  initialData?: Obra;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: Omit<Obra, 'id' | 'userId' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>) => void;
  trigger?: React.ReactNode;
}

export default function ObraFormDialog({
  mode,
  initialData,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  onSubmit,
  trigger,
}: ObraFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onControlledOpenChange! : setInternalOpen;

  const [formData, setFormData] = useState<Omit<Obra, 'id' | 'userId' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>>({
    nome: initialData?.nome || '',
    codigo: initialData?.codigo || '',
    cliente: initialData?.cliente || '',
    endereco: initialData?.endereco || '',
    dataInicio: initialData?.dataInicio || '',
    dataPrevistaConclusao: initialData?.dataPrevistaConclusao || '',
    valorTotal: initialData?.valorTotal || 0,
    responsavelTecnico: initialData?.responsavelTecnico || '',
    status: initialData?.status || ('planejamento' as ObraStatus),
    areaConstruida: initialData?.areaConstruida || 0,
    tipoObra: initialData?.tipoObra || 'residencial',
    descricao: initialData?.descricao || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    if (!isControlled) {
      setFormData({
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
        tipoObra: 'residencial',
        descricao: '',
      });
    }
  };

  const triggerElement = trigger && isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
          trigger.props?.onClick?.(e);
        }
      })
    : trigger;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerElement}
      <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Cadastrar nova obra' : 'Editar obra'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Código da Obra</Label>
            <Input
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="Ex: OBR-2024-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nome da Obra</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Edifício Aurora"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              placeholder="Nome do cliente"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Responsável técnico</Label>
            <Input
              value={formData.responsavelTecnico}
              onChange={(e) => setFormData({ ...formData, responsavelTecnico: e.target.value })}
              placeholder="Eng. responsável"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Endereço completo"
            />
          </div>
          <div className="space-y-2">
            <Label>Data de início</Label>
            <Input
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data prevista de conclusão</Label>
            <Input
              type="date"
              value={formData.dataPrevistaConclusao}
              onChange={(e) => setFormData({ ...formData, dataPrevistaConclusao: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Planejado (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.valorTotal || ''}
              onChange={(e) => setFormData({ ...formData, valorTotal: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Área construída (m²)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.areaConstruida || ''}
              onChange={(e) => setFormData({ ...formData, areaConstruida: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de obra</Label>
            <Select value={formData.tipoObra} onValueChange={(v) => setFormData({ ...formData, tipoObra: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes do projeto..."
              className="resize-none"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Avançar e Criar Obra' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
