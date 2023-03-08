import express from 'express'
import { prueba } from '../controllers/prueba';

const router = express.Router()

router.get('/', prueba )


// router.post('/', login);

// router.post('/lista', usuariosChat); 

// router.put('/lastchat/:uid',
//   validarJWT,
//   lastChat
// )

module.exports = router;