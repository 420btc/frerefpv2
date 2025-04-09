/**
 * Freire FPV - Button Animation Script
 * 
 * Este script añade los elementos span necesarios para las animaciones de los botones
 * y gestiona el efecto de onda al hacer clic en los botones
 */
document.addEventListener('DOMContentLoaded', function() {
    // Añadir spans a los botones que no los tengan
    const buttons = document.querySelectorAll('.btn-primary:not(:has(span)), .btn-submit:not(:has(span)), .btn-ver-mas:not(:has(span))');
    buttons.forEach(button => {
        // Solo agregar span si el botón no tiene ningún hijo que sea un span
        if (!button.querySelector('span')) {
            const content = button.innerHTML;
            button.innerHTML = `<span>${content}</span>`;
        }
    });

    // Añadir el efecto de onda al hacer clic
    document.body.addEventListener('mousedown', handleButtonEffect);
    document.body.addEventListener('touchstart', handleButtonEffect, {passive: true});

    function handleButtonEffect(e) {
        // Verificamos si el elemento clicado o alguno de sus padres tiene alguna de nuestras clases de botón
        let targetElement = e.target;
        let buttonElement = null;

        // Buscamos hasta 3 niveles arriba para encontrar un botón
        for (let i = 0; i < 3; i++) {
            if (!targetElement) break;
            
            if (targetElement.classList && 
                (targetElement.classList.contains('btn-primary') || 
                 targetElement.classList.contains('btn-submit') || 
                 targetElement.classList.contains('btn-ver-mas'))) {
                buttonElement = targetElement;
                break;
            }
            
            targetElement = targetElement.parentElement;
        }

        // Si encontramos un botón, creamos el efecto
        if (buttonElement) {
            // Obtenemos la posición del clic/toque
            let x, y;
            
            if (e.type === 'touchstart') {
                const touch = e.touches[0];
                x = touch.clientX - buttonElement.getBoundingClientRect().left;
                y = touch.clientY - buttonElement.getBoundingClientRect().top;
            } else {
                x = e.clientX - buttonElement.getBoundingClientRect().left;
                y = e.clientY - buttonElement.getBoundingClientRect().top;
            }
            
            // Forzamos la activación del pseudo-elemento a través de JS
            buttonElement.style.setProperty('--click-x', `${x}px`);
            buttonElement.style.setProperty('--click-y', `${y}px`);
            buttonElement.classList.add('button-clicked');
            
            // Eliminamos la clase después de la animación
            setTimeout(() => {
                buttonElement.classList.remove('button-clicked');
            }, 500);
        }
    }

    console.log('Animación de botones inicializada');
});