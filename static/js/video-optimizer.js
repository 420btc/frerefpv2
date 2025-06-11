/**
 * FreireFPV - Optimizador de Videos
 * 
 * Este script mejora el rendimiento de los videos en el sitio:
 * - Implementa lazy loading (carga diferida)
 * - Detecta dispositivos móviles para servir versiones ligeras
 * - Libera recursos cuando los videos no están visibles
 * - Usa IntersectionObserver para cargar videos solo cuando son visibles
 */

class VideoOptimizer {
    constructor() {
        this.isMobile = this.checkIfMobile();
        this.videoObserver = null;
        this.observedVideos = new Map(); // Para mantener registro de videos observados
        this.initObserver();
    }

    /**
     * Detecta si el usuario está en un dispositivo móvil
     */
    checkIfMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    /**
     * Inicializa el IntersectionObserver para detectar videos visibles
     */
    initObserver() {
        // Crear el IntersectionObserver si está soportado por el navegador
        if ('IntersectionObserver' in window) {
            this.videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    
                    // Si el video es visible en pantalla
                    if (entry.isIntersecting) {
                        this.loadVideo(video);
                    } else {
                        this.unloadVideo(video);
                    }
                });
            }, {
                // Umbral de 0.1 significa que se activará cuando al menos el 10% del video sea visible
                threshold: 0.1,
                // Margen para cargar videos un poco antes de que sean visibles
                rootMargin: '100px'
            });
        }
    }

    /**
     * Registra todos los videos para optimización
     */
    registerVideos() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Excluir videos del carrusel y video de fondo del lazy loading
            const isCarouselVideo = video.classList.contains('drone-video');
            const isHeroVideo = video.id === 'hero-background-video';
            const hasLazyloadDisabled = video.dataset.lazyload === 'false';
            
            if (!isCarouselVideo && !isHeroVideo && !hasLazyloadDisabled) {
                // Guardar información del video
                this.observedVideos.set(video, {
                    loaded: false,
                    originalSources: []
                });
                
                // Solo aplicar lazy loading a videos que no son críticos
                if (video.dataset.lazyload !== 'false') {
                    // Guardar la fuente original pero quitar del src para prevenir carga automática
                    video.querySelectorAll('source').forEach(source => {
                        source.dataset.src = source.src;
                        source.removeAttribute('src');
                    });
                    
                    // Observar para carga diferida
                    if (this.videoObserver) {
                        this.videoObserver.observe(video);
                    }
                }
            }
        });
        
        console.log(`VideoOptimizer: ${this.observedVideos.size} videos registrados para optimización`);
    }

    /**
     * Carga un video cuando se vuelve visible
     */
    loadVideo(video) {
        const videoData = this.observedVideos.get(video);
        
        if (videoData && !videoData.loaded) {
            console.log(`VideoOptimizer: Cargando video ${video.id || 'sin-id'}`);
            
            // Restaurar fuentes
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.dataset.src) {
                    // Si hay una versión móvil y estamos en móvil, usarla
                    if (this.isMobile && source.dataset.mobileSrc) {
                        source.src = source.dataset.mobileSrc;
                    } else {
                        source.src = source.dataset.src;
                    }
                }
            });
            
            // Recargar el video para que detecte las nuevas fuentes
            video.load();
            
            // Reproducir automáticamente si está configurado para ello
            if (video.dataset.autoplay === 'true') {
                // Usar un pequeño delay para evitar conflictos
                setTimeout(() => {
                    video.play().catch(e => {
                        console.warn(`VideoOptimizer: No se pudo reproducir automáticamente: ${e.message}`);
                    });
                }, 100);
            }
            
            // Marcar como cargado
            videoData.loaded = true;
        }
    }

    /**
     * Descarga un video cuando sale de la vista (opcional)
     */
    unloadVideo(video) {
        const videoData = this.observedVideos.get(video);
        
        if (videoData && videoData.loaded) {
            // Solo pausar, no descargar completamente para mejor UX
            if (!video.paused) {
                video.pause();
            }
        }
    }

    /**
     * Optimiza un video específico para móviles
     */
    optimizeForMobile(video) {
        if (this.isMobile) {
            // Reducir calidad en móviles
            video.setAttribute('preload', 'metadata');
            
            // Buscar fuente móvil si existe
            const mobileSource = video.querySelector('source[data-mobile-src]');
            if (mobileSource && mobileSource.dataset.mobileSrc) {
                mobileSource.src = mobileSource.dataset.mobileSrc;
                video.load();
            }
        }
    }

    /**
     * Limpia recursos cuando el video no es necesario
     */
    cleanup(video) {
        if (this.videoObserver) {
            this.videoObserver.unobserve(video);
        }
        this.observedVideos.delete(video);
    }

    /**
     * Destruye el optimizador y limpia todos los recursos
     */
    destroy() {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
        this.observedVideos.clear();
    }
}

// Inicializar el optimizador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global del optimizador
    window.videoOptimizer = new VideoOptimizer();
    
    // Registrar videos después de un pequeño delay para asegurar que todos los elementos estén listos
    setTimeout(() => {
        window.videoOptimizer.registerVideos();
    }, 100);
});

// Exportar para uso en otros scripts si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoOptimizer;
}