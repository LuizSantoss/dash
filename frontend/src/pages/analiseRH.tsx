
import { useState, useContext } from 'react';
import type { FormEvent } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

export default function AnaliseRH() {
  const contexto = useContext(AuthContext);
  const navigate = useNavigate();
  
  // O useParams captura automaticamente o ID da requisição que está na URL (ex: /rh/analise/123)
  const { id } = useParams();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // O estado espelha os campos exatos que o nosso backend e banco de dados esperam
  const [dadosRH, setDadosRH] = useState({
    rhCargo: '',
    rhSalarioExp: '',
    rhSalario: '',
    rhCandidato: '',
    rhCodigo: '',
    rhDataAdmissao: '',
    rhRecrutamento: ''
  });

  const handleChange = (campo: string, valor: string) => {
    setDadosRH(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const resposta = await fetch(`http://localhost:3000/api/requisicoes/${id}/encaminhar-diretoria`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${contexto?.token}`
        },
        // O backend espera um objeto com a propriedade "dadosRH"
        body: JSON.stringify({ dadosRH }) 
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        throw new Error(dadosErro.erro || 'Erro ao encaminhar requisição.');
      }

      alert('Dados preenchidos e encaminhados para a Diretoria com sucesso!');
      navigate('/rh'); // Devolve o RH para a caixa de entrada
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Análise e Preenchimento (RH)</h2>
            <p className="text-blue-100 text-sm mt-1">Anexe os dados financeiros e organizacionais</p>
          </div>
          <button onClick={() => navigate('/rh')} className="text-blue-100 hover:text-white transition">
            Voltar
          </button>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-4 text-center border-b border-red-200">{erro}</div>}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Cargo Definitivo (Nomenclatura RH)</label>
              <input required type="text" className={inputClass} value={dadosRH.rhCargo} onChange={e => handleChange('rhCargo', e.target.value)} placeholder="Ex: Desenvolvedor Front-end Sênior" />
            </div>

            <div>
              <label className={labelClass}>Salário de Experiência (R$)</label>
              <input required type="text" className={inputClass} value={dadosRH.rhSalarioExp} onChange={e => handleChange('rhSalarioExp', e.target.value)} placeholder="0.000,00" />
            </div>

            <div>
              <label className={labelClass}>Salário Efetivo (R$)</label>
              <input required type="text" className={inputClass} value={dadosRH.rhSalario} onChange={e => handleChange('rhSalario', e.target.value)} placeholder="0.000,00" />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Candidato Indicado (Se houver)</label>
              <input type="text" className={inputClass} value={dadosRH.rhCandidato} onChange={e => handleChange('rhCandidato', e.target.value)} placeholder="Nome do funcionário ou candidato pré-selecionado" />
            </div>

            <div>
              <label className={labelClass}>Centro de Custos (Código)</label>
              <input required type="text" className={inputClass} value={dadosRH.rhCodigo} onChange={e => handleChange('rhCodigo', e.target.value)} placeholder="Ex: CC-4059" />
            </div>

            <div>
              <label className={labelClass}>Data Prevista de Admissão</label>
              <input required type="date" className={inputClass} value={dadosRH.rhDataAdmissao} onChange={e => handleChange('rhDataAdmissao', e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Tipo de Recrutamento</label>
              <select required className={inputClass} value={dadosRH.rhRecrutamento} onChange={e => handleChange('rhRecrutamento', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Interno">Interno</option>
                <option value="Externo">Externo</option>
                <option value="Misto">Misto</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t mt-8 flex justify-end">
            <button type="submit" disabled={carregando} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              {carregando ? 'A processar...' : 'Encaminhar para Diretoria'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
