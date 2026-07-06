/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stadium: {
          ink: "#17211d",
          field: "#1f5b4e",
          signal: "#d06f3c",
        },
      },
    },
  },
  plugins: [],
};

