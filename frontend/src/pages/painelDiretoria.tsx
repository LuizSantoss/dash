import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

// Definimos o formato (tipagem) do que esperamos receber da nossa API
interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: {
    cargoSolicitado: string;
    departamento: string;
  };
}

export default function PainelGerente() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  // O useEffect roda automaticamente assim que a página abre
  useEffect(() => {
    const buscarRequisicoes = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/requisicoes/minhas', {
          method: 'GET',
          headers: {
            // A chave mágica: enviamos o token para provar quem somos!
            'Authorization': `Bearer ${contexto?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resposta.ok) throw new Error('Falha ao carregar os dados.');

        const dados = await resposta.json();
        setRequisicoes(dados);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    if (contexto?.token) {
      buscarRequisicoes();
    }
  }, [contexto?.token]);

  // Função auxiliar para pintar a etiqueta de status com a cor correta
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
      {/* Cabeçalho da Página */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel do Gerente</h1>
          <p className="text-gray-500">Olá, {contexto?.usuario?.perfil}. Bem-vindo de volta.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/gerente/nova')} // Rota que vamos criar a seguir!
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
          >
            + Nova Requisição
          </button>
          <button 
            onClick={contexto?.logout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Área da Lista de Requisições */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-gray-500">Carregando requisições...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500">{erro}</div>
        ) : requisicoes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Você ainda não criou nenhuma requisição de pessoal.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Cargo Solicitado</th>
                <th className="p-4 font-semibold">Departamento</th>
                <th className="p-4 font-semibold">Data do Pedido</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {requisicoes.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{req.dadosGerais.cargoSolicitado}</td>
                  <td className="p-4 text-gray-600">{req.dadosGerais.departamento}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(req.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${corStatus(req.status)}`}>
                      {req.status}
                    </span>
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
