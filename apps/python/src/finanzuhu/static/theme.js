(() => {
  const root = document.documentElement;
  let saved = "dark";
  try {
    saved = localStorage.getItem("finanzuhu-theme") || "dark";
  } catch {
    // Storage may be unavailable in a private browsing context.
  }
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = () => {
    const dark = saved === "system" ? systemDark.matches : saved === "dark";
    root.dataset.theme = dark ? "dark" : "light";
    const button = document.querySelector(".theme-toggle");
    if (button) {
      button.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
      button.title = `Switch to ${dark ? "light" : "dark"} theme`;
      button.querySelector(".theme-icon").textContent = dark ? "☼" : "◐";
    }
  };
  applyTheme();
  systemDark.addEventListener("change", () => {
    if (saved === "system") applyTheme();
  });
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme-toggle");
    button?.addEventListener("click", () => {
      saved = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("finanzuhu-theme", saved);
      } catch {
        // Theme remains available for this page even when it cannot persist.
      }
      applyTheme();
    });
    applyTheme();
  });
})();
