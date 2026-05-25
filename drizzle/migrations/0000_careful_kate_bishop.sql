CREATE TYPE "public"."audit_action" AS ENUM('project_created', 'stage_started', 'checklist_item_toggled', 'approval_requested', 'approval_granted', 'approval_denied', 'schematic_reopened', 'project_archived', 'project_status_changed', 'external_link_added', 'external_link_removed', 'user_created', 'user_role_changed');--> statement-breakpoint
CREATE TYPE "public"."design_class" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."external_link_kind" AS ENUM('drive', 'git', 'datasheet', 'image', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('approval_needed', 'approval_granted', 'approval_denied', 'stage_completed', 'project_assigned');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in_progress', 'on_hold', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."stage_decision" AS ENUM('proceed', 'reopen');--> statement-breakpoint
CREATE TYPE "public"."stage_run_status" AS ENUM('not_started', 'in_progress', 'awaiting_approval', 'approved', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ceo', 'designer', 'viewer');--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_run_id" uuid NOT NULL,
	"approved_by" uuid NOT NULL,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"typed_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_email" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_id" uuid NOT NULL,
	"section_heading" text,
	"label" text NOT NULL,
	"criterion" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_run_id" uuid NOT NULL,
	"checklist_item_id" uuid NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"initials" text,
	"na_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "external_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_run_id" uuid NOT NULL,
	"kind" "external_link_kind" NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"added_by" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"payload_json" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_stage_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"run_number" integer DEFAULT 1 NOT NULL,
	"status" "stage_run_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"notes_markdown" text,
	"decision" "stage_decision",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"design_class" "design_class" NOT NULL,
	"designer_id" uuid NOT NULL,
	"status" "project_status" DEFAULT 'in_progress' NOT NULL,
	"current_stage_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'designer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflow_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"stage_number" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"description_markdown" text,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"is_lock_gate" boolean DEFAULT false NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_stage_run_id_project_stage_runs_id_fk" FOREIGN KEY ("stage_run_id") REFERENCES "public"."project_stage_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_stage_id_workflow_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_stage_run_id_project_stage_runs_id_fk" FOREIGN KEY ("stage_run_id") REFERENCES "public"."project_stage_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_checklist_item_id_checklist_items_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."checklist_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_links" ADD CONSTRAINT "external_links_stage_run_id_project_stage_runs_id_fk" FOREIGN KEY ("stage_run_id") REFERENCES "public"."project_stage_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_links" ADD CONSTRAINT "external_links_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_runs" ADD CONSTRAINT "project_stage_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_runs" ADD CONSTRAINT "project_stage_runs_stage_id_workflow_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_runs" ADD CONSTRAINT "project_stage_runs_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_designer_id_users_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_current_stage_id_workflow_stages_id_fk" FOREIGN KEY ("current_stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_log_timestamp" ON "audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entity" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_actor_id" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_items_stage_id" ON "checklist_items" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_responses_stage_run_id" ON "checklist_responses" USING btree ("stage_run_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_responses_unique" ON "checklist_responses" USING btree ("stage_run_id","checklist_item_id");--> statement-breakpoint
CREATE INDEX "idx_external_links_stage_run_id" ON "external_links" USING btree ("stage_run_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_recipient_id" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("recipient_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_stage_runs_project_id" ON "project_stage_runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_stage_runs_stage_id" ON "project_stage_runs" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "idx_stage_runs_status" ON "project_stage_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_designer_id" ON "projects" USING btree ("designer_id");--> statement-breakpoint
CREATE INDEX "idx_projects_workflow_id" ON "projects" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_stages_workflow_id" ON "workflow_stages" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_stages_display_order" ON "workflow_stages" USING btree ("workflow_id","display_order");