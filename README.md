# NestShop — Backend

REST API dla platformy e-commerce NestShop. Zbudowane na [NestJS](https://nestjs.com/) z MySQL, Redis i TypeORM.

## Technologie

| Warstwa | Technologia |
|---|---|
| Framework | NestJS 11 |
| Baza danych | MySQL 8 + TypeORM 0.3 |
| Sesje | express-session + Redis |
| Autentykacja | Session-based (admin + customer) + Passport JWT |
| Upload obrazów | Multer + Sharp (auto-resize do 5 rozmiarów) |
| Walidacja | class-validator + class-transformer |
| Dokumentacja | Swagger / OpenAPI (`/api/docs`) |

## Wymagania

- Node.js 20+
- MySQL 8
- Redis 7

## Uruchomienie lokalnie

### 1. Instalacja zależności

```bash
npm install
```

### 2. Zmienne środowiskowe

Skopiuj plik `.env` i uzupełnij wartości:

```bash
cp .env .env.local
```

| Zmienna | Opis | Przykład |
|---|---|---|
| `NODE_ENV` | Środowisko | `development` |
| `PORT` | Port serwera | `3000` |
| `DB_HOST` | Host MySQL | `127.0.0.1` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Użytkownik bazy | `app` |
| `DB_PASS` | Hasło bazy | `app` |
| `DB_NAME` | Nazwa bazy | `app` |
| `JWT_SECRET` | Sekret JWT (customer) | *(losowy, min. 32 znaki)* |
| `JWT_EXPIRES_IN` | Ważność tokena | `7d` |
| `ADMIN_JWT_SECRET` | Sekret JWT (admin) | *(losowy, min. 32 znaki)* |
| `ADMIN_JWT_EXPIRES_IN` | Ważność tokena admina | `7d` |
| `SESSION_SECRET` | Sekret sesji | *(losowy, min. 32 znaki)* |
| `REDIS_URL` | URL Redis | `redis://127.0.0.1:6379` |
| `ADMIN_SEED_EMAIL` | Email pierwszego admina | `admin@example.com` |
| `ADMIN_SEED_PASSWORD` | Hasło pierwszego admina | `Admin123!` |
| `ADMIN_PANEL_ORIGIN` | Origin frontendu (CORS) | `http://localhost:3001` |

> **Uwaga:** W produkcji ustaw wszystkie sekrety na losowo wygenerowane wartości i nigdy nie commituj pliku `.env` do repozytorium.

### 3. Migracje bazy danych

```bash
npm run migration:run
```

### 4. Seed (pierwszy admin)

```bash
npm run build
npm run seed
```

### 5. Start serwera

```bash
# Tryb developerski (hot-reload)
npm run start:dev

# Produkcja
npm run build
npm run start:prod
```

Serwer dostępny pod: `http://localhost:3000`
Swagger UI: `http://localhost:3000/api/docs`

---

## Struktura projektu

```
src/
├── admins/          # Autentykacja adminów (session + JWT)
├── carts/           # Koszyk (dla gości i zalogowanych)
├── categories/      # Kategorie produktów (drzewo hierarchiczne)
├── cms/             # Strony statyczne (CMS)
├── customers/       # Klienci, rejestracja, adresy
├── menu/            # Menu nawigacyjne (max 2 poziomy)
├── orders/          # Zamówienia i statusy
├── products/        # Produkty + upload i resize obrazów
├── migrations/      # Migracje TypeORM
├── seeds/           # Seedy bazy danych
├── app.module.ts
└── main.ts
```

---

## Endpointy API

Pełna interaktywna dokumentacja dostępna w Swagger UI pod `/api/docs`.

### Autentykacja

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Rejestracja klienta | — |
| `POST` | `/api/auth/login` | Logowanie klienta | — |
| `POST` | `/api/auth/logout` | Wylogowanie klienta | customer |
| `GET` | `/api/auth/me` | Dane zalogowanego klienta | customer |
| `POST` | `/api/admin/auth/login` | Logowanie admina | — |
| `POST` | `/api/admin/auth/logout` | Wylogowanie admina | admin |
| `GET` | `/api/admin/auth/me` | Dane zalogowanego admina | admin |

### Produkty

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/products` | Lista produktów | — |
| `GET` | `/api/products/:id` | Szczegóły produktu | — |
| `POST` | `/api/admin/products` | Utwórz produkt | admin |
| `GET` | `/api/admin/products` | Lista produktów (admin) | admin |
| `PUT` | `/api/admin/products/:id` | Zaktualizuj produkt | admin |
| `DELETE` | `/api/admin/products/:id` | Usuń produkt | admin |
| `POST` | `/api/admin/products/:id/images` | Upload zdjęcia | admin |
| `PATCH` | `/api/admin/products/:id/images/:imageId/cover` | Ustaw cover | admin |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Usuń zdjęcie | admin |
| `POST` | `/api/admin/products/:id/categories` | Przypisz kategorie | admin |

### Kategorie

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/categories` | Lista kategorii | — |
| `GET` | `/api/categories/tree` | Drzewo kategorii | — |
| `GET` | `/api/categories/:id` | Szczegóły kategorii | — |
| `GET` | `/api/categories/:id/products` | Produkty w kategorii (`?page&limit`) | — |
| `POST` | `/api/admin/categories` | Utwórz kategorię | admin |
| `GET` | `/api/admin/categories/all` | Wszystkie kategorie | admin |
| `GET` | `/api/admin/categories/tree` | Drzewo kategorii | admin |
| `PUT` | `/api/admin/categories/:id` | Zaktualizuj kategorię | admin |
| `DELETE` | `/api/admin/categories/:id` | Usuń kategorię | admin |

### Koszyk

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/cart` | Pobierz / utwórz koszyk | — |
| `POST` | `/api/cart/items` | Dodaj produkt do koszyka | — |
| `PATCH` | `/api/cart/items/:id` | Zmień ilość | — |
| `DELETE` | `/api/cart/items/:id` | Usuń pozycję | — |
| `DELETE` | `/api/cart/clear` | Wyczyść koszyk | — |

### Zamówienia

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Utwórz zamówienie z koszyka | customer |
| `GET` | `/api/orders` | Lista zamówień klienta | customer |
| `GET` | `/api/orders/:id` | Szczegóły zamówienia | customer |
| `GET` | `/api/admin/orders` | Wszystkie zamówienia | admin |
| `GET` | `/api/admin/orders/:id` | Szczegóły zamówienia | admin |
| `PATCH` | `/api/admin/orders/:id/status` | Zmień status | admin |
| `GET` | `/api/admin/orders/:id/status-history` | Historia statusów | admin |

### Klienci (Admin)

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/admin/customers` | Lista klientów | admin |
| `GET` | `/api/admin/customers/addresses` | Wszystkie adresy | admin |

### CMS

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/cms` | Lista stron | — |
| `GET` | `/api/cms/:id` | Szczegóły strony | — |
| `POST` | `/api/admin/cms` | Utwórz stronę | admin |
| `PUT` | `/api/admin/cms/:id` | Zaktualizuj stronę | admin |
| `DELETE` | `/api/admin/cms/:id` | Usuń stronę | admin |

### Menu

| Metoda | Ścieżka | Opis | Auth |
|---|---|---|---|
| `GET` | `/api/menu` | Menu publiczne | — |
| `POST` | `/api/admin/menu` | Utwórz element menu | admin |
| `PUT` | `/api/admin/menu/:id` | Zaktualizuj element | admin |
| `DELETE` | `/api/admin/menu/:id` | Usuń element | admin |

---

## Zdjęcia produktów

Po wgraniu, zdjęcia są automatycznie konwertowane do JPEG i zapisywane w 5 rozmiarach:

| Wariant | Rozmiar |
|---|---|
| `original` | Oryginał |
| `cart_default` | 125×125 px |
| `small_default` | 98×98 px |
| `medium_default` | 452×452 px |
| `home_default` | 250×250 px |
| `large_default` | 800×800 px |

Pliki serwowane pod: `/media/img/p/{id}/{wariant}.jpg`

---

## Migracje

```bash
# Uruchom wszystkie migracje
npm run migration:run

# Wygeneruj nową migrację (po zmianie encji)
npm run migration:generate

# Cofnij ostatnią migrację
npm run migration:revert
```

---

## Skrypty

```bash
npm run start:dev        # Tryb developerski (hot-reload)
npm run build            # Build produkcyjny
npm run start:prod       # Uruchom build produkcyjny
npm run lint             # Linting (ESLint)
npm run format           # Formatowanie (Prettier)
npm run test             # Testy jednostkowe
npm run test:e2e         # Testy E2E
npm run migration:run    # Uruchom migracje
npm run seed             # Wypełnij bazę danymi startowymi
```
