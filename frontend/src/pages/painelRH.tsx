import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';
import { io } from 'socket.io-client';

interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: { cargoSolicitado: string; departamento: string; };
  gerente: { nome: string; setor?: string; }; // NOVO: Mapeamento de setor incluído
}

export default function PainelRH() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const buscarRequisicoes = async () => {
      try {
        const resposta = await fetch(`${apiUrl}${import.meta.env.VITE_API_REQ_RH}`, {
          headers: { 'Authorization': `Bearer ${contexto?.token}` }
        });
        if (!resposta.ok) throw new Error('Falha ao carregar a caixa de entrada.');
        const dados = await resposta.json();
        setRequisicoes(dados);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    if (contexto?.token) buscarRequisicoes();

    // Socket.io via variável de ambiente
    const socket = io(apiUrl);
    
    socket.on('nova_requisicao', (novaReq: Requisicao) => {
      setRequisicoes((prev) => [novaReq, ...prev.filter(r => r.id !== novaReq.id)]);
    });

    socket.on('status_atualizado', (reqAtualizada: Requisicao) => {
      setRequisicoes((prev) =>
        prev.map(r => r.id === reqAtualizada.id ? reqAtualizada : r)
      );
    });

    return () => {
      socket.off('nova_requisicao');
      socket.off('status_atualizado');
      socket.disconnect();
    };
  }, [contexto?.token, apiUrl]);

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
      {/* Cabeçalho Verde Escuro da Empresa */}
      <header className="bg-emerald-800 text-white shadow-lg px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Caixa de Entrada (RH)</h1>
          <p className="text-sm text-emerald-100">Triagem e preenchimento financeiro das requisições</p>
        </div>
        <button
          onClick={() => { contexto?.logout(); navigate('/login'); }}
          className="bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-lg text-sm font-semibold transition border border-emerald-700"
        >
          Sair
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {carregando ? (
          <p className="text-center text-gray-600 py-12 font-medium">A carregar dados do sistema...</p>
        ) : erro ? (
          <div className="bg-rose-100 text-rose-700 p-4 rounded-lg font-medium">{erro}</div>
        ) : requisicoes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow border border-gray-200">
            <p className="text-gray-500 font-medium">Nenhuma requisição na sua caixa de entrada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900 uppercase text-xs font-bold border-b border-gray-200">
                  <th className="p-4">Cargo / Departamento</th>
                  <th className="p-4">Solicitante (Setor)</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {requisicoes.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-semibold text-gray-800">
                      {req.dadosGerais?.cargoSolicitado}
                      <span className="block text-xs font-normal text-gray-500">{req.dadosGerais?.departamento}</span>
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="font-medium">{req.gerente?.nome}</span>
                      {/* NOVO: Exibindo o setor de quem solicitou */}
                      <span className="block text-xs text-emerald-700 font-semibold">
                        Setor: {req.gerente?.setor || 'Não informado'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(req.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${corStatus(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {req.status === 'Pendente' ? (
                        <button
                          onClick={() => navigate(`/rh/analise/${req.id}`)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow"
                        >
                          Analisar / Preencher
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">Em processamento</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}