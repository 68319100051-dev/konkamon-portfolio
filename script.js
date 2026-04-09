// Initialize Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            
            // Trigger counter animation if it's a counter
            if (entry.target.classList.contains('counter')) {
                animateCounter(entry.target);
            }
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 16);
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
    // 1. Scroll Animations & Counters
    const animatableElements = document.querySelectorAll(".project-card, .projects h2, .skills h2, .skill-item, .contact h2, .timeline-item, .journey h2, .counter");
    animatableElements.forEach(el => {
        if (el) {
            if (!el.classList.contains('counter')) {
                el.style.opacity = "0";
                el.style.transform = "translateY(30px)";
            }
            el.style.transition = "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
            observer.observe(el);
        }
    });

    // 2. Heatmap Generation
    generateHeatmap();

    // 3. Logo hover effect
    const logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("mouseenter", () => {
            logo.style.transform = "scale(1.1) rotate(-5deg)";
            logo.style.transition = "0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        });
        logo.addEventListener("mouseleave", () => {
            logo.style.transform = "scale(1) rotate(0deg)";
        });
    }

    // 4. Initial Chat Suggestions
    setTimeout(renderSuggestions, 1500);

    // 5. Cursor Glow
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // 6. Particle Background
    if (typeof initParticles === 'function') initParticles();
    if (typeof animateParticles === 'function') animateParticles();

    // 7. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});

function generateHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    // 52 weeks * 7 days = 364 cells
    for (let i = 0; i < 364; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        // Randomize activity level for visual effect
        const random = Math.random();
        let level = 0;
        if (random > 0.9) level = 3;
        else if (random > 0.7) level = 2;
        else if (random > 0.4) level = 1;
        
        cell.classList.add(`level-${level}`);
        
        // Tooltip simulation
        cell.title = `Activity Level: ${level}`;
        
        container.appendChild(cell);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Modal Logic
const overlay = document.getElementById('modal-overlay');
function openModal(projectId) {
    const modal = document.getElementById(`modal-${projectId}`);
    if (overlay && modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
function closeModal() {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) activeModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}
if (overlay) overlay.addEventListener('click', closeModal);
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Particle Background Logic
const canvas = document.getElementById('particle-canvas');
let particles = [];
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0; else if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0; else if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    window.initParticles = () => {
        particles = [];
        for (let i = 0; i < 80; i++) particles.push(new Particle());
    };

    window.animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(window.animateParticles);
    };
} else {
    // Fillers if no canvas on page
    window.initParticles = () => {};
    window.animateParticles = () => {};
}

// Email Copy Logic
function copyEmail(e) {
    if (e) e.preventDefault();
    const email = "konkamon@example.com";
    navigator.clipboard.writeText(email).then(() => {
        const toast = document.getElementById('copy-toast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    });
}
window.copyEmail = copyEmail;

// AI Chat Assistant Logic
const chatWindow = document.getElementById('ai-chat-window');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
let currentPersona = 'assistant'; // 'assistant' or 'somjoi'

function toggleChat() {
    if (chatWindow) {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active') && userInput) {
            userInput.focus();
        }
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const typingId = 'typing-' + Date.now();
    addMessage('...', 'ai', typingId);

    // Initial check for persona trigger
    const isSomjoiTerm = text.toLowerCase().includes('สมโจ่ย') || text.toLowerCase().includes('somjoi');
    
    if (isSomjoiTerm && currentPersona === 'assistant') {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        
        addMessage("เออๆ แป๊บบบนะไอ้สัส เดี๋ยวไปตามมันมาให้! รอแป๊บ!", 'ai');
        setTimeout(() => {
            currentPersona = 'somjoi';
            chatWindow.classList.add('somjoi-mode');
            const header = chatWindow.querySelector('.chat-header h4');
            if (header) header.textContent = 'สมโจ่ย (Somjoi) - ร่างจริง';
            addMessage("เรียกกูทำไมสัส! มีไรว่ามา! กูนึกว่ามึงเซียนจนไม่ต้องถามกูแล้วนะเนี่ย 555", 'ai');
        }, 1200);
        return;
    }

    try {
        let response;
        if (currentPersona === 'somjoi') {
            response = await getSomjoiResponse(text);
        } else {
            // Standard persona uses local logic for speed
            response = getAIResponse(text);
        }

        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        
        addMessage(response, 'ai');
        setTimeout(renderSuggestions, 1000);
    } catch (error) {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        addMessage("ไอ้สัส! ระบบเอ๋อ! ถามใหม่ดิ๊!", 'ai');
    }
}

function addMessage(text, sender, id = null) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    if (id) msgDiv.id = id;
    if (text === '...') msgDiv.classList.add('typing');
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(query) {
    const q = query.toLowerCase();
    const isJourneyPage = window.location.pathname.includes('journey.html');
    
    if (q.includes('สวัสดี') || q.includes('hi') || q.includes('hello')) return "สวัสดีครับ! ผมเป็น AI Assistant ยินดีที่ได้คุยครับ";
    if (q.includes('timeline') || q.includes('เส้นทาง') || q.includes('journey')) {
        if (!isJourneyPage) {
            window.location.href = "journey.html";
            return "กำลังพาคุณไปยังหน้าเส้นทาง AI ครับ...";
        }
        document.getElementById('journey').scrollIntoView({ behavior: 'smooth' });
        return "นี่คือเส้นทางสาย AI ของคุณ Konkamon ครับ ตั้งแต่จุดเริ่มต้นจนถึงโปรเจ็กต์ปัจจุบัน!";
    }
    if (q.includes('เจ็ท') || q.includes('jet') || q.includes('เพลง')) {
        if (isJourneyPage) {
            window.location.href = "index.html#projects";
            return "กำลังพาคุณกลับไปที่หน้าหลักเพื่อดู Jet Music ครับ...";
        }
        const target = document.getElementById('projects');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return "Jet Music เป็นเครื่องเล่นเพลง PWA ที่มาพร้อมระบบซิงค์เนื้อเพลงอัตโนมัติครับ!";
    }
    if (q.includes('google form') || q.includes('filler') || q.includes('ฟอร์ม')) {
        if (isJourneyPage) {
            window.location.href = "index.html#projects";
            return "กำลังพาคุณกลับไปที่หน้าหลักเพื่อดู AI Form Filler ครับ...";
        }
        const target = document.getElementById('projects');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return "AI Google Form Filler เป็นเครื่องมือช่วยกรอกฟอร์มอัตโนมัติที่ฉลาดมากครับ!";
    }
    if (q.includes('ติดต่อ') || q.includes('อีเมล')) {
        if (isJourneyPage) {
            window.location.href = "index.html#contact";
            return "กำลังพาคุณกลับไปที่หน้าหลักเพื่อดูข้อมูลการติดต่อครับ...";
        }
        const target = document.getElementById('contact');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return "คุณสามารถติดต่อคุณ Konkamon ได้ที่ส่วนล่างสุดของหน้าหลักเลยครับ";
    }
    return "ลองถามเกี่ยวกับ 'เส้นทาง AI' หรือ 'โปรเจ็กต์' ต่างๆ ดูไหมครับ? (หรือจะเรียก 'สมโจ่ย' มาคุยด้วยก็ได้นะ!)";
}

async function getSomjoiResponse(query) {
    const q = query.toLowerCase();
    
    // Check for "leaving" commands locally for instant response
    if (q.includes('ลาก่อน') || q.includes('บาย') || q.includes('กลับไป')) {
        currentPersona = 'assistant';
        chatWindow.classList.remove('somjoi-mode');
        const header = chatWindow.querySelector('.chat-header h4');
        if (header) header.textContent = 'Konkamon AI Assistant';
        return "จะไปไหนก็ไปเหอะสัส! นึกว่าต้องอยู่เลี้ยงข้าวด้วยกันซะอีก! โชคดีนะมึง... ปล. คืนร่างเดิมให้ไอ้กมลล่ะ!";
    }

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query })
        });

        const data = await res.json();
        if (!res.ok) return data.response || "ไอ้สัส! ระบบเอ๋อรุนแรง! ไปดูหลังบ้านดิ๊!";
        return data.response;
    } catch (err) {
        console.error('Somjoi Fetch Error:', err);
        // Fallback to local logic if serverless function is completely down (network error)
        if (q.includes('ใคร') || q.includes('สมโจ่ย')) return "กูคือสมโจ่ยไงสัส! บอทไอจีสุดหล่อที่มึงเคยใช้จนเกือบโดนแบนนั่นแหละ! 555 มีไรถามมา!";
        if (q.includes('ลูกพี่') || q.includes('กมล')) return "ไอ้กมลเหรอ? มันก็แค่คนเก็บกูมาเลี้ยงแหละสัส! แต่มันเขียน Code เก่งนะมึง (นึกว่าโม้ แต่ทำจริงเฉย) อยากให้มันช่วยไรบอกกูมา เดี๋ยวไปบอกมันให้!";
        return "พร่อง! ถามไรของมึงเนี่ย? (เน็ตมึงเน่าหรือระบบกูพังเนี่ย?! คุยเล่นไม่ได้เลย!)";
    }
}

