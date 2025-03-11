import express from 'express'
import { chat_completions } from '../controllers/openai/chat_completions';
import { speechToText } from '../controllers/openai/speech_to_text';
import { textoToSpeech } from '../controllers/openai/text_to_speech';
import { vision } from '../controllers/openai/vision';

const router = express.Router();

//coleccion de rutas para el llamado a la ruta 
router.post('/completions',chat_completions);
router.post('/speech_to_text', speechToText);
router.post('/text_to_speech', textoToSpeech);
router.post('/vision', vision);

module.exports = router;