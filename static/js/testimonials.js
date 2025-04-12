/**
 * Freire FPV - Sistema de Testimonios
 * 
 * Este script maneja la funcionalidad de testimonios de clientes:
 * - Carga testimonios desde la base de datos
 * - Permite a los usuarios añadir testimonios
 * - Permite a los usuarios eliminar sus propios testimonios
 * - Limita a un testimonio por semana por usuario
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos principales
    const testimonialContainer = document.querySelector('.testimonial-slider');
    const dotsContainer = document.querySelector('.testimonial-dots');
    const testimonialToggle = document.getElementById('testimonial-toggle');
    const formContainer = document.getElementById('testimonial-form-container');
    const addButton = document.getElementById('add-testimonial-btn');
    const closeButton = document.getElementById('close-form-btn');
    const testimonialForm = document.getElementById('testimonial-form');
    
    // Si no encontramos los elementos, no continuamos
    if (!testimonialContainer || !dotsContainer) {
        return;
    }
    
    // Variables
    let slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    let dots = Array.from(document.querySelectorAll('.dot'));
    let currentSlide = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let autoPlayInterval = null;
    let isPlaying = true;
    let canAddTestimonial = true;
    
    // Función para mostrar mensaje de notificación
    function showMessage(message, isError = false) {
        // Eliminar mensajes previos
        const prevMessage = document.getElementById('message-container');
        if (prevMessage) {
            prevMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background-color: ${isError ? '#d32f2f' : '#4caf50'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            text-align: center;
            max-width: 80%;
        `;
        messageContainer.textContent = message;
        
        document.body.appendChild(messageContainer);
        
        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            messageContainer.style.opacity = '0';
            messageContainer.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (messageContainer.parentNode) {
                    messageContainer.parentNode.removeChild(messageContainer);
                }
            }, 500);
        }, 4000);
    }
    
    // Función para mostrar un slide específico
    function showSlide(index) {
        // Validar índice
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Actualizar posición actual
        currentSlide = index;
        
        // Ocultar todos los slides
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        // Actualizar indicadores
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
                dot.style.backgroundColor = 'var(--color-primary)';
                dot.style.transform = 'scale(1.2)';
            } else {
                dot.classList.remove('active');
                dot.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                dot.style.transform = 'scale(1)';
            }
        });
    }
    
    // Función para avanzar al siguiente slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Función para retroceder al slide anterior
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Función para alternar la reproducción automática
    function toggleAutoPlay() {
        if (isPlaying) {
            clearInterval(autoPlayInterval);
            isPlaying = false;
        } else {
            autoPlayInterval = setInterval(nextSlide, 5000);
            isPlaying = true;
        }
    }
    
    // Función para eliminar un testimonio
    function deleteTestimonial(id, token) {
        if (!token) {
            showMessage('No se puede eliminar este testimonio', true);
            return;
        }
        
        // Verificar si es un testimonio del sistema
        if (token === 'system') {
            showMessage('Este testimonio no puede ser eliminado. Es un testimonio verificado.', true);
            return;
        }
        
        // Verificar si el usuario es el propietario del testimonio
        const myToken = localStorage.getItem('myTestimonialToken');
        if (myToken !== token) {
            showMessage('Solo puedes eliminar testimonios que tú has creado', true);
            return;
        }
        
        if (!confirm('¿Estás seguro de que deseas eliminar este testimonio?')) {
            return;
        }
        
        fetch(`/api/testimonios/${token}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Buscar el elemento a eliminar
                const testimonialElement = document.getElementById(id);
                if (testimonialElement) {
                    // Buscar el índice del elemento
                    const index = slides.indexOf(testimonialElement);
                    
                    // Eliminar el elemento del DOM
                    testimonialElement.remove();
                    
                    // Eliminar el dot correspondiente
                    if (index !== -1 && index < dots.length) {
                        dots[index].remove();
                    }
                    
                    // Actualizar arrays
                    slides = Array.from(document.querySelectorAll('.testimonial-slide'));
                    dots = Array.from(document.querySelectorAll('.dot'));
                    
                    // Mostrar otro slide si hay
                    if (slides.length > 0) {
                        showSlide(Math.min(currentSlide, slides.length - 1));
                    }
                    
                    // Mostrar mensaje de éxito
                    showMessage('Testimonio eliminado correctamente');
                    
                    // Permitir añadir un nuevo testimonio
                    localStorage.removeItem('lastTestimonialTime');
                    localStorage.removeItem('myTestimonialToken');
                    canAddTestimonial = true;
                }
            } else {
                showMessage(data.error || 'Error al eliminar el testimonio', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Ha ocurrido un error al eliminar el testimonio', true);
        });
    }
    
    // Verificar si el usuario puede añadir un nuevo testimonio
    function checkIfUserCanAddTestimonial() {
        const lastTestimonialTime = localStorage.getItem('lastTestimonialTime');
        
        if (lastTestimonialTime) {
            const lastTime = parseInt(lastTestimonialTime);
            const currentTime = Date.now();
            const daysPassed = (currentTime - lastTime) / (1000 * 60 * 60 * 24);
            
            if (daysPassed < 7) {
                const daysRemaining = Math.ceil(7 - daysPassed);
                const message = `Solo puedes añadir un testimonio cada 7 días. Debes esperar ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} más.`;
                
                canAddTestimonial = false;
                
                // Cambiar el texto del botón
                if (addButton) {
                    const tooltipSpan = document.querySelector('#testimonial-toggle span');
                    if (tooltipSpan) {
                        tooltipSpan.textContent = 'Espera ' + daysRemaining + ' día' + (daysRemaining !== 1 ? 's' : '') + ' más';
                    }
                    
                    addButton.style.backgroundColor = '#ccc';
                    addButton.style.cursor = 'not-allowed';
                    
                    // Tooltip para móviles
                    addButton.addEventListener('click', function(e) {
                        if (!canAddTestimonial) {
                            e.preventDefault();
                            showMessage(message, true);
                        }
                    });
                }
                
                return false;
            }
        }
        
        return true;
    }
    
    // Iniciar el autoplay
    autoPlayInterval = setInterval(nextSlide, 5000);
    
    // Mostrar el primer slide
    if (slides.length > 0) {
        showSlide(0);
    }
    
    // Asignar eventos a los dots de navegación
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            
            // Reiniciar el autoplay
            if (isPlaying) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, 5000);
            }
        });
    });
    
    // Eventos de botones del formulario
    if (addButton) {
        addButton.addEventListener('click', function() {
            if (canAddTestimonial) {
                testimonialToggle.style.display = 'none';
                formContainer.style.display = 'block';
            } else {
                checkIfUserCanAddTestimonial(); // Mostrar mensaje
            }
        });
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            formContainer.style.display = 'none';
            testimonialToggle.style.display = 'block';
        });
    }
    
    // Manejar envío del formulario
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!canAddTestimonial) {
                showMessage('Solo puedes añadir un testimonio cada 7 días', true);
                return;
            }
            
            // Obtener valores
            const name = document.getElementById('testimonial-name').value;
            const role = document.getElementById('testimonial-role').value;
            const text = document.getElementById('testimonial-text').value;
            
            // Validación
            if (!name || !role || !text) {
                showMessage('Por favor, completa todos los campos', true);
                return;
            }
            
            // Mostrar estado "Publicando..."
            const submitButton = document.getElementById('submit-testimonial');
            const loadingIndicator = document.createElement('div');
            loadingIndicator.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(255, 125, 0, 0.8);
                color: white;
                font-weight: bold;
                border-radius: 5px;
                z-index: 1;
            `;
            loadingIndicator.textContent = 'Publicando...';
            
            if (submitButton) {
                submitButton.parentNode.appendChild(loadingIndicator);
                submitButton.disabled = true;
            }
            
            // Enviar datos a la API
            fetch('/api/testimonios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: name,
                    ocupacion: role,
                    texto: text
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Datos del testimonio creado
                    const newTestimonial = data.testimonio;
                    const testimonialId = `testimonio-${newTestimonial.id}`;
                    const token = data.token;
                    
                    // Crear el elemento del nuevo testimonio
                    const newElement = document.createElement('div');
                    newElement.className = 'testimonial-slide';
                    newElement.id = testimonialId;
                    newElement.setAttribute('data-token', token);
                    
                    newElement.innerHTML = `
                        <div class="testimonial-content" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 1.5rem; margin: 0 auto; max-width: 800px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); position: relative; border-left: 4px solid var(--color-primary);">
                            <button class="delete-testimonial" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--color-primary); font-size: 18px; cursor: pointer; opacity: 0.7; transition: all 0.3s ease;">&times;</button>
                            <p style="font-size: 1rem; line-height: 1.6; font-weight: 400; color: #fff; margin-bottom: 1rem; text-align: center; font-style: italic;">"${newTestimonial.texto}"</p>
                            <div class="client-info" style="text-align: center; margin-top: 1rem;">
                                <span class="client-name" style="display: block; font-weight: 600; color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.25rem;">${newTestimonial.nombre}</span>
                                <span class="client-role" style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">${newTestimonial.ocupacion}</span>
                                <span class="testimonial-date" style="display: block; color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin-top: 0.5rem;">${new Date(newTestimonial.fecha_creacion).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    `;
                    
                    // Añadir el testimonio al carrusel
                    testimonialContainer.appendChild(newElement);
                    
                    // Crear y añadir un nuevo punto de navegación
                    const newDot = document.createElement('span');
                    newDot.className = 'dot';
                    newDot.setAttribute('data-token', token);
                    newDot.style.cssText = 'width: 12px; height: 12px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.3); margin: 0 6px; cursor: pointer; transition: background-color 0.3s ease, transform 0.3s ease;';
                    dotsContainer.appendChild(newDot);
                    
                    // Actualizar arrays
                    slides = Array.from(document.querySelectorAll('.testimonial-slide'));
                    dots = Array.from(document.querySelectorAll('.dot'));
                    
                    // Asignar evento al punto de navegación
                    newDot.addEventListener('click', function() {
                        showSlide(dots.indexOf(this));
                    });
                    
                    // Mostrar el testimonio recién añadido
                    setTimeout(() => {
                        showSlide(slides.length - 1);
                        
                        // Guardar timestamp para control de frecuencia y token para identificación
                        localStorage.setItem('lastTestimonialTime', Date.now());
                        localStorage.setItem('myTestimonialToken', token);
                        
                        // Configurar estado
                        canAddTestimonial = false;
                        
                        // Mostrar mensaje de éxito
                        showMessage('Tu testimonio ha sido añadido con éxito. ¡Gracias!');
                        
                        // Añadir evento al botón de eliminar
                        const deleteButton = newElement.querySelector('.delete-testimonial');
                        if (deleteButton) {
                            deleteButton.addEventListener('click', function() {
                                deleteTestimonial(testimonialId, token);
                            });
                        }
                    }, 300);
                } else {
                    // Mostrar mensaje de error
                    showMessage(data.error || 'Error al añadir el testimonio', true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Ha ocurrido un error al procesar tu solicitud. Inténtalo de nuevo.', true);
            })
            .finally(() => {
                // Limpiar UI
                if (loadingIndicator && loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
                
                if (submitButton) {
                    submitButton.disabled = false;
                }
                
                // Ocultar formulario
                formContainer.style.display = 'none';
                testimonialToggle.style.display = 'block';
                
                testimonialForm.reset();
            });
        });
    }
    
    // Eventos para los botones de eliminar testimonios
    document.querySelectorAll('.delete-testimonial').forEach(button => {
        const testimonialSlide = button.closest('.testimonial-slide');
        if (testimonialSlide) {
            const testimonialId = testimonialSlide.id;
            const token = testimonialSlide.getAttribute('data-token');
            
            button.addEventListener('click', function() {
                deleteTestimonial(testimonialId, token);
            });
        }
    });
    
    // Comprobar si el usuario puede añadir testimonios
    if (!checkIfUserCanAddTestimonial()) {
        // Ya se ha configurado el estado en la función
    }
    
    // Soporte para swipe en móviles
    testimonialContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    testimonialContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide(); // Swipe hacia la izquierda, muestra el siguiente
            if (isPlaying) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, 5000);
            }
        }
        
        if (touchEndX > touchStartX + 50) {
            prevSlide(); // Swipe hacia la derecha, muestra el anterior
            if (isPlaying) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, 5000);
            }
        }
    }
});