import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import  AppDataSource  from '../data-source.cli';
import { seedAdmin } from './admin.seed';
import { seedOrderStatuses } from './order-statuses.seed';
import { seedCatalog } from "./catalog.seed"

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('[seed] DB connected');

  /*await seedAdmin(AppDataSource);
  await seedOrderStatuses(AppDataSource);*/
  await seedCatalog(AppDataSource, {
    categories: { roots: 8, childrenPerRoot: 6 },
    products: { count: 300, imagesPerProduct: [1, 5] },
    storageDir: "storage", // jak u Ciebie
  })

  await AppDataSource.destroy();
  
  console.log('[seed] done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});