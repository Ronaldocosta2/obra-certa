import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Orcamento } from '@/pages/OrcamentosPage';
import { formatCurrency, formatDate } from '@/data/mockData';

export async function generateOrcamentoPDF(orcamento: Orcamento, empresaName?: string) {
  // Criar elemento temporário para renderizar o conteúdo
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '14px';
  tempDiv.style.lineHeight = '1.6';
  tempDiv.style.color = '#333';

  // Conteúdo do PDF
  const statusLabels: Record<string, string> = {
    novo: 'Novo',
    em_negociacao: 'Em Negociação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    expirado: 'Expirado',
    convertido: 'Convertido'
  };

  tempDiv.innerHTML = `
    <div style="max-width: 210mm; margin: 0 auto;">
      <!-- Header -->
      <div style="border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #0066cc;">OBRA CERTA</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Gestão de Projetos e Obras</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #666;">Data de Impressão: ${formatDate(new Date().toISOString().split('T')[0])}</p>
          </div>
        </div>
      </div>

      <!-- Título e Status -->
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">Orçamento #${orcamento.id.substring(0, 8).toUpperCase()}</h2>
        <div style="display: flex; gap: 15px;">
          <div>
            <p style="margin: 0; font-size: 12px; color: #666;">STATUS</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #0066cc;">${statusLabels[orcamento.status] || orcamento.status}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 12px; color: #666;">CRIAÇÃO</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${formatDate(orcamento.dataCriacao)}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 12px; color: #666;">VALIDADE</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${formatDate(orcamento.dataValidade)}</p>
          </div>
        </div>
      </div>

      <!-- Dados do Cliente -->
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Dados do Cliente</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 50%; color: #666;">
              <strong>Cliente:</strong> ${orcamento.cliente}
            </td>
            ${orcamento.obraId ? `<td style="padding: 8px 0; color: #666;"><strong>Projeto ID:</strong> ${orcamento.obraId}</td>` : '<td style="padding: 8px 0;"></td>'}
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">
              <strong>Telefone:</strong> ${orcamento.telefone || '-'}
            </td>
            <td style="padding: 8px 0; color: #666;">
              <strong>Email:</strong> ${orcamento.email || '-'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Informações do Orçamento -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Informações do Orçamento</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 12px; border: 1px solid #ddd; background-color: #0066cc; color: white; font-weight: bold;">Descrição</td>
            <td style="padding: 12px; border: 1px solid #ddd; background-color: #0066cc; color: white; font-weight: bold; text-align: right; width: 120px;">Valor Total</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
              ${orcamento.descricao || '(Sem descrição)'}
            </td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 16px; font-weight: bold; color: #0066cc;">
              ${formatCurrency(orcamento.valor)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Observações -->
      ${orcamento.observacoes ? `
        <div style="background-color: #fffacd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 20px; border-radius: 3px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Observações</h3>
          <p style="margin: 0; white-space: pre-wrap; color: #666;">${orcamento.observacoes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999;">
        <p style="margin: 0;">Este documento foi gerado automaticamente pelo sistema OBRA CERTA.</p>
        <p style="margin: 5px 0 0 0;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Converter HTML para Canvas
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Criar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar imagem ao PDF com paginação
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Download do PDF
    pdf.save(`orcamento_${orcamento.cliente.replace(/\s+/g, '_')}_${orcamento.id.substring(0, 8)}.pdf`);
  } finally {
    // Remover elemento temporário
    document.body.removeChild(tempDiv);
  }
}
