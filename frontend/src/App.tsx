import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth.context';
import { PrivateRoute } from './components/private.route';
import Login from './pages/login.tsx';

// Exemplo de importação das suas páginas (você criará essas telas a seguir)
// import PainelGerente from './pages/PainelGerente';
// import PainelRH from './pages/PainelRH';
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
                <div>Painel do Gerente</div>
              </PrivateRoute>
            } 
          />

          {/* Rota Protegida do RH */}
          <Route 
            path="/rh" 
            element={
              <PrivateRoute perfisPermitidos={['RH']}>
                <div>Painel do RH</div>
              </PrivateRoute>
            } 
          />

          {/* Rota Protegida da Diretoria */}
          <Route 
            path="/diretoria" 
            element={
              <PrivateRoute perfisPermitidos={['DIRETORIA']}>
                <div>Painel da Diretoria</div>
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
