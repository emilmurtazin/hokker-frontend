/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ice: {
          50: "#F7FAFC",
          100: "#F0F4F8",   // фон
          200: "#E1E9F0",
          300: "#C9D6E3",
        },
        rink: {
          900: "#0B2545",   // тёмно-синий "лёд в тени" — текст, шапки
          800: "#123165",
          700: "#1B3F7A",
        },
        action: {
          DEFAULT: "#C8102E", // хоккейный красный — основной акцент
          hover: "#A50D26",
          light: "#FDECEF",
        },
        goal: {
          DEFAULT: "#FFB81C", // "свет гола" — успех/награды
          light: "#FFF6E0",
        },
        neutral: {
          500: "#5C6B7A",
          400: "#8B98A5",
        },
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
        stat: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
}
