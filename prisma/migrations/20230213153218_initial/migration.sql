-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "name" TEXT NOT NULL,
    "author_id" UUID,
    "is_primary" BOOLEAN DEFAULT false,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "short_name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "long_name_plural" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "recipe_id" UUID,
    "author_id" UUID,
    "rating" DECIMAL NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "image" TEXT,
    "author_id" UUID,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes_collections" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "collection_id" UUID,
    "recipe_id" UUID,

    CONSTRAINT "recipes_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes_ingredients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "recipe_id" UUID,
    "quantity" DECIMAL NOT NULL,
    "name" TEXT NOT NULL,
    "measurement_id" UUID NOT NULL,

    CONSTRAINT "recipes_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_image" TEXT,
    "password" TEXT,
    "reset_token" TEXT,
    "token_expires" TIMESTAMP(6),
    "third_party_domain" TEXT,
    "third_party_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_collections_followers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "user_id" UUID,
    "collection_id" UUID,

    CONSTRAINT "users_collections_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_ingredients_groceries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "deleted" BOOLEAN DEFAULT false,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "measurement_id" UUID NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "item_index" INTEGER DEFAULT 0,

    CONSTRAINT "users_ingredients_groceries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_recipes_menu" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "deleted" BOOLEAN DEFAULT false,
    "user_id" UUID,
    "recipe_id" UUID,

    CONSTRAINT "users_recipes_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_staples" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "user_id" UUID,
    "quantity" DECIMAL NOT NULL,
    "name" TEXT NOT NULL,
    "measurement_id" UUID NOT NULL,

    CONSTRAINT "users_staples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "measurements_short_name_key" ON "measurements"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "measurements_long_name_key" ON "measurements"("long_name");

-- CreateIndex
CREATE UNIQUE INDEX "measurements_long_name_plural_key" ON "measurements"("long_name_plural");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_recipe_id_author_id_key" ON "ratings"("recipe_id", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_collections_recipe_id_collection_id_key" ON "recipes_collections"("recipe_id", "collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "id_unique" ON "recipes_ingredients"("id");

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session"("expire");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_third_party_id_key" ON "users"("third_party_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_collections_followers_user_id_collection_id_key" ON "users_collections_followers"("user_id", "collection_id");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recipes_collections" ADD CONSTRAINT "recipes_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recipes_collections" ADD CONSTRAINT "recipes_collections_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_collections_followers" ADD CONSTRAINT "users_collections_followers_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_collections_followers" ADD CONSTRAINT "users_collections_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_ingredients_groceries" ADD CONSTRAINT "users_ingredients_groceries_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_ingredients_groceries" ADD CONSTRAINT "users_ingredients_groceries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_recipes_menu" ADD CONSTRAINT "users_recipes_menu_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_recipes_menu" ADD CONSTRAINT "users_recipes_menu_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_staples" ADD CONSTRAINT "users_staples_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_staples" ADD CONSTRAINT "users_staples_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
