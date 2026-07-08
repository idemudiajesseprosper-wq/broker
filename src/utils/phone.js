import { parsePhoneNumberFromString } from "libphonenumber-js";

export const COUNTRY_OPTIONS = [
  ["Argentina", "AR"],
  ["Australia", "AU"],
  ["Bangladesh", "BD"],
  ["Brazil", "BR"],
  ["Cameroon", "CM"],
  ["Canada", "CA"],
  ["Egypt", "EG"],
  ["France", "FR"],
  ["Germany", "DE"],
  ["Ghana", "GH"],
  ["India", "IN"],
  ["Italy", "IT"],
  ["Ivory Coast", "CI"],
  ["Kenya", "KE"],
  ["Malaysia", "MY"],
  ["Mexico", "MX"],
  ["Morocco", "MA"],
  ["Netherlands", "NL"],
  ["Pakistan", "PK"],
  ["Philippines", "PH"],
  ["Rwanda", "RW"],
  ["Saudi Arabia", "SA"],
  ["Senegal", "SN"],
  ["Singapore", "SG"],
  ["South Africa", "ZA"],
  ["Spain", "ES"],
  ["Tanzania", "TZ"],
  ["Uganda", "UG"],
  ["United Arab Emirates", "AE"],
  ["United Kingdom", "GB"],
  ["United States", "US"],
];

const COUNTRY_CODES = new Map(COUNTRY_OPTIONS);

export function normalizePhoneNumber(phone, country) {
  const countryCode = COUNTRY_CODES.get(country);
  const input = String(phone || "").trim();

  if (!countryCode || !input) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(input, countryCode);

  if (!parsed?.isValid() || parsed.country !== countryCode) {
    return null;
  }

  return parsed.number;
}
