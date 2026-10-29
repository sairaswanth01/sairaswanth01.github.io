function startPreloaderSequence() {
    const preloader = document.getElementById('preloader');
    const percentage = document.getElementById('preloader-percentage');
    const progressTrack = document.querySelector('.preloader-progress-track');
    const progressFill = document.getElementById('preloader-progress-fill');
    if (!preloader || !percentage || !progressTrack || !progressFill) return;

    let progress = 0;
    let pageLoaded = document.readyState === 'complete';
    let loadStartedAt = 0;
    const startedAt = performance.now();

    function updateProgress() {
        const now = performance.now();

        if (pageLoaded) {
            if (!loadStartedAt) loadStartedAt = now;
            const loadProgress = Math.min((now - loadStartedAt) / 400, 1);
            progress = 90 + loadProgress * 10;
        } else {
            progress = Math.min((now - startedAt) / 1600 * 90, 90);
        }

        const displayedProgress = Math.floor(progress);
        percentage.textContent = `${displayedProgress}%`;
        percentage.setAttribute('aria-label', `Loading ${displayedProgress}%`);
        progressFill.style.width = `${displayedProgress}%`;
        progressTrack.setAttribute('aria-valuenow', String(displayedProgress));

        if (progress < 100) {
            requestAnimationFrame(updateProgress);
            return;
        }

        percentage.textContent = '100%';
        percentage.setAttribute('aria-label', 'Loading complete');
        progressFill.style.width = '100%';
        progressTrack.setAttribute('aria-valuenow', '100');
        setTimeout(() => {
            preloader.classList.add('preloader-show-welcome');
            setTimeout(() => {
                preloader.classList.add('preloader-hide');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 950);
            }, 1900);
        }, 250);
    }

    window.addEventListener('load', () => {
        pageLoaded = true;
    }, { once: true });

    requestAnimationFrame(updateProgress);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPreloaderSequence, { once: true });
} else {
    startPreloaderSequence();
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

    const footerProjectsLink = document.querySelector('.footer-nav-links a[href="#projects"]');
    const projectsSection = document.getElementById('projects');

    if (footerProjectsLink && projectsSection) {
        footerProjectsLink.addEventListener('click', event => {
            event.preventDefault();
            window.history.pushState(null, '', '#projects');
            window.scrollTo({
                top: projectsSection.getBoundingClientRect().top + window.scrollY,
                behavior: 'instant'
            });
        });
    }

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
    const projectGrid = document.querySelector('.projects-grid');

    if (filterBtns.length > 0 && projectGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectGrid.querySelectorAll('.project-card').forEach(card => {
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

const certificateLinks = document.querySelectorAll(".achievement-certificate-link");
const certificateModal = document.getElementById("certificateModal");
const certificateImage = document.getElementById("certificateImage");
const certificateCounter = document.getElementById("certificateCounter");
const certificateClose = document.getElementById("certificateClose");
const certificatePrev = document.getElementById("certificatePrev");
const certificateNext = document.getElementById("certificateNext");
const certificateShare = document.getElementById("certificateShare");
const certificateShareStatus = document.getElementById("certificateShareStatus");

if (certificateModal && certificateImage && certificateCounter && certificateLinks.length) {
    let currentIndex = 0;

    function showCertificate(index) {
        currentIndex = (index + certificateLinks.length) % certificateLinks.length;
        certificateImage.src = certificateLinks[currentIndex].href;
        certificateCounter.textContent = `${currentIndex + 1} / ${certificateLinks.length}`;
        if (certificateShareStatus) certificateShareStatus.textContent = "";
    }

    function closeCertificate() {
        certificateModal.classList.remove("active");
        certificateModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    async function copyCertificateLink() {
        const certificateUrl = certificateLinks[currentIndex].href;

        try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
            await navigator.clipboard.writeText(certificateUrl);
        } catch {
            const temporaryInput = document.createElement("textarea");
            temporaryInput.value = certificateUrl;
            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";
            document.body.appendChild(temporaryInput);
            temporaryInput.select();
            const copied = document.execCommand("copy");
            temporaryInput.remove();
            if (certificateShareStatus) {
                certificateShareStatus.textContent = copied
                    ? "Certificate link copied."
                    : "Unable to copy the certificate link.";
            }
            return;
        }

        if (certificateShareStatus) certificateShareStatus.textContent = "Certificate link copied.";
    }

    certificateLinks.forEach((link, index) => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showCertificate(index);
            certificateModal.classList.add("active");
            certificateModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            if (typeof gtag === "function") {
                gtag("event", "certificate_view", {
                    certificate_name: link.getAttribute("aria-label") || link.href
                });
            }
        });
    });

    certificatePrev?.addEventListener("click", () => showCertificate(currentIndex - 1));
    certificateNext?.addEventListener("click", () => showCertificate(currentIndex + 1));
    certificateClose?.addEventListener("click", closeCertificate);
    certificateShare?.addEventListener("click", copyCertificateLink);

    certificateModal.addEventListener("click", event => {
        if (event.target === certificateModal) closeCertificate();
    });

    document.addEventListener("keydown", event => {
        if (!certificateModal.classList.contains("active")) return;
        if (event.key === "Escape") closeCertificate();
        if (event.key === "ArrowLeft") showCertificate(currentIndex - 1);
        if (event.key === "ArrowRight") showCertificate(currentIndex + 1);
    });
}
