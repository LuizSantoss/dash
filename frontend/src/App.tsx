import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth.context';
import { PrivateRoute } from './components/private.route';
import Login from './pages/login.tsx';
import PainelGerente from './pages/painelGerente';
import NovaRequisicao from './pages/novaRequisicao.tsx';
import PainelRH from './pages/painelRH';
import AnaliseRH from './pages/analiseRH.tsx';

// import PainelDiretoria from './pages/PainelDiretoria';

function App() {
  return (
    // O AuthProvider envolve tudo para que todas as telas saibam quem está logado
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública (Qualquer um entra) */}
          <Route path="/login" element={<Login />} /> 


          {/* Rota Protegida do Gerente */}
          <Route 
            path="/gerente" 
            element={
              <PrivateRoute perfisPermitidos={['GERENTE']}>
                <PainelGerente/>
              </PrivateRoute>
            } 
          />
          {/* Rota de Criar Requisição */}
          <Route 
            path="/gerente/nova" 
            element={<PrivateRoute perfisPermitidos={['GERENTE']}><NovaRequisicao /></PrivateRoute>} 
          />

          {/* Rota Protegida do RH */}
          <Route 
            path="/rh" 
            element={
              <PrivateRoute perfisPermitidos={['RH']}>
                <PainelRH/>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/rh/analise/:id" 
            element={<PrivateRoute perfisPermitidos={['RH']}><AnaliseRH /></PrivateRoute>} 
          />


          {/* Rota Protegida da Diretoria */}
          <Route 
            path="/diretoria" 
            element={
              <PrivateRoute perfisPermitidos={['DIRETORIA']}>
                <painelDiretoria/>
              </PrivateRoute>
            } 
          />

          {/* Se o usuário digitar uma URL que não existe, joga pro login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
