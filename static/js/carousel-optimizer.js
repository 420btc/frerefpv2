/**
 * Carrusel de Videos para FreireFPV
 * Versión Básica y Optimizada (v1.0)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del carousel
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;

    const carouselSlides = carouselContainer.querySelectorAll('.carousel-slide');
    const carouselVideos = carouselContainer.querySelectorAll('.drone-video');
    const prevBtn = carouselContainer.querySelector('.carousel-nav-btn.prev');
    const nextBtn = carouselContainer.querySelector('.carousel-nav-btn.next');
    const indicators = carouselContainer.querySelectorAll('.indicator');
    
    let currentSlideIndex = 0;
    let isAnimating = false;
    
    // Inicializar videos
    carouselVideos.forEach((video, index) => {
        // Configuraciones para carga inmediata
        video.preload = "auto"; 
        video.setAttribute('playsinline', '');
        
        // Cargar videos inmediatamente
        video.load();
        
        // Botones de control de video
        const playPauseBtn = video.parentElement.querySelector('.play-pause');
        const restartBtn = video.parentElement.querySelector('.video-restart');
        const spinner = video.parentElement.querySelector('.loading-spinner');
        
        // Configurar control de reproducción/pausa
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                if (video.paused) {
                    video.play()
                        .then(() => {
                            this.querySelector('i').className = 'fas fa-pause';
                        })
                        .catch(e => console.error('Error al reproducir:', e));
                } else {
                    video.pause();
                    this.querySelector('i').className = 'fas fa-play';
                }
            });
        }
        
        // Configurar reinicio de video
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                video.currentTime = 0;
                video.play()
                    .then(() => {
                        if (playPauseBtn) {
                            playPauseBtn.querySelector('i').className = 'fas fa-pause';
                        }
                    })
                    .catch(e => console.error('Error al reiniciar video:', e));
            });
        }
        
        // Reproducir primer video automáticamente
        if (index === 0) {
            video.addEventListener('loadeddata', function() {
                if (spinner) spinner.style.display = 'none';
                
                video.play()
                    .then(() => {
                        if (playPauseBtn) {
                            playPauseBtn.querySelector('i').className = 'fas fa-pause';
                        }
                    })
                    .catch(e => console.error('Error al reproducir video inicial:', e));
            });
        }
    });
    
    // Función para ir a un slide específico
    function goToSlide(index) {
        // Evitar cambios durante una animación
        if (isAnimating) return;
        isAnimating = true;
        
        // Validar índice
        if (index < 0) index = carouselSlides.length - 1;
        if (index >= carouselSlides.length) index = 0;
        
        // Si estamos en el mismo slide, no hacer nada
        if (index === currentSlideIndex) {
            isAnimating = false;
            return;
        }
        
        // Pausar el video actual
        const currentVideo = carouselVideos[currentSlideIndex];
        if (currentVideo) {
            currentVideo.pause();
            
            // Actualizar botón
            const currentBtn = carouselSlides[currentSlideIndex].querySelector('.play-pause i');
            if (currentBtn) currentBtn.className = 'fas fa-play';
        }
        
        // Añadir clase 'prev' al slide actual (para animación)
        carouselSlides[currentSlideIndex].classList.add('prev');
        
        // Quitar clase active de todos los slides e indicadores
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Activar el nuevo slide e indicador
        carouselSlides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Activar el nuevo video
        const newVideo = carouselVideos[index];
        const spinner = carouselSlides[index].querySelector('.loading-spinner');
        
        if (spinner) spinner.style.display = 'flex';
        
        // Reproducir el nuevo video después de la transición
        setTimeout(() => {
            // Limpiar clase 'prev' para futuras transiciones
            carouselSlides.forEach(slide => slide.classList.remove('prev'));
            
            if (newVideo) {
                newVideo.play()
                    .then(() => {
                        // Actualizar icono
                        const playPauseBtn = carouselSlides[index].querySelector('.play-pause i');
                        if (playPauseBtn) playPauseBtn.className = 'fas fa-pause';
                        
                        // Ocultar spinner
                        if (spinner) spinner.style.display = 'none';
                    })
                    .catch(e => console.error('Error al reproducir video:', e));
            }
            
            // Actualizar índice actual
            currentSlideIndex = index;
            isAnimating = false;
        }, 400); // Coincidir con la duración de la transición CSS
    }
    
    // Eventos de navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
    }
    
    // Configurar indicadores
    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => goToSlide(idx));
    });
});