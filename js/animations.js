// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initPreloader() {
    const tl = gsap.timeline();
    const counterElement = document.querySelector('.loader-percentage');
    const progressBar = document.querySelector('.loader-progress-bar');
    const loaderLogo = document.querySelector('.loader-logo');
    
    // Disable scroll initially
    document.body.style.overflow = 'hidden';
    document.body.classList.add('loading');

    let progress = { value: 0 };
    let loadDuration = 3.5; // Slightly longer for dramatic effect

    // Easter egg click handler
    let clickCount = 0;
    if (loaderLogo) {
        loaderLogo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 3) {
                gsap.to(tl, { timeScale: 2, duration: 0.5 });
            }
        });
    }

    // Loading Animation
    tl.to(progress, {
        value: 100,
        duration: loadDuration,
        ease: "power4.inOut", 
        onUpdate: () => {
            if(counterElement) counterElement.textContent = Math.round(progress.value) + '%';
            if(progressBar) progressBar.style.width = Math.round(progress.value) + '%';
        }
    })
    
    // Exit Transition
    .to('.loader-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    })
    .to('.loader', {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
            document.body.classList.remove('loading');
            document.body.style.overflow = ''; // Enable scroll
            initHero(); // Start Hero animations ONLY after loader
        }
    });
}

function initHero() {
    // 1. Headlines Reveal
    const headline = document.querySelector('.hero-headline');
    if (headline) {
        const split = new SplitType('.hero-headline', { types: 'chars' });
        gsap.from(split.chars, {
            y: 100,
            rotateX: -90,
            opacity: 0,
            stagger: 0.02,
            duration: 1,
            ease: 'power4.out',
            delay: 0.2
        });
    }

    // 2. Subheadline & CTA Reveal
    gsap.from('.hero-subheadline, .cta-hero, .hero-scroll-indicator', {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        delay: 0.8,
        ease: 'power3.out'
    });

    // 3. Reveal Block Effect
    const revealBlock = document.querySelector('.reveal-block');
    if (revealBlock) {
        gsap.set('.reveal-text', { opacity: 1 });
        gsap.to('.reveal-block', {
            x: '105%',
            duration: 0.8,
            delay: 0.5,
            ease: 'power3.inOut'
        });
    }

    // Initialize subsequent sections
    // Note: ScrollTriggers will wait for user to scroll
    initAbout();
    initMethod();
    initCases();
    initRoadmap();
    initSquad();
    initIara();
    initPricing();
    initFooter();
}

function initAbout() {
    gsap.from('.section-title', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 70%'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });

    const aboutParagraphs = document.querySelectorAll('.about-text p');
    gsap.from(aboutParagraphs, {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 60%'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const targetValue = parseInt(counter.getAttribute('data-target'));
        const isMoney = targetValue >= 1000000;
        
        let obj = { val: 0 };
        
        gsap.to(obj, {
            val: targetValue,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: counter,
                start: 'top 85%'
            },
            onUpdate: function() {
                let cleanVal = Math.ceil(obj.val);
                if (isMoney) {
                    let millions = (cleanVal / 1000000).toFixed(targetValue >= 10000000 ? 0 : 1);
                    counter.textContent = `R$ ${millions}M+`;
                } else {
                    counter.textContent = cleanVal;
                }
            }
        });
    });

    // Image Reveal
    gsap.to('.founders-image', {
        scrollTrigger: {
            trigger: '.about-image-wrapper',
            start: 'top 70%'
        },
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 1.2,
        ease: 'power4.inOut'
    });
}

