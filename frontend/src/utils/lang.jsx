import flags from "emoji-flags";
import DOMPurify from 'dompurify';

export const capitalFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const voiceLanguages = () => {
  const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
  });
  const voices = window.speechSynthesis.getVoices();
  const languages = [...new Set(voices.map(v => v.lang))];
  const langs = languages.map(v => ({
      label: languageNames.of(v),
      value: v
    }));
  return langs;
}

export const allVoices = (selectedLang) => {
  const synth = window.speechSynthesis;
  const allVoices = synth.getVoices().filter(v => v.lang === selectedLang);
  return allVoices;
}

export const getActiveContent = (activeLang, item) => {
    if (!item) return { content: "", text: "" };

    // Nếu ngôn ngữ khớp ngôn ngữ chính
    if (activeLang === item.language) {
        return {
            content: DOMPurify.sanitize(item.content),
            text: item.text || ""
        };
    }

    // Tìm trong translations
    const found = item.translations?.find(t => t.lang === activeLang);

    // Nếu tìm thấy bản dịch
    if (found) {
        return {
            content: DOMPurify.sanitize(found.content) || "",
            text: found.text || ""
        };
    }

    // Fallback về ngôn ngữ gốc
    return {
        content: DOMPurify.sanitize(item.content),
        text: item.text || ""
    };
};

export const getTitleByLang = (data, lang) => {
    if (lang === data.language) return data.title || "";
    return data.translations?.find(t => t.lang === lang)?.title || "";
  };

export const getFlag = (langInput) => {
    const langCode = typeof langInput === "object" ? langInput.value : langInput;
    const countryCode = langCode?.split("-")[1] || langCode;
    try {
      const flag = flags.countryCode(countryCode.toUpperCase());
      return flag ? <span style={{ fontSize: 20 }}>{flag.emoji}</span> : "🌐";
    } catch {
      return "🌐";
    }
  };