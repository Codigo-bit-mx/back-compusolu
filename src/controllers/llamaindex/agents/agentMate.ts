import { Request, Response} from 'express';
import { OpenAI, FunctionTool, OpenAIAgent } from "llamaindex";

require('dotenv').config()

const sumNumbers = FunctionTool.from(
    ({ a, b }: { a: number; b: number }) => `${a + b}`,
    {
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: {
        type: "object",
        properties: {
          a: {
            type: "number",
            description: "The first number",
          },
          b: {
            type: "number",
            description: "The second number",
          },
        },
        required: ["a", "b"],
      },
    },
  );

  const divideNumbers = FunctionTool.from(
    ({ a, b }: { a: number; b: number }) => `${a / b}`,
    {
      name: "divideNumbers",
      description: "Use this function to divide two numbers",
      parameters: {
        type: "object",
        properties: {
          a: {
            type: "number",
            description: "The dividend a to divide",
          },
          b: {
            type: "number",
            description: "The divisor b to divide by",
          },
        },
        required: ["a", "b"],
      },
    },
  );

export const agentMate = async (req: Request, res: Response) => {
    
const prompt = req.body.prompt; // pregunta

 const agent = new OpenAIAgent({
    tools: [sumNumbers, divideNumbers],
 });

 const response = await agent.chat({
    message: prompt,
  });

 
 res.status(200).json({msg: response});
 
 console.log(response);
 
}





