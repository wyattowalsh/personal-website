CREATE TABLE "studio_rate_limit_counters" (
	"user_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"window_hours" integer NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_rate_limit_counters_user_id_action_window_hours_pk" PRIMARY KEY("user_id","action","window_hours")
);
--> statement-breakpoint
ALTER TABLE "studio_rate_limit_counters" ADD CONSTRAINT "studio_rate_limit_counters_user_id_studio_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_studio_rate_limit_counters_updated" ON "studio_rate_limit_counters" USING btree ("updated_at");