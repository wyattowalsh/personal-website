CREATE TABLE "auth_failure_throttle" (
	"throttle_key" varchar(320) PRIMARY KEY NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"first_failure_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_failure_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cooldown_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_auth_failure_throttle_cooldown" ON "auth_failure_throttle" USING btree ("cooldown_until");
--> statement-breakpoint
CREATE INDEX "idx_auth_failure_throttle_updated" ON "auth_failure_throttle" USING btree ("updated_at");
