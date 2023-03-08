import { Request, Response, NextFunction, response } from "express"


export const esSuperAdminRole = (req: Request, res:Response, next: NextFunction) => {

    if( !req.params ) {
        return res.status(500).json({
            msg: 'Se quiere verificar el token sin verificar el token primero'
        })
    }

    const { role } = req.params
    if(role !== 'SUPER_ADMIN'){
        return res.status(401).json({
            msg: `No eres super administrador - no puede realizar la accion`
        })
    }

    next()
}

export const isAdmin = ( req: Request, res: Response, next: NextFunction ) => {
    
    const roleValido = ['SUPER_ADMIN', 'ADMIN_ESTACION']

    if( !req.params ) {
        return res.status(500).json({
            msg: 'Se quiere verificar el token sin verificar el token primero'
        })
    }

    const { role } = req.params
  
    if(!roleValido.includes(role)){
        return res.status(401).json({
            msg: `No eres administrador - no puede realizar la accion`
        })
    }

    next()
}
