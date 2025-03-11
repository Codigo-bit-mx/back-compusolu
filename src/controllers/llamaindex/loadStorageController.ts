import { Request, Response} from 'express';
import fs from 'fs/promises';
import { Document,
         OpenAI,
         VectorStoreIndex,
         serviceContextFromDefaults,
         SimpleNodeParser,
         RelevancyEvaluator,
         storageContextFromDefaults, 
         OpenAIEmbedding
        } from 'llamaindex';

require('dotenv').config()


export const loadStorageController = async (req: Request, res: Response) => {

    const prompt = req.body.prompt;
    console.log('prompt', prompt);
    const loadStorage = await storageContextFromDefaults({
        persistDir: './storage'
    })    

    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: 'gpt-4o', temperature: 0}),
        embedModel: new OpenAIEmbedding({
            model: 'text-embedding-3-large',
          })
    });

    const loadIndexStorage = await VectorStoreIndex.init({
        storageContext: loadStorage, 
        serviceContext
    });
    // console.log('loadIndexStorage', loadIndexStorage);
    
    const loadedQueryEngine = loadIndexStorage.asQueryEngine();
    const loadedResponse = await loadedQueryEngine.query({
        query: prompt
    })

    res.status(200).json(loadedResponse);

}   