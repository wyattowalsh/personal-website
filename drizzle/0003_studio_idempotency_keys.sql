CREATE TABLE "studio_idempotency_keys" (
	"user_id" uuid NOT NULL,
	"scope" varchar(120) NOT NULL,
	"key" varchar(128) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"state" varchar(20) DEFAULT 'pending' NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "studio_idempotency_keys_user_id_scope_key_pk" PRIMARY KEY("user_id","scope","key")
);
--> statement-breakpoint
ALTER TABLE "studio_idempotency_keys" ADD CONSTRAINT "studio_idempotency_keys_user_id_studio_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_studio_idempotency_keys_updated" ON "studio_idempotency_keys" USING btree ("updated_at");
