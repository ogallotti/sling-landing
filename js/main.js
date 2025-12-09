import { initPreloader } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get ALL sections for snapping (including method-section)
    const sections = Array.from(document.querySelectorAll('section, footer'));
    let currentSectionIndex = 0;
    let isAnimating = false;

    // Initialize Lenis for smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
    });

    // Make lenis globally accessible
    window.lenis = lenis;

    // Link Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Navigate to a specific section
    function goToSection(index) {
        if (index < 0 || index >= sections.length || isAnimating) return;
        
        isAnimating = true;
        currentSectionIndex = index;
        
        const targetSection = sections[index];
        const targetTop = targetSection.offsetTop;
        
        gsap.to(window, {
            scrollTo: { y: targetTop, autoKill: false },
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
                isAnimating = false;
            }
        });
    }

    // Scroll delta accumulator
    let accumulatedDelta = 0;
    const deltaThreshold = 120;
    let deltaResetTimeout;

    // Handle wheel events
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isAnimating) return;

        accumulatedDelta += e.deltaY;
        
        clearTimeout(deltaResetTimeout);
        deltaResetTimeout = setTimeout(() => {
            accumulatedDelta = 0;
        }, 200);

        if (Math.abs(accumulatedDelta) >= deltaThreshold) {
            if (accumulatedDelta > 0) {
                goToSection(currentSectionIndex + 1);
            } else {
                goToSection(currentSectionIndex - 1);
            }
            accumulatedDelta = 0;
            clearTimeout(deltaResetTimeout);
        }
    }, { passive: false });

    // Touch support
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (isAnimating) return;
        
        const deltaY = touchStartY - e.changedTouches[0].clientY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                goToSection(currentSectionIndex + 1);
            } else {
                goToSection(currentSectionIndex - 1);
            }
        }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA' ||
            isAnimating) {
            return;
        }

        switch(e.key) {
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                goToSection(currentSectionIndex + 1);
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                goToSection(currentSectionIndex - 1);
                break;
            case 'Home':
                e.preventDefault();
                goToSection(0);
                break;
            case 'End':
                e.preventDefault();
                goToSection(sections.length - 1);
                break;
        }
    });

    // Update current section on load
    const scrollY = window.scrollY;
    for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollY >= sections[i].offsetTop - 100) {
            currentSectionIndex = i;
            break;
        }
    }

    // Initialize Pre-loader
    initPreloader();
});
