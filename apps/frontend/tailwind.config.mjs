const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        move: {
          to: { offsetDistance: "100%" },
        },
      },
      animation: {
        move: "move 10s linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