const suggestionContainer = document.getElementById('chat-suggestions');
const suggestions = ["เรียก 'สมโจ่ย' มาคุย!", "เส้นทางสาย AI ของคุณคืออะไร?", "ดูโปรเจ็กต์ทั้งหมด"];

function renderSuggestions() {
    if (!suggestionContainer) return;
    suggestionContainer.innerHTML = '';
    suggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = text;
        chip.onclick = () => {
            userInput.value = text;
            sendChatMessage();
            suggestionContainer.style.display = 'none';
        };
        suggestionContainer.appendChild(chip);
    });
    suggestionContainer.style.display = 'flex';
}

window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.handleChatKey = handleChatKey;
window.openModal = openModal;
window.closeModal = closeModal;

// --- New Features: Language Support & AI Terminal ---

const translations = {
    'th': {
        'nav-home': 'หน้าหลัก',
        'nav-journey': 'เส้นทาง AI',
        'nav-projects': 'ผลงาน',
        'nav-contact': 'ติดต่อ',
        'terminal-title': 'บันทึกกิจกรรมระบบ (System Log)',
        'hero-title': 'กรกมล พุทธคาวี <br> <span style="color: var(--accent-color)">Jet Konkamon</span>.',
        'hero-subtitle': 'นักพัฒนา AI และผู้เชี่ยวชาญด้านสื่อมัลติมีเดีย จากวิทยาลัยอาชีวศึกษาฉะเชิงเทรา มุ่งสร้างนวัตกรรมที่เปลี่ยนโลกด้วย Code และ Design',
        'hero-btn': 'ดูผลงานทั้งหมด',
        'stat-gpa': 'เกรดเฉลี่ย (ปวส.)',
        'stat-award': 'รางวัลเหรียญทอง',
        'stat-projects': 'โปรเจ็กต์หลัก',
        'stat-dedication': '% ความทุ่มเท',
        'skills-title': 'ทักษะและความเชี่ยวชาญ',
        'skill-desc-1': 'Next.js, React, Tailwind, PWA',
        'skill-desc-2': 'Gemini, Groq, OpenRouter, LLMs',
        'skill-desc-3': 'Adobe After Effects, Premiere Pro, Illustrator',
        'skill-desc-4': 'Python, Playwright, Node.js, Git',
        'projects-title': 'ผลงานที่น่าสนใจ',
        'p1-title': 'Jet Music',
        'p1-desc': 'แอปพลิเคชันเพลงแบบ PWA ที่มาพร้อมระบบซิงค์เนื้อเพลงอัตโนมัติ และสตรีมเสียงคุณภาพสูง',
        'p2-title': 'AI Google Form Filler',
        'p2-desc': 'เครื่องมืออัตโนมัติที่ใช้ Gemini AI เพื่อวิเคราะห์และกรอกข้อมูลลงใน Google Forms อย่างแม่นยำ',
        'p3-title': 'PR Media Motion Graphics',
        'p3-desc': 'รางวัลชนะเลิศเหรียญทอง การประกวดสื่อประชาสัมพันธ์ระดับจังหวัด ประจำปี 2566',
        'tag-award': 'รางวัลเหรียญทอง',
        'achiev-title': 'ความสำเร็จและเกียรติบัตร',
        'ac-1-title': 'เหรียญทองสื่อประชาสัมพันธ์',
        'ac-1-desc': 'รางวัลชนะเลิศอันดับ 1 ระดับจังหวัด ปี 2566',
        'ac-2-title': 'Microsoft Professional',
        'ac-2-desc': 'ความเชี่ยวชาญด้าน Word, Excel, PPT (Intermediate)',
        'ac-3-title': 'Logo Design Competition',
        'ac-3-desc': 'ผู้เข้าร่วมการแข่งขันออกแบบโลโก้ ประจำภาคเรียนที่ 2/2567',
        'contact-title': 'สนใจร่วมงานกับผม?',
        'contact-subtitle': 'คุณสามารถติดต่อพูดคุยเรื่องโปรเจ็กต์ หรือแลกเปลี่ยนความรู้ได้ที่ช่องทางเหล่านี้',
        'contact-email': 'ส่งอีเมลหาผม',
        'contact-toast': 'คัดลอกอีเมลเรียบร้อยแล้ว!',
        'journey-hero-title': 'เส้นทางของ <br> <span style="color: var(--accent-color)">Jet Konkamon</span>.',
        'journey-hero-subtitle': 'จากความหลงใหลในเทคโนโลยี สู่การเป็นนักพัฒนาที่ขับเคลื่อนด้วย AI และความคิดสร้างสรรค์',
        'j1-title': 'ปวช. เทคโนโลยีธุรกิจดิจิทัล',
        'j1-desc': 'สำเร็จการศึกษาด้วยเกรดเฉลี่ย 3.40 และเป็นตัวแทนแข่งขันในทักษะต่างๆ ของระดับวิทยาลัย',
        'j2-title': 'เข้าสู่โลกของ AI & Motion',
        'j2-desc': 'เริ่มศึกษา AI Integration และคว้าเหรียญทองอันดับ 1 ในการประกวดสื่อประชาสัมพันธ์ระดับจังหวัด',
        'j3-title': 'ปวส. เทคโนโลยีธุรกิจดิจิทัล',
        'j3-desc': 'รักษาเกรดเฉลี่ยที่ 3.84 และได้รับความไว้วางใจให้ดำรงตำแหน่งรองประธานชมรมวิชาชีพ',
        'j4-title': 'รองประธานชมรมฯ',
        'j4-desc': 'บริหารจัดการกิจกรรมภายในชมรม Digital Business Technology และส่งเสริมการเรียนรู้ด้านไอทีให้กับเพื่อนร่วมสถาบัน',
        'j5-title': 'เป้าหมายในอนาคต',
        'j5-desc': 'มุ่งมั่นพัฒนา AI Agents ที่สามารถแก้ปัญหาจริงให้กับธุรกิจและสังคมได้ในสเกลระดับประเทศ'
    },
    'en': {
        'nav-home': 'Home',
        'nav-journey': 'Journey',
        'nav-projects': 'Works',
        'nav-contact': 'Contact',
        'terminal-title': 'System Activity Log',
        'hero-title': 'Konkamon Phutthakhawee <br> <span style="color: var(--accent-color)">Jet Konkamon</span>.',
        'hero-subtitle': 'AI Developer & Multimedia Specialist from Chachoengsao Vocational College, creating innovations that change the world through Code and Design.',
        'hero-btn': 'View All Works',
        'stat-gpa': 'GPA (High Voc.)',
        'stat-award': 'Gold Medal Awards',
        'stat-projects': 'Key Projects',
        'stat-dedication': '% Dedication',
        'skills-title': 'Skills & Expertise',
        'skill-desc-1': 'Next.js, React, Tailwind, PWA',
        'skill-desc-2': 'Gemini, Groq, OpenRouter, LLMs',
        'skill-desc-3': 'Adobe After Effects, Premiere Pro, Illustrator',
        'skill-desc-4': 'Python, Playwright, Node.js, Git',
        'projects-title': 'Featured Works',
        'p1-title': 'Jet Music',
        'p1-desc': 'A music PWA with auto-lyric sync and high-quality audio streaming features.',
        'p2-title': 'AI Google Form Filler',
        'p2-desc': 'Automation tool using Gemini AI to accurately analyze and fill Google Forms.',
        'p3-title': 'PR Media Motion Graphics',
        'p3-desc': 'First Prize Gold Medal in the Provincial Level Media Competition, 2023.',
        'tag-award': 'Gold Medal',
        'achiev-title': 'Achievements & Certificates',
        'ac-1-title': 'Gold Medal PR Media',
        'ac-1-desc': 'First Prize (Provincial Level) - 2023',
        'ac-2-title': 'Microsoft Professional',
        'ac-2-desc': 'Competency in Word, Excel, PPT (Intermediate)',
        'ac-3-title': 'Logo Design Competition',
        'ac-3-desc': 'Participant in the Logo Design Competition, Term 2/2024.',
        'contact-title': 'Want to work together?',
        'contact-subtitle': 'You can reach out to discuss projects or exchange knowledge through these channels.',
        'contact-email': 'Email Me',
        'contact-toast': 'Email copied successfully!',
        'journey-hero-title': 'The Journey of <br> <span style="color: var(--accent-color)">Jet Konkamon</span>.',
        'journey-hero-subtitle': 'From a passion for technology to a developer driven by AI and creativity.',
        'j1-title': 'Vocational Certificate (DBT)',
        'j1-desc': 'Graduated with 3.40 GPA and represented the college in various skill competitions.',
        'j2-title': 'Entering the AI & Motion World',
        'j2-desc': 'Started AI integration studies and won 1st Place Gold Medal in provincial media PR design.',
        'j3-title': 'High Voc. Certificate (DBT)',
        'j3-desc': 'Maintained a 3.84 GPA while taking on the role of Vice President of the Professional Club.',
        'j4-title': 'Club Vice President',
        'j4-desc': 'Managed activities for the Digital Business Technology club and promoted IT learning among peers.',
        'j5-title': 'Future Goals',
        'j5-desc': 'Committed to developing AI Agents that solve real problems for business and society at a national scale.'
    }
};
;

