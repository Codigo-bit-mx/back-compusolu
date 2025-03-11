import {Request, Response} from 'express'
import OpenAI from "openai";
const openai = new OpenAI();


export const vision = async (req: Request, res: Response) =>  {

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Que observas en esta imegen?" },
            {
              type: "image_url",
              image_url: {
                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg", // agregar la url de la imagen que quieres analizar
              },
            },
          ],
        },
      ],
    });

    console.log(response);

    res.status(200).json({msg: response.choices[0]});

  } catch (error) {
    
    res.status(400).json({msg: error})
}

}


module.exports = { vision };