ALTER TABLE "applications"
  ADD CONSTRAINT "applications_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
