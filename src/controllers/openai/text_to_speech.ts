import {Request, Response} from 'express';
import fs from "fs";
import path from "path";
import OpenAI from "openai";


const openai = new OpenAI();

/**** Generacion de voz apartir del texto ****/
const speechFile = path.resolve("./speech.mp3"); // agrega la carpeta donde quieras guardar el audio

export const textoToSpeech = async (req: Request, res: Response) => {

  try {    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: "hola mundo jaja!",
    });

    console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    
    res.status(200).json({msg: "exito"})
  } catch (error) {
    res.status(400).json({msg: error})
  }
}

/****** 
 model: "modelo de voz tts-1 con menos latencia para hablar en tiempo real" 
 voice: "tipo de voz"
 input: "texto de entrada"
 formatos de salida aceptados: "mp3(default), Opus, ACC, FLAC, WAV, PCM"
 *****/  


module.exports = { textoToSpeech };