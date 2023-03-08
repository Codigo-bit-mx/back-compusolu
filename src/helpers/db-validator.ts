// import { Roles } from '../models/roles/rolesModel'
// import { Usuarios } from '../models/usuario/usuarioModel';

// import {Types} from 'mongoose'
// import { conexion, disconnect } from '../database/config';

// export const RoleValid = async(rol: string = '') => {
//     await conexion ()
//     const existeRol = await Roles.findOne({ rol });
   
//     if ( !existeRol ) {
//         throw new Error(`El rol ${ rol } no está registrado en la BD`);
//     }
//     await disconnect()
// } 

// export const emailExiste = async( email: string = '' ) => {
//     await conexion()
//     const existeEmail = await Usuarios.findOne({ email });
//     if ( existeEmail ) {
//         console.log(existeEmail)
//         throw new Error(`El correo: ${ email }, ya está registrado`);
        
//     }
//     await disconnect()
// }

// export const existeUsuarioPorId = async( id:string ) => {

//     // Verificar si el correo existe
//     await conexion()
//     const existeUsuario = await Usuarios.findById(id);
//     if ( !existeUsuario ) {
//         throw new Error(`El id no existe ${ id }`);
//     }
//     await disconnect()
// }


// export const existeEstacionPorId = async( id: string ) => {

//     // Verificar si el correo existe
//     await conexion()
//     const existeCategoria = await Estaciones.findById(id);
//     if ( !existeCategoria ) {
//         throw new Error(`El id no existe ${ id }`);
//     }
//     await disconnect()
// }