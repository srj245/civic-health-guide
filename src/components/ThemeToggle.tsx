import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "civiccare-theme";

/** Dark is the default. The `light` class on <html> switches palettes. */
const ThemeToggle = () => {
  const [light, setLight] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "light";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    try {
      localStorage.setItem(STORAGE_KEY, light ? "light" : "dark");
    } catch {
      /* storage unavailable */
    }
  }, [light]);

  return (
    <button
      type="button"
      onClick={() => setLight((v) => !v)}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:text-foreground"
    >
      {light ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
