/**
 * Carrusel de Videos para FreireFPV
 * Versión Simplificada (v2.0)
 * Solución de problemas de navegación
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrusel...');
    
    // Seleccionar elementos principales
    const slides = document.querySelectorAll('.carousel-slide');
    const videos = document.querySelectorAll('.drone-video');
    const nextBtn = document.querySelector('.carousel-nav-btn.next');
    const prevBtn = document.querySelector('.carousel-nav-btn.prev');
    const indicators = document.querySelectorAll('.indicator');
    
    // Variables de control
    let currentIndex = 0;
    let isTransitioning = false;
    
    // Función de debug
    function debug(msg) {
        console.log('Carrusel: ' + msg);
    }
    
    debug('Encontrados ' + slides.length + ' slides y ' + videos.length + ' videos');
    
    // Preparar videos para carga inmediata
    videos.forEach((video, index) => {
        video.preload = 'auto';
        video.setAttribute('playsinline', '');
        video.muted = true; // Asegurar que esté silenciado para autoplay
        
        // Cargar el video
        video.load();
        
        // Agregar event listeners para manejo de errores
        video.addEventListener('loadeddata', () => {
            debug(`Video ${index} cargado correctamente`);
        });
        
        video.addEventListener('error', (e) => {
            debug(`Error cargando video ${index}: ${e.message}`);
        });
    });
    
    // Función para reproducir video de forma segura
    function safePlayVideo(video, slideIndex) {
        if (!video) return;
        
        // Pausar cualquier reproducción anterior
        video.pause();
        video.currentTime = 0;
        
        // Intentar reproducir con manejo de errores
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    const spinner = slides[slideIndex]?.querySelector('.loading-spinner');
                    const playBtn = slides[slideIndex]?.querySelector('.play-pause i');
                    
                    if (spinner) spinner.style.display = 'none';
                    if (playBtn) playBtn.className = 'fas fa-pause';
                    debug(`Video ${slideIndex} reproduciendo correctamente`);
                })
                .catch(err => {
                    debug(`Error reproduciendo video ${slideIndex}: ${err.message}`);
                    // Intentar reproducir sin sonido si falla
                    video.muted = true;
                    setTimeout(() => {
                        video.play().catch(e => debug(`Segundo intento fallido: ${e.message}`));
                    }, 500);
                });
        }
    }
    
    // Iniciar el primer video con delay para evitar conflictos
    setTimeout(() => {
        if (videos[0]) {
            safePlayVideo(videos[0], 0);
        }
    }, 200);
    
    // Configurar botones de control para cada video
    videos.forEach((video, index) => {
        const playBtn = slides[index].querySelector('.play-pause');
        const restartBtn = slides[index].querySelector('.video-restart');
        
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                if (video.paused) {
                    safePlayVideo(video, index);
                } else {
                    video.pause();
                    this.querySelector('i').className = 'fas fa-play';
                }
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                safePlayVideo(video, index);
            });
        }
    });
    
    // Función principal para cambiar de slide
    function changeSlide(newIndex) {
        if (isTransitioning) return;
        
        debug('Intentando cambiar al slide ' + newIndex);
        
        // Validar el índice
        if (newIndex < 0) newIndex = slides.length - 1;
        if (newIndex >= slides.length) newIndex = 0;
        
        // Si estamos en el mismo slide, no hacer nada
        if (newIndex === currentIndex) return;
        
        isTransitioning = true;
        debug('Cambiando de slide ' + currentIndex + ' a ' + newIndex);
        
        // Pausar video actual
        if (videos[currentIndex]) {
            videos[currentIndex].pause();
            
            const oldPlayBtn = slides[currentIndex].querySelector('.play-pause i');
            if (oldPlayBtn) oldPlayBtn.className = 'fas fa-play';
        }
        
        // Activar clase 'prev' en el slide actual (para animación)
        slides[currentIndex].classList.add('prev');
        
        // Quitar 'active' de todos los slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Activar nuevo slide e indicador
        slides[newIndex].classList.add('active');
        if (indicators[newIndex]) {
            indicators[newIndex].classList.add('active');
        }
        
        // Actualizar índice
        currentIndex = newIndex;
        
        // Reproducir nuevo video después de un pequeño delay
        setTimeout(() => {
            if (videos[newIndex]) {
                safePlayVideo(videos[newIndex], newIndex);
            }
            
            // Limpiar clases de animación después de la transición
            setTimeout(() => {
                slides.forEach(slide => slide.classList.remove('prev'));
                isTransitioning = false;
            }, 500);
        }, 100);
        
        debug('Slide cambiado a ' + newIndex);
    }
    
    // Configurar botones de navegación
    if (nextBtn) {
        debug('Configurando botón siguiente');
        nextBtn.addEventListener('click', function() {
            changeSlide(currentIndex + 1);
        });
    }
    
    if (prevBtn) {
        debug('Configurando botón anterior');
        prevBtn.addEventListener('click', function() {
            changeSlide(currentIndex - 1);
        });
    }
    
    // Configurar indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            changeSlide(index);
        });
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(currentIndex + 1);
        }
    });
    
    debug('Carrusel inicializado correctamente');
});