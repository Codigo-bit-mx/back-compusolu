import mongoose from 'mongoose'

const mongoConnected = {
    isConnect: 0
}

export const conexion = async() => {
 
   if(mongoConnected.isConnect) {
    console.log('ya conectado')
   }

   if(mongoose.connect.length > 0) {
    mongoConnected.isConnect = mongoose.connections[0].readyState
    if(mongoConnected.isConnect === 1) {
        console.log('en uso conexion anterior')
        return
    }
        await mongoose.disconnect()
   }

   await mongoose.connect(process.env.MONGO_URL || '')
   mongoConnected.isConnect = 1 
   console.log('conectado a mongoDB')
}


export const disconnect = async () => {

    if(process.env.NODE_ENV === 'development') return
    if(mongoConnected.isConnect === 0){
        return
    }
    await mongoose.disconnect()
    console.log("Desconectado de MONGODB")
} 