export interface Country {
  name: string;
  flag: string;
  code: string;
  phonePrefix: string;
  paymentMethods: string[];
}

export const COUNTRIES: Country[] = [
  {
    name: "Togo",
    flag: "🇹🇬",
    code: "TG",
    phonePrefix: "+228",
    paymentMethods: ["TMoney", "Flooz"],
  },
  {
    name: "Bénin",
    flag: "🇧🇯",
    code: "BJ",
    phonePrefix: "+229",
    paymentMethods: ["MTN MoMo", "Moov Money"],
  },
  {
    name: "Sénégal",
    flag: "🇸🇳",
    code: "SN",
    phonePrefix: "+221",
    paymentMethods: ["Orange Money", "Wave"],
  },
  {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    code: "CI",
    phonePrefix: "+225",
    paymentMethods: ["Orange Money", "MTN MoMo", "Moov Money", "Wave"],
  },
  {
    name: "Burkina Faso",
    flag: "🇧🇫",
    code: "BF",
    phonePrefix: "+226",
    paymentMethods: ["Orange Money", "MTN MoMo", "Moov Money"],
  },
  {
    name: "Mali",
    flag: "🇲🇱",
    code: "ML",
    phonePrefix: "+223",
    paymentMethods: ["Orange Money", "Moov Money"],
  },
  {
    name: "Congo-Brazzaville",
    flag: "🇨🇬",
    code: "CG",
    phonePrefix: "+242",
    paymentMethods: ["Mobile Money Congo"],
  },
  {
    name: "Congo RDC",
    flag: "🇨🇩",
    code: "CD",
    phonePrefix: "+243",
    paymentMethods: ["Airtel Money RDC", "MTN Mobile Money RDC", "Banque locale / transfert bancaire RDC"],
  },
  {
    name: "Cameroun",
    flag: "🇨🇲",
    code: "CM",
    phonePrefix: "+237",
    paymentMethods: ["MTN MoMo", "Orange Money"],
  },
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
