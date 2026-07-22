import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// O formato dos dados que vamos guardar na memória do React
interface Usuario {
  id: string;
  perfil: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Cria o contexto vazio
export const AuthContext = createContext<AuthContextType | null>(null);

// O "Provedor" que vai abraçar o nosso aplicativo
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Assim que o site abre, ele procura se o usuário deixou um token salvo no navegador
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('@dashRH:token');
    if (tokenSalvo) {
      try {
        const payload = jwtDecode<Usuario>(tokenSalvo);
        setToken(tokenSalvo);
        setUsuario({ id: payload.id, perfil: payload.perfil });
      } catch (error) {
        // Se o token for inválido, limpa tudo
        localStorage.removeItem('@dashRH:token');
      }
    }
  }, []);

  // Função chamada na tela de Login quando o backend diz "OK"
  const login = (novoToken: string) => {
    localStorage.setItem('@dashRH:token', novoToken);
    const payload = jwtDecode<Usuario>(novoToken);
    setToken(novoToken);
    setUsuario({ id: payload.id, perfil: payload.perfil });
  };

  // Função chamada no botão de Sair
  const logout = () => {
    localStorage.removeItem('@dashRH:token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
