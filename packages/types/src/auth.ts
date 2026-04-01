export enum UserRole {
  Consumer = "consumer",
  Merchant = "merchant",
  Admin = "admin",
}

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type MerchantProfile = Profile & {
  role: UserRole.Merchant;
  merchant_id: string;
};
