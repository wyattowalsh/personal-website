CREATE TABLE "sketch_bookmarks" (
	"sketch_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sketch_bookmarks_sketch_id_user_id_pk" PRIMARY KEY("sketch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "sketch_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sketch_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_likes" (
	"sketch_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sketch_likes_sketch_id_user_id_pk" PRIMARY KEY("sketch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "sketch_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sketch_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sketch_id" uuid NOT NULL,
	"code" text NOT NULL,
	"config" jsonb,
	"version" integer NOT NULL,
	"message" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sketch_id" uuid NOT NULL,
	"viewer_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) DEFAULT 'Untitled Sketch' NOT NULL,
	"description" text DEFAULT '',
	"code" text NOT NULL,
	"engine" varchar(10) DEFAULT 'p5js' NOT NULL,
	"tags" text[] DEFAULT '{}',
	"thumbnail_url" text,
	"author_id" uuid NOT NULL,
	"forked_from" uuid,
	"like_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"slug" varchar(250),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_collection_items" (
	"collection_id" uuid NOT NULL,
	"sketch_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_collection_items_collection_id_sketch_id_pk" PRIMARY KEY("collection_id","sketch_id")
);
--> statement-breakpoint
CREATE TABLE "studio_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text DEFAULT '',
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_follows" (
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "studio_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"actor_id" uuid NOT NULL,
	"sketch_id" uuid,
	"comment_id" uuid,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) DEFAULT '' NOT NULL,
	"email" varchar(255),
	"image" text,
	"provider" varchar(20) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"display_name" varchar(100),
	"bio" text,
	"website" varchar(500),
	"social_links" jsonb,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sketch_bookmarks" ADD CONSTRAINT "sketch_bookmarks_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_bookmarks" ADD CONSTRAINT "sketch_bookmarks_user_id_studio_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_comments" ADD CONSTRAINT "sketch_comments_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_comments" ADD CONSTRAINT "sketch_comments_author_id_studio_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_comments" ADD CONSTRAINT "sketch_comments_parent_id_sketch_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sketch_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_likes" ADD CONSTRAINT "sketch_likes_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_likes" ADD CONSTRAINT "sketch_likes_user_id_studio_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_reports" ADD CONSTRAINT "sketch_reports_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_reports" ADD CONSTRAINT "sketch_reports_reporter_id_studio_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_versions" ADD CONSTRAINT "sketch_versions_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_views" ADD CONSTRAINT "sketch_views_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_author_id_studio_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_forked_from_sketches_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."sketches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_collection_items" ADD CONSTRAINT "studio_collection_items_collection_id_studio_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."studio_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_collection_items" ADD CONSTRAINT "studio_collection_items_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_collections" ADD CONSTRAINT "studio_collections_owner_id_studio_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_follows" ADD CONSTRAINT "studio_follows_follower_id_studio_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_follows" ADD CONSTRAINT "studio_follows_following_id_studio_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_notifications" ADD CONSTRAINT "studio_notifications_user_id_studio_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_notifications" ADD CONSTRAINT "studio_notifications_actor_id_studio_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."studio_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_notifications" ADD CONSTRAINT "studio_notifications_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_notifications" ADD CONSTRAINT "studio_notifications_comment_id_sketch_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."sketch_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sketch_bookmarks_user" ON "sketch_bookmarks" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sketch_comments_sketch" ON "sketch_comments" USING btree ("sketch_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sketch_comments_author" ON "sketch_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_sketch_likes_user" ON "sketch_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sketch_reports_sketch" ON "sketch_reports" USING btree ("sketch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sketch_reports_unique" ON "sketch_reports" USING btree ("sketch_id","reporter_id");--> statement-breakpoint
CREATE INDEX "idx_sketch_versions_sketch" ON "sketch_versions" USING btree ("sketch_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sketch_views_unique" ON "sketch_views" USING btree ("sketch_id","viewer_hash");--> statement-breakpoint
CREATE INDEX "idx_sketches_public" ON "sketches" USING btree ("is_public","created_at");--> statement-breakpoint
CREATE INDEX "idx_sketches_created_id" ON "sketches" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "idx_sketches_likes" ON "sketches" USING btree ("is_public","like_count");--> statement-breakpoint
CREATE INDEX "idx_sketches_author" ON "sketches" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_sketches_tags" ON "sketches" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sketches_slug" ON "sketches" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_studio_collection_items_collection" ON "studio_collection_items" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "idx_studio_collections_owner" ON "studio_collections" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_studio_follows_follower" ON "studio_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_studio_follows_following" ON "studio_follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "idx_studio_notifications_user" ON "studio_notifications" USING btree ("user_id","read","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_studio_users_provider" ON "studio_users" USING btree ("provider","provider_id");