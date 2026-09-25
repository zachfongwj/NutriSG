import dotenv from 'dotenv';
import { createApp } from './server/app';
dotenv.config();
const port = Number(process.env.PORT || 3000);
createApp(true).then(app => app.listen(port, () => console.log(`NutriSG server listening on ${port}`))).catch(error => { console.error('Fatal server startup failure', error); process.exit(1); });
