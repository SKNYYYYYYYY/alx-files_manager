/* eslint-disable import/extensions */
import express from 'express';
import * as AppContoller from '../controllers/AppController.js';
import * as UsersContoller from '../controllers/UsersContoller.js';
import * as AuthController from '../controllers/AuthController.js';
import * as FilesController from '../controllers/FilesController.js';

const router = express.Router();

router.use(express.json());

router.get('/status', AppContoller.getStatus);

router.get('/stats', AppContoller.getStats);

router.post('/users', UsersContoller.postNew);

router.get('/users/me', UsersContoller.getMe);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.post('/files', FilesController.postUpload);

router.get('/files/:id', FilesController.getShow);

router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);

router.put('/files/:id/unpublish', FilesController.putUnPublish);

router.get('/files/:id/data', FilesController.getFile);

export default router;
