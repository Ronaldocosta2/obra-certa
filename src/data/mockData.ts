export type ObraStatus = 'planejamento' | 'em_andamento' | 'pausada' | 'finalizada';

export interface Obra {
  id: string;
  nome: string;
  codigo: string;
  cliente: string;
  endereco: string;
  dataInicio: string;
  dataPrevistaConclusao: string;
  valorTotal: number;
  responsavelTecnico: string;
  status: ObraStatus;
  areaConstruida: number;
  tipoObra: 'residencial' | 'comercial' | 'industrial';
  descricao: string;
  progresso: number;
  custoRealizado: number;
  tarefasTotal: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
}

export interface Atividade {
  id: string;
  obraId: string;
  nome: string;
  descricao: string;
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  duracao: number;
  percentualConcluido: number;
  dependencias: string[];
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
}

export interface DiarioObra {
  id: string;
  obraId: string;
  data: string;
  responsavel: string;
  atividadesRealizadas: string;
  equipesPresentes: string[];
  condicoesClimaticas: string;
  problemasOcorridos: string;
  observacoes: string;
}

export interface Despesa {
  id: string;
  obraId: string;
  tipo: string;
  valor: number;
  data: string;
  fornecedor: string;
  categoria: 'mao_de_obra' | 'materiais' | 'equipamentos' | 'servicos_terceirizados';
}

export const mockObras: Obra[] = [
  {
    id: '1',
    nome: 'Edifício Aurora Residencial',
    codigo: 'OBR-2024-001',
    cliente: 'Construtora Horizonte',
    endereco: 'Av. Paulista, 1500 - São Paulo, SP',
    dataInicio: '2024-03-01',
    dataPrevistaConclusao: '2025-09-30',
    valorTotal: 12500000,
    responsavelTecnico: 'Eng. Carlos Silva',
    status: 'em_andamento',
    areaConstruida: 4500,
    tipoObra: 'residencial',
    descricao: 'Edifício residencial de 20 andares com 80 unidades',
    progresso: 45,
    custoRealizado: 5200000,
    tarefasTotal: 120,
    tarefasConcluidas: 54,
    tarefasAtrasadas: 3,
  },
  {
    id: '2',
    nome: 'Centro Comercial Vitória',
    codigo: 'OBR-2024-002',
    cliente: 'Grupo Vitória',
    endereco: 'Rua Augusta, 800 - São Paulo, SP',
    dataInicio: '2024-06-15',
    dataPrevistaConclusao: '2025-12-31',
    valorTotal: 8900000,
    responsavelTecnico: 'Eng. Maria Santos',
    status: 'em_andamento',
    areaConstruida: 3200,
    tipoObra: 'comercial',
    descricao: 'Centro comercial com 40 lojas e estacionamento',
    progresso: 28,
    custoRealizado: 2100000,
    tarefasTotal: 95,
    tarefasConcluidas: 27,
    tarefasAtrasadas: 5,
  },
  {
    id: '3',
    nome: 'Galpão Industrial Logística Plus',
    codigo: 'OBR-2024-003',
    cliente: 'Logística Plus LTDA',
    endereco: 'Rod. Anhanguera, Km 45 - Campinas, SP',
    dataInicio: '2024-01-10',
    dataPrevistaConclusao: '2024-11-30',
    valorTotal: 5600000,
    responsavelTecnico: 'Eng. Roberto Lima',
    status: 'finalizada',
    areaConstruida: 8000,
    tipoObra: 'industrial',
    descricao: 'Galpão industrial com 8.000m² para logística',
    progresso: 100,
    custoRealizado: 5450000,
    tarefasTotal: 80,
    tarefasConcluidas: 80,
    tarefasAtrasadas: 0,
  },
  {
    id: '4',
    nome: 'Condomínio Jardins do Sol',
    codigo: 'OBR-2025-001',
    cliente: 'Incorporadora Solar',
    endereco: 'Rua das Flores, 200 - Ribeirão Preto, SP',
    dataInicio: '2025-02-01',
    dataPrevistaConclusao: '2026-08-31',
    valorTotal: 15800000,
    responsavelTecnico: 'Eng. Ana Oliveira',
    status: 'planejamento',
    areaConstruida: 6200,
    tipoObra: 'residencial',
    descricao: 'Condomínio com 4 torres de 15 andares',
    progresso: 5,
    custoRealizado: 320000,
    tarefasTotal: 200,
    tarefasConcluidas: 10,
    tarefasAtrasadas: 0,
  },
  {
    id: '5',
    nome: 'Reforma Hospital Central',
    codigo: 'OBR-2024-004',
    cliente: 'Prefeitura Municipal',
    endereco: 'Av. Brasil, 500 - Sorocaba, SP',
    dataInicio: '2024-08-01',
    dataPrevistaConclusao: '2025-03-31',
    valorTotal: 3200000,
    responsavelTecnico: 'Eng. Pedro Costa',
    status: 'pausada',
    areaConstruida: 1200,
    tipoObra: 'comercial',
    descricao: 'Reforma da ala pediátrica do Hospital Central',
    progresso: 62,
    custoRealizado: 2100000,
    tarefasTotal: 45,
    tarefasConcluidas: 28,
    tarefasAtrasadas: 2,
  },
];

