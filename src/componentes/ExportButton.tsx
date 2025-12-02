import { useState } from 'react';
import { Download, ChevronDown, Table, FileText } from 'lucide-react';
// Serviço de exportação inline
const exportToExcel = (data: any[], filename: string = 'export') => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + [Object.keys(data[0] || {}).join(",")]
    .concat(data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(",")
    )).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = (data: any[], filename: string = 'export') => {
  const printContent = `
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563EB; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2563EB; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Relatório de Ações</h1>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

interface ExportButtonProps {
  data: any[];
  disabled?: boolean;
  filename?: string;
}

export default function ExportButton({ data, disabled = false, filename = 'acoes' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (disabled || data.length === 0) return;

    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (format === 'excel') {
        exportToExcel(data, filename);
      } else {
        exportToPDF(data, filename);
      }
      
      console.log(`Exportado para ${format.toUpperCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  if (isExporting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg flex items-center gap-2 cursor-not-allowed"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        Exportando...
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || data.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        Exportar
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => handleExport('excel')}
              disabled={data.length === 0}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg"
            >
              <Table className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Excel (.csv)</div>
                <div className="text-xs text-gray-500">Planilha editável</div>
              </div>
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              disabled={data.length === 0}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg border-t border-gray-100"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <div>
                <div className="font-medium text-gray-900">PDF</div>
                <div className="text-xs text-gray-500">Documento formatado</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}