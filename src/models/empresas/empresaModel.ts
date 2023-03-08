import mongoose, {Schema, model} from 'mongoose'
import { Empresa } from '../../interfaces'
require('../tipos/tiposModel')

const empresaSchema = new Schema<Empresa>({

  nombre: {   
    type: String, 
    required: true
  }, 
  fecha: {
     type: String,
     required: true
  },
  tipo: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'tipos', 
    required: true
  }, 
  comentario: {
    type: String
  }, 
  active: { 
     type: Boolean,
     default: true
   },
})


export const Empresas = model<Empresa>('empresa', empresaSchema)