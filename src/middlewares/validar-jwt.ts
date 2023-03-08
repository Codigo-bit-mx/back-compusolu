import next, { Request, Response, NextFunction } from "express"
import { Usuarios } from "../models/usuario/usuarioModel"
import { comprobarJWT } from "../helpers/generacion-jwt"
import {conexion, disconnect} from '../database/config'
import { Usuario } from "../interfaces"


export const validarJWT = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.header('x-auth-token')
   
    if(!token){
        return res.status(401).json({
            msg:'No existe el token'
        })
    }

    try {
        const userId = await comprobarJWT(token)
        await conexion()
        const usuario = await Usuarios.findById<Usuario>(userId)
        
        if( !usuario ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }

        if ( !usuario.active ) {
            return res.status(401).json({
                msg: 'Token no válido - el usuario no existe'
            })
        }

        req.params = {id: userId, role: usuario.role}
        await disconnect()
        next()
    } catch (error) {
        res.status(400).json({
            msg: "Ocurrio un error en validar jwt"
        })
    }
}