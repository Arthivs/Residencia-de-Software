// src/paginas/Financeiro.tsx
import { useState } from 'react';
import { 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  TrendingUp,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { FaMoneyBillWave } from 'react-icons/fa';

interface RegistroFinanceiro {
  id: string;
  data: string;
  locacao: string;
  assessoriaJuridica: string;
  assessoriaComunicacao: string;
  combustivel: string;
  debito: string;
  credito: string;
  outros: string;
  total: string;
}

function Financeiro() {
  const [formData, setFormData] = useState({
    dataRegistro: new Date().toLocaleDateString('pt-BR'),
    valorAssessoriaJuridica: '',
    valorCombustivel: '',
    despesasCredito: '',
    valorLocacaoImovel: '',
    valorAssessoriaComunicacao: '',
    despesasDebito: '',
    outrasDespesas: ''
  });

  const [registrosFinanceiros, setRegistrosFinanceiros] = useState<RegistroFinanceiro[]>([
    {
      id: '1',
      data: '02/07/2025',
      locacao: '40.000,00',
      assessoriaJuridica: '20.000,00',
      assessoriaComunicacao: '3.000,00',
      combustivel: '2.000,00',
      debito: '0,00',
      credito: '0,00',
      outros: '0,00',
      total: '65.000,00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<'data' | 'total'>('data');

  // Função para formatar valor durante a digitação
  const formatarValorInput = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros === '') return '';
    
    const numero = parseInt(apenasNumeros, 10) / 100;
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter formato brasileiro para número
  const parseValor = (valor: string): number => {
    if (!valor || valor.trim() === '') return 0;
    const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
    return parseFloat(valorLimpo) || 0;
  };

  // Função para formatar número para o formato brasileiro
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleInputChange = (field: string, value: string) => {
    if (field !== 'dataRegistro') {
      const valorFormatado = formatarValorInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: valorFormatado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calcularTotalForm = (): number => {
    const valores = [
      formData.valorAssessoriaJuridica,
      formData.valorCombustivel,
      formData.despesasCredito,
      formData.valorLocacaoImovel,
      formData.valorAssessoriaComunicacao,
      formData.despesasDebito,
      formData.outrasDespesas
    ];

    return valores.reduce((sum, valor) => {
      return sum + parseValor(valor);
    }, 0);
  };

  // Filtrar e ordenar registros
  const registrosFiltrados = registrosFinanceiros
    .filter(registro => {
      const buscaTermo = searchTerm.toLowerCase();
      const buscaData = dataFiltro;
      
      const matchTermo = !buscaTermo || 
        registro.data.toLowerCase().includes(buscaTermo) ||
        registro.total.toLowerCase().includes(buscaTermo);
      
      const matchData = !buscaData || registro.data === buscaData;
      
      return matchTermo && matchData;
    })
    .sort((a, b) => {
      if (ordenacao === 'data') {
        return new Date(b.data.split('/').reverse().join('-')).getTime() - 
               new Date(a.data.split('/').reverse().join('-')).getTime();
      } else {
        return parseValor(b.total) - parseValor(a.total);
      }
    });

  // Calcular totais gerais
  const calcularTotaisGerais = () => {
    const totais = {
      locacao: 0,
      assessoriaJuridica: 0,
      assessoriaComunicacao: 0,
      combustivel: 0,
      debito: 0,
      credito: 0,
      outros: 0,
      total: 0
    };

    registrosFinanceiros.forEach(registro => {
      totais.locacao += parseValor(registro.locacao);
      totais.assessoriaJuridica += parseValor(registro.assessoriaJuridica);
      totais.assessoriaComunicacao += parseValor(registro.assessoriaComunicacao);
      totais.combustivel += parseValor(registro.combustivel);
      totais.debito += parseValor(registro.debito);
      totais.credito += parseValor(registro.credito);
      totais.outros += parseValor(registro.outros);
      totais.total += parseValor(registro.total);
    });

    return totais;
  };

  const totaisGerais = calcularTotaisGerais();

  const handleNovoRegistro = () => {
    const algumValorPreenchido = Object.values(formData)
      .slice(1)
      .some(valor => parseValor(valor) > 0);

    if (!algumValorPreenchido) {
      alert('Por favor, preencha pelo menos um valor antes de salvar.');
      return;
    }

    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!formData.dataRegistro || !dataRegex.test(formData.dataRegistro)) {
      alert('Por favor, insira uma data válida no formato DD/MM/AAAA.');
      return;
    }

    const novoRegistro: RegistroFinanceiro = {
      id: Date.now().toString(),
      data: formData.dataRegistro,
      locacao: formData.valorLocacaoImovel || '0,00',
      assessoriaJuridica: formData.valorAssessoriaJuridica || '0,00',
      assessoriaComunicacao: formData.valorAssessoriaComunicacao || '0,00',
      combustivel: formData.valorCombustivel || '0,00',
      debito: formData.despesasDebito || '0,00',
      credito: formData.despesasCredito || '0,00',
      outros: formData.outrasDespesas || '0,00',
      total: formatarValor(calcularTotalForm())
    };

    setRegistrosFinanceiros(prev => [novoRegistro, ...prev]);

    // Limpar formulário mantendo a data atual
    setFormData({
      dataRegistro: new Date().toLocaleDateString('pt-BR'),
      valorAssessoriaJuridica: '',
      valorCombustivel: '',
      despesasCredito: '',
      valorLocacaoImovel: '',
      valorAssessoriaComunicacao: '',
      despesasDebito: '',
      outrasDespesas: ''
    });

    alert('Registro financeiro salvo com sucesso!');
  };

  const handleLimparFormulario = () => {
    if (window.confirm('Deseja limpar todos os campos do formulário?')) {
      setFormData({
        dataRegistro: new Date().toLocaleDateString('pt-BR'),
        valorAssessoriaJuridica: '',
        valorCombustivel: '',
        despesasCredito: '',
        valorLocacaoImovel: '',
        valorAssessoriaComunicacao: '',
        despesasDebito: '',
        outrasDespesas: ''
      });
    }
  };

  const handleExportExcel = () => {
    const headers = ['Data', 'Locação', 'Assessoria Jurídica', 'Assessoria Comunicação', 'Combustível', 'Débito', 'Crédito', 'Outros', 'Total'];
    const csvData = registrosFinanceiros.map(registro => [
      registro.data,
      parseValor(registro.locacao).toFixed(2),
      parseValor(registro.assessoriaJuridica).toFixed(2),
      parseValor(registro.assessoriaComunicacao).toFixed(2),
      parseValor(registro.combustivel).toFixed(2),
      parseValor(registro.debito).toFixed(2),
      parseValor(registro.credito).toFixed(2),
      parseValor(registro.outros).toFixed(2),
      parseValor(registro.total).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros-financeiros-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Arquivo CSV exportado com sucesso!');
  };

  const handleVisualizarRegistro = (registro: RegistroFinanceiro) => {
    const detalhes = `
📊 **DETALHES DO REGISTRO FINANCEIRO**

**Data:** ${registro.data}

**Despesas:**
• Locação: R$ ${registro.locacao}
• Assessoria Jurídica: R$ ${registro.assessoriaJuridica}
• Assessoria Comunicação: R$ ${registro.assessoriaComunicacao}
• Combustível: R$ ${registro.combustivel}
• Débito: R$ ${registro.debito}
• Crédito: R$ ${registro.credito}
• Outros: R$ ${registro.outros}

**TOTAL:** R$ ${registro.total}
    `.trim();

    alert(detalhes);
  };

  const handleExcluirRegistro = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro financeiro?')) {
      setRegistrosFinanceiros(prev => prev.filter(registro => registro.id !== id));
      alert('Registro excluído com sucesso!');
    }
  };

  const formatCurrencyDisplay = (value: string): string => {
    if (!value || value === '0' || value === '0,00') return '0,00';
    return value;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Cabeçalho azul padronizado */}
      <div className="bg-blue-600 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-2">
            <FaMoneyBillWave className="w-8 h-8 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Financeiro
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Gerencie informações financeiras
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Caminho de navegação */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="text-[#114A6D] font-medium">Início</span> &gt; Financeiro
            </p>
          </div>

          <div className="p-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Geral</p>
                    <p className="text-xl font-bold text-green-600">R$ {formatarValor(totaisGerais.total)}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Total Registros</p>
                <p className="text-xl font-bold text-blue-600">{registrosFinanceiros.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Média por Registro</p>
                <p className="text-xl font-bold text-purple-600">
                  R$ {formatarValor(registrosFinanceiros.length > 0 ? totaisGerais.total / registrosFinanceiros.length : 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Última Atualização</p>
                    <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Novo Registro Financeiro */}
            <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Novo Registro Financeiro
                </h2>
                <button
                  onClick={handleLimparFormulario}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Limpar
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Data do Registro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data do Registro
                    </label>
                    <input
                      type="text"
                      value={formData.dataRegistro}
                      onChange={(e) => handleInputChange('dataRegistro', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DD/MM/AAAA"
                    />
                  </div>

                  {/* Campos financeiros otimizados */}
                  {[
                    { field: 'valorAssessoriaJuridica', label: 'Assessoria Jurídica' },
                    { field: 'valorCombustivel', label: 'Combustível' },
                    { field: 'despesasCredito', label: 'Despesas no Crédito' },
                    { field: 'valorLocacaoImovel', label: 'Locação do Imóvel' },
                    { field: 'valorAssessoriaComunicacao', label: 'Assessoria de Comunicação' },
                    { field: 'despesasDebito', label: 'Despesas no Débito' },
                    { field: 'outrasDespesas', label: 'Outras Despesas' }
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <input
                          type="text"
                          value={formData[field as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Preview */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Total Previsto:</span>
                      <p className="text-xs text-gray-500">Este será o valor do novo registro</p>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      R$ {formatarValor(calcularTotalForm())}
                    </span>
                  </div>
                </div>

                {/* Botão Salvar */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <button
                    onClick={handleNovoRegistro}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Salvar Registro
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de Ferramentas */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  {/* Busca */}
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por data ou valor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Filtro por data */}
                  <div className="relative flex-1 md:flex-none">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por data..."
                      value={dataFiltro}
                      onChange={(e) => setDataFiltro(e.target.value)}
                      className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  {/* Ordenação */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Ordenar por:</span>
                    <select
                      value={ordenacao}
                      onChange={(e) => setOrdenacao(e.target.value as 'data' | 'total')}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="data">Data (mais recente)</option>
                      <option value="total">Maior valor</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleExportExcel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>

            {/* Registros Financeiros */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Registros Financeiros</h2>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {registrosFiltrados.length} de {registrosFinanceiros.length} registro(s)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        DATA
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        LOCAÇÃO
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        ASS. JURÍDICA
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        ASS. COMUNICAÇÃO
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        COMBUSTÍVEL
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        DÉBITO
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        CRÉDITO
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        OUTROS
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        TOTAL
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <FileText className="w-12 h-12 opacity-50" />
                            <p>Nenhum registro financeiro encontrado.</p>
                            {(searchTerm || dataFiltro) && (
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setDataFiltro('');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                              >
                                Limpar filtros
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      registrosFiltrados.map((registro) => (
                        <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {registro.data}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.locacao)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.assessoriaJuridica)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.assessoriaComunicacao)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.combustivel)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.debito)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.credito)}</td>
                          <td className="p-4 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.outros)}</td>
                          <td className="p-4 text-sm font-bold text-green-600">R$ {formatCurrencyDisplay(registro.total)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleVisualizarRegistro(registro)}
                                className="p-2 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Visualizar registro"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleExcluirRegistro(registro.id)}
                                className="p-2 rounded text-red-600 hover:bg-red-50 transition-colors"
                                title="Excluir registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer com totais */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {registrosFiltrados.length} registro(s)
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Total Geral: </span>
                    <span className="font-bold text-green-600">R$ {formatarValor(totaisGerais.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;