document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Lógica de la Pantalla del Sobre ---
    const envelopeScreen = document.getElementById('envelope-screen');
    const layoutContainer = document.getElementById('main-content');
    
    // Bloquear scroll al inicio
    document.body.classList.add('locked');

    let isOpened = false;

    function openEnvelope() {
        if (isOpened) return;
        isOpened = true;

        // Deslizar sobre hacia arriba y ocultar
        envelopeScreen.classList.add('opened');
        
        // Mostrar contenido principal
        layoutContainer.classList.add('visible');

        // Desbloquear scroll
        document.body.classList.remove('locked');

        // Iniciar la animación de hojas cayendo
        createLeaves('left-leaves', 20);
        createLeaves('right-leaves', 20);
        
        // Opcional: reproducir música automáticamente si el navegador lo permite
        const bgMusic = document.getElementById('bg-music');
        const musicBtn = document.getElementById('music-btn');
        if (bgMusic && musicBtn && !musicBtn.classList.contains('playing')) {
            bgMusic.volume = 0.15; // Volumen muy bajo (15%) para que no asuste
            bgMusic.play().then(() => {
                musicBtn.classList.add('playing');
                // Nota: Declaramos isPlaying de la música abajo, no interferirá directamente
            }).catch(e => console.log("Autoplay bloqueado por el navegador"));
        }
    }

    // Escuchar scroll o click para abrir
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) openEnvelope();
    });

    window.addEventListener('touchmove', () => {
        openEnvelope();
    }, { once: true });

    if (envelopeScreen) {
        envelopeScreen.addEventListener('click', openEnvelope);
    }

    // --- 1. Animación de Hojas Cayendo (Solo se ven en PC debido al CSS de las columnas) ---
    function createLeaves(containerId, count) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('leaf');
            
            // Variar tamaño, posición y velocidad para que se vea natural
            const size = Math.random() * 15 + 10; // entre 10px y 25px
            const left = Math.random() * 100; // porcentaje del ancho del contenedor
            const duration = Math.random() * 5 + 5; // entre 5s y 10s
            const delay = Math.random() * 5; // retraso inicial
            
            // Si quieres usar colores un poco distintos para simular varias hojas
            const colors = ['#3a5f6b', '#2f5c6b', '#48707d', '#f1b7a9'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            leaf.style.left = `${left}%`;
            leaf.style.animationDuration = `${duration}s`;
            leaf.style.animationDelay = `${delay}s`;
            leaf.style.backgroundColor = color;
            
            container.appendChild(leaf);
        }
    }

    // --- 2. Contador de Cuenta Regresiva ---
    // Fecha de la Boda: 18 de Julio de 2026 a las 17:00 (5:00 PM)
    const weddingDate = new Date("Jul 18, 2026 17:00:00").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minutesEl.innerText = "00";
            secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days < 10 ? "0" + days : days;
        hoursEl.innerText = hours < 10 ? "0" + hours : hours;
        minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    // Actualizar cada segundo
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Ejecutar inmediatamente

    // --- 3. Simulación del Frasco (Matter.js) ---
    const canvasContainer = document.getElementById('jar-canvas-container');
    const width = 250;
    const height = 350;

    // Aliases de Matter.js
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    // Crear motor
    const engine = Engine.create();
    const world = engine.world;

    // Crear render
    const render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false, // Queremos ver colores, no solo lineas
            background: 'transparent'
        }
    });

    Render.run(render);

    // Crear runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Definir paredes invisibles del frasco para contener las bolitas
    // Parametros: x, y, width, height
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width / 2, height, width, 40, wallOptions);
    const leftWall = Bodies.rectangle(0, height / 2, 40, height, wallOptions);
    const rightWall = Bodies.rectangle(width, height / 2, 40, height, wallOptions);

    Composite.add(world, [ground, leftWall, rightWall]);

    // Función para crear bolitas
    function addBalls(count) {
        const balls = [];
        for (let i = 0; i < count; i++) {
            // Bolitas doradas
            const radius = 10 + Math.random() * 5; // tamaño aleatorio entre 10 y 15
            const x = width / 2 + (Math.random() * 20 - 10); // caen cerca del centro
            const y = -50 - (i * 30); // caen desde arriba con un pequeño retraso
            
            const ball = Bodies.circle(x, y, radius, {
                restitution: 0.6, // rebote
                friction: 0.05,
                render: {
                    fillStyle: '#37597c' // Color azul de los botones
                }
            });
            balls.push(ball);
        }
        Composite.add(world, balls);
    }

    // --- Integración con Google Sheets ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEKTOsMeKFEDWk1OUl38III9Ed-QHp_R7Vcz6uE3hc8kGJ41LCpLKdldJtgJSocxN5JA/exec';
    
    let totalGuests = 0;
    const totalGuestsCounterEl = document.getElementById('total-guests-counter');
    
    // Al cargar la página, leemos cuántos invitados hay en total en el Excel
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if (data && data.total) {
                totalGuests = parseInt(data.total);
            }
            
            // Si el Excel está vacío y da 0, ponemos un número simulado para mostrar la función, 
            // O podemos dejarlo en 0. Dejémoslo real:
            if (totalGuestsCounterEl) {
                totalGuestsCounterEl.innerText = `Personas que asistirán: ${totalGuests}`;
            }

            // Dejar caer las bolitas iniciales poco a poco
            if (totalGuests > 0) {
                setTimeout(() => {
                    addBalls(totalGuests);
                }, 1000);
            }
        })
        .catch(err => {
            console.error("Error al cargar invitados:", err);
            // Fallback: mostrar 0
            if (totalGuestsCounterEl) {
                totalGuestsCounterEl.innerText = `Personas que asistirán: ${totalGuests}`;
            }
        });

    // --- 4. Formulario RSVP ---
    const rsvpForm = document.getElementById('rsvp-form');
    
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('guest-name');
        const countInput = document.getElementById('guest-count');
        const submitBtn = e.target.querySelector('.submit-btn');
        
        const count = parseInt(countInput.value);
        const name = nameInput.value;
        
        if (count > 0 && name) {
            
            // Cambiamos el texto del botón mientras carga
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Enviando...";
            submitBtn.disabled = true;

            // Preparamos los datos para Google Sheets
            const formData = new URLSearchParams();
            formData.append('nombre', name);
            formData.append('asistentes', count);

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
            .then(response => {
                // Añadir bolitas al frasco visualmente
                addBalls(count);
                
                // Actualizar total
                totalGuests += count;
                
                // Actualizar contador de texto
                if (totalGuestsCounterEl) {
                    totalGuestsCounterEl.innerText = `Personas que asistirán: ${totalGuests}`;
                }
                
                alert(`¡Gracias ${name}! Hemos registrado la asistencia para ${count} persona(s).`);
                rsvpForm.reset();
            })
            .catch(err => {
                alert("Hubo un error al guardar. Por favor intenta de nuevo.");
                console.error(err);
            })
            .finally(() => {
                // Restaurar botón
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        }
    });

    // --- 5. Animación al hacer scroll (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animamos una sola vez
            }
        });
    }, {
        threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    });

    fadeElements.forEach(el => observer.observe(el));

    // --- 6. Control de Música de Fondo ---
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');
    
    let isPlaying = false;

    // Sincronizar el estado de isPlaying con el autoplay si ocurrió
    if (musicBtn && musicBtn.classList.contains('playing')) {
        isPlaying = true;
    } else if (bgMusic && !bgMusic.paused) {
        isPlaying = true;
    }

    if (musicBtn && bgMusic) {
        // Intentar bajar el volumen un poco para que no asuste
        bgMusic.volume = 0.15; // Volumen muy bajo (15%)

        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
            } else {
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                }).catch(err => {
                    console.error("No se pudo reproducir el audio:", err);
                });
            }
            isPlaying = !isPlaying;
        });
    }

    // --- 7. Reproductor de Video en Hero ---
    const mainVideoContainer = document.getElementById('main-video-container');
    const heroVideo = document.getElementById('hero-video');

    if (mainVideoContainer && heroVideo) {
        mainVideoContainer.addEventListener('click', () => {
            if (!mainVideoContainer.classList.contains('playing')) {
                mainVideoContainer.classList.add('playing');
                // Intentamos reproducir el video
                heroVideo.play().catch(e => console.log("Error al reproducir el video:", e));
            }
        });
    }

});
