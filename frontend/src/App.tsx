import React, { useState } from 'react';

export default function FormularioRequisicao() {
  const [formData, setFormData] = useState({
    empresa: '', cargo_solicitado: '', departamento: '',
    motivo_requisicao: '', forma_contratacao: '', periodo: '',
    horario_trabalho: '', entrada: '', saida: '',
    colaborador_substituido: '', justificativa_aumento: '',
    idade: '', idade_anos: '', sexo: '', caracteristicas_pessoais: '',
    escolaridade: '', curso: '', periodo_curso: '', cursos_complementares: '',
    condicoes_ambientais: [] as string[], esforco_fisico: '', contatos: '',
    rh_cargo: '', rh_salario_exp: '', rh_salario: '', rh_candidato: '',
    rh_codigo: '', rh_data_admissao: '', rh_recrutamento: ''
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'condicoes_ambientais') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        condicoes_ambientais: checked 
          ? [...prev.condicoes_ambientais, value]
          : prev.condicoes_ambientais.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados prontos para inserção no PostgreSQL:", formData);
    alert("Formulário salvo com sucesso! Verifique o console.");
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-800 outline-none transition-all duration-300 bg-slate-50 hover:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:-translate-y-0.5 focus:shadow-md";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 transition-colors duration-200 group-focus-within:text-emerald-600";
  const sectionTitleClass = "text-xl font-bold text-slate-800 border-b-2 border-emerald-100 pb-3 mb-6 flex items-center gap-2 transition-colors duration-300";
  const radioClass = "w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer transition-transform duration-200 hover:scale-110";
  const radioLabelClass = "flex items-center gap-2 cursor-pointer text-sm text-slate-700 transition-all duration-200 hover:text-emerald-700 hover:translate-x-1";

  const getSpotlightClass = (sectionName: string) => {
    const isActive = activeSection === sectionName;
    const isAnyActive = activeSection !== null;

    return `p-6 sm:p-8 -mx-6 sm:-mx-8 rounded-3xl transition-all duration-500 ease-out cursor-default ${
      isActive 
        ? 'bg-white shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-200 scale-[1.02] relative z-10' 
        : isAnyActive 
          ? 'opacity-40 grayscale-[20%] scale-[0.98] hover:opacity-60 cursor-pointer' 
          : 'hover:bg-emerald-50/30' // Modificado para um hover levemente esverdeado quando inativo
    }`;
  };

  return (
    // FUNDO ALTERADO AQUI: bg-emerald-50
    <div className="min-h-screen bg-emerald-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* SOMBRA E BORDA ALTERADAS AQUI: shadow-emerald-900/10 e border-emerald-100 */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-900/10 overflow-hidden border border-emerald-100">
        
        {/* CABEÇALHO */}
        <div 
          className="bg-emerald-900 text-white p-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden group cursor-pointer"
          onClick={() => setActiveSection(null)}
        >
          <div className="absolute inset-0 bg-emerald-800 opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
          
          <div className="flex flex-col items-center sm:items-start relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight transition-transform duration-500 hover:scale-105 text-white">SA CAVALCANTE</h1>
            <span className="text-emerald-200 text-sm mt-1 font-medium">Gestão de Pessoas</span>
          </div>
          <div className="text-center relative z-10">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white">Requisição de Pessoal</h2>
          </div>
          <div className="text-xs text-emerald-100 flex flex-col items-center sm:items-end bg-emerald-950/40 p-3 rounded-lg relative z-10 transition-colors duration-300 hover:bg-emerald-950/80 border border-emerald-800/50">
            <span className="font-semibold text-white mb-1">Cód: FOR 6.2-01</span>
            <span>Versão: 04</span>
            <span>Emissão: 26/05/09</span>
          </div>
        </div>

        {/* CONTAINER DO FORMULÁRIO */}
        <div 
          className="px-8 sm:px-12 py-8 space-y-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveSection(null);
          }}
        >
          
          {/* SEÇÃO: INFO BÁSICA */}
          <section 
            className={getSpotlightClass('info')}
            onFocus={() => setActiveSection('info')}
            onClick={() => setActiveSection('info')}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group/input">
                <label className={labelClass}>Empresa solicitante</label>
                <input type="text" name="empresa" onChange={handleChange} className={inputClass} placeholder="Ex: Matriz" />
              </div>
              <div className="group/input">
                <label className={labelClass}>Cargo solicitado</label>
                <input type="text" name="cargo_solicitado" onChange={handleChange} className={inputClass} placeholder="Ex: Desenvolvedor Senior" />
              </div>
              <div className="group/input">
                <label className={labelClass}>Departamento</label>
                <input type="text" name="departamento" onChange={handleChange} className={inputClass} placeholder="Ex: TI" />
              </div>
            </div>
          </section>

          {/* SEÇÃO: DADOS GERAIS */}
          <section 
            className={getSpotlightClass('dados_gerais')}
            onFocus={() => setActiveSection('dados_gerais')}
            onClick={() => setActiveSection('dados_gerais')}
          >
            <h3 className={`${sectionTitleClass} ${activeSection === 'dados_gerais' ? 'text-emerald-700' : ''}`}>Dados Gerais</h3>
            
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-xl border transition-colors duration-300 ${activeSection === 'dados_gerais' ? 'bg-slate-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              
              <div>
                <label className="block font-bold text-slate-800 mb-3">Motivo da Requisição</label>
                <div className="space-y-3">
                  {['Demissão', 'Demissionário', 'Promoção', 'Transferência', 'Afastamento', 'Aumento de quadro'].map(motivo => (
                    <label key={motivo} className={radioLabelClass}>
                      <input type="radio" name="motivo_requisicao" value={motivo} onChange={handleChange} className={radioClass} />
                      {motivo}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-3">Forma de Contratação</label>
                <div className="space-y-3 mb-6">
                  {['Efetivo', 'Estágio', 'Prazo Determinado'].map(forma => (
                    <label key={forma} className={radioLabelClass}>
                      <input type="radio" name="forma_contratacao" value={forma} onChange={handleChange} className={radioClass} />
                      {forma}
                    </label>
                  ))}
                </div>
                <div className="group/input">
                  <label className={labelClass}>Período (se aplicável)</label>
                  <input type="text" name="periodo" onChange={handleChange} className={inputClass} placeholder="Ex: 6 meses" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-3">Horário de Trabalho</label>
                <div className="space-y-3 mb-6">
                  {['Administrativo', 'Escala Fixa', 'Turno de revezamento'].map(horario => (
                    <label key={horario} className={radioLabelClass}>
                      <input type="radio" name="horario_trabalho" value={horario} onChange={handleChange} className={radioClass} />
                      {horario}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className={labelClass}>Entrada</label>
                    <input type="time" name="entrada" onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="group/input">
                    <label className={labelClass}>Saída</label>
                    <input type="time" name="saida" onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="group/input">
                <label className={labelClass}>Nome do colaborador substituído</label>
                <input type="text" name="colaborador_substituido" onChange={handleChange} className={inputClass} placeholder="Deixe em branco se for aumento de quadro" />
              </div>
              <div className="group/input">
                <label className={labelClass}>Justificativa para aumento de quadro</label>
                <input type="text" name="justificativa_aumento" onChange={handleChange} className={inputClass} placeholder="Descreva brevemente o motivo" />
              </div>
            </div>
          </section>

          {/* SEÇÃO: REQUISITOS DO CARGO */}
          <section 
            className={getSpotlightClass('requisitos')}
            onFocus={() => setActiveSection('requisitos')}
            onClick={() => setActiveSection('requisitos')}
          >
            <h3 className={`${sectionTitleClass} ${activeSection === 'requisitos' ? 'text-emerald-700' : ''}`}>Requisitos do Cargo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-6">
                <div className={`p-5 rounded-xl border transition-colors duration-300 ${activeSection === 'requisitos' ? 'bg-slate-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <label className="block font-bold text-slate-800 mb-3">Idade Preferencial</label>
                  <div className="space-y-3">
                    <label className={radioLabelClass}>
                      <input type="radio" name="idade" value="Indiferente" onChange={handleChange} className={radioClass} /> Indiferente
                    </label>
                    <div className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                      <input type="radio" name="idade" value="Até" onChange={handleChange} className={radioClass} />
                      <span className="text-sm text-slate-700">Até</span>
                      <input type="number" name="idade_anos" onChange={handleChange} className="w-20 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none text-center transition-all duration-200 focus:-translate-y-0.5" placeholder="Anos" />
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border transition-colors duration-300 ${activeSection === 'requisitos' ? 'bg-slate-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <label className="block font-bold text-slate-800 mb-3">Sexo</label>
                  <div className="flex flex-wrap gap-4">
                    {['Masculino', 'Feminino', 'Indiferente'].map(s => (
                      <label key={s} className={radioLabelClass}>
                        <input type="radio" name="sexo" value={s} onChange={handleChange} className={radioClass} /> {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-6">
                <div className="group/input">
                  <label className="block font-bold text-slate-800 mb-1 group-focus-within/input:text-emerald-600 transition-colors">Características Pessoais</label>
                  <span className="text-xs text-slate-500 mb-3 block">Descreva as características relevantes para o desempenho das tarefas</span>
                  <textarea name="caracteristicas_pessoais" onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Ex: Boa comunicação, trabalho em equipe..."></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-bold text-slate-800 mb-3">Escolaridade</label>
                    <div className="space-y-2 mb-4">
                      {['Ensino Fundamental', 'Ensino Médio', 'Superior Completo', 'Superior Incompleto'].map(esc => (
                        <label key={esc} className={radioLabelClass}>
                          <input type="radio" name="escolaridade" value={esc} onChange={handleChange} className={radioClass} /> {esc}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="group/input">
                        <label className={labelClass}>Nome do Curso:</label>
                        <input type="text" name="curso" onChange={handleChange} className={inputClass} />
                      </div>
                      <div className="group/input">
                        <label className={labelClass}>Período/Semestre:</label>
                        <input type="text" name="periodo_curso" onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="group/input">
                    <label className="block font-bold text-slate-800 mb-1 group-focus-within/input:text-emerald-600 transition-colors">Cursos Complementares</label>
                    <span className="text-xs text-slate-500 mb-3 block">Cursos importantes para as tarefas</span>
                    <textarea name="cursos_complementares" onChange={handleChange} rows={7} className={`${inputClass} resize-none`} placeholder="Ex: Pacote Office, Inglês avançado..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO: AMBIENTE / CONDIÇÕES */}
          <section 
            className={getSpotlightClass('ambiente')}
            onFocus={() => setActiveSection('ambiente')}
            onClick={() => setActiveSection('ambiente')}
          >
            <h3 className={`${sectionTitleClass} ${activeSection === 'ambiente' ? 'text-emerald-700' : ''}`}>Ambiente e Condições de Trabalho</h3>
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-xl border transition-colors duration-300 ${activeSection === 'ambiente' ? 'bg-slate-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              
              <div>
                <label className="block font-bold text-slate-800 mb-4">Condições Ambientais</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Normais', 'Calor', 'Frio', 'Umidade', 'Poeira', 'Ruídos', 'Outros'].map(cond => (
                    <label key={cond} className={radioLabelClass}>
                      <input type="checkbox" name="condicoes_ambientais" value={cond} onChange={handleChange} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer transition-transform duration-200 hover:scale-110" /> 
                      {cond}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-4">Esforço Físico</label>
                <div className="space-y-3">
                  {['Nenhum', 'Pouco', 'Muito'].map(esf => (
                    <label key={esf} className={radioLabelClass}>
                      <input type="radio" name="esforco_fisico" value={esf} onChange={handleChange} className={radioClass} /> {esf}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-4">Nível de Contatos</label>
                <div className="space-y-3">
                  {['Externos', 'Internos', 'Isolado'].map(contato => (
                    <label key={contato} className={radioLabelClass}>
                      <input type="radio" name="contatos" value={contato} onChange={handleChange} className={radioClass} /> {contato}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* SEÇÃO: RH */}
          <section 
            className={getSpotlightClass('rh')}
            onFocus={() => setActiveSection('rh')}
            onClick={() => setActiveSection('rh')}
          >
            <h3 className={`${sectionTitleClass} ${activeSection === 'rh' ? 'text-emerald-700' : ''}`}>Uso exclusivo do RH</h3>
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-xl border-2 border-dashed transition-colors duration-300 ${activeSection === 'rh' ? 'bg-emerald-50/20 border-emerald-300' : 'bg-emerald-50/50 border-emerald-200'}`}>
              
              <div className="md:col-span-3 space-y-6">
                <div className="group/input">
                  <label className={labelClass}>Cargo Aprovado</label>
                  <input type="text" name="rh_cargo" onChange={handleChange} className={inputClass} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className={labelClass}>Salário de Experiência (R$)</label>
                    <input type="number" step="0.01" name="rh_salario_exp" onChange={handleChange} className={inputClass} placeholder="0,00" />
                  </div>
                  <div className="group/input">
                    <label className={labelClass}>Salário Efetivo (R$)</label>
                    <input type="number" step="0.01" name="rh_salario" onChange={handleChange} className={inputClass} placeholder="0,00" />
                  </div>
                </div>

                <div className="group/input">
                  <label className={labelClass}>Nome do Candidato Aprovado</label>
                  <input type="text" name="rh_candidato" onChange={handleChange} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className={labelClass}>Código do Colaborador</label>
                    <input type="text" name="rh_codigo" onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="group/input">
                    <label className={labelClass}>Data de Admissão</label>
                    <input type="date" name="rh_data_admissao" onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 bg-white p-5 rounded-lg border border-emerald-100 shadow-sm h-fit">
                <label className="block font-bold text-emerald-900 mb-4 text-center">Tipo de Recrutamento</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm hover:translate-x-1">
                    <input type="radio" name="rh_recrutamento" value="Interno" onChange={handleChange} className={radioClass} /> 
                    <span className="font-medium text-slate-700">Interno</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm hover:translate-x-1">
                    <input type="radio" name="rh_recrutamento" value="Externo" onChange={handleChange} className={radioClass} /> 
                    <span className="font-medium text-slate-700">Externo</span>
                  </label>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* SEÇÃO: APROVAÇÕES */}
        <div 
          className="bg-slate-800 text-slate-100 p-8 sm:p-12 mt-4"
          onClick={() => setActiveSection(null)}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-8 text-center text-white">Assinaturas de Aprovação</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="group bg-slate-700 rounded-xl p-6 flex flex-col items-center justify-end h-40 border border-slate-600 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:border-slate-500 hover:bg-slate-600 cursor-default">
                <div className="w-full max-w-[240px] border-b-2 border-slate-400 mb-4 transition-colors duration-300 group-hover:border-emerald-400"></div>
                <span className="font-bold text-lg text-white">Gestor Requisitante</span>
                <span className="text-sm text-slate-400 mt-1 transition-colors duration-300 group-hover:text-slate-300">Data: ___ / ___ / ______</span>
              </div>

              <div className="group bg-slate-700 rounded-xl p-6 flex flex-col items-center justify-end h-40 border border-slate-600 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:border-slate-500 hover:bg-slate-600 cursor-default">
                <div className="w-full max-w-[240px] border-b-2 border-slate-400 mb-4 transition-colors duration-300 group-hover:border-emerald-400"></div>
                <span className="font-bold text-lg text-white">Diretoria</span>
                <span className="text-sm text-slate-400 mt-1 transition-colors duration-300 group-hover:text-slate-300">Data: ___ / ___ / ______</span>
              </div>
            </div>

            <div className="mt-12 flex justify-center sm:justify-end">
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-emerald-600 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg transition-all duration-300 ease-out hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-0"
              >
                Salvar e Enviar Requisição
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
