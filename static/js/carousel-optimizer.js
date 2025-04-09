/**
 * Optimizador de Carrusel para FreireFPV
 * 
 * Script simplificado para gestionar el carrusel de videos con carga inmediata
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Carrusel: Inicializando gestión simplificada");
    
    // Elementos del carrusel
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;
    
    const slides = carouselContainer.querySelectorAll('.carousel-slide');
    const videos = carouselContainer.querySelectorAll('video');
    const prevButton = document.querySelector('.carousel-nav-btn.prev');
    const nextButton = document.querySelector('.carousel-nav-btn.next');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    
    // Asegurarse de que todos los videos estén precargados
    videos.forEach((video, index) => {
        // Forzar precarga
        video.preload = "auto";
        
        // Optimizaciones para móviles (dispositivos iOS en particular)
        video.setAttribute('playsinline', '');
        video.style.transform = 'translateZ(0)'; // Hardware acceleration
        
        // Usar versión móvil si está disponible
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            const source = video.querySelector('source');
            if (source && source.dataset.mobileSrc) {
                source.src = source.dataset.mobileSrc;
                video.load();
            }
        }
        
        // Configurar controles de video
        const playPauseBtn = video.parentElement.querySelector('.play-pause');
        const restartBtn = video.parentElement.querySelector('.video-restart');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function(e) {
                e.preventDefault();
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
            restartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                video.currentTime = 0;
                video.play();
                const icon = playPauseBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-pause';
            });
        }
        
        // Si es el primer video, reproducirlo automáticamente
        if (index === 0) {
            // Ocultar spinner después de cargar
            video.addEventListener('loadeddata', function() {
                const spinner = video.parentElement.querySelector('.loading-spinner');
                if (spinner) spinner.style.display = 'none';
                
                // Reproducir video
                console.log("Carrusel: Video inicial cargado, reproduciendo");
                video.play().catch(e => console.warn(`Error al reproducir: ${e.message}`));
            });
        }
    });
    
    // Función para pausar todos los videos
    function pauseAllVideos() {
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                const btn = video.parentElement.querySelector('.play-pause');
                if (btn) {
                    const icon = btn.querySelector('i');
                    if (icon) icon.className = 'fas fa-play';
                }
            }
        });
    }
    
    // Función para cambiar de slide
    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // Si estamos en el mismo slide, no hacer nada
        if (index === currentSlide) return;
        
        console.log(`Carrusel: Cambiando al slide ${index}`);
        
        // Pausar todos los videos
        pauseAllVideos();
        
        // Marcar el slide actual como previo (para animación)
        slides[currentSlide].classList.add('prev');
        
        // Quitar clase active de todos los slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // Activar el nuevo slide e indicador
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Reproducir el video del nuevo slide
        const currentVideo = videos[index];
        
        // Ocultar spinner mientras carga
        const spinner = currentVideo.parentElement.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';
        
        // Actualizar ícono de reproducción
        const playPauseBtn = currentVideo.parentElement.querySelector('.play-pause');
        
        // Reproducir después de un pequeño retraso para la transición
        setTimeout(() => {
            // Quitar clase prev de todos para preparar próxima transición
            slides.forEach(slide => slide.classList.remove('prev'));
            
            // Reproducir video
            currentVideo.play()
                .then(() => {
                    if (playPauseBtn) {
                        const icon = playPauseBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-pause';
                    }
                    if (spinner) spinner.style.display = 'none';
                })
                .catch(e => {
                    console.warn(`Error al reproducir video ${index}: ${e.message}`);
                    if (playPauseBtn) {
                        const icon = playPauseBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-play';
                    }
                });
        }, 100);
        
        // Actualizar índice actual
        currentSlide = index;
    }
    
    // Configurar botones de navegación
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });
    }
    
    // Configurar indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Forzar carga de todos los videos inmediatamente
    videos.forEach(video => {
        if (video.readyState < 3) { // HAVE_FUTURE_DATA
            video.load();
        }
    });
    
    console.log(`Carrusel: ${videos.length} videos preparados`);
});