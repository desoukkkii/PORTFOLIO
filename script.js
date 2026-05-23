(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // ============================================
    // Utility Functions
    // ============================================
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    const handleNavbarScroll = () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', throttle(handleNavbarScroll, 100), { passive: true });

    // ============================================
    // Mobile Menu
    // ============================================
    const toggleMenu = (isOpen) => {
        hamburger.classList.toggle('active', isOpen);
        navLinks.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    };

    const closeMenu = () => toggleMenu(false);
    const openMenu = () => toggleMenu(true);

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('open');
            isOpen ? closeMenu() : openMenu();
        });
    }

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navbar && !navbar.contains(e.target)) {
            closeMenu();
        }
    });

    // Prevent body scroll when menu is open on mobile
    const handleBodyScroll = () => {
        if (navLinks && navLinks.classList.contains('open') && window.innerWidth <= 900) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    if (navLinks) {
        const observer = new MutationObserver(handleBodyScroll);
        observer.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
    }

    // ============================================
    // Scroll Animations with Intersection Observer
    // ============================================
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.delay, 10) || 0;
                setTimeout(() => {
                    el.classList.add('animated');
                }, delay);
                animationObserver.unobserve(el);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => animationObserver.observe(el));

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                // Update URL without causing jump
                history.pushState(null, null, href);
            }
        });
    });

    // ============================================
    // 3D Tilt Effect on Project Cards (with performance optimization)
    // ============================================
    const projectCards = document.querySelectorAll('.project-card');
    
    const handleTiltMove = (card, e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
        const inner = card.querySelector('.project-card-inner');
        if (inner) {
            inner.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
        }
    };

    const handleTiltLeave = (card) => {
        const inner = card.querySelector('.project-card-inner');
        if (inner) {
            inner.style.transform = '';
        }
    };

    // Use throttled event handler for better performance
    projectCards.forEach(card => {
        card.addEventListener('mousemove', throttle((e) => handleTiltMove(card, e), 16));
        card.addEventListener('mouseleave', () => handleTiltLeave(card));
    });

    // ============================================
    // Skill Cards Staggered Animation
    // ============================================
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 40}ms`;
    });

    // ============================================
    // Preloader / Initialization
    // ============================================
    // Ensure all CSS transitions are applied after page load
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Force a reflow to ensure animations start correctly
        void document.body.offsetHeight;
    });

    // ============================================
    // Handle prefers-reduced-motion
    // ============================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        // Disable animations for users who prefer reduced motion
        const style = document.createElement('style');
        style.textContent = `
            [data-animate] {
                opacity: 1;
                transform: none;
                transition: none;
            }
            .project-card:hover .project-card-inner {
                transform: none;
            }
        `;
        document.head.appendChild(style);
    }
})();
