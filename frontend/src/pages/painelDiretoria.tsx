
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';
import { io } from 'socket.io-client';

interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: { cargoSolicitado: string; departamento: string; };
  gerente: { nome: string; };
  dadosRH: { rhCargo: string; rhSalario: string; rhCodigo: string; rhDataAdmissao: string; };
  avaliacaoDiretoria?: { decisao: string; observacao: string; }; // Adicionado para o histórico
}

export default function PainelDiretoria() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [historico, setHistorico] = useState<Requisicao[]>([]); // Novo estado para o histórico
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<Requisicao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const config = { headers: { 'Authorization': `Bearer ${contexto?.token}` } };
        
        // Fazemos as duas buscas ao mesmo tempo para a tela carregar mais rápido (Promise.all)
        const [resPendentes, resHistorico] = await Promise.all([
          fetch('http://localhost:3000/api/requisicoes/diretoria', config),
          fetch('http://localhost:3000/api/requisicoes/diretoria/historico', config)
        ]);

        if (!resPendentes.ok || !resHistorico.ok) throw new Error('Falha ao carregar os dados.');

        const dadosPendentes = await resPendentes.json();
        const dadosHistorico = await resHistorico.json();

        setRequisicoes(dadosPendentes);
        setHistorico(dadosHistorico);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    if (contexto?.token) carregarDados();

    const socket = io('http://localhost:3000');
    socket.on('status_atualizado', (reqAtualizada: Requisicao) => {
      if (reqAtualizada.status === 'Aguardando Diretoria') {
        setRequisicoes(prev => prev.find(r => r.id === reqAtualizada.id) ? prev : [reqAtualizada, ...prev]);
      } else if (reqAtualizada.status === 'Aprovada' || reqAtualizada.status === 'Recusada') {
        // Se outro diretor aprovar, move da lista de pendentes para o histórico em tempo real
        setRequisicoes(prev => prev.filter(r => r.id !== reqAtualizada.id));
        setHistorico(prev => prev.find(r => r.id === reqAtualizada.id) ? prev : [reqAtualizada, ...prev]);
      }
    });

    return () => { socket.disconnect(); };
  }, [contexto?.token]);

  const handleAvaliar = async (decisao: 'Aprovado' | 'Recusado') => {
    if (!requisicaoSelecionada) return;
    
    setProcessando(true);
    try {
      const resposta = await fetch(`http://localhost:3000/api/requisicoes/${requisicaoSelecionada.id}/avaliar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${contexto?.token}`
        },
        body: JSON.stringify({ decisao, observacao })
      });

      if (!resposta.ok) throw new Error('Erro ao processar a avaliação.');

      const dados = await resposta.json();
      const reqAtualizada = dados.requisicao;

      alert(`Requisição ${decisao.toLowerCase()} com sucesso!`);
      
      // Atualiza o ecrã instantaneamente
      setRequisicoes(prev => prev.filter(r => r.id !== reqAtualizada.id));
      setHistorico(prev => [reqAtualizada, ...prev]);
      
      setRequisicaoSelecionada(null);
      setObservacao('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel da Diretoria</h1>
          <p className="text-slate-500">Aprovação final e histórico de decisões.</p>
        </div>
        <button 
          onClick={contexto?.logout}
          className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-5 py-2 rounded-lg font-medium transition-all"
        >
          Sair
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Pendentes */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
          <div className="bg-slate-800 text-white p-4 font-semibold flex justify-between">
            <span>Aguardando Aprovação</span>
            <span className="bg-slate-600 px-2 rounded-full text-xs flex items-center">{requisicoes.length}</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {carregando ? (
              <div className="p-4 text-center text-slate-500">A carregar...</div>
            ) : erro ? (
              <div className="p-4 text-center text-red-500">{erro}</div>
            ) : requisicoes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhuma requisição pendente.</div>
            ) : (
              <div className="space-y-2">
                {requisicoes.map((req) => (
                  <div 
                    key={req.id} 
                    className={`p-4 rounded-lg cursor-pointer border transition-colors ${requisicaoSelecionada?.id === req.id ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'border-transparent hover:bg-slate-50 border-b-slate-100'}`}
                    onClick={() => setRequisicaoSelecionada(req)}
                  >
                    <p className="font-bold text-slate-800">{req.dadosRH?.rhCargo || req.dadosGerais.cargoSolicitado}</p>
                    <p className="text-xs text-slate-500 mt-1">{req.dadosGerais.departamento} • Solicitante: {req.gerente?.nome}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Detalhes da Avaliação OU Histórico */}
        <div className="md:col-span-2">
          
          {requisicaoSelecionada ? (
            // ==========================================
            // VISTA 1: AVALIAR REQUISIÇÃO (Ativa quando clica num pendente)
            // ==========================================
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in h-full">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Avaliar Requisição</h2>
                <button onClick={() => setRequisicaoSelecionada(null)} className="text-slate-400 hover:text-slate-600 text-sm bg-slate-100 px-3 py-1 rounded-full">
                  ✕ Fechar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Dados do Pedido</h3>
                  <p className="text-sm text-slate-800 mb-2"><strong>Cargo:</strong> {requisicaoSelecionada.dadosGerais.cargoSolicitado}</p>
                  <p className="text-sm text-slate-800 mb-2"><strong>Departamento:</strong> {requisicaoSelecionada.dadosGerais.departamento}</p>
                  <p className="text-sm text-slate-800"><strong>Gerente Solicitante:</strong> {requisicaoSelecionada.gerente.nome}</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase mb-3">Impacto Financeiro (RH)</h3>
                  <p className="text-sm text-slate-800 mb-2"><strong>Cargo Final:</strong> {requisicaoSelecionada.dadosRH.rhCargo}</p>
                  <p className="text-sm text-slate-800 mb-2"><strong>Salário Final:</strong> <span className="font-bold text-indigo-700">{requisicaoSelecionada.dadosRH.rhSalario}</span></p>
                  <p className="text-sm text-slate-800 mb-2"><strong>Centro de Custos:</strong> {requisicaoSelecionada.dadosRH.rhCodigo}</p>
                  <p className="text-sm text-slate-800"><strong>Admissão Prevista:</strong> {new Date(requisicaoSelecionada.dadosRH.rhDataAdmissao).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Observação da Diretoria (Opcional)
                </label>
                <textarea 
                  rows={3} 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Aprovado conforme orçamento do trimestre..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleAvaliar('Aprovado')} disabled={processando}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  ✓ Aprovar Contratação
                </button>
                <button 
                  onClick={() => handleAvaliar('Recusado')} disabled={processando}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-bold transition-all"
                >
                  ✕ Recusar
                </button>
              </div>
            </div>

          ) : (

            // ==========================================
            // VISTA 2: HISTÓRICO DE DECISÕES (Padrão)
            // ==========================================
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[80vh] flex flex-col animate-fade-in">
              <div className="bg-slate-50 p-5 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Histórico de Decisões</h2>
                <p className="text-sm text-slate-500">Requisições que já foram avaliadas por si ou por outros Diretores.</p>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                {historico.length === 0 && !carregando ? (
                  <div className="text-center text-slate-400 mt-10">Nenhum histórico disponível.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-3 font-semibold">Cargo</th>
                        <th className="pb-3 font-semibold">Departamento</th>
                        <th className="pb-3 font-semibold">Decisão</th>
                        <th className="pb-3 font-semibold">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historico.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-800 text-sm">{req.dadosRH?.rhCargo || req.dadosGerais.cargoSolicitado}</td>
                          <td className="py-3 pr-4 text-slate-600 text-sm">{req.dadosGerais.departamento}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 text-sm italic max-w-[200px] truncate">
                            {req.avaliacaoDiretoria?.observacao || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
