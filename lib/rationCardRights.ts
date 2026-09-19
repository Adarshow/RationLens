// lib/rationCardRights.ts
//
// Static reference data for the "Know Your Rights" section.
// Card colours + categories are sourced from the Kerala Targeted Public
// Distribution System (Control) Order, 2019, Clause 3(2).
// Entitlement figures are sourced from the Idukki District Civil Supplies
// portal (https://idukki.nic.in/en/departments/civil-supplies/), current
// as of Sept 2026. Quantities are fixed "by the Government from time to
// time" (Clause 8(1) of the Order), so this file intentionally carries a
// last-verified date and a link back to the source — surface both in the UI
// rather than presenting these numbers as permanently fixed.

export type RationCardId =
  | "aay"
  | "priority"
  | "non_priority_subsidy"
  | "non_priority_non_subsidy";

export type RationCardCategory = {
  id: RationCardId;
  colorName: { en: string; ml: string };
  colorHex: string;
  categoryName: { en: string; ml: string };
  eligibility: { en: string; ml: string };
  rice: { en: string; ml: string };
  wheatOrAtta: { en: string; ml: string };
  kerosene: { en: string; ml: string };
};

export const KEROSENE_NOTE = {
  en: "0.5 litre/month for electrified households, 4 litres/month for non-electrified households — same for all card types.",
  ml: "വൈദ്യുതി കണക്ഷനുള്ള വീടുകൾക്ക് പ്രതിമാസം 0.5 ലിറ്ററും, വൈദ്യുതി ഇല്ലാത്ത വീടുകൾക്ക് 4 ലിറ്ററും മണ്ണെണ്ണ — എല്ലാ കാർഡുകൾക്കും ഒരുപോലെ.",
};

export const RATION_CARD_CATEGORIES: RationCardCategory[] = [
  {
    id: "aay",
    colorName: { en: "Yellow", ml: "മഞ്ഞ" },
    colorHex: "#E8C547",
    categoryName: {
      en: "Antyodaya Anna Yojana (AAY)",
      ml: "അന്ത്യോദയ അന്ന യോജന (AAY)",
    },
    eligibility: {
      en: "Poorest-of-the-poor households — daily wage earners, destitute, primitive tribal groups — identified under central government AAY criteria.",
      ml: "ദിവസക്കൂലിക്കാർ, ആശ്രയമില്ലാത്തവർ, ആദിമ ഗോത്രവിഭാഗങ്ങൾ ഉൾപ്പെടെ ഏറ്റവും ദരിദ്രരായ കുടുംബങ്ങൾ — കേന്ദ്ര സർക്കാരിന്റെ AAY മാനദണ്ഡപ്രകാരം തിരഞ്ഞെടുക്കപ്പെട്ടവർ.",
    },
    rice: {
      en: "35 kg per family per month — free of cost",
      ml: "കുടുംബത്തിന് പ്രതിമാസം 35 കിലോ — സൗജന്യം",
    },
    wheatOrAtta: {
      en: "Included within the 35 kg family entitlement",
      ml: "35 കിലോ കുടുംബ അവകാശത്തിൽ ഉൾപ്പെടുന്നു",
    },
    kerosene: KEROSENE_NOTE,
  },
  {
    id: "priority",
    colorName: { en: "Pink", ml: "പിങ്ക്" },
    colorHex: "#E06B93",
    categoryName: { en: "Priority Household (PHH)", ml: "മുൻഗണനാ കുടുംബം" },
    eligibility: {
      en: "Priority households identified under the State Government's inclusion/exclusion criteria.",
      ml: "സംസ്ഥാന സർക്കാരിന്റെ മാനദണ്ഡപ്രകാരം മുൻഗണനാ കുടുംബമായി തിരഞ്ഞെടുക്കപ്പെട്ടവർ.",
    },
    rice: {
      en: "5 kg per family member per month — free of cost",
      ml: "ഓരോ കുടുംബാംഗത്തിനും പ്രതിമാസം 5 കിലോ — സൗജന്യം",
    },
    wheatOrAtta: {
      en: "Included within the 5 kg per-member entitlement",
      ml: "5 കിലോ വ്യക്തിഗത അവകാശത്തിൽ ഉൾപ്പെടുന്നു",
    },
    kerosene: KEROSENE_NOTE,
  },
  {
    id: "non_priority_subsidy",
    colorName: { en: "Blue", ml: "നീല" },
    colorHex: "#3D7EBF",
    categoryName: {
      en: "Non-Priority (Subsidy) Household",
      ml: "മുൻഗണനേതര (സബ്സിഡി) കുടുംബം",
    },
    eligibility: {
      en: "Non-priority households the Government has designated for continued subsidised rates.",
      ml: "സബ്സിഡി നിരക്കിൽ റേഷൻ ലഭിക്കാൻ സർക്കാർ അംഗീകരിച്ച മുൻഗണനേതര കുടുംബങ്ങൾ.",
    },
    rice: {
      en: "2 kg per card at ₹2/kg",
      ml: "കാർഡിന് 2 കിലോ, കിലോയ്ക്ക് ₹2 നിരക്കിൽ",
    },
    wheatOrAtta: {
      en: "Not separately specified for this category",
      ml: "ഈ വിഭാഗത്തിന് പ്രത്യേകം വ്യക്തമാക്കിയിട്ടില്ല",
    },
    kerosene: KEROSENE_NOTE,
  },
  {
    id: "non_priority_non_subsidy",
    colorName: { en: "White", ml: "വെള്ള" },
    colorHex: "#B9B4A6",
    categoryName: {
      en: "Non-Priority (Non-Subsidy) Household",
      ml: "മുൻഗണനേതര (നോൺ-സബ്സിഡി) കുടുംബം",
    },
    eligibility: {
      en: "Households above the priority threshold, not covered by continued subsidy.",
      ml: "മുൻഗണനാ പരിധിക്ക് മുകളിലുള്ളതും സബ്സിഡി ലഭിക്കാത്തതുമായ കുടുംബങ്ങൾ.",
    },
    rice: {
      en: "Rice at ₹8.90/kg and wheat at ₹6.70/kg — quantity varies by monthly availability, not a fixed amount",
      ml: "അരി കിലോയ്ക്ക് ₹8.90ഉം ഗോതമ്പ് കിലോയ്ക്ക് ₹6.70ഉം — അളവ് ലഭ്യതയ്ക്കനുസരിച്ച് മാറാം, നിശ്ചിത അളവല്ല",
    },
    wheatOrAtta: {
      en: "2 kg fortified atta at ₹15/kg",
      ml: "2 കിലോ ഫോർട്ടിഫൈഡ് ആട്ട, കിലോയ്ക്ക് ₹15 നിരക്കിൽ",
    },
    kerosene: KEROSENE_NOTE,
  },
];

export const RIGHTS_DISCLAIMER = {
  en: "Figures shown are current as of September 2026 and are set by the Government of Kerala from time to time. Confirm the current entitlement at your Fair Price Shop or civilsupplieskerala.gov.in.",
  ml: "കാണിച്ചിരിക്കുന്ന കണക്കുകൾ 2026 സെപ്റ്റംബർ വരെയുള്ളവയാണ്, ഇവ കേരള സർക്കാർ കാലാകാലങ്ങളിൽ പുതുക്കും. നിങ്ങളുടെ റേഷൻ കടയിലോ civilsupplieskerala.gov.in ലോ നിലവിലെ അവകാശം സ്ഥിരീകരിക്കുക.",
};

export function getRationCardCategory(id: RationCardId) {
  return RATION_CARD_CATEGORIES.find((category) => category.id === id);
}
