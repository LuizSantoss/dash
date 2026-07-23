import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

export default function NovaRequisicao() {
  const contexto = useContext(AuthContext);
  const navigate = useNavigate();

  // Controle de qual etapa do formulário estamos (1 a 4)
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // O estado reflete EXATAMENTE o que o Prisma backend espera receber
  const [formData, setFormData] = useState({
    dadosGerais: { empresa: '', cargoSolicitado: '', departamento: '', motivoRequisicao: '', formaContratacao: '', justificativaAumento: '' },
    jornadaTrabalho: { periodo: '', horarioTrabalho: '', entrada: '', saida: '' },
    requisitosCargo: { idade: '', sexo: '', escolaridade: '', curso: '' },
    ambienteTrabalho: { condicoesAmbientais: [] as string[], esforcoFisico: '', contatos: '' }
  });

  // Função dinâmica para atualizar textos e selects dentro das "gavetas"
  const handleChange = (secao: keyof typeof formData, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [secao]: { ...prev[secao], [campo]: valor }
    }));
  };

  // Função específica para os checkboxes (Condições Ambientais, que é um Array)
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

  // Disparo final para o Backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (etapa !== 4) {
      setEtapa(etapa + 1);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const resposta = await fetch('http://localhost:3000/api/requisicoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${contexto?.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!resposta.ok) throw new Error('Erro ao salvar a requisição.');

      alert('Requisição criada com sucesso!');
      navigate('/gerente'); // Volta para o painel
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cabeçalho de Progresso */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Nova Requisição de Pessoal</h2>
            <p className="text-emerald-100">Etapa {etapa} de 4</p>
          </div>
          <button onClick={() => navigate('/gerente')} className="text-emerald-100 hover:text-white transition">
            Cancelar e Voltar
          </button>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-4 text-center border-b border-red-200">{erro}</div>}

        <form onSubmit={handleSubmit} className="p-8">
          
          {/* ETAPA 1: Dados Gerais */}
          {etapa === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Dados Gerais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Empresa</label>
                  <input required type="text" className={inputClass} value={formData.dadosGerais.empresa} onChange={e => handleChange('dadosGerais', 'empresa', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Departamento</label>
                  <input required type="text" className={inputClass} value={formData.dadosGerais.departamento} onChange={e => handleChange('dadosGerais', 'departamento', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Cargo Solicitado</label>
                  <input required type="text" className={inputClass} value={formData.dadosGerais.cargoSolicitado} onChange={e => handleChange('dadosGerais', 'cargoSolicitado', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Motivo da Requisição</label>
                  <select required className={inputClass} value={formData.dadosGerais.motivoRequisicao} onChange={e => handleChange('dadosGerais', 'motivoRequisicao', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Aumento de Quadro">Aumento de Quadro</option>
                    <option value="Substituição">Substituição</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Forma de Contratação</label>
                  <select required className={inputClass} value={formData.dadosGerais.formaContratacao} onChange={e => handleChange('dadosGerais', 'formaContratacao', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="CLT">CLT</option>
                    <option value="Estágio">Estágio</option>
                    <option value="PJ">PJ</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Justificativa / Detalhes</label>
                  <textarea rows={3} className={inputClass} value={formData.dadosGerais.justificativaAumento} onChange={e => handleChange('dadosGerais', 'justificativaAumento', e.target.value)}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: Jornada de Trabalho */}
          {etapa === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Jornada de Trabalho</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Período</label>
                  <input required type="text" placeholder="Ex: Integral" className={inputClass} value={formData.jornadaTrabalho.periodo} onChange={e => handleChange('jornadaTrabalho', 'periodo', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Horário de Trabalho</label>
                  <input required type="text" placeholder="Ex: Administrativo" className={inputClass} value={formData.jornadaTrabalho.horarioTrabalho} onChange={e => handleChange('jornadaTrabalho', 'horarioTrabalho', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Entrada (Horário)</label>
                  <input required type="time" className={inputClass} value={formData.jornadaTrabalho.entrada} onChange={e => handleChange('jornadaTrabalho', 'entrada', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>saida (Horário)</label>
                  <input required type="time" className={inputClass} value={formData.jornadaTrabalho.saida} onChange={e => handleChange('jornadaTrabalho', 'saida', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: Requisitos do Cargo */}
          {etapa === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Requisitos do Cargo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Idade (Preferência)</label>
                  <input type="text" className={inputClass} value={formData.requisitosCargo.idade} onChange={e => handleChange('requisitosCargo', 'idade', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Sexo</label>
                  <select className={inputClass} value={formData.requisitosCargo.sexo} onChange={e => handleChange('requisitosCargo', 'sexo', e.target.value)}>
                    <option value="">Indiferente</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Escolaridade Mínima</label>
                  <input required type="text" className={inputClass} value={formData.requisitosCargo.escolaridade} onChange={e => handleChange('requisitosCargo', 'escolaridade', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Curso / Formação</label>
                  <input type="text" className={inputClass} value={formData.requisitosCargo.curso} onChange={e => handleChange('requisitosCargo', 'curso', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: Ambiente de Trabalho */}
          {etapa === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Ambiente e Condições</h3>
              
              <div className="mb-4">
                <label className={labelClass + " mb-2"}>Condições Ambientais (Selecione as aplicáveis)</label>
                <div className="flex gap-4">
                  {['Ar condicionado', 'Externo', 'Fábrica', 'Escritório'].map(opcao => (
                    <label key={opcao} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-emerald-600 accent-emerald-600"
                        checked={formData.ambienteTrabalho.condicoesAmbientais.includes(opcao)}
                        onChange={(e) => handleCheckbox(opcao, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{opcao}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Esforço Físico</label>
                  <select required className={inputClass} value={formData.ambienteTrabalho.esforcoFisico} onChange={e => handleChange('ambienteTrabalho', 'esforcoFisico', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Leve">Leve</option>
                    <option value="Médio">Médio</option>
                    <option value="Pesado">Pesado</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Contatos (Rede de Relacionamento)</label>
                  <input type="text" placeholder="Ex: Interno e Externo" className={inputClass} value={formData.ambienteTrabalho.contatos} onChange={e => handleChange('ambienteTrabalho', 'contatos', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Botões de Navegação */}
          <div className="mt-8 pt-6 border-t flex justify-between">
            {etapa > 1 ? (
              <button type="button" onClick={() => setEtapa(etapa - 1)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Voltar
              </button>
            ) : <div></div> /* Espaçador vazio para manter o layout flex */}
            
            <button type="submit" disabled={carregando} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
              {carregando ? 'Processando...' : etapa === 4 ? 'Criar Requisição' : 'Próxima Etapa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}