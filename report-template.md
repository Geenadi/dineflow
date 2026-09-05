# DineFlow — Assignment Report

> Fill in the sections below honestly and in your own words before exporting this to PDF —
> the brief specifically asks for a short, honest report, and you'll be asked about it in the
> interview. The structure below is a starting point, not filler text to submit as-is.

## Highlights of my system

*(What are you proud of? What works well end-to-end? e.g. server-side price calculation via
inter-service calls, JWT auth shared across two services, table-availability logic for
reservations, status-transition validation on orders...)*

-
-
-

## Challenges I faced

*(What was genuinely tricky? Getting the two services to agree on JWTs? Modelling reservation
availability? CORS between three different ports? Be specific — generic answers are easy to
spot.)*

-
-
-

## What I'd improve

*(With more time, what would you change? Some honest candidates based on how this was built:)*

- Reservation availability doesn't account for how long a table is occupied — a booking at 7pm
  doesn't currently block 7:30pm on the same table.
- No integration/unit tests were written (explicitly out of scope for the "must have" list, but
  would be the first thing added next).
- No real database migration tool (Flyway/Liquibase) — relies on `ddl-auto: update` + `data.sql`,
  which is fine for a prototype but not production-safe.
- (add your own)

## How AI could be used in this system

*(Not "how I used AI to build this" — this section is about the product itself. E.g. AI-assisted
menu recommendations, demand forecasting for kitchen prep, a chatbot for the customer app,
anomaly detection on order cancellations, dynamic pricing for slow periods...)*

-
-

## Time spent

*(One line, roughly how many hours.)*

## AI tools used

*(Required by the brief: which tools, for what parts. Be specific and honest — the interview
will probe this.)*
