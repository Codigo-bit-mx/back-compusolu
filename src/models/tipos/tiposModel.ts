import {Schema, model} from 'mongoose'
import { Tipo } from '../../interfaces'

const tiposSchema = new Schema<Tipo>({
    tipo: {
        type: String, 
        required: true
    }, 
   
})


export const tipos = model('tipos', tiposSchema)