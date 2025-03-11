import { Request, Response } from "express";
import { ChatResponseChunk, OpenAIAgent, FunctionTool, OpenAI } from "llamaindex";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { AuthProvider } from "@microsoft/microsoft-graph-client";
import { JSONSchemaType } from "ajv";

require('dotenv').config()
const llm = new OpenAI({ model: "o1-preview", temperature: 1});

interface EmailParameters {
    auth?: any;
    to: string;
    subject: string;
    body: string;
  }
  

const auth = FunctionTool.from(
    async ({ tenantId, clientId, clientSecret }: { tenantId: string; clientId: string; clientSecret: string }) => {
        const credential = new ClientSecretCredential(
          tenantId,
          clientId,
          clientSecret
        );
      
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
          scopes: ['https://graph.microsoft.com/.default']
        });
      


        return { token: await authProvider.getAccessToken()};
    },
    {
        name: 'Auth',
        description: 'Aqui se obtiene el token de autenticacion para poder enviar el correo',
        parameters: {
            type: 'object',
            properties: {
                tenantId: {
                    type: 'string',
                    description: 'Id del tenant'
                },
                clientId: {
                    type: 'string',
                    description: 'Id del cliente'
                },
                clientSecret: {
                    type: 'string',
                    description: 'Secreto del cliente'
                }
            },
            required: ['tenantId', 'clientId', 'clientSecret']
        }
    }
)


const sendEmail = FunctionTool.from(
    async ({ token, to, subject, body }: { token: string; to: string; subject: string; body: string }) => {
        console.log(token);
        console.log(to);
        console.log(subject);
        console.log(body);
        const client = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => token
            }
          });
        
        console.log(client);
          const message = {
            subject: subject,
            body: {
              contentType: 'Text',
              content: body
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to
                }
              }
            ]
          };
        
          console.log(message);
          try{

              const a = await client.api('/me/sendMail').post({ message });
              console.log(a);
          }catch(e){console.log(e);}
          return { success: true };
    },
    {
        name: 'SendEmail',
        description: 'Envia un correo electronico',
        parameters: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    description: 'Token de autenticacion'
                },
                to: {
                    type: 'string',
                    description: 'Correo electronico del destinatario'
                },
                subject: {
                    type: 'string',
                    description: 'Asunto del correo'
                },
                body: {
                    type: 'string',
                    description: 'Cuerpo del correo'
                }
            },
            required: ['token', 'to', 'subject', 'body']
        }
    }
)





export const agentEmail = async (req: Request, res: Response) => {

    const agent = new OpenAIAgent({
        tools: [auth, sendEmail],
    })

    const prompt = `Autentica la aplicacion para poder enviar el correo electronico. 
        aqui tienes los siguientes datos para autenticarte:
        tenantId: ${process.env.TENANT_ID}
        clientId: ${process.env.CLIENT_ID}
        clientSecret: ${process.env.CLIENT_SECRET}

        una vez que estes autqenticado, usa el token y envia el correo electronico con los siguientes datos:
        to: ${req.body.to}
        subject: ${req.body.subject}
        body: ${req.body.body}


    `

    const task = await agent.chat({
        message: prompt,
    });

    res.status(200).json({msg: task});
}