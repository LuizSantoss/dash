import nodemailer from 'nodemailer';

// 1. Configuração do Motor SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT), 
    secure: process.env.SMTP_PORT === '465', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Como o sistema vai rodar em servidor privado, isso evita bloqueios 
        // caso o servidor de e-mail use certificados locais (self-signed)
        rejectUnauthorized: false 
    }
});

// 2. Função pública para enviar o e-mail (Mantivemos a mesma estrutura!)
export const enviarEmailNotificacao = async (destinatario: string, assunto: string, conteudoHtml: string): Promise<void> => {
    try {
        const remetente = process.env.EMAIL_REMETENTE;

        const info = await transporter.sendMail({
            from: `"Dash RH" <${remetente}>`, // Nome do sistema + email
            to: destinatario,
            subject: assunto,
            html: conteudoHtml,
        });

        console.log(`E-mail enviado com sucesso para: ${destinatario} | ID da Mensagem: ${info.messageId}`);
    } catch (error) {
        console.error("Falha ao enviar e-mail via SMTP:", error);
    }
};