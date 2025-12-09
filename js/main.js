import { initPreloader } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothWheel: true,
    });

    // Make lenis globally accessible
    window.lenis = lenis;

    // Link Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Standard RAF loop for Lenis (backup)
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initialize Pre-loader and all animations
    initPreloader();
});
