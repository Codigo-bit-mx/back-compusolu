import { Request, Response } from 'express';
import {ChatResponseChunk,
        OpenAIAgent,
        FunctionTool, 
        OpenAI
    } from 'llamaindex';

require('dotenv').config()
const llm = new OpenAI({ model: "o1-preview", temperature: 1});


const coleccion = async (spec: string) => {
    const prompt = `Obten las coordenadas correctas del siguiente punto: ${spec}`;
    const response = await llm.complete({prompt})
    return response.text;
}

const getWeatherApi = async (coor: any) => {
    const {lat, lng} = JSON.parse(coor);
    const result = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    );

     return await result.json();
}

const getCoor = FunctionTool.from(
    async ({spec}: {spec: string}) => {
        const prompt = `Obten las coordenadas correctas del siguiente punto: ${spec}`;
        const response = await llm.complete({prompt})
        return response.text;
    },
    {
        name: 'Coordenadas',
        description: 'Aqui se obtienen las coordenadas exactas del lugar solicitado',
        parameters: {
            type: 'object',
            properties: {
                spec: {
                    type: 'string',
                    description: 'Especifica el lugar del que se quieren obtener las coordenadas'
                }
            },
            required: ['spec']
        }
    }
);

const getWeather = FunctionTool.from(
    async ({lat, lng}: { lat:string, lng:string} ) => {
        const result = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
        );
        console.log('result', result);
         return await result.json();
    },
    {
        name: 'Clima',
        description: 'Aqui se obtiene el clima del lugar solicitado mediante el API de Open-Meteo',
        parameters: {
            type: 'object',
            properties: {
                lat: {
                    type: 'string',
                    description: 'Latitud del lugar solicitado'
                },
                lng: {
                    type: 'string',
                    description: 'Longitud del lugar solicitado'
                }
            },
            required: ['lat', 'lng']
        }   
    }
)


export const agentWeather = async (req: Request, res: Response) => {
    
    const agent = new OpenAIAgent({
        tools: [getCoor, getWeather],
    });

    const task = await agent.chat({
        message: 'santa catarina acolman'
    })

    console.log(task);

    res.status(200).json({msg: task});
}