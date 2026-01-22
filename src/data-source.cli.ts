import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // build generuje encje do dist/**, więc CLI ma widzieć *.js
  entities: [__dirname + '/**/*.entity.js'],
  migrations: [__dirname + '/migrations/*.js'],
});
