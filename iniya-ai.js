document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('iniyaAiModal');
    const fab = document.getElementById('iniyaAiFab');
    const teaserBtn = document.getElementById('iniyaTeaserBtn');
    const closeBtn = document.getElementById('iniyaCloseBtn');
    const clearBtn = document.getElementById('iniyaClearBtn');
    const chatForm = document.getElementById('iniyaForm');
    const chatInput = document.getElementById('iniyaInput');
    const messagesContainer = document.getElementById('iniyaMessages');
    const chipsContainer = document.getElementById('iniyaChips');
    const langToggle = document.getElementById('iniyaLangToggle');
    const subtitleEl = document.getElementById('iniyaSubtitle');
    const welcomeTitleEl = document.getElementById('iniyaWelcomeTitle');
    const welcomeTextEl = document.getElementById('iniyaWelcomeText');
    const privacyNoticeEl = document.getElementById('iniyaPrivacyNotice');

    if (!modal) return;

    let currentLang = 'en';

    const saiKnowledge = {
        name: "Sai Raswanth R.D",
        location: "Pudukkottai, Tamil Nadu, India",
        phone: "+91 6374 691 647",
        email: "sairaswanthdev@gmail.com",
        resume: "resume/resume.pdf",
        github: "https://github.com/mr-sai2005",
        linkedin: "https://www.linkedin.com/in/sai-raswanth-r-d-b94998319"
    };

    const uiTranslations = {
        en: {
            subtitle: "Sai Raswanth's AI Assistant",
            welcomeTitle: "Hi there! I'm <strong>INIYA AI</strong>",
            welcomeText: "I can tell you all about Sai Raswanth's design and code work, or we can chat about any general questions! What's on your mind?",
            privacyNotice: `<i class="fa-solid fa-shield-halved"></i> Privacy Notice: Conversations are temporary & no data is saved anywhere.`,
            inputPlaceholder: "Ask me anything about Sai or any general topic...",
            clearAlert: "Chat history cleared. How can I help you next?",
            chips: [
                { icon: "fa-user", text: "About Sai Raswanth", query: "Who is Sai Raswanth?" },
                { icon: "fa-code", text: "Technical & Design Skills", query: "What are his key skills?" },
                { icon: "fa-briefcase", text: "Featured Projects", query: "Show me his top projects" },
                { icon: "fa-envelope", text: "Contact Credentials", query: "How can I contact him?" },
                { icon: "fa-file-arrow-down", text: "Download Resume", query: "Can I download his resume?" }
            ]
        },
        ta: {
            subtitle: "சாய் ரஸ்வந்துவின் உதவியாளர்",
            welcomeTitle: "வணக்கம்! நான் <strong>இனியா AI</strong>",
            welcomeText: "சாய் ரஸ்வந்துவின் படைப்புகள் பற்றியோ அல்லது வேறு எந்த பொதுவான விஷயங்கள் பற்றியோ என்கிட்ட பேசலாம். என்ன தகவல் வேணும்?",
            privacyNotice: `<i class="fa-solid fa-shield-halved"></i> தனியுரிமை அறிவிப்பு: உரையாடல்கள் தற்காலிகமானவை, எந்தத் தரவும் சேமிக்கப்படாது.`,
            inputPlaceholder: "சாய் பற்றி அல்லது பொதுவான கேள்வி எதையும் கேட்கலாம்...",
            clearAlert: "உரையாடல் அழிக்கப்பட்டது. அடுத்து என்ன உதவி வேணும்?",
            chips: [
                { icon: "fa-user", text: "சாய் ரஸ்வந்த் பற்றி", query: "சாய் ரஸ்வந்த் யார்?" },
                { icon: "fa-code", text: "தொழில்நுட்ப திறன்கள்", query: "அவரது திறன்கள் என்ன?" },
                { icon: "fa-briefcase", text: "சிறந்த திட்டங்கள்", query: "அவரது திட்டங்களை காட்டு" },
                { icon: "fa-envelope", text: "தொடர்பு கொள்ள", query: "அவரை எவ்வாறு தொடர்பு கொள்வது?" },
                { icon: "fa-file-arrow-down", text: "ரெசூம் பதிவிறக்கம்", query: "ரெசூம் பதிவிறக்கம் செய்யலாமா?" }
            ]
        }
    };

    function updateUiLanguage(lang) {
        currentLang = lang;

        if (langToggle) {
            langToggle.querySelectorAll('.iniya-lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
        }

        const t = uiTranslations[lang];
        if (subtitleEl) subtitleEl.innerHTML = t.subtitle;
        if (welcomeTitleEl) welcomeTitleEl.innerHTML = t.welcomeTitle;
        if (welcomeTextEl) welcomeTextEl.innerHTML = t.welcomeText;
        if (privacyNoticeEl) privacyNoticeEl.innerHTML = t.privacyNotice;
        if (chatInput) chatInput.placeholder = t.inputPlaceholder;

        if (chipsContainer) {
            chipsContainer.innerHTML = t.chips.map(c => `
                <button class="iniya-chip" data-question="${c.query}">
                    <i class="fa-solid ${c.icon}"></i> <span class="chip-text">${c.text}</span>
                </button>
            `).join('');
        }
    }

    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.iniya-lang-btn');
            if (btn) {
                const lang = btn.getAttribute('data-lang');
                if (lang !== currentLang) updateUiLanguage(lang);
            }
        });
    }

    function openChat() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        if (chatInput) setTimeout(() => chatInput.focus(), 200);
    }

    function closeChat() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    if (fab) fab.addEventListener('click', openChat);
    if (teaserBtn) teaserBtn.addEventListener('click', openChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeChat();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeChat();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            messagesContainer.innerHTML = '';
            if (chipsContainer) chipsContainer.style.display = 'flex';
            addBotMessage(uiTranslations[currentLang].clearAlert);
        });
    }

    if (chipsContainer) {
        chipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.iniya-chip');
            if (chip) {
                const question = chip.getAttribute('data-question') || chip.textContent.trim();
                handleUserQuery(question);
            }
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            handleUserQuery(text);
        });
    }

    function handleUserQuery(queryText) {
        addUserMessage(queryText);
        if (chipsContainer) chipsContainer.style.display = 'none';
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const responseObj = generateAiResponse(queryText);
            addBotMessage(responseObj.text, responseObj.actions);
            if (responseObj.autoClose) {
                setTimeout(() => {
                    closeChat();
                }, 1300);
            }
        }, 450);
    }

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'iniya-msg iniya-user-msg';
        msgDiv.innerHTML = `<div class="iniya-msg-content">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function addBotMessage(htmlContent, actions = []) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'iniya-msg iniya-bot-msg';

        let actionButtonsHtml = '';
        if (actions && actions.length > 0) {
            actionButtonsHtml = `
                <div class="iniya-msg-actions">
                    ${actions.map(act => `<a href="${act.url}" ${act.url.startsWith('http') || act.url.endsWith('.pdf') ? 'target="_blank"' : ''} class="iniya-action-btn">${act.label}</a>`).join('')}
                </div>
            `;
        }

        msgDiv.innerHTML = `
            <div class="iniya-bot-avatar"><i class="fa-solid fa-circle-nodes"></i></div>
            <div class="iniya-msg-bubble">
                <div class="iniya-msg-content">${htmlContent}</div>
                ${actionButtonsHtml}
            </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        removeTypingIndicator();
        const typingDiv = document.createElement('div');
        typingDiv.id = 'iniyaTyping';
        typingDiv.className = 'iniya-msg iniya-bot-msg iniya-typing-msg';
        typingDiv.innerHTML = `
            <div class="iniya-bot-avatar"><i class="fa-solid fa-circle-nodes"></i></div>
            <div class="iniya-msg-bubble">
                <div class="iniya-typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typing = document.getElementById('iniyaTyping');
        if (typing) typing.remove();
    }

    function scrollToBottom() {
        const chatBody = document.getElementById('iniyaChatBody');
        if (chatBody) {
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function isTamil(text) {
        return /[\u0B80-\u0BFF]/.test(text) || /\b(vanakkam|yar|yaru|yara|yarudai|ennudaiya|thirumanam|thalaivan|valkka|tamil|enatadhu|nandri|epdi|irukinga)\b/i.test(text);
    }

    function generateAiResponse(input) {
        const query = input.toLowerCase().trim();
        const useTamil = currentLang === 'ta' || isTamil(input);

        if (/\b(close|close it|close chat|close chatbot|exit|bye|bye bye|quit|goodbye|மூடு|போயிட்டு வரேன்|பை|முடி|மூடவும்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `மிக்க நன்றி! சாய் ரஸ்வந்துவின் போர்ட்ஃபோலியோவை பார்வையிட்டதற்கு நன்றி. நல்ல நாளாக அமையட்டும்!`,
                    autoClose: true
                };
            }
            return {
                text: `Thank you for visiting Sai Raswanth's portfolio! Have a wonderful day ahead!`,
                autoClose: true
            };
        }

        const mathMatch = query.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
        if (mathMatch) {
            const num1 = parseFloat(mathMatch[1]);
            const op = mathMatch[2];
            const num2 = parseFloat(mathMatch[3]);
            let res = 0;
            if (op === '+') res = num1 + num2;
            else if (op === '-') res = num1 - num2;
            else if (op === '*') res = num1 * num2;
            else if (op === '/') res = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero';

            if (useTamil) return { text: `இதோ விடை: <strong>${num1} ${op} ${num2} = ${res}</strong>` };
            return { text: `Here is the result: <strong>${num1} ${op} ${num2} = ${res}</strong>` };
        }

        if (/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|vanakkam|வணக்கம்|ஹலோ|நமஸ்காரம்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `வணக்கம்! நான் <strong>இனியாக் AI</strong>. சாய் ரஸ்வந்துவின் போர்ட்ஃபோலியோ அல்லது வேறு எந்த விஷயத்தைப் பத்தியும் என்கிட்ட பேசலாம். என்ன தகவல் வேணும்?`,
                    actions: [
                        { label: "தொழில்நுட்ப திறன்கள்", url: "#about" },
                        { label: "திட்டங்களை பார்க்க", url: "#projects" }
                    ]
                };
            }
            return {
                text: `Hi there! I'm <strong>INIYA AI</strong>. I can tell you all about Sai Raswanth's work, or we can chat about general topics too! What's on your mind today?`,
                actions: [
                    { label: "Technical Skills", url: "#about" },
                    { label: "Featured Projects", url: "#projects" }
                ]
            };
        }

        if (/\b(how are you|how do you do|epdi irukinga|எப்படி இருக்கிறீர்கள்|நலமா|சௌக்கியமா)\b/.test(query)) {
            if (useTamil) {
                return { text: `நான் சூப்பரா இருக்கேன்! நீங்க எப்படி இருக்கீங்க? உங்களுக்கு என்ன உதவி வேணும்னு சொல்லுங்க.` };
            }
            return { text: `I'm doing great, thanks for asking! How are you doing today? Let me know how I can help!` };
        }

        if (/\b(time|date|today|clock|நேரம்|நாள்|இன்று)\b/.test(query)) {
            const now = new Date();
            const dateStr = now.toLocaleDateString(useTamil ? 'ta-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString(useTamil ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });

            if (useTamil) return { text: `இன்னைக்கு நாள்: <strong>${dateStr}</strong><br>இப்ப நேரம்: <strong>${timeStr}</strong>` };
            return { text: `Today is <strong>${dateStr}</strong> and the current time is <strong>${timeStr}</strong>.` };
        }

        if (/\b(who is sai|about sai|profile|bio|sai|raswanth|background|identity|யார்|பற்றி|விவரம்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>${saiKnowledge.name}</strong> ஒரு திறமையான <strong>கிராஃபிக் டிசைனர், வெப் டெவலப்பர் மற்றும் ஜாவா நிபுணர்</strong>. இவர் புதுக்கோட்டையைச் சேர்ந்தவர்.<br><br>CorelDraw, Photoshop மூலமா அழகான டிசைன்களையும், HTML, CSS, JavaScript மூலமா லேட்டஸ்ட் இணையதளங்களையும் உருவாக்குறாரு!`,
                    actions: [
                        { label: "ரெசூம் பதிவிறக்கம்", url: saiKnowledge.resume },
                        { label: "தொடர்பு கொள்ள", url: "#connect" }
                    ]
                };
            }
            return {
                text: `<strong>${saiKnowledge.name}</strong> is a Graphic Designer, Web Developer, and Java Specialist based in ${saiKnowledge.location}.<br><br>He loves combining creative design (using CorelDraw and Photoshop) with clean code (HTML, CSS, JS, and Java) to build responsive web interfaces and brand identities.`,
                actions: [
                    { label: "Download Resume PDF", url: saiKnowledge.resume },
                    { label: "Contact Sai", url: "#connect" }
                ]
            };
        }

        if (/\b(skill|skills|tech|stack|technology|java|html|css|javascript|coreldraw|photoshop|design|tools|languages|திறன்|திறன்கள்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>${saiKnowledge.name}</strong> அவர்களின் முக்கிய திறன்கள்:<br><br>
                    • <strong>கிராஃபிக் டிசைன்:</strong> CorelDraw & Photoshop (போஸ்டர், லோகோ, பிராண்டிங் டிசைன்கள்)<br>
                    • <strong>வெப் டெவலப்மென்ட்:</strong> HTML5, CSS3, JavaScript (நவீன ரெஸ்பான்சிவ் டிசைன்)<br>
                    • <strong>ஜாவா புரோகிராமிங்:</strong> Java & Object-Oriented System Architecture`,
                    actions: [{ label: "திட்டங்களை காண்க", url: "#projects" }]
                };
            }
            return {
                text: `Sai is skilled in:<br><br>
                • <strong>Graphic Design:</strong> CorelDraw & Photoshop (branding, posters, visual identities)<br>
                • <strong>Web Development:</strong> HTML5, CSS3, JavaScript (modern responsive UI/UX)<br>
                • <strong>Software Development:</strong> Java & Object-Oriented System Architecture`,
                actions: [{ label: "Explore Projects Grid", url: "#projects" }]
            };
        }

        if (/\b(web development|what is html|what is css|what is javascript|what is web design|வெப் டெவலப்மென்ட்|இணையதளம்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>வெப் டெவலப்மென்ட் (Web Development)</strong> என்பது இணையதளங்களை உருவாக்கும் கலையாகும்:<br><br>
                    • <strong>HTML:</strong> இணையதளத்தின் எலும்புக்கூடு (Structure)<br>
                    • <strong>CSS:</strong> இணையதளத்தின் தோற்றம் மற்றும் வண்ணம் (Design & Styling)<br>
                    • <strong>JavaScript:</strong> இணையதளத்தின் மூளை (Logic & Interactivity)`,
                    actions: [{ label: "சாயோட வெப் திட்டங்கள்", url: "#projects" }]
                };
            }
            return {
                text: `<strong>Web Development</strong> is all about building websites:<br><br>
                • <strong>HTML:</strong> Defines the main structure of a web page.<br>
                • <strong>CSS:</strong> Makes it look beautiful with layout, fonts, and colors.<br>
                • <strong>JavaScript:</strong> Adds interactive features and logic so users can chat and interact!`,
                actions: [{ label: "View Web Projects", url: "#projects" }]
            };
        }

        if (/\b(graphic design|what is graphic design|photoshop|coreldraw|poster design|branding|கிராஃபிக்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>கிராஃபிக் டிசைன் (Graphic Design)</strong> என்பது கருத்துக்களை படங்களாகவும் வண்ணங்களாகவும் அழகாக மாற்றும் கலையாகும்.<br><br>சாய் ரஸ்வந்த் CorelDraw மற்றும் Photoshop பயன்படுத்தி லோகோக்கள், போஸ்டர்கள் மற்றும் விளம்பர டிசைன்களை சிறப்பா உருவாக்குறாரு!`,
                    actions: [{ label: "கிராஃபிக் டிசைன்களை காண்க", url: "#projects" }]
                };
            }
            return {
                text: `<strong>Graphic Design</strong> is the art of visually communicating ideas using graphics, fonts, and layouts.<br><br>Sai uses tools like CorelDraw and Photoshop to design eye-catching posters, logos, and corporate brand graphics.`,
                actions: [{ label: "Explore Graphic Works", url: "#projects" }]
            };
        }

        if (/\b(what is java|java programming|object oriented|ஜாவா)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>ஜாவா (Java)</strong> என்பது உலகளவில் பிரபலமான மென்பொருள் நிரலாக்க மொழியாகும் (Programming Language).<br><br>இது ஆண்ட்ராய்டு ஆப்ஸ் மற்றும் பெரிய நிறுவனங்களின் மென்பொருள்களை உருவாக்க பயன்படுகிறது.`,
                    actions: [{ label: "சாய் பற்றிய சுயவிவரம்", url: "#about" }]
                };
            }
            return {
                text: `<strong>Java</strong> is one of the most popular programming languages in the world. It's safe, fast, and used to build everything from mobile Android apps to big corporate backend systems!`,
                actions: [{ label: "View Technical Profile", url: "#about" }]
            };
        }

        if (/\b(what is ai|artificial intelligence|what are you|iniya|செயற்கை நுண்ணறிவு|நீ யார்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>செயற்கை நுண்ணறிவு (AI)</strong> என்பது கணினிகள் மனிதர்களைப் போல சிந்தித்து பதிலளிக்கும் தொழில்நுட்பமாகும்.<br><br>நான் (இனியா AI) சாய் ரஸ்வந்துவின் போர்ட்ஃபோலியோ மற்றும் உங்கள் சந்தேகங்களுக்கு பதிலளிக்க உருவாக்கப்பட்ட டிஜிட்டல் உதவியாளர்!`,
                    actions: [{ label: "சாய் ரஸ்வந்த் பற்றி", url: "#about" }]
                };
            }
            return {
                text: `<strong>Artificial Intelligence (AI)</strong> allows computer systems to learn, think, and chat naturally like humans.<br><br>I'm <strong>INIYA AI</strong>, built to help visitors explore Sai Raswanth's work and answer general questions!`,
                actions: [{ label: "About Sai Raswanth", url: "#about" }]
            };
        }

        if (/\b(project|projects|work|works|portfolio|website|app|design|poster|showcase|திட்டம்|திட்டங்கள்|படைப்புகள்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `<strong>${saiKnowledge.name}</strong> அவர்களின் சிறந்த படைப்புகள்:<br><br>
                    • <strong>செந்தூரன் கல்லூரி போர்டல்:</strong> கல்லூரி மாணவர்களுக்கான வலைத்தளம்.<br>
                    • <strong>போஸ்டர் & பிராண்டிங் டிசைன்கள்:</strong> பொங்கல் விழா போஸ்டர், ஐஸ்கிரீம் விளம்பரம், போலரைஸ் பிராண்ட் டிசைன்.<br>
                    • <strong>கிராஃபிக் போர்ட்ஃபோலியோ:</strong> உயர் தர கிராஃபிக் வடிவமைப்புகள்.`,
                    actions: [{ label: "படைப்புகளை பார்க்க", url: "#projects" }]
                };
            }
            return {
                text: `Here are some of Sai's featured projects:<br><br>
                • <strong>Chendhuran College Portal:</strong> Comprehensive academic web portal.<br>
                • <strong>Graphic Design Series:</strong> Event posters, brand campaigns, and product advertisements.<br>
                • <strong>Polarize Identity:</strong> Modern brand identity and room mockups.`,
                actions: [{ label: "View Portfolio Works", url: "#projects" }]
            };
        }

        if (/\b(resume|cv|biodata|download|document|ரெசூம்|பயோடேட்டா)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `சாயோட ரெசூமை கீழே உள்ள பட்டனை கிளிக் பண்ணி சுலபமா டவுன்லோட் பண்ணிக்கலாம்:`,
                    actions: [{ label: "ரெசூம் பதிவிறக்கம் (PDF)", url: saiKnowledge.resume }]
                };
            }
            return {
                text: `Sure thing! You can view or download Sai's official resume directly:`,
                actions: [{ label: "Download Resume (PDF)", url: saiKnowledge.resume }]
            };
        }

        if (/\b(contact|hire|email|phone|whatsapp|address|location|reach|social|linkedin|github|instagram|topmate|தொடர்பு|போன்|மின்னஞ்சல்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `சாயை சுலபமா தொடர்பு கொள்ள:<br><br>
                    • <strong>மின்னஞ்சல்:</strong> <a href="mailto:${saiKnowledge.email}">${saiKnowledge.email}</a><br>
                    • <strong>போன் / வாட்ஸ்அப்:</strong> ${saiKnowledge.phone}<br>
                    • <strong>இருப்பிடம்:</strong> ${saiKnowledge.location}`,
                    actions: [
                        { label: "நேரடி படிவம்", url: "#connect" },
                        { label: "LinkedIn", url: saiKnowledge.linkedin },
                        { label: "GitHub", url: saiKnowledge.github }
                    ]
                };
            }
            return {
                text: `You can easily reach Sai here:<br><br>
                • <strong>Email:</strong> <a href="mailto:${saiKnowledge.email}">${saiKnowledge.email}</a><br>
                • <strong>Phone / WhatsApp:</strong> ${saiKnowledge.phone}<br>
                • <strong>Location:</strong> ${saiKnowledge.location}`,
                actions: [
                    { label: "Direct Hiring Form", url: "#connect" },
                    { label: "LinkedIn Profile", url: saiKnowledge.linkedin },
                    { label: "GitHub Profile", url: saiKnowledge.github }
                ]
            };
        }

        if (/\b(thanks|thank|awesome|cool|great|nice|good|wonderful|நன்றி|Super|சூப்பர்)\b/.test(query)) {
            if (useTamil) {
                return {
                    text: `மிக்க நன்றி! சாய் கிட்ட நேரடியா பேச விரும்பினா கீழே உள்ள படிவத்தை பயன்படுத்துங்க.`,
                    actions: [{ label: "தொடர்பு படிவம்", url: "#connect" }]
                };
            }
            return {
                text: `You're very welcome! Feel free to browse through the portfolio or reach out directly to Sai!`,
                actions: [{ label: "Hiring Form", url: "#connect" }]
            };
        }

        if (useTamil) {
            return {
                text: `நீங்கள் கேட்டது <strong>"${escapeHtml(input)}"</strong>.<br><br>நான் சாய் ரஸ்வந்துவின் படைப்புகள், வெப் டெவலப்மென்ட், கிராஃபிக் டிசைன் மற்றும் பொதுவான கேள்விகளுக்கு உதவ தயாரா இருக்கேன்! கீழே உள்ள விருப்பங்களையும் கிளிக் பண்ணலாம்:`,
                actions: [
                    { label: "சாய் பற்றி", url: "#about" },
                    { label: "திறன்கள்", url: "#about" },
                    { label: "திட்டங்கள்", url: "#projects" },
                    { label: "ரெசூம்", url: saiKnowledge.resume },
                    { label: "தொடர்புகளுக்கு", url: "#connect" }
                ]
            };
        }

        return {
            text: `I got your question about <strong>"${escapeHtml(input)}"</strong>.<br><br>I can help you explore Sai's work, skills, resume, or chat about tech & design concepts. Pick a quick option below or ask me anything else!`,
            actions: [
                { label: "About Sai", url: "#about" },
                { label: "Technical Skills", url: "#about" },
                { label: "Featured Projects", url: "#projects" },
                { label: "Download Resume", url: saiKnowledge.resume },
                { label: "Contact Details", url: "#connect" }
            ]
        };
    }
    updateUiLanguage('en');
});