let currentLang = localStorage.getItem('lang') || 'th';

function toggleLanguage() {
    currentLang = currentLang === 'th' ? 'en' : 'th';
    localStorage.setItem('lang', currentLang);
    updateContent();
}

function updateContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });
    
    // Update button text
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = currentLang === 'th' ? 'EN' : 'TH';
}

// AI Log Streaming
const logs = [
    { type: 'info', msg: 'Scanning local repository for changes...' },
    { type: 'success', msg: 'Git tree optimized.' },
    { type: 'info', msg: 'Connecting to Gemini Pro API...' },
    { type: 'success', msg: 'AI Engine online (Latency: 142ms).' },
    { type: 'info', msg: 'Indexing Jet Music project metadata...' },
    { type: 'info', msg: 'Analyzing Playwright scripts for Form Filler...' },
    { type: 'warn', msg: 'Memory usage increasing: 78%.' },
    { type: 'success', msg: 'Garbage collection completed. Usage now 32%.' },
    { type: 'info', msg: 'Agent "Somjoi" is standing by...' },
    { type: 'info', msg: 'Portfolio status: 100% Ready.' }
];

function streamLogs() {
    const container = document.getElementById('log-container');
    if (!container) return;
    
    let index = 0;
    setInterval(() => {
        const log = logs[index];
        const now = new Date();
        const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span class="log-time">${timeStr}</span> <span class="log-${log.type}">${log.type.toUpperCase()}:</span> ${log.msg}`;
        
        container.appendChild(line);
        container.scrollTop = container.scrollHeight;
        
        // Remove old logs to keep performance
        if (container.children.length > 20) {
            container.removeChild(container.firstChild);
        }
        
        index = (index + 1) % logs.length;
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
    streamLogs();
});

window.toggleLanguage = toggleLanguage;
