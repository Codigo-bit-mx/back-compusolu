import express, {Express} from 'express'
import cors       from 'cors'
import http       from 'http'
import fileUpload from 'express-fileupload'


export class Server {
    app: Express 
    port: string 
    address: string 
    server: any 
    llamaindex: string 
    openai:string

    constructor() {
        this.app = express()
        this.port        = process.env.PORT!
	    this.address	 = process.env.IP!
        this.server      = http.createServer( this.app )
        this.llamaindex  = '/api/llamaindex'       
        this.openai      = '/api/openai'
        this.conectarBD()
        this.middleware()
        this.routes()
        
    }

    conectarBD() {
        // initializeMySQL(); // configura alguna conexión a base de datos
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
        
    }

    routes() {
        this.app.use( this.llamaindex, require('../routes/llamaindex'))
        this.app.use( this.openai, require('../routes/openai'))
    }

    listen() {
        this.server.listen( this.port, () => {
            console.log("Servidor corriendo en",this.address,':',this.port);
        })
    }
}