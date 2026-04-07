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

function sendChatMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const typingId = 'typing-' + Date.now();
    addMessage('...', 'ai', typingId);

    setTimeout(() => {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        addMessage(getAIResponse(text), 'ai');
        setTimeout(renderSuggestions, 1000);
    }, 1500);
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
    return "ลองถามเกี่ยวกับ 'เส้นทาง AI' หรือ 'โปรเจ็กต์' ดูไหมครับ?";
}

const suggestionContainer = document.getElementById('chat-suggestions');
const suggestions = ["เส้นทางสาย AI ของคุณคืออะไร?", "ดูโปรเจ็กต์ทั้งหมด", "ติดต่อคุณ Konkamon"];

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
