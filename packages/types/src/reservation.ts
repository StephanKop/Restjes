export enum ReservationStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  PickedUp = "picked_up",
  Cancelled = "cancelled",
  Expired = "expired",
}

export type Reservation = {
  id: string;
  dish_id: string;
  consumer_id: string;
  merchant_id: string;
  portions: number;
  total_price: number;
  status: ReservationStatus;
  pickup_time: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};
