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
    function spinPropeller(propeller) {
        // Verificamos que no esté girando ya
        if (propeller.classList.contains('propeller-spinning') || 
            propeller.classList.contains('propeller-spinning-slow')) {
            return; // Ya está girando, no hacemos nada
        }
        
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
    }
    
    // Añadimos los listeners para cada símbolo
    propellers.forEach(propeller => {
        // Eliminar cualquier animación que pudiera haberse iniciado automáticamente
        propeller.classList.remove('propeller-spinning');
        propeller.classList.remove('propeller-spinning-slow');
        
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
    
    console.log('Animación de hélices para los símbolos del logo inicializada');
});