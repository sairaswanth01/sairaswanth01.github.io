function dismissPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('preloader-hide')) {
        preloader.classList.add('preloader-hide');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }
}
// ================= SKILLS PROGRESS ANIMATION =================

const skillSection = document.querySelector(".skills-section");
const skillProgressBars = document.querySelectorAll(".skill-progress");

const skillsObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                skillProgressBars.forEach((bar) => {

                    const progress = bar.getAttribute("data-progress");

                    bar.style.width = `${progress}%`;

                });

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.2
    }
);

if (skillSection) {
    skillsObserver.observe(skillSection);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(dismissPreloader, 1700);
});

window.addEventListener('load', () => {
    setTimeout(dismissPreloader, 1700);
});

document.addEventListener('DOMContentLoaded', () => {
    const bgVideo = document.querySelector('.bg-video');
    if (bgVideo) {
    }

    const roles = ["Graphic Designer", "Web Developer", "Java Developer"];
    const typingTextElement = document.querySelector('.typing-text');

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingTextElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingTextElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    if (typingTextElement) {
        setTimeout(typeEffect, 1000);
    }

    const navItems = document.querySelectorAll('.floating-nav .nav-links li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const videos = document.querySelectorAll('video');
    const isSlowConnection = navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === 'slow-2g');
    
    if (isSlowConnection) {
        videos.forEach(v => {
            v.pause();
            v.removeAttribute('autoplay');
        });
    } else if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(() => {});
                } else {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.15 });

        videos.forEach(v => videoObserver.observe(v));
    }

    const floatingNav = document.querySelector('.floating-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuToggleIcon = document.querySelector('.menu-toggle i');
    const socialSidebar = document.querySelector('.social-sidebar');
    const socialToggle = document.querySelector('.social-toggle');
    const socialToggleIcon = document.querySelector('.social-toggle i');

    let ticking = false;
    function handleScroll() {
        const isMobile = window.innerWidth <= 768;
        const scrollY = window.scrollY;

        if (floatingNav) {
            if (isMobile) {
                if (scrollY > 50) {
                    floatingNav.classList.add('shrink');
                } else {
                    floatingNav.classList.remove('shrink', 'open');
                    if (menuToggleIcon) menuToggleIcon.className = 'fa-solid fa-bars';
                }
            } else {
                floatingNav.classList.remove('shrink', 'open');
            }
        }

        if (socialSidebar) {
            if (isMobile) {
                if (scrollY > 50) {
                    socialSidebar.classList.add('shrink');
                } else {
                    socialSidebar.classList.remove('shrink', 'open');
                    if (socialToggleIcon) socialToggleIcon.className = 'fa-solid fa-share-nodes';
                }
            } else {
                socialSidebar.classList.remove('shrink', 'open');
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    if (menuToggle && floatingNav) {
        menuToggle.addEventListener('click', () => {
            floatingNav.classList.toggle('open');
            if (menuToggleIcon) {
                menuToggleIcon.className = floatingNav.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768 && floatingNav) {
                floatingNav.classList.remove('open');
                if (menuToggleIcon) menuToggleIcon.className = 'fa-solid fa-bars';
            }
        });
    });

    if (socialToggle && socialSidebar) {
        socialToggle.addEventListener('click', () => {
            socialSidebar.classList.toggle('open');
            if (socialToggleIcon) {
                socialToggleIcon.className = socialSidebar.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-share-nodes';
            }
        });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        let cursorTicking = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

            if (!cursorTicking) {
                requestAnimationFrame(updateCursorOutline);
                cursorTicking = true;
            }
        }, { passive: true });

        function updateCursorOutline() {
            outlineX += (mouseX - outlineX) * 0.2;
            outlineY += (mouseY - outlineY) * 0.2;
            cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;

            if (Math.abs(mouseX - outlineX) > 0.1 || Math.abs(mouseY - outlineY) > 0.1) {
                requestAnimationFrame(updateCursorOutline);
            } else {
                cursorTicking = false;
            }
        }

        document.addEventListener('mouseover', (e) => {
            const clickable = e.target.closest('a, button, input, select, textarea, .menu-toggle, .social-toggle, .spinning-badge, .project-separator, .btn, .social-icon, .filter-btn, .project-card, .project-link, .iniya-chip, .iniya-action-btn, .iniya-header-btn, .iniya-fab, .chatbot-teaser');
            if (clickable) {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(255, 107, 0, 0.15)';
                cursorOutline.style.borderColor = 'var(--accent-color)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const clickable = e.target.closest('a, button, input, select, textarea, .menu-toggle, .social-toggle, .spinning-badge, .project-separator, .btn, .social-icon, .filter-btn, .project-card, .project-link, .iniya-chip, .iniya-action-btn, .iniya-header-btn, .iniya-fab, .chatbot-teaser');
            if (clickable) {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorOutline.style.borderColor = 'var(--accent-color)';
            }
        });
    }
});

const likeBtn = document.getElementById("likeBtn");
const likes = document.getElementById("likes");

let liked = false;
let count = 248;

if (likeBtn) {
    likeBtn.addEventListener("click", () => {
        if(!liked){
            count++;
            likeBtn.innerHTML = `💙 <span id="likes">${count}</span> Liked`;
            liked = true;
        }else{
            count--;
            likeBtn.innerHTML = `❤️ <span id="likes">${count}</span> Likes`;
            liked = false;
        }
    });
}
