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
}

export default function PainelDiretoria() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  // Estado para controlar qual requisição o Diretor está a ver no momento
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<Requisicao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarRequisicoes = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/requisicoes/diretoria', {
          headers: { 'Authorization': `Bearer ${contexto?.token}` }
        });

        if (!resposta.ok) throw new Error('Falha ao carregar o painel da diretoria.');

        const dados = await resposta.json();
        setRequisicoes(dados);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    if (contexto?.token) buscarRequisicoes();

    // Ligar o rádio do WebSocket
    const socket = io('http://localhost:3000');

    socket.on('status_atualizado', (reqAtualizada: Requisicao) => {
      if (reqAtualizada.status === 'Aguardando Diretoria') {
        // Se o RH enviou uma nova para cá, adiciona à lista
        setRequisicoes(prev => {
          if (prev.find(r => r.id === reqAtualizada.id)) return prev;
          return [reqAtualizada, ...prev];
        });
      } else {
        // Se foi aprovada/recusada (mesmo que por outro diretor), remove da lista de pendentes
        setRequisicoes(prev => prev.filter(r => r.id !== reqAtualizada.id));
      }
    });

    return () => { socket.disconnect(); };
  }, [contexto?.token]);

  // Função que dispara a decisão final para o backend
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

      alert(`Requisição ${decisao.toLowerCase()} com sucesso! O Gerente será notificado.`);
      setRequisicaoSelecionada(null); // Fecha a vista de detalhes
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
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel da Diretoria</h1>
          <p className="text-slate-500">Aprovação final e análise de custos das requisições.</p>
        </div>
        <button 
          onClick={contexto?.logout}
          className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-5 py-2 rounded-lg font-medium transition-all"
        >
          Sair
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Lista de Requisições Pendentes */}
        <div className={`md:col-span-[ ${requisicaoSelecionada ? '1' : '3'} ] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all`}>
          <div className="bg-slate-800 text-white p-4 font-semibold">
            Aguardando Aprovação ({requisicoes.length})
          </div>
          
          {carregando ? (
            <div className="p-8 text-center text-slate-500">A carregar...</div>
          ) : erro ? (
            <div className="p-8 text-center text-red-500">{erro}</div>
          ) : requisicoes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhuma requisição pendente.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requisicoes.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${requisicaoSelecionada?.id === req.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                  onClick={() => setRequisicaoSelecionada(req)}
                >
                  <p className="font-bold text-slate-800">{req.dadosRH?.rhCargo || req.dadosGerais.cargoSolicitado}</p>
                  <p className="text-sm text-slate-500">{req.dadosGerais.departamento} • Solicitado por: {req.gerente?.nome}</p>
                  <p className="text-xs font-semibold text-indigo-600 mt-2">
                    Custo: {req.dadosRH?.rhSalario}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Vista de Detalhes e Decisão (Só aparece se clicar numa requisição) */}
        {requisicaoSelecionada && (
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Avaliar Requisição</h2>
              <button onClick={() => setRequisicaoSelecionada(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                Fechar ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Dados do Pedido</h3>
                <p className="text-sm text-slate-800 mb-1"><strong>Cargo:</strong> {requisicaoSelecionada.dadosGerais.cargoSolicitado}</p>
                <p className="text-sm text-slate-800 mb-1"><strong>Departamento:</strong> {requisicaoSelecionada.dadosGerais.departamento}</p>
                <p className="text-sm text-slate-800"><strong>Gerente:</strong> {requisicaoSelecionada.gerente.nome}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2">Impacto Financeiro (RH)</h3>
                <p className="text-sm text-slate-800 mb-1"><strong>Cargo (Nomenclatura):</strong> {requisicaoSelecionada.dadosRH.rhCargo}</p>
                <p className="text-sm text-slate-800 mb-1"><strong>Salário Final:</strong> {requisicaoSelecionada.dadosRH.rhSalario}</p>
                <p className="text-sm text-slate-800 mb-1"><strong>Centro de Custos:</strong> {requisicaoSelecionada.dadosRH.rhCodigo}</p>
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
                placeholder="Ex: Aprovado conforme orçamento de Q3..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                onClick={() => handleAvaliar('Aprovado')}
                disabled={processando}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all"
              >
                ✓ Aprovar
              </button>
              <button 
                onClick={() => handleAvaliar('Recusado')}
                disabled={processando}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                ✕ Recusar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}