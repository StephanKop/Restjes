export type Merchant = {
  id: string;
  profile_id: string;
  business_name: string;
  description: string | null;
  address: string;
  city: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type MerchantWithProfile = Merchant & {
  profile: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
};
