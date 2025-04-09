/**
 * Carrusel de Videos para FreireFPV
 * Versión Básica y Optimizada (v1.0)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrusel básico...');
    
    // Seleccionar elementos
    const slides = document.querySelectorAll('.carousel-slide');
    const videos = document.querySelectorAll('.drone-video');
    const prevBtn = document.querySelector('.carousel-nav-btn.prev');
    const nextBtn = document.querySelector('.carousel-nav-btn.next');
    const indicators = document.querySelectorAll('.indicator');
    const spinners = document.querySelectorAll('.loading-spinner');
    
    // Variables
    let currentSlide = 0;
    
    // Inicialización: forzar carga y reproducción inmediata
    videos.forEach((video, index) => {
        // Eliminar cualquier límite en la carga de video
        video.preload = 'auto';
        
        // Para compatibilidad con dispositivos móviles
        video.setAttribute('playsinline', '');
        
        // Forzar carga inmediata
        video.load();
        
        // Si es el primer video, reproducir automáticamente
        if (index === 0) {
            try {
                video.play();
                // Ocultar spinner cuando el video esté listo
                video.addEventListener('loadeddata', function() {
                    if (spinners[index]) spinners[index].style.display = 'none';
                });
            } catch (e) {
                console.error('Error al reproducir video inicial:', e);
            }
        }
        
        // Configurar controles de reproducción
        const playPauseBtn = video.parentElement.querySelector('.play-pause');
        const restartBtn = video.parentElement.querySelector('.video-restart');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                    this.querySelector('i').className = 'fas fa-pause';
                } else {
                    video.pause();
                    this.querySelector('i').className = 'fas fa-play';
                }
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                video.currentTime = 0;
                video.play();
                playPauseBtn.querySelector('i').className = 'fas fa-pause';
            });
        }
    });
    
    // Función para cambiar de slide
    function goToSlide(index) {
        // Validar índice
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // No hacer nada si estamos en el mismo slide
        if (index === currentSlide) return;
        
        // Detener video actual
        videos[currentSlide].pause();
        
        // Actualizar botón de reproducción
        const currentBtn = slides[currentSlide].querySelector('.play-pause i');
        if (currentBtn) currentBtn.className = 'fas fa-play';
        
        // Añadir clase 'prev' al slide actual para animación
        slides[currentSlide].classList.add('prev');
        
        // Desactivar todos los slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // Activar nuevo slide e indicador
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Reproducir el nuevo video
        const newVideo = videos[index];
        const playBtn = slides[index].querySelector('.play-pause i');
        
        // Mostrar spinner
        if (spinners[index]) spinners[index].style.display = 'flex';
        
        setTimeout(() => {
            // Eliminar 'prev' para futura transición
            slides.forEach(slide => slide.classList.remove('prev'));
            
            // Reproducir video
            newVideo.play()
                .then(() => {
                    // Cambiar ícono y ocultar spinner
                    if (playBtn) playBtn.className = 'fas fa-pause';
                    if (spinners[index]) spinners[index].style.display = 'none';
                })
                .catch(error => {
                    console.error('Error al reproducir:', error);
                });
                
            // Actualizar índice actual
            currentSlide = index;
        }, 100);
    }
    
    // Configurar navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }
    
    // Configurar indicadores
    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => goToSlide(idx));
    });
    
    // Inicializar videos inmediatamente
    console.log('Videos inicializados. Navegación lista.');
});