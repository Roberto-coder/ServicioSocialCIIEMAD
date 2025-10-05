/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        // SustentaTerra
        cafe: "#543E2D",
        verdeOscuro: "#234224",
        azul: "#44A3C3",
        mostaza: "#D5A63B",

        // Laboratorio
        guinda: "#C72C2F",
        naranja: "#EF9C1A",
        turquesa: "#02A2D0",
        verde: "#60A917",
        grisAzulado: "#4C5D67",
        verdeProfundo: "#0B4536",
        grisOscuro: "#3F424B",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"], // títulos
        sans: ["Inter", "sans-serif"], // texto
      },
    },
  },
  plugins: [],
};
