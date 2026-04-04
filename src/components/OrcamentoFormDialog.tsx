import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, cloneElement, isValidElement } from "react";

interface Orcamento {
  id: string;
  userId: string;
  cliente: string;
  telefone: string;
  email: string;
  obraId?: string;
  valor: number;
  dataCriacao: string;
  dataValidade: string;
  descricao: string;
  status: string;
  observacoes: string;
  diasSemContato: number;
}

interface OrcamentoFormDialogProps {
  mode: 'create' | 'edit';
  initialData?: Orcamento;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: Omit<Orcamento, 'id' | 'userId' | 'dataCriacao' | 'diasSemContato' | 'status'>) => void;
  trigger?: React.ReactNode;
}

export default function OrcamentoFormDialog({
  mode,
  initialData,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  onSubmit,
  trigger,
}: OrcamentoFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onControlledOpenChange! : setInternalOpen;

  const [formData, setFormData] = useState({
    cliente: initialData?.cliente || '',
    telefone: initialData?.telefone || '',
    email: initialData?.email || '',
    valor: initialData?.valor || 0,
    dataValidade: initialData?.dataValidade || '',
    descricao: initialData?.descricao || '',
    observacoes: initialData?.observacoes || '',
    obraId: initialData?.obraId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    if (!isControlled) {
      setFormData({
        cliente: '',
        telefone: '',
        email: '',
        valor: 0,
        dataValidade: '',
        descricao: '',
        observacoes: '',
        obraId: '',
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
      <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo orçamento' : 'Editar orçamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Input
              required
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              placeholder="Nome do cliente"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.valor || ''}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data de validade</Label>
            <Input
              type="date"
              value={formData.dataValidade}
              onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do orçamento..."
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações..."
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Orçamento' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
