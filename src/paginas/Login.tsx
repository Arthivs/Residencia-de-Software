import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0057b8]"
                />
                <input
                  type="password"
                  placeholder="Sua senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0057b8]"
                />
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" />
                  Lembrar acesso
                </label>
                <a href="#" className="text-[#0057b8] hover:underline">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0057b8] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#004494] transition-colors"
              >
                Entrar
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