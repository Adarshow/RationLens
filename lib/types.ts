export type UserRole = "citizen" | "shopkeeper" | "admin";

export type StockStatus =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "unknown";

export type VerificationStatus =
  | "shop_verified"
  | "ai_assisted"
  | "community_report";

export type StockUpdateMethod = "manual" | "quick" | "ai_image";

export type AlertStatus = "active" | "triggered" | "cancelled";

export type QueryLanguage = "en" | "ml";

export type QueryIntent =
  | "check_stock"
  | "find_nearby_shop"
  | "subscribe_notification";

export type LocalizedNames = {
  ml?: string;
  hi?: string;
};

export type Profile = {
  id: string;
  name: string | null;
  role: UserRole;
  language: string | null;
  shop_id: string | null;
  created_at: string | null;
  verification_status: "pending" | "approved" | "rejected";
  license_number: string | null;
  proof_image_path: string | null;
  phone: string | null;
};

export type Shop = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  created_at: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
};

export type Item = {
  id: string;
  name: string;
  localized_names: LocalizedNames;
  unit: string | null;
};

export type Stock = {
  id: string;
  shop_id: string | null;
  item_id: string | null;
  quantity: number | null;
  status: StockStatus | null;
  last_updated_at: string | null;
  verification_status: VerificationStatus | null;
  updated_by: string | null;
};

export type StockUpdate = {
  id: string;
  shop_id: string | null;
  item_id: string | null;
  old_quantity: number | null;
  new_quantity: number | null;
  old_status: StockStatus | null;
  new_status: StockStatus | null;
  method: string | null;
  updated_by: string | null;
  human_confirmed: boolean | null;
  created_at: string | null;
};

export type Alert = {
  id: string;
  user_id: string | null;
  item_id: string | null;
  shop_id: string | null;
  status: string | null;
  created_at: string | null;
};

export type Notification = {
  id: string;
  user_id: string | null;
  message: string | null;
  read: boolean | null;
  created_at: string | null;
};

export type ExtractedIntent = {
  language: QueryLanguage;
  intent: QueryIntent;
  item: string | null;
  radius_km: number | null;
};

export type ExtractedStockItem = {
  item: string;
  quantity: number;
  unit: string;
};

export type ImageStockProposal = {
  items: ExtractedStockItem[];
  confidence: "high" | "medium" | "low";
};
