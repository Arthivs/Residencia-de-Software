// frontend/src/paginas/financeiro.tsx - VERSÃO CORRIGIDA
import { useState, useEffect, useRef } from 'react';
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
import { useDashConect } from '../conect/dashconect';
import { apiService } from '../services/api';
import type { RegistroFinanceiro as ApiRegistroFinanceiro } from '../services/api';

// Interface compatível com API
interface RegistroFinanceiroUI {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: string;
  formaPagamento: string;
  comprovante?: string;
  dataCriacao: string; // CORREÇÃO: string em vez de Date
  tags: string[];
}

function Financeiro() {
  const { data, atualizarFinanceiro } = useDashConect();
  const [registrosFinanceiros, setRegistrosFinanceiros] = useState<RegistroFinanceiroUI[]>([]);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: 'Assessoria Jurídica',
    valor: '',
    tipo: 'despesa',
    forma_pagamento: 'Transferência',
    tags: [] as string[]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor'>('data');
  const [loading, setLoading] = useState(false);

  // Refs para controle de loops
  const hasLoadedFinanceiro = useRef(false);
  const isFetching = useRef(false);

  // Carregar dados do contexto/backend - CORRIGIDO
  useEffect(() => {
    const carregarDados = async () => {
      // Evitar múltiplas chamadas
      if (isFetching.current || hasLoadedFinanceiro.current) {
        return;
      }

      // Se já temos dados no contexto, usar eles primeiro
      if (data.financeiro && data.financeiro.length > 0 && !hasLoadedFinanceiro.current) {
        console.log("📂 Usando dados do contexto para financeiro");
        const contextData = data.financeiro.map((reg: any) => ({
          id: reg.id,
          data: reg.data, // CORREÇÃO: usar diretamente a string
          descricao: reg.descricao,
          categoria: reg.categoria,
          valor: reg.valor,
          tipo: reg.tipo,
          formaPagamento: reg.formaPagamento,
          comprovante: reg.comprovante,
          dataCriacao: reg.dataCriacao, // CORREÇÃO: string, não converter para Date
          tags: reg.tags || []
        }));
        setRegistrosFinanceiros(contextData);
        hasLoadedFinanceiro.current = true;
        return;
      }

      // Carregar do servidor apenas se necessário
      try {
        isFetching.current = true;
        setLoading(true);
        
        console.log("📡 Buscando financeiro do servidor...");
        const financeiroData = await apiService.financeiro.getAll();
        
        // Converter para UI
        const registrosUI = financeiroData.map((reg: ApiRegistroFinanceiro) => ({
          id: reg.id.toString(),
          data: reg.data || new Date().toISOString().split('T')[0], // Usar string direto
          descricao: reg.descricao,
          categoria: reg.categoria,
          valor: reg.valor,
          tipo: reg.tipo,
          formaPagamento: reg.forma_pagamento,
          comprovante: reg.comprovante,
          dataCriacao: reg.data_criacao || new Date().toISOString(), // CORREÇÃO: string
          tags: Array.isArray(reg.tags) ? reg.tags : []
        }));
        
        setRegistrosFinanceiros(registrosUI);
        
        // Converter para o formato do contexto - CORREÇÃO: dataCriacao como string
        const registrosContexto = registrosUI.map(reg => ({
          id: reg.id,
          data: reg.data,
          descricao: reg.descricao,
          categoria: reg.categoria,
          valor: reg.valor,
          tipo: reg.tipo as "despesa" | "receita",
          formaPagamento: reg.formaPagamento,
          comprovante: reg.comprovante,
          dataCriacao: reg.dataCriacao, // CORREÇÃO: string
          tags: reg.tags
        }));
        
        atualizarFinanceiro(registrosContexto);
        hasLoadedFinanceiro.current = true;
        
      } catch (error) {
        console.error('❌ Erro ao carregar financeiro:', error);
        // Usar dados do contexto como fallback
        const contextData = data.financeiro.map((reg: any) => ({
          id: reg.id,
          data: reg.data,
          descricao: reg.descricao,
          categoria: reg.categoria,
          valor: reg.valor,
          tipo: reg.tipo,
          formaPagamento: reg.formaPagamento,
          comprovante: reg.comprovante,
          dataCriacao: reg.dataCriacao,
          tags: reg.tags || []
        }));
        setRegistrosFinanceiros(contextData);
        hasLoadedFinanceiro.current = true;
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    // Executar apenas uma vez
    carregarDados();

    // Cleanup
    return () => {
      hasLoadedFinanceiro.current = false;
    };
  }, []); // ← Array vazio para executar apenas uma vez

  // Função para formatar valor
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para criar novo registro
  const handleNovoRegistro = async () => {
    if (!formData.descricao || !formData.valor || !formData.data) {
      alert('Por favor, preencha descrição, valor e data.');
      return;
    }

    try {
      const novoRegistro: Omit<ApiRegistroFinanceiro, 'id' | 'data_criacao'> = {
        data: formData.data,
        descricao: formData.descricao,
        categoria: formData.categoria,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        forma_pagamento: formData.forma_pagamento,
        tags: formData.tags
      };

      const registroCriado = await apiService.financeiro.create(novoRegistro);
      
      // Adicionar à lista local
      const registroUI: RegistroFinanceiroUI = {
        id: registroCriado.id.toString(),
        data: registroCriado.data,
        descricao: registroCriado.descricao,
        categoria: registroCriado.categoria,
        valor: registroCriado.valor,
        tipo: registroCriado.tipo,
        formaPagamento: registroCriado.forma_pagamento,
        comprovante: registroCriado.comprovante,
        dataCriacao: registroCriado.data_criacao, // CORREÇÃO: string
        tags: Array.isArray(registroCriado.tags) ? registroCriado.tags : []
      };

      setRegistrosFinanceiros(prev => [registroUI, ...prev]);
      
      // Atualizar contexto
      const registroContexto = {
        id: registroUI.id,
        data: registroUI.data,
        descricao: registroUI.descricao,
        categoria: registroUI.categoria,
        valor: registroUI.valor,
        tipo: registroUI.tipo as "despesa" | "receita",
        formaPagamento: registroUI.formaPagamento,
        comprovante: registroUI.comprovante,
        dataCriacao: registroUI.dataCriacao, // CORREÇÃO: string
        tags: registroUI.tags
      };
      
      // Limpar formulário
      setFormData({
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria: 'Assessoria Jurídica',
        valor: '',
        tipo: 'despesa',
        forma_pagamento: 'Transferência',
        tags: []
      });

      alert('Registro financeiro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      alert('Erro ao salvar registro. Tente novamente.');
    }
  };

  // Função para excluir registro
  const handleExcluirRegistro = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro financeiro?')) {
      return;
    }

    try {
      await apiService.financeiro.delete(parseInt(id));
      setRegistrosFinanceiros(prev => prev.filter(reg => reg.id !== id));
      alert('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro. Tente novamente.');
    }
  };

  // Filtrar registros
  const registrosFiltrados = registrosFinanceiros
    .filter(registro => {
      const buscaTermo = searchTerm.toLowerCase();
      const buscaData = dataFiltro;
      
      const matchTermo = !buscaTermo || 
        registro.descricao.toLowerCase().includes(buscaTermo) ||
        registro.categoria.toLowerCase().includes(buscaTermo) ||
        formatarValor(registro.valor).includes(buscaTermo);
      
      const matchData = !buscaData || registro.data === buscaData;
      
      return matchTermo && matchData;
    })
    .sort((a, b) => {
      if (ordenacao === 'data') {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      } else {
        return b.valor - a.valor;
      }
    });

  // Calcular totais
  const calcularTotais = () => {
    const totais = {
      despesas: 0,
      receitas: 0,
      saldo: 0
    };

    registrosFinanceiros.forEach(registro => {
      if (registro.tipo === 'despesa') {
        totais.despesas += registro.valor;
      } else if (registro.tipo === 'receita') {
        totais.receitas += registro.valor;
      }
    });

    totais.saldo = totais.receitas - totais.despesas;
    return totais;
  };

  const totais = calcularTotais();

  // Categorias disponíveis
  const categorias = [
    'Assessoria Jurídica',
    'Assessoria Comunicação',
    'Locação Imóvel',
    'Combustível',
    'Material',
    'Transporte',
    'Alimentação',
    'Outros'
  ];

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
            <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
              Tempo Real
            </span>
          </div>
          <p className="text-blue-100 text-lg">
            Gestão financeira com atualização em tempo real
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {formatarValor(totais.receitas)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-xl font-bold text-red-600">
                  R$ {formatarValor(totais.despesas)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {formatarValor(totais.saldo)}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Formulário de Novo Registro */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Novo Registro Financeiro
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição do registro"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Transferência">Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Pix">Pix</option>
                </select>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={handleNovoRegistro}
                disabled={!formData.descricao || !formData.valor}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm ${
                  !formData.descricao || !formData.valor
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Salvar Registro
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição, categoria ou valor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as 'data' | 'valor')}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="data">Data (mais recente)</option>
                  <option value="valor">Maior valor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Registros */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Registros Financeiros {loading && '(Carregando...)'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    DATA
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    DESCRIÇÃO
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    CATEGORIA
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    VALOR
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    TIPO
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {loading ? 'Carregando registros...' : 'Nenhum registro encontrado.'}
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(registro.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {registro.descricao}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {registro.categoria}
                      </td>
                      <td className={`p-4 text-sm font-medium ${
                        registro.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        R$ {formatarValor(registro.valor)}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          registro.tipo === 'receita' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registro.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleExcluirRegistro(registro.id)}
                          className="p-2 rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {registrosFiltrados.length} de {registrosFinanceiros.length} registro(s)
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Saldo Atual: </span>
                <span className={`font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {formatarValor(totais.saldo)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;