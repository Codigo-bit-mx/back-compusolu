import { Server } from './server'

require('dotenv').config()

const server = new Server()

server.listen()