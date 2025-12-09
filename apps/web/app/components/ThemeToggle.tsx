"use client";

import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Evita flash de conteúdo não estilizado
  if (!mounted) {
    return (
      <button className="theme-toggle" aria-label="Toggle theme">
        <span className="theme-toggle-icon">🌙</span>
      </button>
    );
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="theme-toggle-icon">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      <span className="theme-toggle-text">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
