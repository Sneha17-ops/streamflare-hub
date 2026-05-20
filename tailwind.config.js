/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./games/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#020617",
          deep: "#070a13",
          card: "rgba(15, 23, 42, 0.4)",
          hover: "rgba(30, 41, 59, 0.6)"
        },
        primary: {
          DEFAULT: "#8b5cf6", // premium purple
          glow: "#a78bfa"
        },
        secondary: {
          DEFAULT: "#06b6d4", // premium cyan
          glow: "#22d3ee"
        },
        accent: {
          DEFAULT: "#ec4899", // magenta neon
          glow: "#f472b6"
        }
      },
      boxShadow: {
        "neon-purple": "0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)",
        "neon-cyan": "0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.2)",
        "neon-accent": "0 0 15px rgba(236, 72, 153, 0.5), 0 0 30px rgba(236, 72, 153, 0.2)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      },
      backdropBlur: {
        xs: "2px"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite linear",
        "mesh-move": "mesh 15s ease infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "50%": { transform: "translateX(-60%)" },
          "100%": { transform: "translateX(150%)" }
        },
        mesh: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(5%, 8%) scale(1.1)" },
          "66%": { transform: "translate(-8%, -5%) scale(0.95)" }
        }
      }
    }
  },
  plugins: []
}
