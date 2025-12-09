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
    let loadDuration = 3.5;

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
            document.body.style.overflow = '';
            initHero();
        }
    });
}

function initHero() {
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

    gsap.from('.hero-subheadline, .cta-hero, .hero-scroll-indicator', {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        delay: 0.8,
        ease: 'power3.out'
    });

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

    // Initialize all sections - ORDER MUST MATCH DOM ORDER for ScrollTrigger pins
    initAbout();
    initCases();   // Cases comes BEFORE Method in the HTML
    initMethod();  // Method comes AFTER Cases in the HTML
    initRoadmap();
    initSquad();
    initIara();
    initPricing();
    initFooter();
}

function initAbout() {
    gsap.from('.about-section .section-title', {
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
    const counters = document.querySelectorAll('.about-section .counter');
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

// METHODOLOGY - HORIZONTAL SLIDER (FIXED)
// METHODOLOGY - HORIZONTAL SLIDER (FIXED)
function initMethod() {
    const section = document.querySelector('.method-section');
    const slider = document.querySelector('.method-slider');
    const slides = document.querySelectorAll('.method-slide');
    const dots = document.querySelectorAll('.method-dots .dot');
    
    if (!section || !slider || slides.length === 0) return;
    
    // Total move is -100vw * (slides.length - 1)
    // For 7 slides moving to show the last one, we move -600vw which is approx -85.7% of 700vw container
    const xMovePercent = -(100 * (slides.length - 1) / slides.length);

    // Create the horizontal scroll animation
    gsap.to(slider, {
        xPercent: xMovePercent,
        ease: "none",
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.5,
            start: "top top",
            end: "+=5000",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Update dots based on progress
                const index = Math.round(self.progress * (slides.length - 1));
                dots.forEach((d, i) => d.classList.toggle('active', i === index));
            }
        }
    });
}

// CASES - HORIZONTAL SCROLL SLIDER
// CASES - HORIZONTAL SCROLL SLIDER
function initCases() {
    const section = document.querySelector('.cases-section');
    const slider = document.querySelector('.cases-slider');
    const slides = document.querySelectorAll('.case-slide');
    
    if (!section || !slider || slides.length === 0) return;
    
    // We have 4 slides (intro + 3 cases) in a 400vw slider.
    // We want to move 3 full slides to the left so the last one is visible.
    // Movement = -3 viewport widths.
    // -300vw relative to 400vw container = -75%.
    const xMovePercent = -75;

    // Create the horizontal scroll animation
    gsap.to(slider, {
        xPercent: xMovePercent, // Using percentage is safer for responsiveness
        ease: "none",
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.5,
            start: "top top",
            end: "+=4000",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Animate counters when we scroll past intro slide
                if (self.progress > 0.1) {
                    animateCaseCounters();
                }
            }
        }
    });
}

// Animate case counters (called once)
let countersAnimated = false;
function animateCaseCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    
    const counters = document.querySelectorAll('.cases-slider .counter');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target) || 0;
        const prefix = counter.dataset.prefix || '';
        const suffix = counter.dataset.suffix || '';
        
        let obj = { val: 0 };
        gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
                counter.textContent = prefix + Math.ceil(obj.val) + suffix;
            }
        });
    });
}

// ROADMAP - HORIZONTAL SCROLL FROM SCRATCH
function initRoadmap() {
    const section = document.querySelector('.roadmap-section');
    const wrapper = document.querySelector('.timeline-wrapper');
    const track = document.querySelector('.timeline-track');
    const markers = document.querySelectorAll('.timeline-marker');
    const fillLine = document.querySelector('.timeline-line-fill');

    if (!section || !track || markers.length === 0) return;

    // Initial state: hide all markers
    markers.forEach((marker, i) => {
        gsap.set(marker, { 
            opacity: 0, 
            y: marker.classList.contains('top') ? -30 : 30,
            scale: 0.8 
        });
    });
    
    if (fillLine) gsap.set(fillLine, { width: '0%' });

    // Calculate how much we need to scroll horizontally
    const getHorizontalDistance = () => {
        return track.scrollWidth - window.innerWidth;
    };

    // Main horizontal scroll timeline
    const mainTL = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${getHorizontalDistance() + 500}`,
            invalidateOnRefresh: true
        }
    });

    // 1. Move the track left as we scroll
    mainTL.to(track, {
        x: () => -getHorizontalDistance(),
        ease: "none",
        duration: 1
    });

    // 2. Fill the line progressively
    if (fillLine) {
        mainTL.to(fillLine, {
            width: '100%',
            ease: "none",
            duration: 1
        }, 0); // Start at same time
    }

    // 3. Reveal markers one by one as we scroll
    const markerCount = markers.length;
    markers.forEach((marker, i) => {
        const startProgress = i / markerCount;
        const duration = 0.08;
        
        mainTL.to(marker, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: duration,
            ease: "back.out(1.5)"
        }, startProgress);
    });
}

// SQUAD - CARD DECK CYCLING (FIXED)
function initSquad() {
    const section = document.querySelector('.squad-section');
    const deck = document.querySelector('.card-deck');
    const cards = document.querySelectorAll('.deck-card');

    if (!section || !deck || cards.length === 0) return;

    const scrollDuration = cards.length * 600;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.5,
            start: "top top",
            end: `+=${scrollDuration}`,
            invalidateOnRefresh: true
        }
    });

    // Cycle cards: top card goes left, then moves to back of deck
    cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // Last card stays

        const nextCard = cards[i + 1];
        
        // Card flies left
        tl.to(card, {
            x: -350,
            rotation: -25,
            duration: 0.5,
            ease: "power2.in"
        });
        
        // Card moves to back (right side, behind deck)
        tl.to(card, {
            x: 30,
            y: -60,
            rotation: 3,
            zIndex: 0,
            scale: 0.92,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Next card scales up and centers
        if (nextCard) {
            tl.to(nextCard, {
                scale: 1,
                x: 0,
                y: 0,
                rotation: 0,
                zIndex: 10,
                duration: 0.3,
                ease: "power2.out"
            }, "<");
        }
    });
}

// IARA SECTION (FIXED)
function initIara() {
    const section = document.querySelector('.iara-section');
    if (!section) return;

    // Animate visual orb
    gsap.from('.ai-orb', {
        scrollTrigger: {
            trigger: section,
            start: 'top 60%'
        },
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)'
    });

    // Animate content
    gsap.from('.iara-content', {
        scrollTrigger: {
            trigger: section,
            start: 'top 50%'
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // Animate list items
    gsap.from('.iara-list li', {
        scrollTrigger: {
            trigger: '.iara-list',
            start: 'top 70%'
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out'
    });

    // Animate stats
    gsap.from('.stat-inline', {
        scrollTrigger: {
            trigger: '.iara-stats-inline',
            start: 'top 80%'
        },
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out'
    });
}

function initPricing() {
    const section = document.querySelector('.pricing-section');
    if (!section) return;

    gsap.from('.pricing-box', {
        scrollTrigger: {
            trigger: section,
            start: 'top 70%'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.price-row', {
        scrollTrigger: {
            trigger: '.pricing-box',
            start: 'top 60%'
        },
        x: -30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out'
    });
}

function initFooter() {
    // Footer animations if needed
}
