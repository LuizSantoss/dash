import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import "isomorphic-fetch";

// 1. Configuração do Autenticador da Microsoft
const msalConfig = {
    auth: {
        clientId: process.env.GRAPH_CLIENT_ID as string,
        clientSecret: process.env.GRAPH_CLIENT_SECRET as string,
        authority: `https://login.microsoftonline.com/${process.env.GRAPH_TENANT_ID}`
    }
};

const cca = new ConfidentialClientApplication(msalConfig);

// 2. Função privada para gerar o token do Microsoft Graph
const obterTokenAcesso = async (): Promise<string> => {
    const clientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
    };
    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    return response?.accessToken || '';
};

// 3. Função pública para enviar o e-mail
export const enviarEmailNotificacao = async (destinatario: string, assunto: string, conteudoHtml: string): Promise<void> => {
    try {
        const token = await obterTokenAcesso();

        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });

        const mensagem = {
            message: {
                subject: assunto,
                body: {
                    contentType: "HTML",
                    content: conteudoHtml
                },
                toRecipients: [
                    { emailAddress: { address: destinatario } }
                ]
            },
            saveToSentItems: "false"
        };

        const remetente = process.env.EMAIL_REMETENTE;
        
        // Faz o pedido à API do Outlook para enviar a mensagem
        await client.api(`/users/${remetente}/sendMail`).post(mensagem);
        
        console.log(`E-mail enviado com sucesso para: ${destinatario}`);
    } catch (error) {
        console.error("Falha ao enviar e-mail via MS Graph:", error);
    }
};