import { Request, Response } from "express";
import {
    Context, 
    StartEvent,
    StopEvent, 
    Workflow, 
    WorkflowEvent,
} from "@llamaindex/core/workflow";
import { OpenAI } from "llamaindex";

require('dotenv').config()
const llm = new OpenAI({ model: "o1-preview", temperature: 1});

export class JokeEvent extends WorkflowEvent<{ joke: string }> {}

const generateJoke = async (_context: Context, ev: StartEvent) => {
 const prompt = `Crea el codigo necesario para crear la función siguiente${ev.data.input}`
 const response = await llm.complete({prompt})
    return new JokeEvent({ joke: response.text });
}

const critiqueJoke = async (_context: Context, ev: JokeEvent) => {
    const prompt = `Revisa el codigo lo mas profundo posible y detecta correctamente los issues: ${ev.data.joke}`;
    const response = await llm.complete({prompt});
    return new StopEvent({ result: response.text });
}

const jokeFlow = new Workflow({ verbose: true });
jokeFlow.addStep(StartEvent, generateJoke);
jokeFlow.addStep(JokeEvent, critiqueJoke);



export const agentJoker = async (req: Request, res: Response) => {

    const spec = req.body.specification;

    const result = await jokeFlow.run(spec);

    console.log(result);
    res.status(200).json({res:result});

}
