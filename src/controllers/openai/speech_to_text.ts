 import {Request, Response} from 'express';
 import OpenAI from "openai";
 import fs from "fs";
 const openai = new OpenAI();


/*** Generacion de texto apartir de voz ***/
export const speechToText = async (req: Request, res: Response) => {
 
  try {

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream("/path/to/file/audio.mp3"), // consume tu audio agrega la carpeta
      model: "whisper-1",
    });  

    res.status(200).json({msg: transcription.text})
  } catch (error) {
    res.status(400).json({msg: 'error'})
  }
 
  
}

/**
    modelo: 'whisper-1 (modelo de transcripción de audio)',
    file: 'archivo de audio',
 **/ 

module.exports = { speechToText };