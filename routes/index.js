/* eslint-disable import/extensions */
import express from 'express';
import * as AppContoller from './controllers/AppController.js';

const router = express.Router();

router.get('/status', AppContoller.getStatus);

router.get('/stats', AppContoller.getStats);

export default router;
