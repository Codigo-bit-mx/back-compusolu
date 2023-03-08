import express, {Express} from 'express'
import fs          from 'fs'
import cors       from 'cors'
import {conexion} from '../database/config'
import http       from 'http'
import fileUpload from 'express-fileupload'

export class Server {
    app: Express 
    port: string 
    address: string 
    server: any 
    empresas: string
    tipos: string
  

    constructor() {
        this.app = express()
        this.port        = process.env.PORT!
	    this.address	 = process.env.IP!
        this.server      = http.createServer( this.app )
        this.empresas    = '/api/empresas'
        this.tipos       = '/api/tipos'       
        this.conectarBD()
        this.middleware()
        this.routes()
        
    }

    conectarBD() {
        conexion();
    }

    middleware() {
        this.app.use(cors());
        this.app.use( express.json() );
        this.app.use(express.static('public'));
        this.app.use(fileUpload({
            useTempFiles:true, 
            tempFileDir: '/tmp/', 
            createParentPath: true
        }))
        // this.app.use( this.upload.single('file'));
    }

    routes() {
        this.app.use( this.empresas, require('../routes/empresas'))
        this.app.use( this.tipos, require('../routes/tipos'))
       
    }

    listen() {
        this.server.listen( this.port, this.address, () => {
            console.log("Servidor corriendo en",this.address,':',this.port);
        })
    }
}



// module.exports = Server;