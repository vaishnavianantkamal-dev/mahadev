export type Locale = "mr" | "en";

export function getLocaleFromReq(req: any): Locale {
  return (req.cookies?.locale as Locale) || "mr";
}
