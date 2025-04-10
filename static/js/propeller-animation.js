/**
 * Freire FPV - Propeller Animation Script
 * 
 * Este script maneja la animación de los símbolos + y - del logo como hélices de dron
 */

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionamos todos los símbolos del logo
    const propellers = document.querySelectorAll('.propeller-symbol');
    
    if (propellers.length === 0) {
        console.log('No se encontraron elementos con clase .propeller-symbol');
        return;
    }
    
    // Función para iniciar la rotación de un símbolo
    function spinPropeller(propeller, isInteractive = false) {
        // Verificamos que no esté girando ya o detenemos animación existente
        if (propeller.classList.contains('propeller-spinning') || 
            propeller.classList.contains('propeller-spinning-slow')) {
            if (isInteractive) {
                // Si es interactivo, detenemos la animación
                propeller.classList.remove('propeller-spinning');
                propeller.classList.remove('propeller-spinning-slow');
            } else {
                // Si no es interactivo, no hacemos nada (ya está girando)
                return;
            }
        } else {
            // Iniciamos la animación
            if (Math.random() > 0.5) {
                propeller.classList.add('propeller-spinning');
            } else {
                propeller.classList.add('propeller-spinning-slow');
            }
            
            // Si es interactivo, después de un tiempo aleatorio, detenemos la animación
            if (isInteractive) {
                const duration = 3000 + Math.random() * 5000; // Entre 3 y 8 segundos
                setTimeout(() => {
                    propeller.classList.remove('propeller-spinning');
                    propeller.classList.remove('propeller-spinning-slow');
                }, duration);
            }
        }
    }
    
    // Añadimos los listeners para cada símbolo
    propellers.forEach(propeller => {
        // Hacer que algunos símbolos comiencen a girar automáticamente
        if (Math.random() > 0.5) {
            spinPropeller(propeller);
        }
        
        // Listener para clic
        propeller.addEventListener('click', function(e) {
            e.preventDefault(); // Evitar navegación si está dentro de un enlace
            e.stopPropagation(); // Evitar que el evento se propague
            spinPropeller(this, true);
        });
        
        // Listener para mouse enter (hover)
        propeller.addEventListener('mouseenter', function() {
            // Añadimos un pequeño retraso para que no se active inmediatamente al pasar el ratón
            this.hoverTimeout = setTimeout(() => {
                if (Math.random() > 0.3) { // 70% de probabilidad de que gire al pasar el ratón
                    spinPropeller(this, true);
                }
            }, 100); // 100ms de retraso
        });
        
        // Listener para mouse leave (fin del hover)
        propeller.addEventListener('mouseleave', function() {
            // Cancelamos el timeout si el usuario retira el ratón antes del retraso
            if (this.hoverTimeout) {
                clearTimeout(this.hoverTimeout);
            }
        });
    });
    
    console.log('Animación de hélices para los símbolos del logo inicializada');
});