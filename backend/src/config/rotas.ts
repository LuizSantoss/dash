export const ROTAS = {
  AUTH: {
    REGISTRAR: '/registrar',
    LOGIN: '/login',
    USUARIOS: '/usuarios',
    ALTERAR_SENHA: '/usuarios/alterar-senha',
  },
  REQUISICOES: {
    CRIAR: '/',
    MINHAS: '/minhas',
    RH: '/rh',
    DIRETORIA: '/diretoria',
    DIRETORIA_HISTORICO: '/diretoria/historico',
    ADM_TODAS: '/adm/todas',
    ENCAMINHAR_DIRETORIA: '/:id/encaminhar-diretoria',
    AVALIAR: '/:id/avaliar',
  },
} as const;