import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Tipos para exportação
interface ExportOptions {
  filename?: string;
  includeDate?: boolean;
  orientation?: 'portrait' | 'landscape';
}

// Serviço de exportação para Excel
export const exportToExcel = (data: any[], columns: any[], options: ExportOptions = {}) => {
  const {
    filename = 'export',
    includeDate = true
  } = options;

  // Preparar dados para Excel
  const excelData = data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      if (col.key in item) {
        row[col.title] = item[col.key];
      }
    });
    return row;
  });

  // Criar workbook e worksheet
  const ws = utils.json_to_sheet(excelData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Dados');

  // Gerar nome do arquivo
  const dateSuffix = includeDate ? `_${new Date().toISOString().split('T')[0]}` : '';
  const fileName = `${filename}${dateSuffix}.xlsx`;

  // Download
  writeFile(wb, fileName);
};

// Serviço de exportação para PDF
export const exportToPDF = (data: any[], columns: any[], options: ExportOptions = {}) => {
  const {
    filename = 'export',
    includeDate = true,
    orientation = 'portrait'
  } = options;

  // Criar PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  // Adicionar título
  const date = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(16);
  doc.text('Relatório de Ações', 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${date}`, 14, 22);

  // Preparar dados para a tabela
  const headers = columns.map(col => col.title);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Formatar valores especiais
      if (col.key === 'data' && value) {
        return new Date(value).toLocaleDateString('pt-BR');
      }
      if (col.key === 'lat' || col.key === 'lng') {
        return value ? Number(value).toFixed(6) : '-';
      }
      return value || '-';
    })
  );

  // Adicionar tabela
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246] // Cinza claro
    }
  });

  // Gerar nome do arquivo
  const dateSuffix = includeDate ? `_${new Date().toISOString().split('T')[0]}` : '';
  const fileName = `${filename}${dateSuffix}.pdf`;

  // Download
  doc.save(fileName);
};

// Serviço específico para Ações
export const acoesExportService = {
  exportAcoesToExcel: (acoes: any[]) => {
    const columns = [
      { key: 'titulo', title: 'Título' },
      { key: 'tipo', title: 'Tipo' },
      { key: 'bairro', title: 'Bairro' },
      { key: 'cidade', title: 'Cidade' },
      { key: 'data', title: 'Data' },
      { key: 'descricao', title: 'Descrição' },
      { key: 'lat', title: 'Latitude' },
      { key: 'lng', title: 'Longitude' },
      { key: 'endereco', title: 'Endereço' }
    ];

    exportToExcel(acoes, columns, {
      filename: 'acoes_vereador',
      includeDate: true
    });
  },

  exportAcoesToPDF: (acoes: any[]) => {
    const columns = [
      { key: 'titulo', title: 'Título' },
      { key: 'tipo', title: 'Tipo' },
      { key: 'bairro', title: 'Bairro' },
      { key: 'data', title: 'Data' },
      { key: 'descricao', title: 'Descrição' }
    ];

    exportToPDF(acoes, columns, {
      filename: 'acoes_vereador',
      includeDate: true,
      orientation: 'landscape'
    });
  }
};