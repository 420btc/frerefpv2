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
     * Registra todos los videos en la página para optimizarlos
     */
    registerVideos() {
        const videos = document.querySelectorAll('video[data-optimize="true"]');
        
        videos.forEach(video => {
            // Solo registrar videos que no hayan sido observados antes
            if (!this.observedVideos.has(video)) {
                // Guardar las fuentes originales antes de optimizar
                const sources = Array.from(video.querySelectorAll('source')).map(source => {
                    return {
                        src: source.src,
                        type: source.type,
                        dataset: { ...source.dataset }
                    };
                });
                
                // Guardar info adicional
                const videoData = {
                    sources: sources,
                    poster: video.poster,
                    loaded: false
                };
                
                this.observedVideos.set(video, videoData);
                
                // Configurar el video para carga diferida
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
                video.play().catch(e => {
                    console.warn(`VideoOptimizer: No se pudo reproducir automáticamente: ${e.message}`);
                });
            }
            
            videoData.loaded = true;
        }
    }

    /**
     * Descarga un video cuando deja de ser visible para liberar recursos
     */
    unloadVideo(video) {
        const videoData = this.observedVideos.get(video);
        
        // Solo descargar si está configurado para ser descargado cuando no es visible
        if (videoData && videoData.loaded && video.dataset.unloadWhenHidden === 'true') {
            console.log(`VideoOptimizer: Descargando video ${video.id || 'sin-id'}`);
            
            // Pausar el video
            video.pause();
            
            // Quitar fuentes para liberar recursos si está configurado para descarga completa
            if (video.dataset.fullUnload === 'true') {
                video.querySelectorAll('source').forEach(source => {
                    source.removeAttribute('src');
                });
                video.load(); // Esto liberará recursos
                videoData.loaded = false;
            }
        }
    }

    /**
     * Metodo principal para inicializar la optimización
     */
    init() {
        // Registrar todos los videos al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            this.registerVideos();
        });
        
        // También registrar videos después de carga para capturar contenido dinámico
        window.addEventListener('load', () => {
            this.registerVideos();
        });
        
        // Re-registrar videos si se agregan nuevos dinámicamente
        if ('MutationObserver' in window) {
            const bodyObserver = new MutationObserver((mutations) => {
                let shouldRegister = false;
                
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeName === 'VIDEO' || 
                                (node.nodeType === 1 && node.querySelector('video'))) {
                                shouldRegister = true;
                                break;
                            }
                        }
                    }
                });
                
                if (shouldRegister) {
                    this.registerVideos();
                }
            });
            
            bodyObserver.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        }
        
        console.log(`VideoOptimizer: Inicializado (Dispositivo ${this.isMobile ? 'móvil' : 'de escritorio'})`);
    }
}

// Crear e inicializar el optimizador de videos
const videoOptimizer = new VideoOptimizer();
videoOptimizer.init();