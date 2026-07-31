import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

export default function NovaRequisicao() {
  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [formData, setFormData] = useState({
    dadosGerais: {
      empresa: '',
      cargoSolicitado: '',
      departamento: '',
      motivoRequisicao: '',
      formaContratacao: '',
      justificativaAumento: ''
    },
    jornadaTrabalho: {
      periodo: '',
      horarioTrabalho: '',
      entrada: '',
      saida: ''
    },
    requisitosCargo: {
      idade: '',
      sexo: '',
      escolaridade: '',
      curso: ''
    },
    ambienteTrabalho: {
      condicoesAmbientais: [] as string[],
      esforcoFisico: '',
      contatos: ''
    }
  });

  const handleChange = (secao: keyof typeof formData, campo: string, valor: string) => {
    setFormData(prev => ({ ...prev, [secao]: { ...prev[secao], [campo]: valor } }));
  };

  const handleCheckbox = (valor: string, checked: boolean) => {
    setFormData(prev => {
      const atuais = prev.ambienteTrabalho.condicoesAmbientais;
      const novas = checked ? [...atuais, valor] : atuais.filter(item => item !== valor);
      return {
        ...prev,
        ambienteTrabalho: { ...prev.ambienteTrabalho, condicoesAmbientais: novas }
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (etapa !== 4) {
      setEtapa(etapa + 1);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/requisicoes`;
      const resposta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${contexto?.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!resposta.ok) {
        const erroDados = await resposta.json();
        throw new Error(erroDados.erro || 'Erro ao salvar a requisição.');
      }

      alert('Requisição criada com sucesso!');
      navigate('/gerente');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-emerald-600">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Nova Requisição de Pessoal</h1>
            <p className="text-sm text-gray-500">Etapa {etapa} de 4 - Preencha as informações necessárias</p>
          </div>
          <button
            onClick={() => navigate('/gerente')}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
          >
            Cancelar e Voltar
          </button>
        </div>

        {erro && (
          <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 rounded mb-6 text-sm font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {etapa === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800">1. Dados Gerais</h2>
              <div>
                <label className={labelClass}>Empresa</label>
                <input required type="text" className={inputClass} value={formData.dadosGerais.empresa} onChange={e => handleChange('dadosGerais', 'empresa', e.target.value)} placeholder="Ex: Matriz S/A" />
              </div>
              <div>
                <label className={labelClass}>Cargo Solicitado</label>
                <input required type="text" className={inputClass} value={formData.dadosGerais.cargoSolicitado} onChange={e => handleChange('dadosGerais', 'cargoSolicitado', e.target.value)} placeholder="Ex: Analista de Finanças" />
              </div>
              <div>
                <label className={labelClass}>Departamento</label>
                <input required type="text" className={inputClass} value={formData.dadosGerais.departamento} onChange={e => handleChange('dadosGerais', 'departamento', e.target.value)} placeholder="Ex: Financeiro / Operações" />
              </div>
              <div>
                <label className={labelClass}>Motivo da Requisição</label>
                <input required type="text" className={inputClass} value={formData.dadosGerais.motivoRequisicao} onChange={e => handleChange('dadosGerais', 'motivoRequisicao', e.target.value)} placeholder="Ex: Aumento de Quadro ou Substituição" />
              </div>
              <div>
                <label className={labelClass}>Forma de Contratação</label>
                <input required type="text" className={inputClass} value={formData.dadosGerais.formaContratacao} onChange={e => handleChange('dadosGerais', 'formaContratacao', e.target.value)} placeholder="Ex: CLT / PJ / Temporário" />
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800">2. Jornada de Trabalho</h2>
              <div>
                <label className={labelClass}>Período</label>
                <input required type="text" placeholder="Ex: Integral" className={inputClass} value={formData.jornadaTrabalho.periodo} onChange={e => handleChange('jornadaTrabalho', 'periodo', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Horário de Trabalho</label>
                <input required type="text" placeholder="Ex: Administrativo (40h semanais)" className={inputClass} value={formData.jornadaTrabalho.horarioTrabalho} onChange={e => handleChange('jornadaTrabalho', 'horarioTrabalho', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Entrada</label>
                  <input required type="time" className={inputClass} value={formData.jornadaTrabalho.entrada} onChange={e => handleChange('jornadaTrabalho', 'entrada', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Saída</label>
                  <input required type="time" className={inputClass} value={formData.jornadaTrabalho.saida} onChange={e => handleChange('jornadaTrabalho', 'saida', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800">3. Requisitos do Cargo</h2>
              <div>
                <label className={labelClass}>Faixa Etária (Preferência)</label>
                <input type="text" className={inputClass} value={formData.requisitosCargo.idade} onChange={e => handleChange('requisitosCargo', 'idade', e.target.value)} placeholder="Ex: Indiferente / Maior de 18 anos" />
              </div>
              <div>
                <label className={labelClass}>Sexo</label>
                <input type="text" className={inputClass} value={formData.requisitosCargo.sexo} onChange={e => handleChange('requisitosCargo', 'sexo', e.target.value)} placeholder="Ex: Indiferente" />
              </div>
              <div>
                <label className={labelClass}>Escolaridade</label>
                <input type="text" className={inputClass} value={formData.requisitosCargo.escolaridade} onChange={e => handleChange('requisitosCargo', 'escolaridade', e.target.value)} placeholder="Ex: Ensino Superior Completo" />
              </div>
              <div>
                <label className={labelClass}>Curso / Especialização</label>
                <input type="text" className={inputClass} value={formData.requisitosCargo.curso} onChange={e => handleChange('requisitosCargo', 'curso', e.target.value)} placeholder="Ex: Administração, Contabilidade, etc." />
              </div>
            </div>
          )}

          {etapa === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800">4. Ambiente de Trabalho</h2>
              <div>
                <label className={labelClass}>Condições Ambientais</label>
                <div className="mt-2 space-y-2">
                  {['Interno / Escritório', 'Trabalho Externo', 'Área Operacional / Fabril', 'Viagens Frequentes'].map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.ambienteTrabalho.condicoesAmbientais.includes(item)}
                        onChange={e => handleCheckbox(item, e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Esforço Físico</label>
                <input required type="text" className={inputClass} value={formData.ambienteTrabalho.esforcoFisico} onChange={e => handleChange('ambienteTrabalho', 'esforcoFisico', e.target.value)} placeholder="Ex: Leve / Sentado na maior parte do tempo" />
              </div>
              <div>
                <label className={labelClass}>Contatos Internos e Externos</label>
                <input required type="text" className={inputClass} value={formData.ambienteTrabalho.contatos} onChange={e => handleChange('ambienteTrabalho', 'contatos', e.target.value)} placeholder="Ex: Contato direto com fornecedores e diretoria" />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            {etapa > 1 ? (
              <button
                type="button"
                onClick={() => setEtapa(etapa - 1)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Voltar
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={carregando}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50"
            >
              {carregando ? 'Gravando...' : etapa === 4 ? 'Criar Requisição' : 'Próxima Etapa →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}