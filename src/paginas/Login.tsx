import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center p-5">
      <div className="w-[800px] max-w-[95%] bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(11,44,88,0.12)]">
        <div className="flex flex-col md:flex-row">
          <div className="bg-[#0057b8] flex-1 flex items-center justify-center p-8 min-h-[300px] md:min-h-[450px]">
            <FaUserCircle className="text-[100px] text-white" />
          </div>

          <div className="flex-1 p-10 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
              <p className="text-gray-600 text-lg">Faça login para acessar o sistema</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0057b8]"
                  required
                />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0057b8]"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center text-sm mb-4">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" />
                  Lembrar acesso
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#0057b8] hover:bg-[#004494]'} text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
            <footer className="mt-8 text-center text-gray-500 text-sm">
              Sistema de Gestão Política v.1.0.0 
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}