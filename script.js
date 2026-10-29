document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 280 * dpr;
    canvas.height = 320 * dpr;
    ctx.scale(dpr, dpr);

    let mouse = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let blink = 0;
    let time = 0;
    let clickCount = 0;
    let lastClick = 0;
    let angryUntil = 0;
    let collapseUntil = 0;
    let laughUntil = 0;
    let mouthMode = 'smile';
    let mouthUntil = 0;
    let isRedirecting = false;

    const updateTarget = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        target.x = (clientX - cx) / (rect.width / 2);
        target.y = (clientY - cy) / (rect.height / 2);
    };

    canvas.addEventListener('mousemove', (e) => {
        updateTarget(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseleave', () => {
        target.x = 0;
        target.y = 0;
    });

    function draw() {
        time += 0.05;

        mouse.x += (target.x - mouse.x) * 0.1;
        mouse.y += (target.y - mouse.y) * 0.1;

        const w = 280;
        const h = 320;
        const cx = w / 2;
        const cy = h / 2 + 20;

        ctx.clearRect(0, 0, w, h);

        const now = Date.now();

        if (now < collapseUntil) {
            canvas.style.opacity = '0';
            requestAnimationFrame(draw);
            return;
        }

        canvas.style.opacity = '1';

        const isAngry = now < angryUntil;
        const isLaughing = now < laughUntil;

        canvas.classList.toggle('robot-canvas-angry', isAngry);

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(
            cx,
            cy + 90,
            40 + Math.sin(time) * 5,
            10,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        const floatY = Math.sin(time) * 8;

        const bodyX = cx + mouse.x * 5;
        const bodyY = cy + floatY + 30;

        const bodyGrad = ctx.createRadialGradient(
            bodyX - 20, bodyY - 20, 10,
            bodyX, bodyY, 60
        );

        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(1, '#d1d9e6');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(bodyX, bodyY, 50, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        const logoX = bodyX + mouse.x * 10;
        const logoY = bodyY + mouse.y * 5;

        ctx.fillStyle = '#25d366';
        ctx.beginPath();
        ctx.arc(logoX, logoY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(logoX - 3, logoY - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        const headX = cx + mouse.x * 25;
        const headY = cy + floatY - 50 + mouse.y * 15;

        const headGrad = ctx.createRadialGradient(
            headX - 30, headY - 20, 20,
            headX, headY, 80
        );

        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(1, '#cbd5e1');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.roundRect(headX - 60, headY - 45, 120, 90, 40);
        ctx.fill();

        const faceX = headX + mouse.x * 10;
        const faceY = headY + mouse.y * 8;
        const faceHeight = 60;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(
            faceX - 45,
            faceY - faceHeight / 2,
            90,
            faceHeight,
            22
        );
        ctx.fill();

        if (Math.random() > 0.98) blink = 1;
        if (blink > 0) blink -= 0.2;

        const eyeY = faceY + mouse.y * 5 - 2;
        const eyeColor = isAngry ? '#ff4d4d' : '#25d366';

        ctx.fillStyle = eyeColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = eyeColor;

        if (blink <= 0.2) {
            ctx.beginPath();
            ctx.ellipse(
                faceX - 22 + mouse.x * 5,
                eyeY, 7, 10, 0, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(
                faceX + 22 + mouse.x * 5,
                eyeY, 7, 10, 0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.shadowBlur = 0;

        if (Date.now() > mouthUntil) {
            mouthMode = 'smile';
        }

        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 4;

        const mouthFloat = mouse.y * 6;
        const baseY = faceY + 14 + mouthFloat;

        if (mouthMode === 'sad') {
            ctx.beginPath();
            ctx.moveTo(faceX - 18, baseY + 8);
            ctx.quadraticCurveTo(
                faceX, baseY - 2,
                faceX + 18, baseY + 8
            );
            ctx.stroke();
        } else if (mouthMode === 'wow') {
            ctx.beginPath();
            ctx.arc(faceX, baseY + 4, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (mouthMode === 'oh') {
            ctx.beginPath();
            ctx.arc(faceX, baseY + 4, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            const smileDepth =
                (isLaughing ? 12 : 8) + Math.abs(mouse.y * 4);

            ctx.beginPath();
            ctx.moveTo(faceX - 18, baseY);
            ctx.quadraticCurveTo(
                faceX, baseY + smileDepth,
                faceX + 18, baseY
            );
            ctx.stroke();
        }

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.moveTo(headX - 40, headY - 40);
        ctx.lineTo(headX - 55, headY - 65);
        ctx.moveTo(headX + 40, headY - 40);
        ctx.lineTo(headX + 55, headY - 65);
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();

    canvas.addEventListener('click', () => {
        if (isRedirecting) return;

        const now = Date.now();

        if (now - lastClick > 1500) {
            clickCount = 0;
        }

        clickCount += 1;
        lastClick = now;

        // FIRST CLICK: Normal robot reaction
        if (clickCount === 1) {
            laughUntil = now + 1200;
            mouthMode = 'smile';
            mouthUntil = now + 1200;

            emitBubbles(4);
            emitPop("Let's Connect", 1500);

            canvas.classList.remove('robot-canvas-fun');
            void canvas.offsetWidth;
            canvas.classList.add('robot-canvas-fun');

            setTimeout(() => {
                canvas.classList.remove('robot-canvas-fun');
            }, 600);

            return;
        }

        // SECOND CLICK: Collapse and redirect
        if (clickCount >= 2) {
            isRedirecting = true;
            clickCount = 0;

            mouthMode = 'oh';
            mouthUntil = now + 1400;

            collapseUntil = now + 1200;

            canvas.classList.add('robot-canvas-collapse');

            emitBubbles(18, 'burst');
            emitPop("Let's Connect!", 1200);

            setTimeout(() => {
                canvas.classList.remove('robot-canvas-collapse');
                canvas.classList.remove('robot-canvas-reappear');

                // Keep the original reappearance animation
                void canvas.offsetWidth;
                canvas.classList.add('robot-canvas-reappear');

                emitBubbles(14, 'burst');

                setTimeout(() => {
                    canvas.classList.remove('robot-canvas-reappear');
                }, 600);

                // Redirect to the contact section
                const contactSection = document.querySelector('#connect');

                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    console.warn(
                        "Contact section not found. Add id='contact' to your section."
                    );
                }

                // Allow interaction again after the transition
                setTimeout(() => {
                    isRedirecting = false;
                }, 800);

            }, 1200);
        }
    });

    function emitPop(text, duration) {
        const card = canvas.closest('.robot-card');
        if (!card) return;

        const pop = document.createElement('span');
        pop.className = 'robot-pop';
        pop.textContent = text;

        card.appendChild(pop);

        setTimeout(() => pop.remove(), duration || 1200);
    }

    function emitBubbles(count, tone) {
        const card = canvas.closest('.robot-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.48;

        for (let i = 0; i < count; i += 1) {
            const bubble = document.createElement('span');

            bubble.className =
                tone === 'angry'
                    ? 'robot-bubble robot-bubble-angry'
                    : 'robot-bubble';

            if (tone === 'burst') {
                const angle =
                    (Math.PI * 2 * i) / count + Math.random() * 0.2;

                bubble.style.left =
                    `${centerX + Math.cos(angle) * radius}px`;

                bubble.style.top =
                    `${centerY + Math.sin(angle) * radius}px`;
            } else {
                bubble.style.left = `${40 + Math.random() * 40}%`;
                bubble.style.top = `${30 + Math.random() * 40}%`;
            }

            bubble.style.width = `${8 + Math.random() * 8}px`;
            bubble.style.height = bubble.style.width;

            card.appendChild(bubble);

            setTimeout(() => bubble.remove(), 900);
        }
    }
});
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
