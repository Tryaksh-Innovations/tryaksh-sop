ALTER TABLE "workflow_stages" ADD COLUMN "is_decision_gate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_stages" ADD COLUMN "reopens_to_stage_number" text;