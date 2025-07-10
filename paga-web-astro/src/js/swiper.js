// Swiper slider initialization
document.addEventListener('DOMContentLoaded', function() {
  import('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs').then((module) => {
    const Swiper = module.default;
    
    new Swiper('.mySwiper', {
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      speed: 1000
    });
  });
});
