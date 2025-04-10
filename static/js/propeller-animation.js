/**
 * Freire FPV - Propeller Animation Script
 * 
 * Este script maneja la animación de los símbolos + y - del logo como hélices de dron
 * Se asegura de que la animación solo se active por interacción del usuario
 */

document.addEventListener('DOMContentLoaded', function() {
    // Esperamos un momento para asegurarnos de que todo esté cargado
    setTimeout(() => {
        initializePropellerAnimations();
    }, 100);
});

// Función principal para inicializar las animaciones
function initializePropellerAnimations() {
    // Primero, aseguramos que no haya ninguna animación activa
    const allPropellers = document.querySelectorAll('.propeller-symbol');
    
    // Detener cualquier animación que pueda estar activa
    allPropellers.forEach(propeller => {
        propeller.classList.remove('propeller-spinning');
        propeller.classList.remove('propeller-spinning-slow');
        
        // Reiniciar estilos para asegurar que no hay animaciones residuales
        propeller.style.animation = 'none';
        propeller.offsetHeight; // Forzar un reflow para que se aplique el cambio de estilo
        propeller.style.animation = null;
    });

    if (allPropellers.length === 0) {
        console.log('No se encontraron elementos con clase .propeller-symbol');
        return;
    }
    
    // Función para iniciar la rotación de un símbolo
    function spinPropeller(propeller) {
        // Parar cualquier animación previa
        propeller.classList.remove('propeller-spinning');
        propeller.classList.remove('propeller-spinning-slow');
        propeller.style.animation = 'none';
        propeller.offsetHeight; // Forzar un reflow para que se aplique el cambio de estilo
        propeller.style.animation = null;
        
        // Esperar un momento antes de iniciar la nueva animación
        setTimeout(() => {
            // Iniciamos la animación con velocidad aleatoria
            if (Math.random() > 0.5) {
                propeller.classList.add('propeller-spinning');
            } else {
                propeller.classList.add('propeller-spinning-slow');
            }
            
            // Detenemos la animación después de un tiempo corto (1-2 segundos)
            const duration = 1000 + Math.random() * 1000; 
            setTimeout(() => {
                propeller.classList.remove('propeller-spinning');
                propeller.classList.remove('propeller-spinning-slow');
            }, duration);
        }, 10);
    }
    
    // Añadimos los listeners para cada símbolo
    allPropellers.forEach(propeller => {
        // Listener para clic
        propeller.addEventListener('click', function(e) {
            e.preventDefault(); // Evitar navegación si está dentro de un enlace
            e.stopPropagation(); // Evitar que el evento se propague
            spinPropeller(this);
        });
        
        // Listener para mouse enter (hover)
        propeller.addEventListener('mouseenter', function() {
            spinPropeller(this);
        });
    });
    
    console.log('Animación de hélices para los símbolos del logo inicializada correctamente');
}