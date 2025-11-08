// Ejemplo de posts. Reemplaza esto importando tus posts reales (markdown o JSON)
export const posts = [
  {
    id: "p1",
    title: "Avances en restauración ecológica urbana",
    excerpt:
      "Resumen breve sobre técnicas y resultados en restauración de áreas verdes urbanas.",
    date: "2025-10-01",
    author: "Dra. M. Concepción",
    // image: "/publicaciones/img1.jpg",
    image:
      "https://www.fundacionaquae.org/wp-content/uploads/2020/05/ecolog%C3%ADa-urbana.jpg",
  },
  {
    id: "p2",
    title: "Monitoreo de calidad del agua: un estudio de caso",
    excerpt:
      "Métodos, indicadores y recomendaciones para seguimiento de cuerpos de agua.",
    date: "2025-09-15",
    author: "Héctor Ramírez",
    // image: "/publicaciones/img2.jpg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_DR506AVhsWYnVEG9sTYr6jC2tRw3S5UV-w&s",
  },
  {
    id: "p3",
    title: "Estrategias participativas en gestión ambiental",
    excerpt: "Cómo involucrar comunidades en proyectos de conservación.",
    date: "2025-09-02",
    author: "Ana Laura",
    // image: "/publicaciones/img3.jpg",
    image:
      "https://one-more-tree.org/es/wp-content/uploads/sites/13/2025/02/599323-870x563-1.jpg",
  },
  {
    id: "p4",
    title: "Cambio climático y adaptación local",
    excerpt:
      "Evaluación de riesgos y propuestas de adaptación a nivel municipal.",
    date: "2025-08-20",
    author: "Equipo CIIEMAD",
    // image: "/publicaciones/img4.jpg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREOEUbd7zolkxUJT_PHllBRtfxbjqLxNpwfQ&s",
  },
  {
    id: "p5",
    title: "Movilidad sostenible: un enfoque interdisciplinario",
    excerpt:
      "Políticas, diseño urbano y participación social para movilidad sostenible.",
    date: "2025-07-10",
    author: "Varios autores",
    // image: "/publicaciones/img5.jpg",
    image:
      "https://www.gob.mx/cms/uploads/article/main_image/64798/movilidad-sustentable.jpg",
  },
];

// Recientes (puedes ordenar / filtrar según necesites)
export const recientes = posts.slice(0, 4);
