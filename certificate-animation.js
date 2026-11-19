(() => {
    function initializeCertificateCylinder() {
        const section = document.getElementById('certifications');
        const track = section && section.querySelector('.certifications-container');
        const component = section && section.querySelector('[data-certificate-cylinder]');
        const indexLabel = section && section.querySelector('.certificate-cylinder-index');
        const nameLabel = section && section.querySelector('.certificate-cylinder-label-name');
        const dotsList = section && section.querySelector('.certificate-cylinder-dots');
        const cards = track ? Array.from(track.querySelectorAll('.achievement-card')) : [];

        if (!section || !component || !track || cards.length < 2 ||
            !indexLabel || !nameLabel || !dotsList || !window.gsap || !window.ScrollTrigger ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const lastIndex = cards.length - 1;
        const step = 360 / cards.length;
        let currentIndex = -1;
        let labelTween;
        let timeline;

        const titles = cards.map(card => {
            const title = card.querySelector('.achievement-content h3');
            return title ? title.textContent.trim() : 'Achievement';
        });

        const dots = cards.map((card, index) => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `Show ${titles[index]}`);
            button.addEventListener('click', () => {
                const trigger = timeline && timeline.scrollTrigger;
                if (!trigger) return;

                window.scrollTo({
                    top: trigger.start + (trigger.end - trigger.start) * (index / lastIndex),
                    behavior: 'smooth'
                });
            });
            item.appendChild(button);
            dotsList.appendChild(item);
            return button;
        });

        function update(index, immediate) {
            if (index === currentIndex) return;
            currentIndex = index;

            cards.forEach((card, cardIndex) => {
                const inactive = cardIndex !== index;
                card.inert = inactive;
                card.setAttribute('aria-hidden', String(inactive));
            });

            dots.forEach((dot, dotIndex) => {
                if (dotIndex === index) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });

            indexLabel.textContent =
                `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;

            if (immediate) {
                nameLabel.textContent = titles[index];
                return;
            }

            labelTween && labelTween.kill();
            labelTween = gsap.timeline()
                .to(nameLabel, {
                    autoAlpha: 0,
                    yPercent: -110,
                    duration: 0.15,
                    ease: 'power2.in',
                    onComplete: () => {
                        nameLabel.textContent = titles[index];
                    }
                })
                .fromTo(nameLabel, { autoAlpha: 0, yPercent: 110 }, {
                    autoAlpha: 1,
                    yPercent: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    clearProps: 'transform'
                });
        }

        function setCylinderRadius() {
            const radius = (track.offsetHeight / 2 + 12) / Math.tan((step * Math.PI) / 360);
            gsap.set([track, ...cards], { transformOrigin: `50% 50% ${-radius}px` });
        }

        section.classList.add('is-cylinder-active');
        setCylinderRadius();
        gsap.set(cards, {
            rotationX: index => -index * step,
            opacity: index => index === 0 ? 1 : 0.3
        });
        update(0, true);

        timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => `+=${window.innerHeight * lastIndex * 0.9}`,
                pin: section,
                scrub: 1,
                snap: {
                    snapTo: 1 / lastIndex,
                    inertia: false,
                    duration: { min: 0.25, max: 0.75 },
                    ease: 'power2.inOut'
                },
                invalidateOnRefresh: true,
                onRefreshInit: setCylinderRadius,
                onUpdate: self => update(Math.round(self.progress * lastIndex), false)
            }
        });

        timeline.to(track, { rotationX: lastIndex * step, duration: lastIndex }, 0);
        cards.forEach((card, index) => {
            if (index > 0) timeline.to(card, { opacity: 1, duration: 1 }, index - 1);
            if (index < lastIndex) timeline.to(card, { opacity: 0.3, duration: 1 }, index);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCertificateCylinder, { once: true });
    } else {
        initializeCertificateCylinder();
    }
})();
