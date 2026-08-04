import  { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados Dash RH...');

  // 1. Limpeza inicial do banco (ordem reversa devido às chaves estrangeiras)
  await prisma.avaliacaoDiretoria.deleteMany();
  await prisma.dadosRH.deleteMany();
  await prisma.ambienteTrabalho.deleteMany();
  await prisma.requisitosCargo.deleteMany();
  await prisma.jornadaTrabalho.deleteMany();
  await prisma.dadosGerais.deleteMany();
  await prisma.requisicao.deleteMany();
  await prisma.usuario.deleteMany();

  // Hash padrão para todas as senhas de teste: "senha123"
  const senhaPadrao = await bcrypt.hash('senha123', 10);

  // 2. CRIAÇÃO DE USUÁRIOS (PERFIS DO SISTEMA)

  // Administrador (ADM) - Visualiza tudo e altera senhas
  const adm = await prisma.usuario.create({
    data: {
      nome: 'Administrador Geral',
      email: 'admin@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'ADM',
      setor: 'Tecnologia da Informação',
    },
  });

  // Gerentes com Mapeamento de Setor
  const gerenteTech = await prisma.usuario.create({
    data: {
      nome: 'Carlos Silva',
      email: 'carlos.silva@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'GERENTE',
      setor: 'Tecnologia',
    },
  });

  const gerenteComercial = await prisma.usuario.create({
    data: {
      nome: 'Mariana Souza',
      email: 'mariana.souza@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'GERENTE',
      setor: 'Comercial',
    },
  });

  // RH (Máximo de 2 perfis respeitando a regra de negócio)
  const rh1 = await prisma.usuario.create({
    data: {
      nome: 'Ana Beatriz (RH Principal)',
      email: 'ana.rh@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'RH',
      setor: 'Recursos Humanos',
    },
  });

  const rh2 = await prisma.usuario.create({
    data: {
      nome: 'Roberto Gomes (RH Apoio)',
      email: 'roberto.rh@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'RH',
      setor: 'Recursos Humanos',
    },
  });

  // Diretoria - Aprovação Final
  const diretoria = await prisma.usuario.create({
    data: {
      nome: 'Dr. Roberto Mendes',
      email: 'diretoria@tuaempresa.com',
      senha: senhaPadrao,
      perfil: 'DIRETORIA',
      setor: 'Diretoria Executiva',
    },
  });

  console.log('✅ Usuários cadastrados com sucesso!');

  // ==========================================
  // 3. CRIAÇÃO DE REQUISIÇÕES (CENÁRIOS REAIS)
  // ==========================================

  // CENÁRIO 1: Requisição "Pendente" (Acabou de ser criada pelo Gerente de Tech)
  await prisma.requisicao.create({
    data: {
      status: 'Pendente',
      gerenteId: gerenteTech.id,
      dadosGerais: {
        create: {
          empresa: 'Dash RH Matriz',
          cargoSolicitado: 'Desenvolvedor Frontend Sênior',
          departamento: 'Tecnologia',
          motivoRequisicao: 'Aumento de Quadro',
          formaContratacao: 'CLT',
          justificativaAumento: 'Expansão do produto local em servidor privado.',
        },
      },
      jornadaTrabalho: {
        create: {
          periodo: 'Integral',
          horarioTrabalho: 'Híbrido - Comercial',
          entrada: '09:00',
          saida: '18:00',
        },
      },
      requisitosCargo: {
        create: {
          idade: 'Indiferente',
          sexo: 'Indiferente',
          escolaridade: 'Superior Completo',
          curso: 'Ciência da Computação ou afins',
          cursosComplementares: 'React, Tailwind CSS e TypeScript.',
        },
      },
      ambienteTrabalho: {
        create: {
          condicoesAmbientais: ['Escritório Climatizado', 'Trabalho Híbrido'],
          esforcoFisico: 'Leve (Trabalho de escritório)',
          contatos: 'Interno (Equipe de Engenharia e Design)',
        },
      },
    },
  });

  // CENÁRIO 2: Requisição "Aguardando Diretoria" (Triada e complementada pelo RH)
  await prisma.requisicao.create({
    data: {
      status: 'Aguardando Diretoria',
      gerenteId: gerenteComercial.id,
      dadosGerais: {
        create: {
          empresa: 'Dash RH Matriz',
          cargoSolicitado: 'Executivo de Contas',
          departamento: 'Comercial',
          motivoRequisicao: 'Substituição',
          formaContratacao: 'CLT',
          colaboradorSubstituido: 'Fernando Oliveira',
        },
      },
      jornadaTrabalho: {
        create: {
          periodo: 'Integral',
          horarioTrabalho: 'Comercial',
          entrada: '08:00',
          saida: '17:00',
        },
      },
      requisitosCargo: {
        create: {
          idade: 'Indiferente',
          sexo: 'Indiferente',
          escolaridade: 'Superior Completo',
          curso: 'Administração ou Marketing',
          cursosComplementares: 'Negociação B2B e CRM.',
        },
      },
      ambienteTrabalho: {
        create: {
          condicoesAmbientais: ['Escritório Climatizado', 'Atendimento Externo'],
          esforcoFisico: 'Leve',
          contatos: 'Clientes e Diretoria Comercial',
        },
      },
      dadosRH: {
        create: {
          rhCargo: 'Executivo de Contas Pleno',
          rhSalarioExp: 'R$ 6.500,00 + Comissões',
          rhSalario: 'R$ 6.500,00',
          rhCandidato: 'Processo Externo',
          rhCodigo: 'REQ-2026-002',
          rhDataAdmissao: '2026-09-01',
          rhRecrutamento: 'LinkedIn e Portal de Vagas',
        },
      },
    },
  });

  // CENÁRIO 3: Requisição "Aprovada" (Fluxo completo e histórico finalizado)
  await prisma.requisicao.create({
    data: {
      status: 'Aprovada',
      gerenteId: gerenteTech.id,
      dadosGerais: {
        create: {
          empresa: 'Dash RH Matriz',
          cargoSolicitado: 'Engenheiro de DevOps Pleno',
          departamento: 'Tecnologia',
          motivoRequisicao: 'Aumento de Quadro',
          formaContratacao: 'CLT',
          justificativaAumento: 'Migração de infraestrutura local e SMTP corporativo.',
        },
      },
      jornadaTrabalho: {
        create: {
          periodo: 'Integral',
          horarioTrabalho: 'Flexível',
          entrada: '09:00',
          saida: '18:00',
        },
      },
      requisitosCargo: {
        create: {
          idade: 'Indiferente',
          sexo: 'Indiferente',
          escolaridade: 'Superior Completo',
          curso: 'Engenharia de Software',
          cursosComplementares: 'Docker, PostgreSQL, Linux e Redes.',
        },
      },
      ambienteTrabalho: {
        create: {
          condicoesAmbientais: ['Servidores', 'Escritório Climatizado'],
          esforcoFisico: 'Leve',
          contatos: 'Equipe de Infraestrutura e Backend',
        },
      },
      dadosRH: {
        create: {
          rhCargo: 'Analista de Infraestrutura Pleno',
          rhSalarioExp: 'R$ 8.000,00',
          rhSalario: 'R$ 8.000,00',
          rhCandidato: 'Lucas Martins (Interno)',
          rhCodigo: 'REQ-2026-001',
          rhDataAdmissao: '2026-08-15',
          rhRecrutamento: 'Promovido internamente',
        },
      },
      avaliacaoDiretoria: {
        create: {
          decisao: 'Aprovado',
          observacao: 'Aprovado em razão da migração para o servidor local privado.',
        },
      },
    },
  });

  console.log('✅ Requisições e históricos populados com sucesso!');
  console.log('🎯 Processo de Seed finalizado.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });