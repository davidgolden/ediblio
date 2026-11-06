-- Columns used by custom menu items / menu dates (bcba433). They were added to production by hand,
-- so IF NOT EXISTS makes this a no-op there while creating them on fresh/restored databases.
ALTER TABLE "users_recipes_menu" ADD COLUMN IF NOT EXISTS "date" DATE;
ALTER TABLE "users_recipes_menu" ADD COLUMN IF NOT EXISTS "name" TEXT;
