DROP TRIGGER IF EXISTS [dbo].[ti_user]
DROP TRIGGER IF EXISTS [dbo].[ti_query]
UPDATE django_content_type SET app_label = 'security' WHERE app_label = 'auth' and model = 'user'