export const mockAtividades: Atividade[] = [
  { id: 'a1', obraId: '1', nome: 'Fundação', descricao: 'Execução das fundações', responsavel: 'Eq. Fundações', dataInicio: '2024-03-01', dataFim: '2024-05-15', duracao: 75, percentualConcluido: 100, dependencias: [], status: 'concluida' },
  { id: 'a2', obraId: '1', nome: 'Estrutura - Térreo ao 5º', descricao: 'Estrutura dos primeiros pavimentos', responsavel: 'Eq. Estrutura', dataInicio: '2024-05-16', dataFim: '2024-08-30', duracao: 106, percentualConcluido: 100, dependencias: ['a1'], status: 'concluida' },
  { id: 'a3', obraId: '1', nome: 'Estrutura - 6º ao 10º', descricao: 'Estrutura dos pavimentos intermediários', responsavel: 'Eq. Estrutura', dataInicio: '2024-09-01', dataFim: '2024-12-15', duracao: 105, percentualConcluido: 85, dependencias: ['a2'], status: 'em_andamento' },
  { id: 'a4', obraId: '1', nome: 'Instalações Elétricas', descricao: 'Infraestrutura elétrica geral', responsavel: 'Eq. Elétrica', dataInicio: '2024-08-01', dataFim: '2025-03-30', duracao: 241, percentualConcluido: 40, dependencias: ['a2'], status: 'em_andamento' },
  { id: 'a5', obraId: '1', nome: 'Instalações Hidráulicas', descricao: 'Infraestrutura hidráulica', responsavel: 'Eq. Hidráulica', dataInicio: '2024-08-15', dataFim: '2025-04-15', duracao: 243, percentualConcluido: 35, dependencias: ['a2'], status: 'atrasada' },
  { id: 'a6', obraId: '1', nome: 'Alvenaria', descricao: 'Execução de alvenaria', responsavel: 'Eq. Alvenaria', dataInicio: '2024-10-01', dataFim: '2025-05-30', duracao: 241, percentualConcluido: 20, dependencias: ['a3'], status: 'em_andamento' },
  { id: 'a7', obraId: '1', nome: 'Acabamentos', descricao: 'Acabamentos gerais', responsavel: 'Eq. Acabamento', dataInicio: '2025-03-01', dataFim: '2025-08-30', duracao: 183, percentualConcluido: 0, dependencias: ['a6'], status: 'pendente' },
  { id: 'a8', obraId: '1', nome: 'Paisagismo', descricao: 'Área externa e paisagismo', responsavel: 'Eq. Paisagismo', dataInicio: '2025-07-01', dataFim: '2025-09-30', duracao: 91, percentualConcluido: 0, dependencias: ['a7'], status: 'pendente' },
];

export const mockDespesas: Despesa[] = [
  { id: 'd1', obraId: '1', tipo: 'Concreto Usinado', valor: 850000, data: '2024-06-15', fornecedor: 'Concreteira ABC', categoria: 'materiais' },
  { id: 'd2', obraId: '1', tipo: 'Mão de obra - Fundações', valor: 420000, data: '2024-05-01', fornecedor: 'Equipe Própria', categoria: 'mao_de_obra' },
  { id: 'd3', obraId: '1', tipo: 'Aço CA-50', valor: 680000, data: '2024-07-20', fornecedor: 'Gerdau', categoria: 'materiais' },
  { id: 'd4', obraId: '1', tipo: 'Guindastes', valor: 320000, data: '2024-08-10', fornecedor: 'Locação Total', categoria: 'equipamentos' },
  { id: 'd5', obraId: '1', tipo: 'Projeto Elétrico', valor: 180000, data: '2024-03-15', fornecedor: 'EletroProjetos', categoria: 'servicos_terceirizados' },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export const statusConfig: Record<ObraStatus, { label: string; color: string }> = {
  planejamento: { label: 'Planejamento', color: 'bg-info text-info-foreground' },
  em_andamento: { label: 'Em Andamento', color: 'bg-success text-success-foreground' },
  pausada: { label: 'Pausada', color: 'bg-warning text-warning-foreground' },
  finalizada: { label: 'Finalizada', color: 'bg-muted text-muted-foreground' },
};
