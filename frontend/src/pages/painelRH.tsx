import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';
import { io } from 'socket.io-client';

// A tipagem ajustada para o que a rota do RH devolve (inclui os dados do Gerente)
interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: {
    cargoSolicitado: string;
    departamento: string;
  };
  gerente: {
    nome: string;
  };
}

export default function PainelRH() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Carregamento Inicial das Requisições
    const buscarRequisicoes = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/requisicoes/rh', {
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

    // 2. Conexão com o WebSocket para atualizações em Tempo Real
    const socket = io('http://localhost:3000');

    // Escuta novas requisições criadas pelos gerentes
    socket.on('nova_requisicao', (novaRequisicao: Requisicao) => {
      // Adiciona a nova requisição no topo da lista automaticamente
      setRequisicoes((estadoAnterior) => [novaRequisicao, ...estadoAnterior]);
    });

    // Escuta atualizações de status (ex: Diretoria aprovou)
    socket.on('status_atualizado', (requisicaoAtualizada: Requisicao) => {
      setRequisicoes((estadoAnterior) => 
        estadoAnterior.map(req => req.id === requisicaoAtualizada.id ? requisicaoAtualizada : req)
      );
    });

    // Limpeza da conexão quando o utilizador sai da página
    return () => {
      socket.disconnect();
    };
  }, [contexto?.token]);

  const corStatus = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Diretoria': return 'bg-blue-100 text-blue-800';
      case 'Aprovada': return 'bg-green-100 text-green-800';
      case 'Recusada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caixa de Entrada (RH)</h1>
          <p className="text-gray-500">Faz a triagem e o preenchimento financeiro das requisições.</p>
        </div>
        <button 
          onClick={contexto?.logout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition-all"
        >
          Sair
        </button>
      </div>

      {/* Tabela de Requisições */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-gray-500">A carregar dados...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500">{erro}</div>
        ) : requisicoes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhuma requisição na tua caixa de entrada.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Cargo / Departamento</th>
                <th className="p-4 font-semibold">Solicitante</th>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {requisicoes.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{req.dadosGerais?.cargoSolicitado}</p>
                    <p className="text-xs text-gray-500">{req.dadosGerais?.departamento}</p>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {/* O nome do gerente vem através da relação (JOIN) do Prisma! */}
                    {req.gerente?.nome} 
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(req.criadoEm).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${corStatus(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'Pendente' ? (
                      <button 
                        // Iremos criar a página de "Análise do RH" no próximo passo
                        onClick={() => navigate(`/rh/analise/${req.id}`)}
                        className="text-sm bg-blue-50 text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                      >
                        Analisar / Preencher
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">Em processamento</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
