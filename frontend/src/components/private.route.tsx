import { useContext, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth.context';

interface PrivateRouteProps {
  children: JSX.Element;
  perfisPermitidos: string[]; // Ex: ['RH', 'DIRETORIA']
}

export const PrivateRoute = ({ children, perfisPermitidos }: PrivateRouteProps) => {
  const contexto = useContext(AuthContext);

  // Se o contexto não existir ou ainda estiver a ler o localStorage, mostra apenas um ecrã vazio ou "A carregar"
  if (!contexto || contexto.carregandoDados) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">A carregar sistema...</div>;
  }

  const { usuario } = contexto;
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2ª Barreira: O usuário está logado, mas o perfil dele não está na lista de permitidos para esta rota?
  if (!perfisPermitidos.includes(usuario.perfil)) {
    // Se ele for pego no pulo, mandamos ele para uma rota padrão dependendo de quem ele for
    if (usuario.perfil === 'GERENTE') return <Navigate to="/gerente" replace />;
    if (usuario.perfil === 'RH') return <Navigate to="/rh" replace />;
    if (usuario.perfil === 'DIRETORIA') return <Navigate to="/diretoria" replace />;
    
    // Fallback de segurança extrema
    return <Navigate to="/login" replace />;
  }

  // Se ele passou pelas duas barreiras, a porta se abre e a tela é renderizada
  return children;
};
