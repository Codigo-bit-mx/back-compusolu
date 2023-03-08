import express from 'express'
import  {check}  from 'express-validator'
import { addTipo, obtener_tipos } from '../controllers/tipos/tiposController'


const router = express.Router()

//GET
router.get('/alltipos', obtener_tipos)

//POST
router.post('/register_tipo', [
    check('tipo', 'El nombre es obligatorio').not().isEmpty(),
], addTipo )


module.exports = router