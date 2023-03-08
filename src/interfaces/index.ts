import {Types} from 'mongoose'

export interface Tipo {
    tipo: string 
}

export interface Empresa {
    _id: string
    nombre?: string
    fecha: string
    tipo: Types.ObjectId
    comentario?: string 
    active: boolean
}




