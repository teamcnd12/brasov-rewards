/*
  # Add 'removed_tokens' action to activity_log

  1. Modified Tables
    - `activity_log`
      - Updated `action` CHECK constraint to allow 'removed_tokens' in addition to 'added_tokens' and 'verified_redemption'

  2. Important Notes
    - This enables staff to log token removal events in the audit trail
    - Existing data is unaffected since we are only adding a new allowed value
*/

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_action_check;

ALTER TABLE activity_log ADD CONSTRAINT activity_log_action_check
  CHECK (action IN ('added_tokens', 'verified_redemption', 'removed_tokens'));
