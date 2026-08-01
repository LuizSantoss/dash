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
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // API chamada dinamicamente pelo padrão ${} do .env
      const url = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_LOGIN}`;
      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao fazer login.');
      }

      contexto?.login(dados.token);

      // Redirecionamento por perfil
      if (dados.usuario.perfil === 'GERENTE') navigate('/gerente');
      else if (dados.usuario.perfil === 'RH') navigate('/rh');
      else if (dados.usuario.perfil === 'DIRETORIA') navigate('/diretoria');
      else if (dados.usuario.perfil === 'ADM') navigate('/adm'); // Suporte ao novo ADM
      else navigate('/');
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-emerald-500">
        <h1 className="text-3xl font-bold text-center text-emerald-800 mb-2">Dash RH</h1>
        <p className="text-sm text-center text-gray-600 mb-6">Acesse o seu painel de requisições</p>

        {erro && (
          <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 rounded mb-6 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail corporativo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="exemplo@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-emerald-900/20 disabled:opacity-50"
          >
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}