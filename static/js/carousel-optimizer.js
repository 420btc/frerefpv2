/**
 * Optimizador de Carrusel para FreireFPV
 * 
 * Este script optimiza específicamente los videos del carrusel en la página principal:
 * - Carga videos a baja resolución/calidad inmediatamente
 * - Controla los videos para detener la reproducción cuando no están visibles
 * - Implementa técnicas específicas para mejorar rendimiento en móviles
 */

class CarouselOptimizer {
    constructor() {
        this.isMobile = this.checkIfMobile();
        this.activeSlideIndex = 0;
        this.carouselVideos = [];
        this.carouselContainer = null;
    }

    /**
     * Detecta si el usuario está en un dispositivo móvil
     */
    checkIfMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    /**
     * Inicializa el optimizador
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configura el optimizador
     */
    setup() {
        this.carouselContainer = document.querySelector('.carousel-container');
        if (!this.carouselContainer) return;
        
        console.log("CarouselOptimizer: Inicializando para carrusel de videos");
        
        // Obtener todos los videos del carrusel
        const slides = this.carouselContainer.querySelectorAll('.carousel-slide');
        slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
                this.carouselVideos.push(video);
                
                // Optimizar video
                this.optimizeVideo(video);
            }
        });
        
        // Configurar manejadores de eventos para los botones de navegación
        const prevBtn = document.querySelector('.carousel-nav-btn.prev');
        const nextBtn = document.querySelector('.carousel-nav-btn.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.pauseAllVideos();
                setTimeout(() => this.handleSlideChange(), 100);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.pauseAllVideos();
                setTimeout(() => this.handleSlideChange(), 100);
            });
        }
        
        // Detectar cambios en el carrusel mediante observación de clases
        const slideObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (mutation.target.classList.contains('active')) {
                        const index = parseInt(mutation.target.dataset.index);
                        if (!isNaN(index)) {
                            this.activeSlideIndex = index;
                            this.handleSlideChange();
                        }
                    }
                }
            });
        });
        
        slides.forEach(slide => {
            slideObserver.observe(slide, { attributes: true });
        });
        
        // Manejar el slide inicial
        this.handleSlideChange();
        
        console.log(`CarouselOptimizer: ${this.carouselVideos.length} videos optimizados`);
    }
    
    /**
     * Optimiza un video específico del carrusel
     */
    optimizeVideo(video) {
        // Aplicar optimizaciones específicas para móviles
        if (this.isMobile) {
            // Reducir la calidad de reproducción en móviles
            video.setAttribute('playsinline', '');
            video.style.transform = 'scale(1.01)'; // Pequeño hack para mejorar rendimiento
            
            // Forzar hardware acceleration
            video.style.transform = 'translateZ(0)';
            video.style.backfaceVisibility = 'hidden';
            
            // Crear una versión de menor calidad del video
            const source = video.querySelector('source');
            if (source && source.src) {
                const originalSrc = source.src;
                
                // Crear un canvas para reducir la calidad del video
                if (!video.dynamicQuality && source.dataset.mobileSrc) {
                    video.dynamicQuality = true;
                    source.src = source.dataset.mobileSrc || originalSrc;
                    video.load();
                }
            }
        }
        
        // Agregar eventos para manejar la reproducción
        video.addEventListener('loadeddata', () => {
            // Cuando el video está listo, ocultar spinner si existe
            const spinner = video.parentElement.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        });
        
        // Mejorar rendimiento
        video.preload = "auto"; // Cargar inmediatamente para el carrusel
        
        // Si hay un botón de play/pause, configurarlo
        const playPauseBtn = video.parentElement.querySelector('.play-pause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (video.paused) {
                    video.play();
                    playPauseBtn.querySelector('i').className = 'fas fa-pause';
                } else {
                    video.pause();
                    playPauseBtn.querySelector('i').className = 'fas fa-play';
                }
            });
        }
        
        // Si hay un botón de reinicio, configurarlo
        const restartBtn = video.parentElement.querySelector('.video-restart');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                video.currentTime = 0;
                if (video.paused) {
                    video.play();
                    const icon = playPauseBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-pause';
                }
            });
        }
    }
    
    /**
     * Se ejecuta cuando cambia el slide activo en el carrusel
     */
    handleSlideChange() {
        const activeSlide = this.carouselContainer.querySelector('.carousel-slide.active');
        if (!activeSlide) return;
        
        const index = parseInt(activeSlide.dataset.index);
        if (isNaN(index)) return;
        
        this.activeSlideIndex = index;
        
        // Pausar todos los videos excepto el activo
        this.carouselVideos.forEach((video, i) => {
            const videoContainer = video.closest('.carousel-slide');
            if (!videoContainer) return;
            
            const videoIndex = parseInt(videoContainer.dataset.index);
            if (isNaN(videoIndex)) return;
            
            if (videoIndex === this.activeSlideIndex) {
                // Este es el video activo
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA o mejor
                    console.log(`CarouselOptimizer: Reproduciendo video ${i} (slide ${videoIndex})`);
                    
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn(`CarouselOptimizer: Error al reproducir video: ${error.message}`);
                        });
                    }
                    
                    // Actualizar el ícono del botón
                    const playPauseBtn = video.parentElement.querySelector('.play-pause');
                    if (playPauseBtn) {
                        const icon = playPauseBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-pause';
                    }
                } else {
                    // El video aún no está listo, agregar evento para reproducir cuando esté listo
                    console.log(`CarouselOptimizer: Video ${i} aún no está listo, esperando...`);
                    const loadHandler = () => {
                        console.log(`CarouselOptimizer: Video ${i} ahora está listo, reproduciendo`);
                        video.play().catch(e => console.warn(`Error al reproducir: ${e.message}`));
                        video.removeEventListener('canplay', loadHandler);
                    };
                    video.addEventListener('canplay', loadHandler);
                    
                    // Mostrar spinner si existe
                    const spinner = video.parentElement.querySelector('.loading-spinner');
                    if (spinner) {
                        spinner.style.display = 'flex';
                    }
                    
                    // Forzar carga
                    video.load();
                }
            } else {
                // Pausar videos inactivos
                video.pause();
                
                // Actualizar el ícono del botón
                const playPauseBtn = video.parentElement.querySelector('.play-pause');
                if (playPauseBtn) {
                    const icon = playPauseBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-play';
                }
            }
        });
    }
    
    /**
     * Pausa todos los videos del carrusel
     */
    pauseAllVideos() {
        this.carouselVideos.forEach(video => {
            if (!video.paused) {
                video.pause();
                
                // Actualizar el ícono del botón
                const playPauseBtn = video.parentElement.querySelector('.play-pause');
                if (playPauseBtn) {
                    const icon = playPauseBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-play';
                }
            }
        });
    }
}

// Inicializar el optimizador
document.addEventListener('DOMContentLoaded', () => {
    const carouselOptimizer = new CarouselOptimizer();
    carouselOptimizer.init();
    console.log("CarouselOptimizer: Inicializado");
});