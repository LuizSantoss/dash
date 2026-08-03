import { useEffect, useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  setor?: string;
}

interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: { cargoSolicitado: string; departamento: string; };
  gerente: { nome: string; email: string; setor?: string; };
}

export default function PainelADM() {
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'requisicoes'>('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados para alteração de senha
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const carregarDadosADM = async () => {
      setCarregando(true);
      setErro('');
      try {
        const config = { headers: { 'Authorization': `Bearer ${contexto?.token}` } };

        // Chamadas dinâmicas utilizando as rotas padronizadas do .env
        const urlUsuarios = `${apiUrl}${import.meta.env.VITE_API_AUTH_USUARIOS}`;
        const urlRequisicoes = `${apiUrl}${import.meta.env.VITE_API_REQ_ADM_TODAS}`;

        const [resUsuarios, resRequisicoes] = await Promise.all([
          fetch(urlUsuarios, config),
          fetch(urlRequisicoes, config)
        ]);

        if (!resUsuarios.ok || !resRequisicoes.ok) {
          throw new Error('Falha ao carregar os dados administrativos.');
        }

        const dadosUsuarios = await resUsuarios.json();
        const dadosRequisicoes = await resRequisicoes.json();

        setUsuarios(dadosUsuarios);
        setRequisicoes(dadosRequisicoes);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    if (contexto?.token) {
      carregarDadosADM();
    }
  }, [contexto?.token, apiUrl]);

  const handleAlterarSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuarioSelecionado || !novaSenha.trim()) return;

    setSalvandoSenha(true);
    try {
      const url = `${apiUrl}${import.meta.env.VITE_API_AUTH_ALTERAR_SENHA}`;
      const resposta = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${contexto?.token}`
        },
        body: JSON.stringify({
          idUsuario: usuarioSelecionado.id,
          novaSenha: novaSenha.trim()
        })
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.erro || 'Erro ao alterar senha.');
      }

      alert(`Senha do utilizador "${usuarioSelecionado.nome}" alterada com sucesso!`);
      setUsuarioSelecionado(null);
      setNovaSenha('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const corPerfil = (perfil: string) => {
    switch (perfil) {
      case 'ADM': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DIRETORIA': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'RH': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const corStatus = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Aguardando Diretoria': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Aprovada': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Recusada': return 'bg-rose-100 text-rose-800 border border-rose-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho Verde Escuro Corporativo */}
      <header className="bg-emerald-800 text-white shadow-lg px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Painel de Controlo — ADM</h1>
          <p className="text-sm text-emerald-100">
            Administração global de usuários, senhas e acompanhamento do sistema
          </p>
        </div>
        <button
          onClick={() => { contexto?.logout(); navigate('/login'); }}
          className="bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-lg text-sm font-semibold transition border border-emerald-700"
        >
          Sair
        </button>
      </header>

      {/* Barra de Navegação entre Abas */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          <button
            onClick={() => setAbaAtiva('usuarios')}
            className={`py-4 px-2 text-sm font-bold border-b-2 transition ${
              abaAtiva === 'usuarios'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Gestão de Usuários & Senhas ({usuarios.length})
          </button>
          <button
            onClick={() => setAbaAtiva('requisicoes')}
            className={`py-4 px-2 text-sm font-bold border-b-2 transition ${
              abaAtiva === 'requisicoes'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Visão Global das Requisições ({requisicoes.length})
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        {carregando ? (
          <p className="text-center text-gray-600 py-12 font-medium">
            A carregar dados globais do sistema...
          </p>
        ) : erro ? (
          <div className="bg-rose-100 text-rose-700 p-4 rounded-lg font-medium">{erro}</div>
        ) : abaAtiva === 'usuarios' ? (
          /* ==========================================
             ABA 1: TABELA DE USUÁRIOS
             ========================================== */
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900 uppercase text-xs font-bold border-b border-gray-200">
                  <th className="p-4">Nome / E-mail</th>
                  <th className="p-4">Perfil de Acesso</th>
                  <th className="p-4">Setor</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usuarios.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{usr.nome}</p>
                      <span className="text-xs text-gray-500">{usr.email}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${corPerfil(usr.perfil)}`}>
                        {usr.perfil}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-700 font-semibold">
                      {usr.setor || 'Não informado'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setUsuarioSelecionado(usr);
                          setNovaSenha('');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow"
                      >
                        Redefinir Senha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==========================================
             ABA 2: TABELA GLOBAL DE REQUISIÇÕES
             ========================================== */
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900 uppercase text-xs font-bold border-b border-gray-200">
                  <th className="p-4">Cargo / Departamento</th>
                  <th className="p-4">Gerente Solicitante</th>
                  <th className="p-4">Setor</th>
                  <th className="p-4">Data do Pedido</th>
                  <th className="p-4">Status Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {requisicoes.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{req.dadosGerais.cargoSolicitado}</p>
                      <span className="text-xs text-gray-500">{req.dadosGerais.departamento}</span>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      {req.gerente.nome}
                    </td>
                    <td className="p-4 text-emerald-700 font-semibold">
                      {req.gerente.setor || 'Não informado'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(req.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${corStatus(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL DE REDEFINIÇÃO DE SENHA
          ========================================== */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-emerald-600">
            <h3 className="text-lg font-bold text-emerald-900">Redefinir Senha</h3>
            <p className="text-sm text-gray-600 mt-1">
              Alterar a senha do utilizador: <strong className="text-gray-800">{usuarioSelecionado.nome}</strong>
            </p>

            <form onSubmit={handleAlterarSenha} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  placeholder="Digite a nova senha..."
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUsuarioSelecionado(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoSenha}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-sm transition shadow disabled:opacity-50"
                >
                  {salvandoSenha ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
