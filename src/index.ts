import dotenv from 'dotenv';
import router from '@/router';
import express from 'express';
import dbService from '@/services/dbService';
import aiService from '@/services/aiService';

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(router);

const startServer = async () => {
  await dbService.connect();
  await aiService.init();

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
