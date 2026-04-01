export type Review = {
  id: string;
  reservation_id: string;
  consumer_id: string;
  merchant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};
