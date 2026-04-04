import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Obra, Atividade, Despesa, DiarioObra, 
  mockObras, mockAtividades, mockDespesas 
} from '@/data/mockData';
import { useAuth } from './AuthContext';

export interface Documento {
  id: string;
  userId: string;
  obraId: string;
  nome: string;
  tamanho: string;
  dataUpload: string;
  tipo: string;
}

interface AppContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  clearUserData: () => void;
  
  obras: Obra[];
  addObra: (obra: Omit<Obra, 'id' | 'userId' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>) => void;
  updateObra: (id: string, obra: Partial<Obra>) => void;
  deleteObra: (id: string) => void;

  atividades: Atividade[];
  addAtividade: (atividade: Omit<Atividade, 'id' | 'userId'>) => void;
  updateAtividade: (id: string, atividade: Partial<Atividade>) => void;
  deleteAtividade: (id: string) => void;

  despesas: Despesa[];
  addDespesa: (despesa: Omit<Despesa, 'id' | 'userId'>) => void;
  updateDespesa: (id: string, despesa: Partial<Despesa>) => void;
  deleteDespesa: (id: string) => void;

  diarios: DiarioObra[];
  addDiario: (diario: Omit<DiarioObra, 'id' | 'userId'>) => void;
  updateDiario: (id: string, diario: Partial<DiarioObra>) => void;
  deleteDiario: (id: string) => void;

  documentos: Documento[];
  addDocumento: (doc: Omit<Documento, 'id'>) => void;
  deleteDocumento: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('isDemoMode') === 'true');
  
  // Helper functions para isolação por user_id
  const getStorageKey = (key: string) => {
    if (!currentUserId) return null;
    return `${currentUserId}:${key}`;
  };

  const loadUserData = (key: string, defaultValue: any[] = []) => {
    if (!currentUserId) return defaultValue;
    const storageKey = getStorageKey(key);
    if (!storageKey) return defaultValue;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const saveUserData = (key: string, data: any) => {
    if (!currentUserId) return;
    const storageKey = getStorageKey(key);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  // Estados inicializados com dados do usuário
  const [obras, setObras] = useState<Obra[]>(() => loadUserData('obras'));
  const [atividades, setAtividades] = useState<Atividade[]>(() => loadUserData('atividades'));
  const [despesas, setDespesas] = useState<Despesa[]>(() => loadUserData('despesas'));
  const [diarios, setDiarios] = useState<DiarioObra[]>(() => loadUserData('diarios'));
  const [documentos, setDocumentos] = useState<Documento[]>(() => loadUserData('documentos'));

  // Persiste dados ao localStorage (com isolação por user_id)
  useEffect(() => {
    saveUserData('obras', obras);
  }, [obras]);

  useEffect(() => {
    saveUserData('atividades', atividades);
  }, [atividades]);

  useEffect(() => {
    saveUserData('despesas', despesas);
  }, [despesas]);

  useEffect(() => {
    saveUserData('diarios', diarios);
  }, [diarios]);

  useEffect(() => {
    saveUserData('documentos', documentos);
  }, [documentos]);

  // Limpa dados quando usuário muda
  useEffect(() => {
    if (currentUserId) {
      setObras(loadUserData('obras'));
      setAtividades(loadUserData('atividades'));
      setDespesas(loadUserData('despesas'));
      setDiarios(loadUserData('diarios'));
      setDocumentos(loadUserData('documentos'));
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('isDemoMode', isDemoMode.toString());
    if (isDemoMode && obras.length === 0 && currentUserId) {
      // Adiciona userId aos dados mock
      const mockObrasWithUser = mockObras.map(o => ({ ...o, userId: currentUserId }));
      const mockAtividadesWithUser = mockAtividades.map(a => ({ ...a, userId: currentUserId }));
      const mockDespesasWithUser = mockDespesas.map(d => ({ ...d, userId: currentUserId }));
      
      setObras(mockObrasWithUser);
      setAtividades(mockAtividadesWithUser);
      setDespesas(mockDespesasWithUser);
    }
  }, [isDemoMode, currentUserId]);

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setObras([]);
    setAtividades([]);
    setDespesas([]);
    setDiarios([]);
    setDocumentos([]);
  };

  // Limpa dados do usuário ao fazer logout
  const clearUserData = () => {
    setObras([]);
    setAtividades([]);
    setDespesas([]);
    setDiarios([]);
    setDocumentos([]);
  };

  // Função para calcular progresso da obra baseado nas atividades
  const calcularProgressoObra = (obraId: string, atividadesList: Atividade[]) => {
    const atividadesDaObra = atividadesList.filter(a => a.obraId === obraId && !a.parentId);
    
    if (atividadesDaObra.length === 0) return 0;
    
    const totalPercentual = atividadesDaObra.reduce((sum, atividade) => {
      return sum + (atividade.percentualConcluido || 0);
    }, 0);
    
    return Math.round(totalPercentual / atividadesDaObra.length);
  };

  // Função para atualizar progresso da obra
  const atualizarProgressoObra = (obraId: string, atividadesList: Atividade[]) => {
    const novoProgresso = calcularProgressoObra(obraId, atividadesList);
    setObras(prev => prev.map(o => 
      o.id === obraId ? { ...o, progresso: novoProgresso } : o
    ));
  };

  // OBRAS
  const addObra = (data: Omit<Obra, 'id' | 'userId' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>) => {
    if (!currentUserId) return;
    const newObra: Obra = {
      ...data,
      id: crypto.randomUUID(),
      userId: currentUserId,
      progresso: 0,
      custoRealizado: 0,
      tarefasTotal: 0,
      tarefasConcluidas: 0,
      tarefasAtrasadas: 0,
      pedreirosAtuantes: 0,
    };
    setObras(prev => [...prev, newObra]);
    console.log(`✅ Obra criada: ${data.nome} (${data.codigo}) para usuário ${currentUserId}`);
  };

  const updateObra = (id: string, data: Partial<Obra>) => {
    setObras(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const deleteObra = (id: string) => {
    setObras(prev => prev.filter(o => o.id !== id));
    setAtividades(prev => prev.filter(a => a.obraId !== id));
    setDespesas(prev => prev.filter(d => d.obraId !== id));
    setDiarios(prev => prev.filter(d => d.obraId !== id));
    setDocumentos(prev => prev.filter(d => d.obraId !== id));
  };

  // ATIVIDADES
  const addAtividade = (data: Omit<Atividade, 'id' | 'userId'>) => {
    if (!currentUserId) return;
    const newAt: Atividade = { ...data, id: crypto.randomUUID(), userId: currentUserId };
    setAtividades(prev => {
      const updated = [...prev, newAt];
      atualizarProgressoObra(data.obraId, updated);
      return updated;
    });
  };

  const updateAtividade = (id: string, data: Partial<Atividade>) => {
    setAtividades(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...data } : a);
      const obraId = updated.find(a => a.id === id)?.obraId;
      if (obraId) {
        atualizarProgressoObra(obraId, updated);
      }
      return updated;
    });
  };

  const deleteAtividade = (id: string) => {
    setAtividades(prev => {
      const obraId = prev.find(a => a.id === id)?.obraId;
      const updated = prev.filter(a => a.id !== id && a.parentId !== id);
      if (obraId) {
        atualizarProgressoObra(obraId, updated);
      }
      return updated;
    });
  };

  // DESPESAS
  const addDespesa = (data: Omit<Despesa, 'id' | 'userId'>) => {
    if (!currentUserId) return;
    const newDesp: Despesa = { ...data, id: crypto.randomUUID(), userId: currentUserId };
    setDespesas(prev => [...prev, newDesp]);
    
    const valorPago = data.valor * (data.parcelasPagas / data.parcelasContratadas);
    setObras(prev => prev.map(o => {
      if (o.id === data.obraId) {
        return { ...o, custoRealizado: o.custoRealizado + valorPago };
      }
      return o;
    }));
  };
  const updateDespesa = (id: string, data: Partial<Despesa>) => {
    const oldDesp = despesas.find(d => d.id === id);
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    
    if (oldDesp) {
      const newValor = data.valor ?? oldDesp.valor;
      const newPagas = data.parcelasPagas ?? oldDesp.parcelasPagas;
      const newContratadas = data.parcelasContratadas ?? oldDesp.parcelasContratadas;
      const oldValorPago = oldDesp.valor * (oldDesp.parcelasPagas / oldDesp.parcelasContratadas);
      const newValorPago = newValor * (newPagas / newContratadas);
      
      const obraId = data.obraId ?? oldDesp.obraId;
      setObras(prev => prev.map(o => {
        if (o.id === obraId) {
          return { ...o, custoRealizado: o.custoRealizado - oldValorPago + newValorPago };
        }
        return o;
      }));
    }
  };
  const deleteDespesa = (id: string) => {
    const oldDesp = despesas.find(d => d.id === id);
    setDespesas(prev => prev.filter(d => d.id !== id));
    
    if (oldDesp) {
      const valorPago = oldDesp.valor * (oldDesp.parcelasPagas / oldDesp.parcelasContratadas);
      setObras(prev => prev.map(o => {
        if (o.id === oldDesp.obraId) {
          return { ...o, custoRealizado: Math.max(0, o.custoRealizado - valorPago) };
        }
        return o;
      }));
    }
  };

  // DIARIOS
  const addDiario = (data: Omit<DiarioObra, 'id' | 'userId'>) => {
    if (!currentUserId) return;
    setDiarios(prev => [...prev, { ...data, id: crypto.randomUUID(), userId: currentUserId }]);
  };
  const updateDiario = (id: string, data: Partial<DiarioObra>) => setDiarios(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  const deleteDiario = (id: string) => setDiarios(prev => prev.filter(d => d.id !== id));

  // DOCUMENTOS
  const addDocumento = (data: Omit<Documento, 'id' | 'userId'>) => {
    if (!currentUserId) return;
    setDocumentos(prev => [...prev, { ...data, id: crypto.randomUUID(), userId: currentUserId }]);
  };
  const deleteDocumento = (id: string) => setDocumentos(prev => prev.filter(d => d.id !== id));

  return (
    <AppContext.Provider value={{
      isDemoMode, enableDemoMode, disableDemoMode, clearUserData,
      obras, addObra, updateObra, deleteObra,
      atividades, addAtividade, updateAtividade, deleteAtividade,
      despesas, addDespesa, updateDespesa, deleteDespesa,
      diarios, addDiario, updateDiario, deleteDiario,
      documentos, addDocumento, deleteDocumento
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
