import {Express, Response, Request} from 'express'


export const prueba = (req:Request, res:Response) => {
   
    res.send('Express con TypeScript')
}

