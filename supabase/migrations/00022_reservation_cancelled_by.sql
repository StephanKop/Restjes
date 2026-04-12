-- Track who cancelled a reservation so notifications go to the right party
ALTER TABLE public.reservations
  ADD COLUMN cancelled_by TEXT,
  ADD CONSTRAINT chk_cancelled_by CHECK (cancelled_by IN ('consumer', 'merchant'));
