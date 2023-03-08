import {json, Request, Response} from 'express'
import { Empresas } from '../../models/empresas/empresaModel'
import {Empresa} from '../../interfaces'
import {conexion, disconnect} from '../../database/config'



export const all_empresas = async (req: Request, res: Response) => {
  try {  
    await conexion()
     const consulta = await Empresas.find({active: true}).sort({nombre: 1}).populate({
      path:'tipo', 
      select:'tipo'
     }).lean()

    await disconnect()
     
    res.status(200).json({
     consulta  
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({msg: 'Se obtuvo un error'})
  }
}


export const addEmpresa = async (req: Request, res:Response) => {

   const {nombre, fecha, tipo, comentario} = req.body
  
   try {
    if( nombre === '' || fecha === '' || tipo === '' ) {
      return res.status(400).json({msg:'Todos los campos son obligatorios'})
    }

    if(nombre.length > 250) return res.status(401).json({msg:'El nombre no puede tener mas de 250 caracteres'})
    if(comentario?.length > 1030) return res.status(401).json({msg: 'El comentario no puede sobrepasar los 1030 caracteres'})
  
    await conexion() 
     
      let empresa = await Empresas.findOne({nombre})
      if(empresa){
        return res.status(400).json({
          msg: 'Empresa registrada'
        })
      }

      empresa = new Empresas({
        nombre,
        fecha,
        tipo,
        comentario
      })
    await empresa.save()
    await disconnect()
  
    res.status(200).json({msg: 'Se guardo correctamente la empresa'})
   
  } catch (err) {
    return res.status(400).json({msg: 'Existe un error verifica los datos'})
   }

}


export const updateEmpresa = async ( req: Request, res: Response ) => {
  const {...argumentos} = req.body
  try {

    if( argumentos.nombre === '' || argumentos.fecha === '' || argumentos.tipo === '' ) {
      return res.status(400).json({msg:'Todos los campos son obligatorios'})
    }

    await conexion() 
      await Empresas.findByIdAndUpdate(argumentos.id, argumentos)
    await disconnect()

   res.status(200).json({ msg:'Se Actualizo correcta la empresa' })

  } catch (error) {
   res.status(400).json({msg: 'Error'})
  }
  
}

export const activeEmpresa = async ( req: Request, res: Response) => {

  const { id, active } = req.body
  
  try {
      await conexion()  
      await Empresas.findByIdAndUpdate(id, {active: active})
      await disconnect()
      
      res.status(200).json({msg: 'Exito se elimino la empresa'})
    
    } catch (error) {
     
      res.status(400).json({
        msg: 'Error al eliminar la empresa'
      })
    }

}




