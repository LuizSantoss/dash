import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Impede a página de recarregar
    setErro('');
    setCarregando(true);

    try {
      // 1. Faz o pedido à nossa API Node.js
      const resposta = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      // 2. Se a API retornar um erro (ex: senha errada), mostramos no ecrã
      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao fazer login.');
      }

      // 3. Sucesso! Guardamos o token na memória (AuthContext)
      contexto?.login(dados.token);

      // 4. A Rota Inteligente: redireciona com base no perfil que veio do banco
      if (dados.usuario.perfil === 'GERENTE') navigate('/gerente');
      else if (dados.usuario.perfil === 'RH') navigate('/rh');
      else if (dados.usuario.perfil === 'DIRETORIA') navigate('/diretoria');
      else navigate('/'); // Fallback de segurança

    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dash RH</h1>
          <p className="text-gray-500 mt-2">Acesse o seu painel de requisições</p>
        </div>

        {/* Caixa de Mensagem de Erro */}
        {erro && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-200">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail corporativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="exemplo@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full text-white font-medium py-2.5 rounded-lg transition-all ${
              carregando 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
            }`}
          >
            {carregando ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
        </form>
        
      </div>
    </div>
  );
}
