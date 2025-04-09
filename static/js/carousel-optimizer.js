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
    
    // Función de debug
    function debug(msg) {
        console.log('Carrusel: ' + msg);
    }
    
    debug('Encontrados ' + slides.length + ' slides y ' + videos.length + ' videos');
    
    // Preparar videos para carga inmediata
    videos.forEach(video => {
        video.preload = 'auto';
        video.setAttribute('playsinline', '');
        video.load();
    });
    
    // Iniciar el primer video
    if (videos[0]) {
        const playBtn = slides[0].querySelector('.play-pause i');
        const spinner = slides[0].querySelector('.loading-spinner');
        
        videos[0].play()
            .then(() => {
                if (spinner) spinner.style.display = 'none';
                if (playBtn) playBtn.className = 'fas fa-pause';
                debug('Video inicial reproduciendo');
            })
            .catch(err => debug('Error reproduciendo video inicial: ' + err.message));
    }
    
    // Configurar botones de control para cada video
    videos.forEach((video, index) => {
        const playBtn = slides[index].querySelector('.play-pause');
        const restartBtn = slides[index].querySelector('.video-restart');
        
        if (playBtn) {
            playBtn.addEventListener('click', function() {
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
                if (playBtn) {
                    playBtn.querySelector('i').className = 'fas fa-pause';
                }
            });
        }
    });
    
    // Función principal para cambiar de slide
    function changeSlide(newIndex) {
        debug('Intentando cambiar al slide ' + newIndex);
        
        // Validar el índice
        if (newIndex < 0) newIndex = slides.length - 1;
        if (newIndex >= slides.length) newIndex = 0;
        
        // Si estamos en el mismo slide, no hacer nada
        if (newIndex === currentIndex) return;
        
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
        
        // Activar el nuevo slide e indicador
        slides[newIndex].classList.add('active');
        indicators[newIndex].classList.add('active');
        
        // Mostrar spinner mientras carga
        const spinner = slides[newIndex].querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';
        
        // Esperar a que termine la transición para reproducir el video
        setTimeout(() => {
            // Limpiar clase 'prev'
            slides.forEach(slide => slide.classList.remove('prev'));
            
            // Reproducir el nuevo video
            if (videos[newIndex]) {
                videos[newIndex].play()
                    .then(() => {
                        debug('Reproduciendo video ' + newIndex);
                        
                        // Actualizar botón
                        const playBtn = slides[newIndex].querySelector('.play-pause i');
                        if (playBtn) playBtn.className = 'fas fa-pause';
                        
                        // Ocultar spinner
                        if (spinner) spinner.style.display = 'none';
                    })
                    .catch(err => {
                        debug('Error reproduciendo video ' + newIndex + ': ' + err.message);
                        if (spinner) spinner.style.display = 'none';
                    });
            }
            
            // Actualizar índice actual
            currentIndex = newIndex;
        }, 500);
    }
    
    // Evento botón siguiente
    if (nextBtn) {
        debug('Configurando botón siguiente');
        nextBtn.onclick = function(e) {
            e.preventDefault();
            debug('Clic en botón siguiente');
            changeSlide(currentIndex + 1);
        };
    }
    
    // Evento botón anterior
    if (prevBtn) {
        debug('Configurando botón anterior');
        prevBtn.onclick = function(e) {
            e.preventDefault();
            debug('Clic en botón anterior');
            changeSlide(currentIndex - 1);
        };
    }
    
    // Configurar indicadores
    indicators.forEach((indicator, idx) => {
        indicator.onclick = function() {
            debug('Clic en indicador ' + idx);
            changeSlide(idx);
        };
    });
    
    debug('Carrusel inicializado correctamente');
});