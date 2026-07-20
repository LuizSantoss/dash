-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requisicao" (
    "id" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "gerenteId" TEXT NOT NULL,

    CONSTRAINT "Requisicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DadosGerais" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cargoSolicitado" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "motivoRequisicao" TEXT NOT NULL,
    "formaContratacao" TEXT NOT NULL,
    "colaboradorSubstituido" TEXT,
    "justificativaAumento" TEXT,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "DadosGerais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaTrabalho" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "horarioTrabalho" TEXT NOT NULL,
    "entrada" TEXT NOT NULL,
    "saida" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "JornadaTrabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisitosCargo" (
    "id" TEXT NOT NULL,
    "idade" TEXT NOT NULL,
    "idadeAnos" TEXT,
    "sexo" TEXT NOT NULL,
    "caracteristicasPessoais" TEXT,
    "escolaridade" TEXT NOT NULL,
    "curso" TEXT,
    "periodoCurso" TEXT,
    "cursosComplementares" TEXT,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "RequisitosCargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbienteTrabalho" (
    "id" TEXT NOT NULL,
    "condicoesAmbientais" TEXT[],
    "esforcoFisico" TEXT NOT NULL,
    "contatos" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "AmbienteTrabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DadosRH" (
    "id" TEXT NOT NULL,
    "rhCargo" TEXT,
    "rhSalarioExp" TEXT,
    "rhSalario" TEXT,
    "rhCandidato" TEXT,
    "rhCodigo" TEXT,
    "rhDataAdmissao" TEXT,
    "rhRecrutamento" TEXT,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "DadosRH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoDiretoria" (
    "id" TEXT NOT NULL,
    "decisao" TEXT NOT NULL,
    "observacao" TEXT,
    "avaliadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requisicaoId" TEXT NOT NULL,

    CONSTRAINT "AvaliacaoDiretoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DadosGerais_requisicaoId_key" ON "DadosGerais"("requisicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaTrabalho_requisicaoId_key" ON "JornadaTrabalho"("requisicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "RequisitosCargo_requisicaoId_key" ON "RequisitosCargo"("requisicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AmbienteTrabalho_requisicaoId_key" ON "AmbienteTrabalho"("requisicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "DadosRH_requisicaoId_key" ON "DadosRH"("requisicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoDiretoria_requisicaoId_key" ON "AvaliacaoDiretoria"("requisicaoId");

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_gerenteId_fkey" FOREIGN KEY ("gerenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DadosGerais" ADD CONSTRAINT "DadosGerais_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaTrabalho" ADD CONSTRAINT "JornadaTrabalho_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisitosCargo" ADD CONSTRAINT "RequisitosCargo_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbienteTrabalho" ADD CONSTRAINT "AmbienteTrabalho_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DadosRH" ADD CONSTRAINT "DadosRH_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoDiretoria" ADD CONSTRAINT "AvaliacaoDiretoria_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
