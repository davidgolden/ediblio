-- CreateTable
CREATE TABLE "invite_token" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1(),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "email" TEXT NOT NULL,
    "inviter_id" UUID NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invite_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
