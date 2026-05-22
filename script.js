(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');

    // Web3Forms configuration (moved to environment variable concept)
    // IMPORTANT: In production, consider using a backend proxy or environment variables
    const FORM_ACCESS_KEY = 'e05b31d5-119d-4999-ad84-2bea8b2927ea';
    const FORM_REDIRECT_URL = 'https://desoukkkii.github.io/desouki-portfolio/';

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
    // Form Validation
    // ============================================
    const validators = {
        name: (val) => val.trim().length >= 2,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        message: (val) => val.trim().length >= 10
    };

    const errorMessages = {
        name: 'Please enter your name (at least 2 characters).',
        email: 'Please enter a valid email address.',
        message: 'Please enter a message (at least 10 characters).'
    };

    const setError = (inputId, errorId, message) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input) input.classList.add('error');
        if (error) error.textContent = message;
    };

    const clearError = (inputId, errorId) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input) input.classList.remove('error');
        if (error) error.textContent = '';
    };

    const validateField = (fieldName, value) => {
        const isValid = validators[fieldName] ? validators[fieldName](value) : true;
        if (!isValid) {
            setError(fieldName, `${fieldName}Error`, errorMessages[fieldName]);
        } else {
            clearError(fieldName, `${fieldName}Error`);
        }
        return isValid;
    };

    // ============================================
    // Contact Form Submission
    // ============================================
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        const formSuccess = document.getElementById('formSuccess');

        // Real-time validation
        const setupLiveValidation = (inputId, fieldName) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', debounce(() => {
                    validateField(fieldName, input.value);
                }, 300));
            }
        };

        setupLiveValidation('name', 'name');
        setupLiveValidation('email', 'email');
        setupLiveValidation('message', 'message');

        const setLoading = (isLoading) => {
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;
            if (btnText) btnText.style.display = isLoading ? 'none' : '';
            if (btnLoading) btnLoading.style.display = isLoading ? 'flex' : 'none';
        };

        const showSuccess = () => {
            if (contactForm) contactForm.reset();
            if (submitBtn) submitBtn.style.display = 'none';
            if (formSuccess) formSuccess.style.display = 'flex';
            
            // Reset form visibility after 5 seconds (optional)
            setTimeout(() => {
                if (submitBtn) submitBtn.style.display = '';
                if (formSuccess) formSuccess.style.display = 'none';
            }, 5000);
        };

        const showError = (message) => {
            setError('message', 'messageError', message || 'Something went wrong. Please try again or email directly.');
            setLoading(false);
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = nameInput?.value || '';
            const emailVal = emailInput?.value || '';
            const messageVal = messageInput?.value || '';

            // Clear all previous errors
            ['name', 'email', 'message'].forEach(field => {
                clearError(field, `${field}Error`);
            });

            // Validate all fields
            const isNameValid = validateField('name', nameVal);
            const isEmailValid = validateField('email', emailVal);
            const isMessageValid = validateField('message', messageVal);

            if (!isNameValid || !isEmailValid || !isMessageValid) return;

            setLoading(true);

            try {
                const formData = new FormData();
                formData.append('access_key', FORM_ACCESS_KEY);
                formData.append('name', nameVal);
                formData.append('email', emailVal);
                formData.append('message', messageVal);
                formData.append('subject', 'New message from your portfolio');
                formData.append('from_name', 'Portfolio Contact');
                formData.append('redirect', FORM_REDIRECT_URL);
                // Honeypot field
                formData.append('botcheck', '');

                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showSuccess();
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            } catch (err) {
                console.error('Form submission error:', err);
                showError(err.message);
            } finally {
                setLoading(false);
            }
        });
    }

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

    // ============================================
    // Logging (optional, remove in production)
    // ============================================
    if (process.env.NODE_ENV !== 'production') {
        console.log('Portfolio initialized successfully');
    }
})();
