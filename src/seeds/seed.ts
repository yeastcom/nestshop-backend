import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import  AppDataSource  from '../data-source.cli';
import { seedAdmin } from './admin.seed';
import { seedOrderStatuses } from './order-statuses.seed';

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('[seed] DB connected');

  await seedAdmin(AppDataSource);
  await seedOrderStatuses(AppDataSource);
  await AppDataSource.destroy();
  
  console.log('[seed] done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});