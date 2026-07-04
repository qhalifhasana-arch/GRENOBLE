export interface Country {
  name: string;
  flag: string;
  code: string;
  phonePrefix: string;
  paymentMethods: string[];
}

export const COUNTRIES: Country[] = [
  {
    name: "Tchad",
    flag: "🇹🇩",
    code: "TD",
    phonePrefix: "+235",
    paymentMethods: ["Airtel Money", "Moov Money"],
  },
  {
    name: "Niger",
    flag: "🇳🇪",
    code: "NE",
    phonePrefix: "+227",
    paymentMethods: ["Airtel Money", "Moov Money"],
  },
];

export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.name === name);
}

export function getPaymentMethodsForCountry(countryName: string): string[] {
  return getCountryByName(countryName)?.paymentMethods || [];
}

export function getFlagForCountry(countryName: string): string {
  return getCountryByName(countryName)?.flag || "🌍";
}
