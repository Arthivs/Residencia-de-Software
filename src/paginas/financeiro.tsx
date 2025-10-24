import React, { useState } from 'react';
import { Download, Plus, Trash2, Eye } from 'lucide-react';
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

  // Função para formatar valor durante a digitação
  const formatarValorInput = (valor: string): string => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros === '') return '';
    
    // Converte para número e formata
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

  const calcularTotalRegistro = (registro: Omit<RegistroFinanceiro, 'id' | 'total'>): number => {
    const valores = [
      registro.locacao,
      registro.assessoriaJuridica,
      registro.assessoriaComunicacao,
      registro.combustivel,
      registro.debito,
      registro.credito,
      registro.outros
    ];

    return valores.reduce((sum, valor) => {
      return sum + parseValor(valor);
    }, 0);
  };

  const handleNovoRegistro = () => {
    // Validar se há pelo menos um valor preenchido
    const algumValorPreenchido = Object.values(formData)
      .slice(1) // Remove a data
      .some(valor => parseValor(valor) > 0);

    if (!algumValorPreenchido) {
      alert('Por favor, preencha pelo menos um valor antes de salvar.');
      return;
    }

    // Validar data
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

  const handleExportExcel = () => {
    // Criar CSV em vez de JSON para melhor compatibilidade
    const headers = ['Data', 'Locação', 'Assessoria Jurídica', 'Assessoria Comunicação', 'Combustível', 'Débito', 'Crédito', 'Outros', 'Total'];
    const csvData = registrosFinanceiros.map(registro => [
      registro.data,
      `R$ ${registro.locacao}`,
      `R$ ${registro.assessoriaJuridica}`,
      `R$ ${registro.assessoriaComunicacao}`,
      `R$ ${registro.combustivel}`,
      `R$ ${registro.debito}`,
      `R$ ${registro.credito}`,
      `R$ ${registro.outros}`,
      `R$ ${registro.total}`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'registros-financeiros.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Arquivo CSV exportado com sucesso!');
  };

  const handleVisualizarRegistro = (registro: RegistroFinanceiro) => {
    const detalhes = `
Data: ${registro.data}
  Locação: R$ ${registro.locacao}
  Assessoria Jurídica: R$ ${registro.assessoriaJuridica}
  Assessoria Comunicação: R$ ${registro.assessoriaComunicacao}
  Combustível: R$ ${registro.combustivel}
  Débito: R$ ${registro.debito}
  Crédito: R$ ${registro.credito}
  Outros: R$ ${registro.outros}
  Total: R$ ${registro.total}
    `.trim();

    alert(`📊 Detalhes do Registro:\n\n${detalhes}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500 bg-opacity-20">
            <FaMoneyBillWave className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Financeiro</h1>
            <p className="text-blue-100">Gerencie informações financeiras</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-gray-600">
            <span className="text-gray-400">Início</span>
            <span className="mx-2">›</span>
            <span className="text-blue-600 font-medium">Financeiro</span>
          </nav>
        </div>

        {/* Novo Registro Financeiro */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Novo Registro Financeiro</h2>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/AAAA"
                />
              </div>

              {/* Valor da Assessoria Jurídica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Assessoria Jurídica
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.valorAssessoriaJuridica}
                    onChange={(e) => handleInputChange('valorAssessoriaJuridica', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Valor do Combustível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Combustível
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.valorCombustivel}
                    onChange={(e) => handleInputChange('valorCombustivel', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Despesas no Crédito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Despesas no Crédito
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.despesasCredito}
                    onChange={(e) => handleInputChange('despesasCredito', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Valor da Locação do Imóvel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Locação do Imóvel
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.valorLocacaoImovel}
                    onChange={(e) => handleInputChange('valorLocacaoImovel', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Valor da Assessoria de Comunicação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Assessoria de Comunicação
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.valorAssessoriaComunicacao}
                    onChange={(e) => handleInputChange('valorAssessoriaComunicacao', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Despesas no Débito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Despesas no Débito
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.despesasDebito}
                    onChange={(e) => handleInputChange('despesasDebito', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Outras Despesas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outras Despesas
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formData.outrasDespesas}
                    onChange={(e) => handleInputChange('outrasDespesas', e.target.value)}
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Total Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Previsto:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {formatarValor(calcularTotalForm())}
                </span>
              </div>
            </div>

            {/* Divider e Botão */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={handleNovoRegistro}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Salvar Registro
              </button>
            </div>
          </div>
        </div>

        {/* Registros Financeiros */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Registros Financeiros</h2>
            <button 
              onClick={handleExportExcel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    DATA
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    LOCAÇÃO
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    ASS. JURÍDICA
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    ASS. COMUNICAÇÃO
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    COMBUSTÍVEL
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    DÉBITO
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    CRÉDITO
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    OUTROS
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    TOTAL
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrosFinanceiros.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-gray-500">
                      Nenhum registro financeiro encontrado.
                    </td>
                  </tr>
                ) : (
                  registrosFinanceiros.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm text-gray-700 font-medium">{registro.data}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.locacao)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.assessoriaJuridica)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.assessoriaComunicacao)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.combustivel)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.debito)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.credito)}</td>
                      <td className="p-3 text-sm text-gray-700">R$ {formatCurrencyDisplay(registro.outros)}</td>
                      <td className="p-3 text-sm text-gray-700 font-bold">R$ {formatCurrencyDisplay(registro.total)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleVisualizarRegistro(registro)}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Visualizar registro"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleExcluirRegistro(registro.id)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
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

          {/* Footer com contador */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {registrosFinanceiros.length} registro(s) financeiro(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;