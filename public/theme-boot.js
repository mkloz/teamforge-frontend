(() => {
  const STORAGE_KEY = "findafew:appearance:v2";
  const defaults = {
    themeAppearance: "system",
    themeColor: "graphite",
    themeStyle: "classic",
  };
  const validAppearance = new Set(["system", "light", "dark"]);
  const validStyle = new Set(["classic", "glass", "ink", "poster"]);
  const supportedColors = new Set([
    "graphite",
    "teal",
    "ember",
    "mono",
    "harbor",
  ]);

  function readPreferences() {
    try {
      // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- This dependency-free boot script validates every field below.
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      if (!value || typeof value !== "object") {
        return defaults;
      }

      const themeAppearance = validAppearance.has(value.themeAppearance)
        ? value.themeAppearance
        : defaults.themeAppearance;
      const themeStyle = validStyle.has(value.themeStyle)
        ? value.themeStyle
        : defaults.themeStyle;
      const themeColor = supportedColors.has(value.themeColor)
        ? value.themeColor
        : defaults.themeColor;

      return { themeAppearance, themeColor, themeStyle };
    } catch {
      return defaults;
    }
  }

  const preferences = readPreferences();
  const systemDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const theme =
    preferences.themeAppearance === "system"
      ? systemDark
        ? "dark"
        : "light"
      : preferences.themeAppearance;
  const root = document.documentElement;

  window.__APP_BOOT_STARTED_AT = performance.now();
  root.dataset.theme = theme;
  root.dataset.themeAppearance = preferences.themeAppearance;
  root.dataset.themeColor = preferences.themeColor;
  root.dataset.themeStyle = preferences.themeStyle;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", theme === "dark" ? "#000000" : "#F4F4F2");
})();
