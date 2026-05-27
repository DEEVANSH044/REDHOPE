"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <UIContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIContext must be used within UIProvider");
  return context;
}
