-- Case archive + audit trail
-- Safe to run after adding the archived enum value.

ALTER TYPE public.case_status ADD VALUE IF NOT EXISTS 'archived';

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS cases_status_idx ON public.cases(status);
CREATE INDEX IF NOT EXISTS cases_created_by_idx ON public.cases(created_by);
CREATE INDEX IF NOT EXISTS cases_deleted_by_idx ON public.cases(deleted_by);
CREATE INDEX IF NOT EXISTS cases_deleted_at_idx ON public.cases(deleted_at);

-- Server-side audit fields: the browser cannot spoof who created/deleted a case.
CREATE OR REPLACE FUNCTION public.set_case_audit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN
      NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM 'archived'::public.case_status
       AND NEW.status = 'archived'::public.case_status THEN
      NEW.deleted_by := auth.uid();
      NEW.deleted_at := COALESCE(NEW.deleted_at, now());
    ELSIF OLD.status = 'archived'::public.case_status
       AND NEW.status IS DISTINCT FROM 'archived'::public.case_status THEN
      NEW.deleted_by := NULL;
      NEW.deleted_at := NULL;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cases_audit_fields ON public.cases;
CREATE TRIGGER trg_cases_audit_fields
BEFORE INSERT OR UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.set_case_audit_fields();
