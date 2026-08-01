import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';
import { io } from 'socket.io-client';

interface Requisicao {
  id: string;
  status: string;
  criadoEm: string;
  dadosGerais: { cargoSolicitado: string; departamento: string; };
  gerente: { nome: string; setor?: string; };
  dadosRH: { rhCargo: string; rhSalario: string; rhCodigo: string; rhDataAdmissao: string; };
  avaliacaoDiretoria?: { decisao: string; observacao: string; };
}

export default function PainelDiretoria() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [historico, setHistorico] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<Requisicao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
  const carregarDados = async () => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${contexto?.token}` } };
      
      const urlPendentes = `${apiUrl}${import.meta.env.VITE_API_REQ_DIRETORIA}`;
      const urlHistorico = `${apiUrl}${import.meta.env.VITE_API_REQ_DIRETORIA_HISTORICO}`;

      const [resPendentes, resHistorico] = await Promise.all([
        fetch(urlPendentes, config),
        fetch(urlHistorico, config)
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

  const socket = io(apiUrl);
  socket.on('status_atualizado', (reqAtualizada: Requisicao) => {
    if (reqAtualizada.status === 'Aguardando Diretoria') {
      setRequisicoes(prev => [reqAtualizada, ...prev.filter(r => r.id !== reqAtualizada.id)]);
    } else if (reqAtualizada.status === 'Aprovada' || reqAtualizada.status === 'Recusada') {
      setRequisicoes(prev => prev.filter(r => r.id !== reqAtualizada.id));
      setHistorico(prev => [reqAtualizada, ...prev.filter(r => r.id !== reqAtualizada.id)]);
    }
  });

    return () => {
      socket.off('status_atualizado');
      socket.disconnect();
    };
  }, [contexto?.token, apiUrl]);

  const handleAvaliar = async (decisao: 'Aprovado' | 'Recusado') => {
    if (!requisicaoSelecionada) return;
    setProcessando(true);

    try {
      const reqBase = import.meta.env.VITE_API_REQ_BASE;
      const url = `${apiUrl}${reqBase}/${requisicaoSelecionada.id}/avaliar`;

      const resposta = await fetch(url, {
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
      setRequisicoes(prev => prev.filter(r => r.id !== reqAtualizada.id));
      setHistorico(prev => [reqAtualizada, ...prev.filter(r => r.id !== reqAtualizada.id)]);
      setRequisicaoSelecionada(null);
      setObservacao('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho Verde Escuro Executivo */}
      <header className="bg-emerald-800 text-white shadow-lg px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Portal da Diretoria Executiva</h1>
          <p className="text-sm text-emerald-100">Avaliação final, custos organizacionais e histórico de decisões</p>
        </div>
        <button
          onClick={() => { contexto?.logout(); navigate('/login'); }}
          className="bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-lg text-sm font-semibold transition border border-emerald-700"
        >
          Sair
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: Aguardando Aprovação */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 md:col-span-1">
          <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center justify-between">
            Aguardando Aprovação
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs">
              {requisicoes.length}
            </span>
          </h2>

          {carregando ? (
            <p className="text-sm text-gray-500">A carregar solicitações...</p>
          ) : requisicoes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma requisição aguardando avaliação.</p>
          ) : (
            <div className="space-y-3">
              {requisicoes.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setRequisicaoSelecionada(req)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    requisicaoSelecionada?.id === req.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-gray-800 text-sm">
                    {req.dadosRH?.rhCargo || req.dadosGerais.cargoSolicitado}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitante: <span className="font-semibold text-gray-700">{req.gerente.nome}</span>
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    Setor: {req.gerente.setor || 'Não informado'}
                  </p>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                    <span>{req.dadosGerais.departamento}</span>
                    <span>{new Date(req.criadoEm).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA / CENTRAL: Painel de Avaliação ou Histórico */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 md:col-span-2">
          {requisicaoSelecionada ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">
                    {requisicaoSelecionada.dadosRH?.rhCargo || requisicaoSelecionada.dadosGerais.cargoSolicitado}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Departamento: {requisicaoSelecionada.dadosGerais.departamento} | 
                    Setor do Solicitante: <strong className="text-emerald-700">{requisicaoSelecionada.gerente.setor || 'Não informado'}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setRequisicaoSelecionada(null)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Fechar ✕
                </button>
              </div>

              {/* Informações Financeiras do RH */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  Resumo Financeiro (Preenchido por RH)
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Salário Projetado</span>
                    <strong className="text-gray-800">{requisicaoSelecionada.dadosRH?.rhSalario || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Código / Centro de Custo</span>
                    <strong className="text-gray-800">{requisicaoSelecionada.dadosRH?.rhCodigo || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Observações da Diretoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações da Diretoria (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Deixe observações ou diretrizes sobre a contratação..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Ações: Aprovar ou Recusar */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => handleAvaliar('Aprovado')}
                  disabled={processando}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition shadow-md disabled:opacity-50"
                >
                  ✓ Aprovar Contratação
                </button>
                <button
                  onClick={() => handleAvaliar('Recusado')}
                  disabled={processando}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-bold transition shadow-md disabled:opacity-50"
                >
                  ✕ Recusar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-emerald-900 mb-4">Histórico de Decisões</h2>
              <p className="text-sm text-gray-500 mb-6">Requisições já avaliadas pela Diretoria Executiva.</p>

              {historico.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">Nenhum histórico disponível no momento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-900 uppercase text-xs font-bold border-b border-gray-200">
                        <th className="p-3">Cargo</th>
                        <th className="p-3">Setor</th>
                        <th className="p-3">Decisão</th>
                        <th className="p-3">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historico.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/60">
                          <td className="p-3 font-semibold text-gray-800">
                            {req.dadosRH?.rhCargo || req.dadosGerais.cargoSolicitado}
                          </td>
                          <td className="p-3 text-gray-600">{req.gerente?.setor || '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                req.status === 'Aprovada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500 text-xs">
                            {req.avaliacaoDiretoria?.observacao || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}