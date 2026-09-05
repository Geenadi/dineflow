# DineFlow

A restaurant ordering & management prototype built for the Full-Stack Engineer internship
assignment. Covers only the **must-have** features from the brief — no bonus items
(docker-compose, tests, CI, Swagger) were added, to keep focus on the core system.

## What's here

- **`menu-service`** (Spring Boot, port `8081`) — categories & menu items, ~7 Java files total.
  Public browse/search endpoints, admin CRUD endpoints (JWT-protected), plus an internal endpoint
  used by `order-service` to fetch authoritative prices.
- **`order-service`** (Spring Boot, port `8082`) — orders, order items, reservations, and the
  admin login (issues JWTs), ~15 Java files total. Also acts as the "brain" that prices orders
  server-side by calling `menu-service`.
- **`frontend`** (React + Vite, port `5173`) — the customer app and the admin portal in one
  single-page app, routed by URL (`/` for customers, `/admin/*` for staff).
- **PostgreSQL** — one local database (`dineflow`), shared by both services but with each
  service owning its own tables.

Two independent Spring Boot services + one shared Postgres instance satisfies "at least two
separate Spring Boot services" from the brief. A `reservation-service` was intentionally **not**
split out as a third service — reservations live in `order-service` — since the brief marks that
split as optional and a smaller, well-explained system was prioritised over over-engineering.

### Kept deliberately simple

This was rebuilt once already to cut unnecessary layers. A few choices that keep it lean without
dropping any required feature:

- **No separate DTO classes.** Entities (`Category`, `MenuItem`, `RestaurantOrder`, `OrderItem`,
  `Reservation`) double as request *and* response bodies. A couple of fields are marked
  `@Transient` or `@JsonIgnore` where the wire shape needs to differ slightly from the DB shape
  (e.g. `MenuItem.categoryId` is how the client points at a category on create/update; the actual
  JPA relationship is the `@JsonIgnore`d `category` field).
- **No custom exception hierarchy.** Controllers throw Spring's built-in `ResponseStatusException`
  directly with the right HTTP status and a plain message — no `NotFoundException` /
  `GlobalExceptionHandler` scaffolding.
- **No Lombok.** Plain getters/setters — one less annotation processor to fight with your IDE.
- **Security in one file per service.** `SecurityConfig.java` holds the filter chain, CORS rules,
  and (in `order-service`) the JWT issuing/validation logic and the admin-seeding logic too,
  instead of spreading that across five small config classes.
- **No `RestaurantTable` entity.** Reservations pick from a fixed, hardcoded pool of table
  numbers (`1..8`) rather than a separate table entity with capacity matching — good enough for
  "reject the booking if no table is free at that time" without extra modelling.
- **RestTemplate instantiated directly** in `OrderController` (`new RestTemplate()`) instead of a
  separate config class for one bean.

## Architecture at a glance

```
                    ┌─────────────────┐
   Customer/Admin   │    frontend      │
   browser  ───────▶│  React + Vite    │
                    │   (port 5173)    │
                    └───────┬─────┬────┘
                            │     │
                 REST/JSON  │     │  REST/JSON
                            ▼     ▼
                ┌──────────────┐ ┌──────────────────┐
                │ menu-service │ │  order-service     │
                │ (port 8081)  │◀│  (port 8082)       │
                │              │ │  - orders          │
                │ categories   │ │  - reservations    │
                │ menu items   │ │  - admin login/JWT │
                └──────┬───────┘ └────────┬───────────┘
                       │                  │
                       └────────┬─────────┘
                                ▼
                        ┌───────────────┐
                        │  PostgreSQL   │
                        │  (dineflow)   │
                        └───────────────┘
```

`order-service` calls `menu-service`'s internal endpoint (`GET /api/internal/menu-items?ids=...`)
when a customer places an order, so **prices are always calculated server-side from the real,
current menu** — the client never gets to dictate a price.

