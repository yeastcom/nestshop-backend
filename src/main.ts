import "dotenv/config"

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

import cookieParser from "cookie-parser"
import session from "express-session"

import { createClient } from "redis"
import { RedisStore } from "connect-redis"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix("api")

  app.enableCors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })

  app.use(cookieParser())

  const redisClient = createClient({
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  })
  redisClient.on("error", (err) => console.error("[redis] error", err))
  await redisClient.connect()

  if (!process.env.SESSION_SECRET) {
    throw new Error("Missing SESSION_SECRET in env")
  }

const sessionMiddlewareAdmin = session({
  name: "admin.sid",
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/", // <-- KLUCZ
  },
})

const sessionMiddlewareCustomer = session({
  name: "customer.sid",
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/", // <-- KLUCZ
  },
})

// podpinamy middleware tylko na API (żeby nie działał globalnie),
// ale cookie ma path "/" żeby Next middleware je widział
app.use("/api/admin", sessionMiddlewareAdmin)
app.use("/api", sessionMiddlewareCustomer)
  const config = new DocumentBuilder()
    .setTitle("NestShop API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

bootstrap()