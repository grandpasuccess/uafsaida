-- Database initialization script for UAFSAIDA
-- Creates required extensions and initial data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects"("userId");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects"("status");
CREATE INDEX IF NOT EXISTS "project_files_project_id_idx" ON "project_files"("projectId");
CREATE INDEX IF NOT EXISTS "chat_messages_session_id_idx" ON "chat_messages"("sessionId");
CREATE INDEX IF NOT EXISTS "agent_tasks_session_id_idx" ON "agent_tasks"("sessionId");
CREATE INDEX IF NOT EXISTS "deployments_project_id_idx" ON "deployments"("projectId");