Both services validate admin requests with a JWT. Only `order-service` issues tokens (via
`/api/auth/login`); `menu-service` just verifies them using the same shared secret
(`JWT_SECRET`), so a login on one service authorises admin actions on both.

## Prerequisites

- Java 17+
- Maven (or just use the `./mvnw` wrapper if you add one — plain `mvn` is assumed below)
- Node.js 18+ and npm
- PostgreSQL running locally (or in a container) on port `5432`

## 1. Database setup

```sql
-- as the postgres superuser
CREATE DATABASE dineflow;
CREATE USER dineflow WITH PASSWORD 'dineflow';
GRANT ALL PRIVILEGES ON DATABASE dineflow TO dineflow;
```

Both services default to `jdbc:postgresql://localhost:5432/dineflow` with username/password
`dineflow`/`dineflow` (override with `DB_USERNAME` / `DB_PASSWORD` env vars if you used
different ones). Tables and starter data (categories, a few menu items, 8 restaurant tables) are
created automatically on first boot via Hibernate `ddl-auto: update` + `data.sql`.

## 2. Run the backend services

Open two terminals.

```bash
# terminal 1
cd menu-service
mvn spring-boot:run
```

```bash
# terminal 2
cd order-service
mvn spring-boot:run
```

- `menu-service` starts on **http://localhost:8081**
- `order-service` starts on **http://localhost:8082**

Both read a shared `JWT_SECRET` env var (defaults to a placeholder value baked into
`application.yml` — fine for local evaluation, but you'd want to override it with a real secret
in any deployed environment). `order-service` also seeds a default admin login on first boot:

```
username: admin
password: admin123
```

Override with `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars if you want different credentials.

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. It talks to the two backend services using the URLs in
`.env` (copy `.env.example` if you ever need to change ports):

```
VITE_MENU_API_URL=http://localhost:8081
VITE_ORDER_API_URL=http://localhost:8082
```

## Using it

**Customer side** (`http://localhost:5173/`):
1. Browse the menu, search/filter by category.
2. Add items to the cart, adjust quantities, go to `/cart` to check out.
3. Fill in name/phone/order type (+ table number if dine-in) and place the order.
4. You get an order reference back (e.g. `DF-3F2A9C`) — use `/order-status` to check on it.
5. `/book-table` lets you reserve a table; if nothing's free at that time you'll get a clear
   rejection message.

**Admin side** (`http://localhost:5173/admin/login`):
1. Log in with `admin` / `admin123`.
2. `/admin/menu` — add/edit/delete categories and menu items, toggle "sold out" without deleting.
3. `/admin/orders` — filter by status, open an order to see its items, move it through
   `PLACED → CONFIRMED → PREPARING → READY → COMPLETED` (or cancel it).
4. `/admin/reservations` — pick a date, see the day's bookings, confirm or cancel them.

## Design notes / trade-offs

- **Table availability logic**: a reservation is matched to the smallest available table whose
  capacity covers the party size, for that exact date+time slot. It doesn't account for how long
  a table is occupied (e.g. a 7pm booking doesn't block 7:30pm) — a real system would need a
  seating-duration model. This is called out here rather than hidden.
- **Dine-in "table number"** on an order is just a label the customer types in (which physical
  table they're sitting at) — it isn't linked to the reservation system. Reservations and
  walk-in dine-in orders are separate concerns in this prototype.
- **Order item snapshots**: `order-service` stores the item name/price at the time of ordering
  (not a live reference), so historical orders stay accurate even if a menu item's price or name
  changes later.
- **Shared JWT secret** instead of a shared auth service: simpler to run locally for a system
  this size, while still keeping `menu-service` from trusting unauthenticated writes.

## Report

`report-template.md` is a skeleton for the submission report the brief asks for (highlights,
challenges, what you'd improve, how AI could be used in this system, hours spent, and which AI
tools you used for what). Fill in the honest, personal parts yourself — hours spent and the
challenges you personally ran into aren't something a generated file can answer for you — then
export it to PDF.
