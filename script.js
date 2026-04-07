// Initialize Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Select all project cards and headings to animate
document.addEventListener("DOMContentLoaded", () => {
    const animatableElements = document.querySelectorAll(".project-card, .projects h2, .skills h2, .skill-item, .contact h2, .timeline-item, .journey h2");
    
    animatableElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
        observer.observe(el);
    });

    // Logo hover effect
    const logo = document.querySelector(".logo");
    logo.addEventListener("mouseenter", () => {
        logo.style.transform = "scale(1.1) rotate(-5deg)";
        logo.style.transition = "0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    });
    logo.addEventListener("mouseleave", () => {
        logo.style.transform = "scale(1) rotate(0deg)";
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Modal Logic
const overlay = document.getElementById('modal-overlay');

function openModal(projectId) {
    const modal = document.getElementById(`modal-${projectId}`);
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) activeModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scroll
}

// Close listeners
overlay.addEventListener('click', closeModal);
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// ESC key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Cursor Glow Effect
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

// Particle Background Logic
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

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

            if (this.x > canvas.width) this.x = 0;
            else if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            else if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
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
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
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
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
window.copyEmail = copyEmail;

// AI Chat Assistant Logic
const chatWindow = document.getElementById('ai-chat-window');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
        userInput.focus();
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    // Simulate AI thinking
    const typingId = 'typing-' + Date.now();
    addMessage('...', 'ai', typingId);

    setTimeout(() => {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        
        const response = getAIResponse(text);
        addMessage(response, 'ai');
    }, 1500);
}

function addMessage(text, sender, id = null) {
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
    
    if (q.includes('สวัสดี') || q.includes('hi') || q.includes('hello')) {
        return "สวัสดีครับ! ผมเป็น AI Assistant ของคุณ Konkamon ยินดีที่ได้รู้จักครับ";
    }
    if (q.includes('ใคร') || q.includes('ชื่อ')) {
        return "ผมเป็น AI ที่สร้างขึ้นเพื่อช่วยเหลือผู้ที่เข้ามาชมพอร์ตของคุณ Konkamon ครับ";
    }
    if (q.includes('เจ็ท') || q.includes('jet-music') || q.includes('เพลง')) {
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        return "Jet Music เป็นเครื่องเล่นเพลง PWA ที่มาพร้อมระบบซิงค์เนื้อเพลงอัตโนมัติครับ ผมเลื่อนหน้าจอไปให้คุณดูแล้ว!";
    }
    if (q.includes('timeline') || q.includes('เส้นทาง') || q.includes('journey')) {
        document.getElementById('journey').scrollIntoView({ behavior: 'smooth' });
        return "นี่คือเส้นทางสาย AI ของคุณ Konkamon ครับ ตั้งแต่จุดเริ่มต้นจนถึงโปรเจ็กต์ปัจจุบัน!";
    }
    if (q.includes('google form') || q.includes('filler') || q.includes('ฟอร์ม')) {
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        return "AI Google Form Filler เป็นเครื่องมือช่วยกรอกฟอร์มอัตโนมัติที่ฉลาดมากครับ ลองดูรายละเอียดได้เลย";
    }
    if (q.includes('ติดต่อ') || q.includes('อีเมล')) {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        return "คุณสามารถติดต่อคุณ Konkamon ได้ผ่านส่วน Contact ด้านล่างนี้เลยครับ";
    }
    
    return "เป็นคำถามที่น่าสนใจครับ! แต่ตอนนี้ผมยังเรียนรู้ได้จำกัด ลองถามเกี่ยวกับ โปรเจ็กต์ หรือ การติดต่อ ดูไหมครับ?";
}

window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.handleChatKey = handleChatKey;

// Suggestions System
const suggestionContainer = document.getElementById('chat-suggestions');
const suggestions = [
    "เส้นทางสาย AI ของคุณคืออะไร?",
    "ดูโปรเจ็กต์ Jet Music",
    "ดูโปรเจ็กต์ AI Form Filler",
    "ติดต่อคุณ Konkamon"
];

function renderSuggestions() {
    suggestionContainer.innerHTML = '';
    suggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = text;
        chip.onclick = () => {
            userInput.value = text;
            sendChatMessage();
            suggestionContainer.style.display = 'none'; // Hide after use
        };
        suggestionContainer.appendChild(chip);
    });
    suggestionContainer.style.display = 'flex';
}

// Show suggestions after each AI response or on start
document.addEventListener('DOMContentLoaded', () => {
    // Other init logic...
    setTimeout(renderSuggestions, 1000);
});

// Update sending logic to reapppear suggestions
const originalSendChatMessage = sendChatMessage;
window.sendChatMessage = () => {
    originalSendChatMessage();
    setTimeout(renderSuggestions, 3000); // Re-show after response
};
