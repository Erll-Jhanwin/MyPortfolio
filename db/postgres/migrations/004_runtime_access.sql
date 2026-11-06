DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime' AND NOT rolsuper AND NOT rolbypassrls) THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO portfolio_runtime';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON inquiries, privacy_requests, notification_jobs, rate_limits, projects, project_images TO portfolio_runtime';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON resume_documents TO portfolio_runtime';

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inquiries' AND policyname='inquiry_runtime_access') THEN
      EXECUTE 'CREATE POLICY inquiry_runtime_access ON inquiries TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='privacy_requests' AND policyname='privacy_runtime_access') THEN
      EXECUTE 'CREATE POLICY privacy_runtime_access ON privacy_requests TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_jobs' AND policyname='notification_runtime_access') THEN
      EXECUTE 'CREATE POLICY notification_runtime_access ON notification_jobs TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rate_limits' AND policyname='rate_runtime_access') THEN
      EXECUTE 'CREATE POLICY rate_runtime_access ON rate_limits TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='projects_runtime_access') THEN
      EXECUTE 'CREATE POLICY projects_runtime_access ON projects TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='project_images' AND policyname='project_images_runtime_access') THEN
      EXECUTE 'CREATE POLICY project_images_runtime_access ON project_images TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resume_documents' AND policyname='resume_documents_runtime_access') THEN
      EXECUTE 'CREATE POLICY resume_documents_runtime_access ON resume_documents TO portfolio_runtime USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schema_migrations' AND policyname='migrations_runtime_read') THEN
      EXECUTE 'CREATE POLICY migrations_runtime_read ON schema_migrations TO portfolio_runtime USING (true)';
    END IF;
  END IF;
END $$;
