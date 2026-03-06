import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { mockObras, mockAtividades, mockDespesas, formatCurrency } from "@/data/mockData";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Olá! Sou o assistente virtual do ObraCerta. Como posso ajudar você hoje?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      let responseText = "Desculpe, ainda estou aprendendo. Posso ajudar com informações sobre a quantidade de obras, status (em andamento), custos gerais, despesas, atividades e tarefas atrasadas. O que você gostaria de saber?";
      const lowerQuery = inputValue.toLowerCase();

      // Funções auxiliares para buscar palavras-chave (regex ou includes iterados)
      const hasAny = (keywords: string[]) => keywords.some(kw => lowerQuery.includes(kw));

      if (hasAny(["quantas obras", "total de obras", "numero de obras", "qtas obras"])) {
        responseText = `Atualmente, temos ${mockObras.length} obras cadastradas no sistema.`;
      } else if (hasAny(["andamento", "acontecendo", "rodando", "ativas"])) {
        const emAndamento = mockObras.filter(o => o.status === 'em_andamento').length;
        responseText = `Temos ${emAndamento} obras em andamento no momento.`;
      } else if (hasAny(["custo", "gasto", "valor", "dinheiro", "orcamento", "orçamento"])) {
        const custoTotal = mockObras.reduce((sum, o) => sum + o.custoRealizado, 0);
        const valorPlanejado = mockObras.reduce((sum, o) => sum + o.valorTotal, 0);
        responseText = `O custo total realizado de todas as obras é de ${formatCurrency(custoTotal)}, de um total planejado de ${formatCurrency(valorPlanejado)}.`;
      } else if (hasAny(["atrasada", "atraso", "atrasadas", "pendente"])) {
        const atrasadas = mockObras.reduce((sum, o) => sum + o.tarefasAtrasadas, 0);
        responseText = atrasadas > 0 ? `Atenção: existem ${atrasadas} tarefas atrasadas no total considerando todas as obras.` : `Não há tarefas atrasadas no momento!`;
      } else if (hasAny(["despesa", "despesas", "pagamentos"])) {
        const totalDespesas = mockDespesas.reduce((sum, d) => sum + d.valor, 0);
        responseText = `Temos ${mockDespesas.length} despesas registradas, totalizando ${formatCurrency(totalDespesas)}.`;
      } else if (hasAny(["atividade", "atividades", "tarefas"])) {
        const concluidas = mockAtividades.filter(a => a.status === 'concluida').length;
        responseText = `Temos ${mockAtividades.length} atividades cadastradas, das quais ${concluidas} já foram concluídas.`;
      } else if (hasAny(["quais obras", "lista de obras", "nome das obras"])) {
        const nomes = mockObras.map(o => o.nome).join(', ');
        responseText = `As obras cadastradas são: ${nomes}.`;
      } else if (hasAny(["finalizada", "concluida", "terminadas", "prontas"])) {
        const finalizadas = mockObras.filter(o => o.status === 'finalizada').length;
        responseText = finalizadas > 0 ? `Temos ${finalizadas} obras finalizadas.` : `Ainda não temos obras finalizadas.`;
      } else if (hasAny(["ola", "olá", "oi", "bom dia", "boa tarde", "boa noite"])) {
        responseText = "Olá! Pergunte sobre obras, custos, despesas, atividades ou tarefas atrasadas e eu responderei com os dados do sistema.";
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Janela de Chat */}
      {isOpen && (
        <div className="mb-4 bg-background border border-primary/20 rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Assistente ObraCerta</h3>
                <span className="text-[10px] text-primary-foreground/80 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/10 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-auto">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                    : "bg-background text-foreground border rounded-2xl rounded-bl-sm"
                    }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 mt-auto">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-background border-t">
            <div className="flex items-center gap-2 bg-muted/50 rounded-full pr-1 pl-4 py-1 border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent border-none text-sm focus:outline-none py-2"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 group relative"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
        </button>
      )}
    </div>
  );
}
