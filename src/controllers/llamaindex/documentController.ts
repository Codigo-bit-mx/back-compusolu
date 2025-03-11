import { Request, Response} from 'express';
import fs from 'fs/promises';
import { Document,
        OpenAI,
        VectorStoreIndex,
        serviceContextFromDefaults,
        SimpleNodeParser,
        RelevancyEvaluator, 
        SimpleDirectoryReader,
        PDFReader,
        storageContextFromDefaults, 
        OpenAIEmbedding,
   } from 'llamaindex';

// import path from 'path';

require('dotenv').config();

function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks = [];
  let currentChunk = "";
  const words = text.split(/\s+/); // manipulador de esácops em blanco

  for (const word of words) {
    if ( (currentChunk + " " + word).length > chunkSize && currentChunk.length > 0 ) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += (currentChunk ? " " : "") + word;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}


export const documentController = async (req: Request, res: Response) => {

  try {
      // leer el archivo con tecnologia llamaInde
      //const datafile:any = req.files;
      //const path:any = datafile.file.tempFilePath;
        const path = './document'; //path donde se encuentran los archivos

        const reader = new SimpleDirectoryReader();
        const documents = await reader.loadData(path);
        console.log(documents); // muestra los documentos leidos

     // Dividir cada documento en trozos más pequeños
        const chunkedDocs = [];
        for (const doc of documents) {
          const chunks = splitTextIntoChunks(doc.text, 4000); // dividir el texto en trozos de 4000 caracteres
          chunkedDocs.push(...chunks.map(chunk => new Document({ text: chunk })));
        }
        const serviceContext = serviceContextFromDefaults({  //configuracion de modelo
            llm: new OpenAI({ model: 'gpt-4o'}),
            embedModel: new OpenAIEmbedding({
              model: 'text-embedding-3-large',
            })
          }); // representacion numerica del texto (TOKEN)

        const storageContext = await storageContextFromDefaults({
          persistDir: "./storage",
        });

        // Indexar por lotes
        const batchSize = 100; // 
        for (let i = 0; i < chunkedDocs.length; i += batchSize) {
          const batch = chunkedDocs.slice(i, i + batchSize);
          const index = await VectorStoreIndex.fromDocuments(batch, {serviceContext, storageContext});

 
        //   //Un índice es el contenedor y la organización básicos de sus datos.
        //   const index = await VectorStoreIndex.fromDocuments(documents, {
        //     serviceContext,
        //     storageContext,
        //  });
    
         console.log(index);
        }
        res.status(200).json({res:"indexado correcto"});
  } catch (error) {
    console.log(error);
    res.status(500).json({res:"error"});
  }

}