// METHODOLOGY SECTION - HORIZONTAL SLIDER
function initMethod() {
    const section = document.querySelector('.method-section');
    const slider = document.querySelector('.method-slider');
    const slides = document.querySelectorAll('.method-slide');
    
    if (!section || !slider || slides.length === 0) return;
    
    // Total move distance: (numSlides - 1) * 100vw
    const totalMove = (slides.length - 1) * 100; 

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: "+=3000", // Adjust length of scroll
            invalidateOnRefresh: true
        }
    });

    // Move slider horizontally
    tl.to(slider, {
        xPercent: -((slides.length - 1) * 100) / slides.length, // Logic for flex container
        // Actually, since width is 700vw (7 slides), moving to end means moving -600vw visually?
        // Simpler: xPercent: -100 * (slides.length - 1) / slides.length
        // Let's use x: () => -(slider.scrollWidth - window.innerWidth)
        x: () => -(slider.scrollWidth - window.innerWidth),
        ease: "none"
    });

    // Sync dots
    const dots = document.querySelectorAll('.method-dots .dot');
    dots.forEach((dot, i) => {
        // Highlight logic
        // We want dot i to be active when slide i is in view
        // Slide i is in view when progress is roughly i / (total - 1)
        if (i === 0) return; // First one active start
        
        tl.call(() => {
            dots.forEach(d => d.classList.remove('active'));
            dots[i].classList.add('active');
        }, null, i / (slides.length - 1) * tl.duration()); // approximate timing
        
        // This call approach in scrub timeline is tricky. simpler to use checking onUpdate.
    });

    // Re-do dots using onUpdate in ScrollTrigger is smoother
    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=3000',
        scrub: true,
        onUpdate: (self) => {
            const index = Math.round(self.progress * (slides.length - 1));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }
    });
}

// CASES SECTION
function initCases() {
    const cards = document.querySelectorAll('.case-card');
    cards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: '.cases-section',
                start: 'top 60%'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power3.out'
        });
    });
}

// ROADMAP SECTION - FIXED LOGIC
function initRoadmap() {
    const section = document.querySelector('.roadmap-section');
    const track = document.querySelector('.timeline-track');
    const fillLine = document.querySelector('.timeline-line-fill');
    const markers = document.querySelectorAll('.timeline-marker');

    if (!section || !track) return;

    // Reset markers initial state
    gsap.set(markers, { opacity: 0, scale: 0.5, y: 20 });
    gsap.set(fillLine, { width: '0%' });

    const scrollDistance = () => track.scrollWidth - window.innerWidth + 200; // Extra buffer

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${scrollDistance()}`,
            invalidateOnRefresh: true
        }
    });

    // 1. Move Track Left
    tl.to(track, {
        x: () => -scrollDistance(),
        ease: "none",
        duration: 10
    });

    // 2. Fill Line (runs concurrent with track movement)
    tl.to(fillLine, {
        width: '100%',
        ease: "none",
        duration: 10
    }, 0);

    // 3. Reveal Markers Sequentially
    // Divide duration (10) by number of markers
    const step = 9.5 / markers.length; 
    
    markers.forEach((marker, i) => {
        tl.to(marker, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        }, i * step + 0.5); // Start slightly after
    });
}

// SQUAD SECTION - CARD DECK LOGIC (ONE BY ONE)
function initSquad() {
    const section = document.querySelector('.squad-section');
    const cards = document.querySelectorAll('.deck-card');

    if (!section || cards.length === 0) return;

    // CSS reset: ensure all cards are stacked absolute
    // (Should be in CSS, but confirming logic here)
    
    // Reverse z-index so first element is top
    cards.forEach((card, i) => {
        card.style.zIndex = cards.length - i;
        // Initial tiny rotation for messiness
        gsap.set(card, { rotation: (Math.random() * 4 - 2) }); 
    });

    const scrollDuration = 3000;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: `+=${scrollDuration}`,
            invalidateOnRefresh: true
        }
    });

    // Animate cards flying away one by one, revealing the next
    // Except the last one
    cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // Keep last card

        tl.to(card, {
            x: -window.innerWidth, // Fly left out of screen
            rotation: -45,
            opacity: 0,
            duration: 1,
            ease: "power2.in"
        });
        
        // Optional: scale up the next card slightly to show focus
        if (cards[i+1]) {
            tl.fromTo(cards[i+1], 
                { scale: 0.95, filter: 'brightness(0.5)' },
                { scale: 1, filter: 'brightness(1)', duration: 0.5 },
                "<+=0.5" // Start halfway through previous card exit
            );
        }
    });
}

function initIara() {
    // Basic reveal
    gsap.from('.iara-content', {
        scrollTrigger: {
            trigger: '.iara-section',
            start: 'top 60%'
        },
        y: 50, opacity: 0, duration: 1
    });
}

function initPricing() {
    gsap.from('.pricing-card', {
        scrollTrigger: {
            trigger: '.pricing-section',
            start: 'top 70%'
        },
        y: 50, opacity: 0, stagger: 0.2, duration: 1
    });
}

function initFooter() {
    // Simple footer
}

function initMenu() {
    const menuBtn = document.querySelector('.nav-links'); // Simplification
}
