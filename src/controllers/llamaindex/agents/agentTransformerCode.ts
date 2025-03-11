import { Request, Response } from "express";
import { OpenAI } from "llamaindex";
import { Context,
         StartEvent,
         StopEvent,
         Workflow,
         WorkflowEvent
} from "@llamaindex/core/workflow";

require('dotenv').config();

const MAX_REVIEWS = 4;

const llm = new OpenAI({ model: "o1-preview", temperature: 1 });

export class MessageEvent extends WorkflowEvent<{ msg: string }> {}
export class CodeEvent extends WorkflowEvent<{ code: string }> {}
export class ReviewEvent extends WorkflowEvent<{
  review: string;
  code: string;
}> {}


const transformCode = async (context: Context, ev: StartEvent) => {
    // get the specification from the start event and save it to context
    context.set("specification", ev.data.input);
    const spec = context.get("specification");
    // write a message to send an update to the user
    context.writeEventToStream(
        new MessageEvent({
        msg: `Observa el codigo del componente que te muestro esta escrito en javascript con React: ${spec}`,
        }),
    );
    const prompt = `Observa el codigo del componente que te muestro: <spec>${spec}</spec>. Analiza cada paso correctamente y transforma el codigo correctamente para ser usado en react native.`;
    const code = await llm.complete({ prompt });
    return new CodeEvent({ code: code.text });
}

const codeReviewer = async (context: Context, ev: ReviewEvent) => {
    const spec = context.get("specification");
    const { review, code } = ev.data;
    context.writeEventToStream(
        new MessageEvent({
        msg: `Actualiza el codigo basado en la revision: ${review}`,
        }),
    );
    const prompt = `Necesitamos mejorar el codigo que deberia implementar esta especificacion: <spec>${spec}</spec>. Aqui esta el codigo actual: <code>${code}</code>. Y aqui esta una revision del codigo: <review>${review}</review>. Mejora el codigo basado en la revision, ten en cuenta la especificacion y devuelve el codigo completo actualizado. No proporciones ningun razonamiento, solo codigo.`;
    const updatedCode = await llm.complete({ prompt });
    return new CodeEvent({ code: updatedCode.text });
}   


const reviewCode = async (context: Context, ev: CodeEvent) => {
    const spec = context.get("specification");
    const code = ev.data.code;

    const numberReviews = context.get("numberReviews", 0) + 1;

    context.set("numberReviews", numberReviews);
    if (numberReviews >= MAX_REVIEWS) {
    context.writeEventToStream(
        new MessageEvent({
        msg: `Se han realizado ${MAX_REVIEWS} revisiones. El codigo final es: ${code}`,
        }),   
    )    
    
    return new StopEvent({ result: code });
    
    }

    context.writeEventToStream(
        new MessageEvent({ msg: `Revisa el codigo lo mas profundo posible y detecta correctamente los issues: ${code}` }),
    );

    const prompt = `Revisa el codigo lo mas profundo posible y detecta correctamente los issues: ${code} esta es la especificacion: <spec>${spec}</spec> original.`;
    const review = (await llm.complete({ prompt })).text;

    if (review.includes("Looks great")) {
        // the reviewer is satisfied with the code, let's return the review
        context.writeEventToStream(
          new MessageEvent({
            msg: `Reviewer says: ${review}`,
          }),
        );
        return new StopEvent({ result: code });
      }
    
        return new ReviewEvent({ review, code });
    
}

const codeAgent = new Workflow({ validate: true });
codeAgent.addStep(StartEvent, transformCode, { outputs: CodeEvent });
codeAgent.addStep(ReviewEvent, codeReviewer, { outputs: CodeEvent });
codeAgent.addStep(CodeEvent, reviewCode, { outputs: ReviewEvent });


export const agentTransformerCode = async (req: Request, res: Response) => {

    const specifications = req.body.specifications; // pregunta
 
    const run = codeAgent.run(specifications)

    for await (const event of codeAgent.streamEvents()) {
        const msg = (event as MessageEvent).data.msg;
        console.log(`${msg}\n`);
      }
      const result = await run;
      console.log("Final code:\n", result.data.result);

      res.status(200).json({result: result.data.result});
}