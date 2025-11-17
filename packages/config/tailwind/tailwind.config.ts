import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Omit<Config, 'content'> = {
  darkMode: "class",
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-body)", ...(defaultTheme.fontFamily?.sans || [])],
        heading: ["var(--font-heading)", "sans-serif"],
        // Legacy support for harrychang-me
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        "ibm-plex": ["var(--font-ibm-plex-sans)", "sans-serif"],
        // Emily chang fonts
        "inter": ["var(--font-inter)", "sans-serif"],
        "playfair": ["var(--font-playfair-display)", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "hsl(var(--foreground))",
            a: {
              color: "hsl(var(--primary))",
              textDecoration: "underline",
              textDecorationStyle: "dashed",
                textDecorationColor: "#1A1A1A",
              textUnderlineOffset: "0.2em",
              transition: "text-decoration-color 0.2s ease-in-out",
              whiteSpace: "nowrap",
              "&:hover": {
                color: "hsl(var(--primary))",
                  textDecorationColor: "hsl(var(--accent))",
              },
              "&::after": {
                content: '"*"',
                display: "inline",
                marginLeft: "0.1em",  
                verticalAlign: "super",
                  color: "hsl(var(--accent))",
                fontFamily: "var(--font-body)",
                fontSize: "0.85em",
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontVariantEmoji: "text",
              },
            },
            h1: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-heading)",
            },
            h2: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-heading)",
            },
            h3: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-heading)",
            },
            h4: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-heading)",
            },
            p: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-body)",
            },
            li: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-body)",
            },
            "ul > li::marker": 
            {
              color: "#4F4F4F",
            },
            "ol > li::marker": 
            {
              color: "#4F4F4F",
            },
            hr: {
              borderColor: "#1A1A1A",
              borderTopWidth: "2px",
              marginTop: "2em",
              marginBottom: "2em"
            },
            blockquote: {
              quotes: "none",
              fontStyle: "normal",
              borderLeftColor: "hsl(var(--primary))",
              borderLeftWidth: "4px",
              paddingLeft: "1.5em",
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-body)",
            },
            "blockquote p:first-of-type::before": {
              content: "none"
            },
            "blockquote p:last-of-type::after": {
              content: "none"
            },
            code: {
              color: "hsl(var(--foreground))",
              backgroundColor: "#4F4F4F",
              borderRadius: "0.25rem",
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
              paddingTop: "0.125rem",
              paddingBottom: "0.125rem",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: "0.875em",
              fontWeight: "400",
            },
            "code::before": {
              content: "none"
            },
            "code::after": {
              content: "none"
            },
            // Ensure pre > code blocks don't get the inline styling
            "pre code": {
              backgroundColor: "transparent",
              borderRadius: "0",
              padding: "0",
              fontSize: "1em",
            }
          },
        },
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-out": "fade-out 0.3s ease-in-out",
      },
      backgroundImage: {
        "loading-gradient":
          "linear-gradient(90deg, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%)",
      },
    },
  },
  plugins: [
    // @ts-ignore
    require("tailwindcss-animate"),
    // @ts-ignore
    require("@tailwindcss/typography")
  ],
}

export default config

