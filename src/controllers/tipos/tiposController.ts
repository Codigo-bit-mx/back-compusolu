import { Request, Response } from "express";
import { tipos } from "../../models/tipos/tiposModel"
import { Tipo} from '../../interfaces'
import { conexion, disconnect } from "../../database/config";

export const obtener_tipos = async(req: Request, res: Response) => {
    
    try {    
        await conexion()
        const tiposall = await tipos.find().sort({tipo: 1})  

       res.status(200).json({
            tiposall
       })

    } catch (error) {
        res.status(400).json({
            msg: 'No se guardo el tipo de empresa'
        })
    }
}


export const addTipo = async( req: Request, res: Response ) => {
 
    const { tipo } = req.body

    try {
        await conexion()  
        const tipounico = await tipos.findOne({tipo})
        if(tipounico){
          return res.status(400).json({msg: 'Ya existe este tipo'})
        }


        let newtipo = new tipos({tipo})
        await newtipo.save()
        await disconnect()

        res.status(200).json({
            msg: 'Se guardo el tipo correctamente'
        })

    } catch (error) {
        res.status(400).json({
            msg: 'No se guardo el tipo de empresa'
        })
    }
}




