import type {
  ImageStockProposal,
  Item,
  Notification,
  Shop,
  Stock,
  StockStatus,
  StockUpdate,
  VerificationStatus,
} from "./types";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const USER_LOCATION = {
  latitude: 11.2588,
  longitude: 75.7804,
};

export const TEST_LOGINS = {
  citizen: { email: "citizen@demo.com", password: "demo123" },
  shopkeeper: { email: "shopkeeper@demo.com", password: "demo123" },
} as const;

export const shops: Shop[] = [
  {
    id: "shop-a",
    name: "Shop A — Puthiyara FPS",
    address: "Puthiyara Road, Kozhikode",
    latitude: 11.2551,
    longitude: 75.7809,
    created_at: hoursAgo(40),
  },
  {
    id: "shop-b",
    name: "Shop B — Mavoor Road FPS",
    address: "Mavoor Road, Kozhikode",
    latitude: 11.2642,
    longitude: 75.7871,
    created_at: hoursAgo(40),
  },
  {
    id: "shop-c",
    name: "Shop C — Palayam FPS",
    address: "Palayam, Kozhikode",
    latitude: 11.2518,
    longitude: 75.7736,
    created_at: hoursAgo(40),
  },
];

export const items: Item[] = [
  {
    id: "item-rice",
    name: "Rice",
    localized_names: { ml: "അരി" },
    unit: "kg",
  },
  {
    id: "item-wheat",
    name: "Wheat",
    localized_names: { ml: "ഗോതമ്പ്" },
    unit: "kg",
  },
  {
    id: "item-sugar",
    name: "Sugar",
    localized_names: { ml: "പഞ്ചസാര" },
    unit: "kg",
  },
];

export const stock: Stock[] = [
  {
    id: "stock-a-rice",
    shop_id: "shop-a",
    item_id: "item-rice",
    quantity: 48,
    status: "available",
    last_updated_at: minutesAgo(10),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper",
  },
  {
    id: "stock-a-wheat",
    shop_id: "shop-a",
    item_id: "item-wheat",
    quantity: 9,
    status: "low_stock",
    last_updated_at: minutesAgo(25),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper",
  },
  {
    id: "stock-a-sugar",
    shop_id: "shop-a",
    item_id: "item-sugar",
    quantity: 0,
    status: "out_of_stock",
    last_updated_at: hoursAgo(2),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper",
  },
  {
    id: "stock-b-rice",
    shop_id: "shop-b",
    item_id: "item-rice",
    quantity: 6,
    status: "low_stock",
    last_updated_at: minutesAgo(25),
    verification_status: "ai_assisted",
    updated_by: "profile-shopkeeper-b",
  },
  {
    id: "stock-b-wheat",
    shop_id: "shop-b",
    item_id: "item-wheat",
    quantity: 22,
    status: "available",
    last_updated_at: minutesAgo(10),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper-b",
  },
  {
    id: "stock-b-sugar",
    shop_id: "shop-b",
    item_id: "item-sugar",
    quantity: 14,
    status: "available",
    last_updated_at: hoursAgo(2),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper-b",
  },
  {
    id: "stock-c-rice",
    shop_id: "shop-c",
    item_id: "item-rice",
    quantity: 0,
    status: "out_of_stock",
    last_updated_at: hoursAgo(2),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper-c",
  },
  {
    id: "stock-c-wheat",
    shop_id: "shop-c",
    item_id: "item-wheat",
    quantity: 0,
    status: "out_of_stock",
    last_updated_at: hoursAgo(2),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper-c",
  },
  {
    id: "stock-c-sugar",
    shop_id: "shop-c",
    item_id: "item-sugar",
    quantity: 11,
    status: "available",
    last_updated_at: minutesAgo(10),
    verification_status: "shop_verified",
    updated_by: "profile-shopkeeper-c",
  },
];

export const notifications: Notification[] = [
  {
    id: "notif-1",
    user_id: "profile-citizen",
    message: "Rice is now available at Shop A — Puthiyara FPS.",
    read: false,
    created_at: minutesAgo(8),
  },
];

export const stockUpdates: StockUpdate[] = [
  {
    id: "update-1",
    shop_id: "shop-a",
    item_id: "item-rice",
    old_quantity: 12,
    new_quantity: 48,
    old_status: "low_stock",
    new_status: "available",
    method: "manual",
    updated_by: "Meenakshi K.",
    human_confirmed: true,
    created_at: minutesAgo(10),
  },
  {
    id: "update-2",
    shop_id: "shop-a",
    item_id: "item-sugar",
    old_quantity: 4,
    new_quantity: 0,
    old_status: "low_stock",
    new_status: "out_of_stock",
    method: "quick",
    updated_by: "Meenakshi K.",
    human_confirmed: true,
    created_at: hoursAgo(2),
  },
];

export const mockImageDetection: ImageStockProposal = {
  confidence: "high",
  items: [
    { item: "Rice", quantity: 20, unit: "bags" },
    { item: "Wheat", quantity: 8, unit: "bags" },
    { item: "Sugar", quantity: 10, unit: "kg" },
  ],
};

export const SHOPKEEPER_SHOP_ID = "shop-a";

export type StockWithItem = Stock & { item: Item };

export function getItem(itemId: string): Item | undefined {
  return items.find((item) => item.id === itemId);
}

export function getShop(shopId: string): Shop | undefined {
  return shops.find((shop) => shop.id === shopId);
}

export function getStockForShop(shopId: string): StockWithItem[] {
  return stock
    .filter((row) => row.shop_id === shopId)
    .map((row) => {
      const item = getItem(row.item_id ?? "");
      if (!item) {
        throw new Error(`Missing item for stock ${row.id}`);
      }
      return { ...row, item };
    });
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function shopDistanceKm(shop: Shop): number {
  return distanceKm(
    USER_LOCATION.latitude,
    USER_LOCATION.longitude,
    shop.latitude,
    shop.longitude,
  );
}

export function sourceLabel(status: VerificationStatus | null): string {
  if (status === "ai_assisted") {
    return "AI-Assisted + Human Confirmed";
  }
  if (status === "community_report") {
    return "Community report";
  }
  return "Authorized Shopkeeper";
}

export function statusWord(status: StockStatus | null): string {
  if (status === "available") return "Available";
  if (status === "low_stock") return "Low Stock";
  if (status === "out_of_stock") return "Out of Stock";
  return "Info may be outdated";
}
