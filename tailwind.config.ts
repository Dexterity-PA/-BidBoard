import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Meritously brand: every indigo-* utility in the app renders in the
        // brand green, so older screens match without touching each class.
        indigo: {
          50: "#ECF5F0",
          100: "#D5EADF",
          200: "#ACD5BF",
          300: "#7DB99B",
          400: "#4E9A75",
          500: "#2A7D57",
          600: "#0F5D3E",
          700: "#0B4A31",
          800: "#093B28",
          900: "#072E1F",
          950: "#041C13",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        bb: {
          surface: "var(--bb-surface)",
          "surface-alt": "var(--bb-surface-alt)",
          "surface-elevated": "var(--bb-surface-elevated)",
          ink: "var(--bb-ink)",
          "ink-muted": "var(--bb-ink-muted)",
          "ink-subtle": "var(--bb-ink-subtle)",
          primary: "var(--bb-primary)",
          "primary-hover": "var(--bb-primary-hover)",
          "primary-soft": "var(--bb-primary-soft)",
          accent: "var(--bb-accent)",
        },
        "bb-border": {
          hairline: "var(--bb-border-hairline)",
          strong: "var(--bb-border-strong)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
