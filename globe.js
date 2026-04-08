// ==========================================
// 3D AI Connectivity Globe - Konkamon Portfolio
// Built with Three.js
// ==========================================

(function initGlobe() {
    const container = document.getElementById('globe-canvas-container');
    const canvas = document.getElementById('globe-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const W = container.clientWidth;
    const H = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Sizing on resize ---
    window.addEventListener('resize', () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    });

    // --- Globe Group ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // --- Earth Sphere ---
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
        color: 0x050520,
        emissive: 0x1a1a4e,
        specular: 0x6366f1,
        shininess: 15,
        transparent: true,
        opacity: 0.95,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // --- Grid / Wireframe Overlay ---
    const wireGeo = new THREE.SphereGeometry(1.001, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
    });
    globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // --- Atmosphere Glow ---
    const atmosGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
                gl_FragColor = vec4(0.38, 0.40, 0.98, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    });
    globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0x223366, 1.5));
    const sunLight = new THREE.DirectionalLight(0x8888ff, 2.5);
    sunLight.position.set(3, 2, 5);
    scene.add(sunLight);

    // --- Helper: lat/lon → 3D ---
    function latLonToXYZ(lat, lon, r = 1.02) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
             r * Math.cos(phi),
             r * Math.sin(phi) * Math.sin(theta)
        );
    }

    // --- Cities / Tech Hubs ---
    const cities = [
        { name: 'Bangkok',       lat: 13.75,  lon: 100.50, color: 0x00ffcc },
        { name: 'San Francisco', lat: 37.77,  lon: -122.41, color: 0x6366f1 },
        { name: 'London',        lat: 51.50,  lon: -0.12,  color: 0x818cf8 },
        { name: 'Tokyo',         lat: 35.68,  lon: 139.65, color: 0xc084fc },
        { name: 'Singapore',     lat: 1.35,   lon: 103.82, color: 0x00ffcc },
        { name: 'Berlin',        lat: 52.52,  lon: 13.40,  color: 0x818cf8 },
        { name: 'Sydney',        lat: -33.87, lon: 151.21, color: 0xfbbf24 },
        { name: 'New York',      lat: 40.71,  lon: -74.00, color: 0x6366f1 },
        { name: 'Seoul',         lat: 37.57,  lon: 126.97, color: 0xc084fc },
        { name: 'Mumbai',        lat: 19.07,  lon: 72.88,  color: 0xfbbf24 },
        { name: 'Dubai',         lat: 25.20,  lon: 55.27,  color: 0xfbbf24 },
        { name: 'Toronto',       lat: 43.70,  lon: -79.42, color: 0x6366f1 },
    ];

    // Draw city dots
    cities.forEach(city => {
        const pos = latLonToXYZ(city.lat, city.lon);
        const dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: city.color });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        globeGroup.add(dot);

        // Pulsing ring
        const ringGeo = new THREE.RingGeometry(0.015, 0.022, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: city.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.userData.baseOpacity = 0.6;
        ring.userData.phase = Math.random() * Math.PI * 2;
        globeGroup.add(ring);
    });

    // --- Connection Arcs ---
    const connections = [
        [0, 1], [0, 3], [0, 4], [0, 8],
        [1, 2], [1, 7], [1, 11],
        [2, 5], [2, 6],
        [3, 8], [4, 9],
        [5, 10], [9, 10],
        [6, 7], [11, 7],
    ];

    const arcLines = [];

    function createArc(cityA, cityB) {
        const start = latLonToXYZ(cityA.lat, cityA.lon, 1.02);
        const end   = latLonToXYZ(cityB.lat, cityB.lon, 1.02);
        const mid   = start.clone().add(end).multiplyScalar(0.5);
        const dist  = start.distanceTo(end);
        mid.normalize().multiplyScalar(1.02 + dist * 0.45);

        const points = [];
        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const pos = new THREE.Vector3();
            pos.x = (1-t)*(1-t)*start.x + 2*(1-t)*t*mid.x + t*t*end.x;
            pos.y = (1-t)*(1-t)*start.y + 2*(1-t)*t*mid.y + t*t*end.y;
            pos.z = (1-t)*(1-t)*start.z + 2*(1-t)*t*mid.z + t*t*end.z;
            points.push(pos);
        }

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        // Use color based on first city
        const hue = Math.random() < 0.5 ? 0x6366f1 : 0x00ffcc;
        const mat = new THREE.LineBasicMaterial({
            color: hue,
            transparent: true,
            opacity: 0.55,
        });
        const line = new THREE.Line(geo, mat);
        globeGroup.add(line);
        arcLines.push({ line, mat, phase: Math.random() * Math.PI * 2 });
    }

    connections.forEach(([a, b]) => createArc(cities[a], cities[b]));

    // --- Starfield ---
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 2000; i++) {
        starVerts.push(
            (Math.random() - 0.5) * 800,
            (Math.random() - 0.5) * 800,
            (Math.random() - 0.5) * 800
        );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Mouse Drag Interaction ---
    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        rotVel.x = dy * 0.005;
        rotVel.y = dx * 0.005;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    canvas.addEventListener('touchstart', e => {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    canvas.addEventListener('touchend', () => { isDragging = false; });
    canvas.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        rotVel.x = dy * 0.005;
        rotVel.y = dx * 0.005;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // --- Animate Live Stats ---
    function animateGlobeStats() {
        const conn = document.getElementById('globe-connections');
        const lat  = document.getElementById('globe-latency');
        const up   = document.getElementById('globe-uptime');
        if (!conn) return;

        let c = 0, l = 150, u = 0;
        const tgtC = 247, tgtL = 18, tgtU = 99.9;
        const timer = setInterval(() => {
            c = Math.min(c + 7, tgtC);
            l = Math.max(l - 4, tgtL);
            u = Math.min(+(u + 2.5).toFixed(1), tgtU);
            conn.textContent = c;
            lat.textContent  = l + 'ms';
            up.textContent   = u + '%';
            if (c >= tgtC) clearInterval(timer);
        }, 30);
    }

    // Trigger stats when section enters viewport
    const globeSection = document.getElementById('globe-section');
    if (globeSection) {
        const statsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateGlobeStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(globeSection);
    }

    // --- Render Loop ---
    let clock = 0;
    function animate() {
        requestAnimationFrame(animate);
        clock += 0.016;

        if (!isDragging) {
            // Auto-rotate slowly
            globeGroup.rotation.y += 0.002;
            rotVel.x *= 0.92;
            rotVel.y *= 0.92;
        } else {
            globeGroup.rotation.x += rotVel.x;
            globeGroup.rotation.y += rotVel.y;
            rotVel.x *= 0.92;
            rotVel.y *= 0.92;
        }

        // Pulse arcs
        arcLines.forEach(({ mat, phase }) => {
            mat.opacity = 0.3 + 0.35 * Math.abs(Math.sin(clock * 1.5 + phase));
        });

        // Pulse rings
        globeGroup.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'RingGeometry') {
                child.material.opacity = child.userData.baseOpacity * (0.5 + 0.5 * Math.abs(Math.sin(clock * 2 + child.userData.phase)));
                const s = 1 + 0.12 * Math.sin(clock * 2.5 + child.userData.phase);
                child.scale.set(s, s, s);
            }
        });

        renderer.render(scene, camera);
    }

    animate();
})();
