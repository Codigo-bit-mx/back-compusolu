import express from 'express'
import { openai } from '../controllers/llamaindex/openai'
import { queryEngineController } from '../controllers/llamaindex/queryEngineController'
import { chatEngineController } from '../controllers/llamaindex/chatEngineController'
import { documentController } from '../controllers/llamaindex/documentController'
import { loadStorageController } from '../controllers/llamaindex/loadStorageController'
// import { promptTemplateController } from '../controllers/llamaindex/promptTemplateController'
import { agentMate } from '../controllers/llamaindex/agents/agentMate'
import { agentGenerateCode } from '../controllers/llamaindex/agents/agentGenerateCode'
import { agentJoker } from '../controllers/llamaindex/agents/agentJoker'
import { agentWeather } from '../controllers/llamaindex/agents/agentWeather'
import { agentTransformerCode } from '../controllers/llamaindex/agents/agentTransformerCode'
import { agentRetriever } from '../controllers/llamaindex/agents/agentRetriever'
import { agentEmail } from '../controllers/llamaindex/agents/agentEmail'

const router = express.Router()

//coleccion de rutas para llamaindex
router.post('/openai', openai)
router.post('/chatengine', chatEngineController)
router.post('/queryengine', queryEngineController)
router.post('/document', documentController)
router.post('/loadstorage', loadStorageController)
// router.post('/promptTemplateController', promptTemplateController)

//agent
router.post('/agentmate', agentMate)
router.post('/agentjoker', agentJoker)
router.post('/agentweather', agentWeather)
router.post('/agentGenerateCode', agentGenerateCode)
router.post('/agentTransformerCode', agentTransformerCode)
router.post('/agentretriever', agentRetriever)
router.post('/agentemail', agentEmail)

module.exports = router;
