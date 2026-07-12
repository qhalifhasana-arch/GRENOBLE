---
name: DB column naming convention
description: Drizzle-ORM PostgreSQL column naming pitfall — always use snake_case for columns
---

When adding columns directly via SQL (ALTER TABLE ... ADD COLUMN), always use unquoted snake_case names:
- CORRECT: `ALTER TABLE users ADD COLUMN is_promoter boolean`
- WRONG: `ALTER TABLE users ADD COLUMN "isPromoter" boolean` — creates a case-sensitive camelCase column that Drizzle cannot find

**Why:** Drizzle-ORM PostgreSQL driver maps JS camelCase field names to snake_case SQL column names automatically. E.g., `isPromoter` in schema → `is_promoter` in DB. If you create the column with quotes (camelCase), the column exists under the wrong name.

**How to apply:** Whenever running raw SQL to add/rename DB columns, always use lowercase snake_case without quotes.
