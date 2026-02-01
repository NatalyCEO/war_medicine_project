// Main application functionality
class WarMedicineApp {
    constructor() {
        this.sections = [];
        this.currentSection = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadData();
    }

    cacheElements() {
        this.sections = document.querySelectorAll('section');
        this.navLinks = document.querySelectorAll('a[href^="#"]');
    }

    bindEvents() {
        // Smooth scrolling for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Intersection Observer for section tracking
        this.initIntersectionObserver();

        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
    }

    scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    initIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.currentSection = entry.target.id;
                        this.onSectionEnter(entry.target);
                    }
                });
            },
            { 
                threshold: 0.3,
                rootMargin: '-10% 0px -10% 0px'
            }
        );

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    onSectionEnter(section) {
        // Add active class to current section
        this.sections.forEach(s => s.classList.remove('active'));
        section.classList.add('active');

        // Trigger section-specific animations
        this.triggerSectionAnimations(section.id);
    }

    triggerSectionAnimations(sectionId) {
        switch(sectionId) {
            case 'scale':
                this.animateCounters('.scale-section .stat-number');
                break;
            case 'map':
                this.animateMap();
                break;
            case 'journey':
                this.animateJourney();
                break;
            // Add more cases for other sections
        }
    }

    animateCounters(selector) {
        const counters = document.querySelectorAll(selector);
        counters.forEach(counter => {
            if (!counter.classList.contains('animated')) {
                this.animateCounter(counter);
                counter.classList.add('animated');
            }
        });
    }

    animateCounter(element, duration = 2000) {
        const target = parseInt(element.dataset.target);
        const isPercentage = target < 100;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                // ФОРМАТИРОВАНИЕ: для героя нужно просто число, а не миллионы
                if (isPercentage) {
                    element.textContent = target + '%';
                } else {
                    // Для героя: обычное число с разделителями
                    element.textContent = target.toLocaleString('ru-RU');
                }
                clearInterval(timer);
            } else {
                if (isPercentage) {
                    element.textContent = Math.floor(current) + '%';
                } else {
                    // Для героя: обычное число при анимации
                    element.textContent = Math.floor(current).toLocaleString('ru-RU');
                }
            }
        }, 16);
    }

    loadData() {
        // Load additional data if needed
        fetch('./assets/data/fronts-data.json')
            .then(response => response.json())
            .then(data => {
                window.frontsData = data;
                this.onDataLoaded(data);
            })
            .catch(error => {
                console.warn('Could not load fronts data:', error);
            });
    }

    onDataLoaded(data) {
        // Initialize components that depend on data
        if (typeof window.initTable === 'function') {
            window.initTable(data);
        }
    }

    handleScroll() {
        // Throttled scroll handling can be added here
    }

    handleResize() {
        // Handle responsive behavior
    }

    animateMap() {
        // Map-specific animations
        console.log('Animating map section');
    }

    animateJourney() {
        // Journey-specific animations
        console.log('Animating journey section');
    }
}

// Global utility functions
function scrollToSection(sectionId) {
    window.app.scrollToSection(sectionId);
}

function shareProject() {
    const shareText = 'Цена Победы: Раненый Солдат - интерактивный проект о подвиге военных медиков в Великой Отечественной войне';
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Цена Победы: Раненый Солдат',
            text: shareText,
            url: shareUrl,
        }).catch(() => {
            fallbackShare(shareUrl);
        });
    } else {
        fallbackShare(shareUrl);
    }
}

function fallbackShare(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Ссылка скопирована в буфер обмена! Поделитесь ею с друзьями.');
    }).catch(() => {
        // Fallback for older browsers
        prompt('Скопируйте эту ссылку чтобы поделиться:', url);
    });
}

// Year accordion functionality
function initYearAccordion() {
    const yearHeaders = document.querySelectorAll('.year-header');

    yearHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const yearItem = this.parentElement;
            const yearContent = yearItem.querySelector('.year-content');
            const toggle = this.querySelector('.year-toggle');

            // Close all other items
            document.querySelectorAll('.year-item').forEach(item => {
                if (item !== yearItem) {
                    item.classList.remove('active');
                    const otherToggle = item.querySelector('.year-toggle');
                    if (otherToggle) otherToggle.textContent = '▶';
                }
            });

            // Toggle current item
            const isActive = yearItem.classList.contains('active');
            yearItem.classList.toggle('active');

            if (isActive) {
                toggle.textContent = '▶';
            } else {
                toggle.textContent = '▼';
            }
        });
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');

    try {
        window.app = new WarMedicineApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }

    initHeroCounters();
    initYearAccordion();
});

function initHeroCounters() {
    const counters = document.querySelectorAll('.hero-stats .stat-number');
    
    if (!counters.length) return;
    
    counters.forEach(counter => {
        if (!counter.classList.contains('animated')) {
            const target = parseInt(counter.dataset.target);
            const isPercentage = target < 100;
            let current = 0;
            const duration = 2000;
            const increment = target / (duration / 16);
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = isPercentage ? target + '%' : target.toLocaleString('ru-RU');
                    clearInterval(timer);
                } else {
                    counter.textContent = isPercentage 
                        ? Math.floor(current) + '%' 
                        : Math.floor(current).toLocaleString('ru-RU');
                }
            }, 16);
            
            counter.classList.add('animated');
        }
    });
}

window.addEventListener('load', initHeroCounters);