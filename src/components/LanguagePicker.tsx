import { Globe } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/i18n/languages";
import { useI18n } from "@/i18n";

/** Native <select> so it works everywhere, styled like the other masthead tools. */
const LanguagePicker = () => {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground hover:text-foreground">
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs text-inherit focus-visible:outline-none"
        aria-label={t("nav.language")}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-card text-foreground">
            {l.name}
            {!l.ui ? " ·" : ""}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguagePicker;
