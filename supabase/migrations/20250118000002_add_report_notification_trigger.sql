-- Create a function to handle report notifications
CREATE OR REPLACE FUNCTION handle_new_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send email notification
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/send-report-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'id', NEW.id,
        'reporter_id', NEW.reporter_id,
        'listing_id', NEW.listing_id,
        'reason', NEW.reason,
        'description', NEW.description,
        'created_at', NEW.created_at,
        'listing', (
          SELECT jsonb_build_object(
            'title', l.title,
            'price', l.price,
            'user_id', l.user_id
          )
          FROM listings l
          WHERE l.id = NEW.listing_id
        ),
        'reporter', (
          SELECT jsonb_build_object(
            'display_name', p.display_name
          )
          FROM profiles p
          WHERE p.id = NEW.reporter_id
        )
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function after insert
CREATE TRIGGER trigger_new_report_notification
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_report();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
