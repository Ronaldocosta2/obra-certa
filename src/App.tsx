import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ObrasPage from "@/pages/ObrasPage";
import ObraDetailPage from "@/pages/ObraDetailPage";
import CronogramaPage from "@/pages/CronogramaPage";
import DiarioPage from "@/pages/DiarioPage";
import FinanceiroPage from "@/pages/FinanceiroPage";
import DocumentosPage from "@/pages/DocumentosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/obras" element={<ObrasPage />} />
            <Route path="/obras/:id" element={<ObraDetailPage />} />
            <Route path="/cronograma" element={<CronogramaPage />} />
            <Route path="/diario" element={<DiarioPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/documentos" element={<DocumentosPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
