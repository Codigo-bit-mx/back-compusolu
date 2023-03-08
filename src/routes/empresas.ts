import express from 'express'
import {check} from 'express-validator'
import { all_empresas, 
         addEmpresa, 
         updateEmpresa, 
         activeEmpresa
        } from '../controllers/empresas/empresas' 


const router = express.Router()

// GET
router.get('/allempresas',         
            all_empresas)    

 
//POST
router.post('/register_empresa',
    check('nombre', 'el nombre es obligatorio').not().isEmpty(),
    check('fecha', 'La fecha es obligatorio').not().isEmpty(), 
    check('tipo').isMongoId(), 
    addEmpresa)

//PUT
router.put('/update_empresa',
            updateEmpresa)


router.put('/active_empresa', 
            activeEmpresa)


module.exports = router