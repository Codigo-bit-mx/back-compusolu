import {Request, Response} from 'express'
import OpenAI from "openai";

const openai = new OpenAI();


export const chat_completions = async (req: Request, res: Response) => {

  const query =  req.body.query;
  const prompt = `actua como un asistente contesta la siguiente pregunta ${query} `;


try {
    let response = null;
    const request = await openai.chat.completions.create({
      model: 'gpt-4o', // Reemplaza esto con el modelo que desees utilizar
      messages: [{ "role": "user", "content": prompt }],
      temperature: 0.5, // creatividad
    });
  
    if (request && request.hasOwnProperty('choices') && request.choices.length > 0) {
        response = request.choices[0].message.content;
    } else {
      return null;
    }

    res.status(200).json({msg: response});

    return ;
  } catch (error) {
    return null;
  }

}
