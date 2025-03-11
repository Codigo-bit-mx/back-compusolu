import { Request, Response} from 'express';
import { OpenAI } from "llamaindex";

require('dotenv').config()

export const openai = async (req: Request, res: Response) => {
    
    const query = req.body.prompt; // pregunta 
    const training = ''; // entrenamiento 
    const prompt = `Eres un asistente constesta la duda siguiente:${query}`; // estructura del prompr
    
    try {
        const llm = new OpenAI({ model: "gpt-4o", temperature: 0 });
        const responseAI = await llm.complete({ prompt });
        const response: string =  responseAI.text;
        res.status(200).json({msg: response});
    } catch (err) {
        console.log(err);
        res.status(400).json({msg: 'Se obtuvo un error'});
    }
}





