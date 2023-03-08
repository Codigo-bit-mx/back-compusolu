import jwt from "jsonwebtoken";

export const generacionJWT = (_id: string, email: string): Promise<string> => {
    
    if(!process.env.SECRET_KEY){
        throw new Error('No hay semilla de JWT - Revisar variables de entorno')
    }
    
    return new Promise( (resolve, reject) => {
        const payload = {_id}
        jwt.sign(payload, process.env.SECRET_KEY!, {
            expiresIn: '30d', 

        }, (err, token)  => {
            if(err) {
                reject('No se genero el token')
            }else{
                resolve(token!)
            }
        })
    })
}



export const comprobarJWT = ( token: string ): Promise<string> => {
    
    if(!process.env.SECRET_KEY) {
        throw new Error('No existe la llave secreta')
    }
  
    return new Promise((resolve, reject) => {
        try{
            jwt.verify(token, process.env.SECRET_KEY || '',
            (err, token) => {
                if(err) return reject('JWT Invalido')

                const {_id} = token as {_id: string}
                resolve(_id)
            }
            )
        }catch(err){
            reject('JWT no valido')
        }
    })
} 