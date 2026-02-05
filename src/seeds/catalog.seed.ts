import { DataSource } from "typeorm"
import { faker } from "@faker-js/faker"
import sharp from "sharp"
import { randomUUID } from "crypto"
import path from "node:path"
import fs from "node:fs/promises"

import { Category } from "../categories/entities/category.entity"
import { Product } from "../products/entities/product.entity"
import { ProductImage } from "../products/entities/product-image.entity" // jeśli masz osobną encję na zdjęcia

type ImageType =
  | "original"
  | "cart_default"
  | "small_default"
  | "medium_default"
  | "home_default"
  | "large_default"

const IMAGE_SIZES: Array<{ type: Exclude<ImageType, "original">; w: number; h: number }> = [
  { type: "cart_default", w: 125, h: 125 },
  { type: "small_default", w: 98, h: 98 },
  { type: "medium_default", w: 452, h: 452 },
  { type: "home_default", w: 250, h: 250 },
  { type: "large_default", w: 800, h: 800 },
]

// wg Twojej konwencji: img/p/1/6/4 dla id=164
function imageDirById(baseDir: string, imageId: number) {
  const parts = String(imageId).split("")
  return path.join(baseDir, "img/p", ...parts)
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function generateOriginalJpg(tmpDir: string, label: string) {
  await ensureDir(tmpDir)
  const filePath = path.join(tmpDir, `${randomUUID()}.jpg`)

  // prosty obraz: losowy kolor + rozmiar 1200x1200
  const bg = faker.color.rgb({ prefix: "" }) // np "a1b2c3"
  const buf = await sharp({
    create: {
      width: 1200,
      height: 1200,
      channels: 3,
      background: `#${bg}`,
    },
  })
    .jpeg({ quality: 85 })
    .toBuffer()

  await fs.writeFile(filePath, buf)
  return filePath
}

async function writeVariants(storageDir: string, imageId: number, originalPath: string) {
  const dir = imageDirById(storageDir, imageId)
  await ensureDir(dir)

  // original
  await fs.copyFile(originalPath, path.join(dir, "original.jpg"))

  // warianty
  const original = sharp(originalPath)
  for (const s of IMAGE_SIZES) {
    await original
      .clone()
      .resize(s.w, s.h, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toFile(path.join(dir, `${s.type}.jpg`))
  }
}

export async function seedCatalog(ds: DataSource, opts?: {
  categories?: { roots: number; childrenPerRoot: number }
  products?: { count: number; imagesPerProduct: [number, number] } // min/max
  storageDir?: string
}) {
  const categoryRepo = ds.getRepository(Category)
  const productRepo = ds.getRepository(Product)
  const imageRepo = ds.getRepository(ProductImage)

  const storageDir = opts?.storageDir ?? path.join(process.cwd(), "storage")
  const tmpDir = path.join(process.cwd(), "tmp-seed-images")

  const roots = opts?.categories?.roots ?? 8
  const childrenPerRoot = opts?.categories?.childrenPerRoot ?? 6
  const productCount = opts?.products?.count ?? 200
  const [minImgs, maxImgs] = opts?.products?.imagesPerProduct ?? [1, 4]

  // 1) Kategorie: root + 1 poziom dzieci
  const rootCats: Category[] = []
  for (let i = 0; i < roots; i++) {
    const name = faker.commerce.department()
    const root = categoryRepo.create({
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      isActive: true,
      parentId: null,
      description: faker.lorem.sentence(),
    })
    rootCats.push(await categoryRepo.save(root))
  }

  const allCats: Category[] = [...rootCats]
  for (const root of rootCats) {
    for (let j = 0; j < childrenPerRoot; j++) {
      const name = `${faker.commerce.productAdjective()} ${faker.commerce.department()}`
      const child = categoryRepo.create({
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        isActive: true,
        parentId: root.id,
        description: faker.lorem.sentence(),
      })
      allCats.push(await categoryRepo.save(child))
    }
  }

  // 2) Produkty
  for (let i = 0; i < productCount; i++) {
    const name = faker.commerce.productName()
    const sku = faker.string.alphanumeric({ length: 10 }).toUpperCase()

    // wybierz kategorie (multi) + default z wybranych
    const categories = faker.helpers.arrayElements(allCats, faker.number.int({ min: 1, max: 4 }))
    const defaultCategory = faker.helpers.arrayElement(categories)

    const product = productRepo.create({
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      sku,
      description: `<p>${faker.lorem.paragraphs(2, "</p><p>")}</p>`,
      shortDescription: faker.lorem.sentence(),
      price: faker.commerce.price({ min: 10, max: 500, dec: 2 }), // string
      stockQty: faker.number.int({ min: 0, max: 250 }),
      isActive: faker.datatype.boolean(0.9),

      defaultCategory,
      categories, // jeśli masz ManyToMany
    })

    const saved = await productRepo.save(product)

    // 3) Zdjęcia dla produktu (DB + pliki)
    const imgsCount = faker.number.int({ min: minImgs, max: maxImgs })
    for (let p = 0; p < imgsCount; p++) {
      const img = await imageRepo.save(
        imageRepo.create({
          product: saved,
          position: p,
          cover: p === 0,
        }),
      )

      const original = await generateOriginalJpg(tmpDir, `${saved.id}`)
      await writeVariants(storageDir, img.id, original)
      await fs.unlink(original).catch(() => undefined)
    }
  }

  // posprzątaj tmp
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
}