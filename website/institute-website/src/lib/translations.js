
import en from "../translations/en.json";
import ta from "../translations/ta.json";
import si from "../translations/si.json";

// The only languages supported by the site.
export const supportedLanguages = ["en", "ta", "si"];

// Keep all language files in one lookup table.
const translations = { en, ta, si };

// Safely retrieve nested values such as "nav.home".
function getNestedValue(object, key) {
    return key.split(".").reduce((value, part) => {
        return value == null ? undefined : value[part];
    }, object);
}

// Return translated text, falling back to English when necessary.
export function translate(language, key) {
    const selectedLanguage = supportedLanguages.includes(language)
        ? language
        : "en";

    const translatedValue = getNestedValue(
        translations[selectedLanguage],
        key
    );

    const englishValue = getNestedValue(en, key);

    // Missing or empty translations use the English equivalent.
    if (
        typeof translatedValue !== "string" ||
        translatedValue.trim() === ""
    ) {
        return typeof englishValue === "string" ? englishValue : key;
    }

    return translatedValue;
}
