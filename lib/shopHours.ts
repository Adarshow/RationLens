export function isShopOpenNow(shop: { morning_open: string | null; morning_close: string | null; evening_open: string | null; evening_close: string | null; closed_on_sunday: boolean | null }): boolean {
  const now = new Date();
  if (shop.closed_on_sunday && now.getDay() === 0) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const ranges = [
    [toMinutes(shop.morning_open), toMinutes(shop.morning_close)],
    [toMinutes(shop.evening_open), toMinutes(shop.evening_close)],
  ];
  return ranges.some(([open, close]) => open !== null && close !== null && minutesNow >= open && minutesNow < close);
}
