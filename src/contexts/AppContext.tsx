import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Obra, Atividade, Despesa, DiarioObra, 
  mockObras, mockAtividades, mockDespesas 
} from '@/data/mockData';

export interface Documento {
  id: string;
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
  
  obras: Obra[];
  addObra: (obra: Omit<Obra, 'id' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>) => void;
  updateObra: (id: string, obra: Partial<Obra>) => void;
  deleteObra: (id: string) => void;

  atividades: Atividade[];
  addAtividade: (atividade: Omit<Atividade, 'id'>) => void;
  updateAtividade: (id: string, atividade: Partial<Atividade>) => void;
  deleteAtividade: (id: string) => void;

  despesas: Despesa[];
  addDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  updateDespesa: (id: string, despesa: Partial<Despesa>) => void;
  deleteDespesa: (id: string) => void;

  diarios: DiarioObra[];
  addDiario: (diario: Omit<DiarioObra, 'id'>) => void;
  updateDiario: (id: string, diario: Partial<DiarioObra>) => void;
  deleteDiario: (id: string) => void;

  documentos: Documento[];
  addDocumento: (doc: Omit<Documento, 'id'>) => void;
  deleteDocumento: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('isDemoMode') === 'true');
  
  const [obras, setObras] = useState<Obra[]>(() => {
    const saved = localStorage.getItem('obras');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [atividades, setAtividades] = useState<Atividade[]>(() => {
    const saved = localStorage.getItem('atividades');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [despesas, setDespesas] = useState<Despesa[]>(() => {
    const saved = localStorage.getItem('despesas');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [diarios, setDiarios] = useState<DiarioObra[]>(() => {
    const saved = localStorage.getItem('diarios');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [documentos, setDocumentos] = useState<Documento[]>(() => {
    const saved = localStorage.getItem('documentos');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('obras', JSON.stringify(obras));
  }, [obras]);

  useEffect(() => {
    localStorage.setItem('atividades', JSON.stringify(atividades));
  }, [atividades]);

  useEffect(() => {
    localStorage.setItem('despesas', JSON.stringify(despesas));
  }, [despesas]);

  useEffect(() => {
    localStorage.setItem('diarios', JSON.stringify(diarios));
  }, [diarios]);

  useEffect(() => {
    localStorage.setItem('documentos', JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem('isDemoMode', isDemoMode.toString());
    if (isDemoMode && obras.length === 0) {
      setObras(mockObras);
      setAtividades(mockAtividades);
      setDespesas(mockDespesas);
    }
  }, [isDemoMode]);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setObras(mockObras);
    setAtividades(mockAtividades);
    setDespesas(mockDespesas);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setObras([]);
    setAtividades([]);
    setDespesas([]);
    setDiarios([]);
    setDocumentos([]);
  };

  // OBRAS
  const addObra = (data: Omit<Obra, 'id' | 'progresso' | 'custoRealizado' | 'tarefasTotal' | 'tarefasConcluidas' | 'tarefasAtrasadas' | 'pedreirosAtuantes'>) => {
    const newObra: Obra = {
      ...data,
      id: crypto.randomUUID(),
      progresso: 0,
      custoRealizado: 0,
      tarefasTotal: 0,
      tarefasConcluidas: 0,
      tarefasAtrasadas: 0,
      pedreirosAtuantes: 0,
    };
    setObras(prev => [...prev, newObra]);
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
  const addAtividade = (data: Omit<Atividade, 'id'>) => {
    const newAt = { ...data, id: crypto.randomUUID() };
    setAtividades(prev => [...prev, newAt]);
  };
  const updateAtividade = (id: string, data: Partial<Atividade>) => {
    setAtividades(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const deleteAtividade = (id: string) => {
    setAtividades(prev => prev.filter(a => a.id !== id && a.parentId !== id));
  };

  // DESPESAS
  const addDespesa = (data: Omit<Despesa, 'id'>) => {
    const newDesp = { ...data, id: crypto.randomUUID() };
    setDespesas(prev => [...prev, newDesp]);
    
    // Atualiza o custoRealizado da obra correspondente
    setObras(prev => prev.map(o => {
      if (o.id === data.obraId) {
        return { ...o, custoRealizado: o.custoRealizado + data.valor };
      }
      return o;
    }));
  };
  const updateDespesa = (id: string, data: Partial<Despesa>) => {
    const oldDesp = despesas.find(d => d.id === id);
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    
    // Recalcula o custo da obra correspondente se o valor ou obra mudarem
    if (oldDesp && data.valor !== undefined && data.valor !== oldDesp.valor && (!data.obraId || data.obraId === oldDesp.obraId)) {
      setObras(prev => prev.map(o => {
        if (o.id === oldDesp.obraId) {
          return { ...o, custoRealizado: o.custoRealizado - oldDesp.valor + (data.valor ?? 0) };
        }
        return o;
      }));
    }
  };
  const deleteDespesa = (id: string) => {
    const oldDesp = despesas.find(d => d.id === id);
    setDespesas(prev => prev.filter(d => d.id !== id));
    
    if (oldDesp) {
      setObras(prev => prev.map(o => {
        if (o.id === oldDesp.obraId) {
          return { ...o, custoRealizado: Math.max(0, o.custoRealizado - oldDesp.valor) };
        }
        return o;
      }));
    }
  };

  // DIARIOS
  const addDiario = (data: Omit<DiarioObra, 'id'>) => setDiarios(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
  const updateDiario = (id: string, data: Partial<DiarioObra>) => setDiarios(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  const deleteDiario = (id: string) => setDiarios(prev => prev.filter(d => d.id !== id));

  // DOCUMENTOS
  const addDocumento = (data: Omit<Documento, 'id'>) => setDocumentos(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
  const deleteDocumento = (id: string) => setDocumentos(prev => prev.filter(d => d.id !== id));

  return (
    <AppContext.Provider value={{
      isDemoMode, enableDemoMode, disableDemoMode,
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
