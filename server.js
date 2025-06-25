/* eslint-disable import/extensions */
import express from 'express';
import indexRouter from './routes/index.js';

const ENV = process.env;
const PORT = ENV.PORT || 5000;

const app = express();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use('/', indexRouter);
