/**
 * Freire FPV - Main JavaScript
 * Author: Carlos Pastor Freire
 * Version: 1.1
 *
 * Actualizado para mejorar la carga y rendimiento del video
 */
 
// El carrusel ahora se maneja a través de carousel-optimizer.js
// Este bloque se ha desactivado para evitar conflictos con el optimizador
document.addEventListener('DOMContentLoaded', function() {
    console.log("Carrusel manejado por carousel-optimizer.js");
});

// Manejador para el video de fondo del hero y secuencia de GIFs
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del video de fondo y secuencia de GIFs
    const heroVideo = document.getElementById('hero-background-video');
    const preloadingContainer = document.getElementById('preloading-container');
    const gifSlides = document.querySelectorAll('.gif-slide');
    
    if (heroVideo && preloadingContainer && gifSlides.length > 0) {
        // Forzamos la reproducción del video desde el principio
        heroVideo.currentTime = 0;
        
        // Añadimos logging para depuración
        console.log('Inicializando sistema de preloading con GIFs...');
        
        // Asegurar que está silenciado para evitar problemas con el autoplay
        heroVideo.muted = true;
        
        // Variables para la secuencia de GIFs
        let currentGifIndex = 0;
        let gifIntervalId;
        
        // Función para mostrar el siguiente GIF en la secuencia
        function showNextGif() {
            // Ocultamos el GIF actual
            gifSlides[currentGifIndex].classList.remove('active');
            
            // Incrementamos el índice
            currentGifIndex = (currentGifIndex + 1) % gifSlides.length;
            
            // Mostramos el siguiente GIF
            gifSlides[currentGifIndex].classList.add('active');
            
            // Si hemos mostrado todos los GIFs, preparamos la transición al video
            if (currentGifIndex === gifSlides.length - 1) {
                // Comprobamos si el video está listo para reproducirse
                checkVideoReady();
            }
        }
        
        // Iniciar la secuencia de GIFs (cambiar cada 2 segundos)
        gifIntervalId = setInterval(showNextGif, 2000);
        
        // Función para comprobar si el video está listo y hacer la transición
        function checkVideoReady() {
            if (heroVideo.readyState >= 3) { // HAVE_FUTURE_DATA o superior
                console.log('Video listo para transicionar desde los GIFs');
                
                // Detenemos el intervalo de cambio de GIFs
                clearInterval(gifIntervalId);
                
                // Esperar un poco más para asegurar que se vea el último GIF
                setTimeout(() => {
                    // Iniciar reproducción del video
                    heroVideo.play().then(() => {
                        console.log('Video de fondo iniciado tras secuencia de GIFs');
                        
                        // Ocultamos los GIFs con una transición suave
                        setTimeout(() => {
                            preloadingContainer.classList.add('hidden');
                        }, 500);
                    }).catch(e => {
                        console.error('Error al iniciar el video tras los GIFs:', e);
                    });
                }, 1500);
            } else {
                // El video no está listo, seguimos con los GIFs
                console.log('Video aún no está listo, continuando con GIFs...');
            }
        }
        
        // Diferentes eventos para el video
        heroVideo.addEventListener('loadeddata', function() {
            console.log('Video de fondo: datos cargados');
        });
        
        heroVideo.addEventListener('loadedmetadata', function() {
            console.log('Video de fondo: metadata cargada, duración:', heroVideo.duration);
        });
        
        // Cuando el video pueda reproducirse, prepara la transición
        heroVideo.addEventListener('canplay', function() {
            console.log('Video de fondo listo para reproducirse');
            
            // Comprobar si estamos en el último GIF para hacer la transición
            if (currentGifIndex === gifSlides.length - 1) {
                checkVideoReady();
            }
        });
        
        // Si ocurre un error al cargar el video
        heroVideo.addEventListener('error', function(e) {
            console.error('Error al cargar el video de fondo:', e.target.error);
            // En caso de error, dejamos los GIFs indefinidamente
        });
        
        // Si el video se detiene
        heroVideo.addEventListener('pause', function() {
            console.log('Video de fondo pausado');
            // Intentar reproducir de nuevo automáticamente
            setTimeout(() => heroVideo.play().catch(e => console.log('No se pudo reanudar automáticamente')), 100);
        });
        
        // Eventos adicionales
        heroVideo.addEventListener('playing', () => console.log('Video de fondo está reproduciendo'));
        heroVideo.addEventListener('waiting', () => console.log('Video de fondo está esperando más datos'));
        heroVideo.addEventListener('ended', () => console.log('Video de fondo terminó'));
        
        // Intentamos forzar la carga del video
        try {
            console.log('Forzando la carga del video de fondo');
            heroVideo.load();
        } catch(e) {
            console.error('Error al forzar la carga del video de fondo:', e);
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // EmailJS ya está inicializado en layout.html con la clave pública

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Transform hamburger into X
            const bars = mobileMenu.querySelectorAll('.bar');
            if (mobileMenu.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                mobileMenu.click();
            }
        });
    });

    // Scroll animation
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('show');
            }
        });
    }
    
    // Check elements on page load
    checkScroll();
    
    // Check elements on scroll
    window.addEventListener('scroll', checkScroll);

    // Comentamos el efecto parallax para el hero section ya que ahora usamos video de fondo
    // const parallaxSection = document.querySelector('.parallax-section');
    // 
    // if (parallaxSection) {
    //     window.addEventListener('scroll', function() {
    //         const scrollPosition = window.pageYOffset;
    //         parallaxSection.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    //     });
    // }

    // Modal functionality for service requests
    const modal = document.getElementById('servicio-modal');
    const modalButtons = document.querySelectorAll('.open-modal');
    const closeModal = document.querySelector('.close-modal');
    const successMessage = document.getElementById('success-message');
    const closeSuccessButton = document.querySelector('.btn-close');
    
    // Open modal
    modalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceType = serviceCard.dataset.service;
            const servicePrice = serviceCard.dataset.precio;
            
            document.getElementById('tipo-servicio').value = serviceType;
            document.getElementById('precio-base').value = servicePrice;
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Enable scrolling
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
    });
    
    // Form submission for service request
    const servicioForm = document.getElementById('servicio-form');
    
    if (servicioForm) {
        servicioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const tipoServicio = document.getElementById('tipo-servicio').value;
            const precioBase = document.getElementById('precio-base').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const duracion = document.getElementById('duracion').value;
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            const mensaje = document.getElementById('mensaje').value;
            
            // Prepare template parameters for EmailJS
            const templateParams = {
                from_name: nombre,
                tipo_servicio: tipoServicio,
                precio_base: precioBase,
                ubicacion: ubicacion,
                duracion: duracion,
                email: email,
                telefono: telefono,
                mensaje: mensaje
            };
            
            // Send email using EmailJS
            // Using the provided service_id: service_k65jk6c
            // Creating a custom template directly in the code since template_id is not provided yet
            // Sending email to carlosfreire777@gmail.com
            
            // Add to_email in templateParams
            templateParams.to_email = 'carlosfreire777@gmail.com';
            templateParams.subject = 'Nuevo pedido de Freire FPV';
            
            // Create message content for the email
            templateParams.message = `
Nuevo pedido de Freire FPV
Tipo de servicio: ${tipoServicio}
Precio base: ${precioBase}
Ubicación: ${ubicacion}
Duración aproximada: ${duracion}
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
${mensaje ? 'Mensaje adicional: ' + mensaje : ''}
`;
            
            console.log('Enviando email con parámetros:', templateParams);
            
            // Parámetros para enviar a Carlos (toda la información del cliente)
            const adminParams = {
                from_name: nombre,
                email: email,
                telefono: telefono,
                tipo_servicio: tipoServicio,
                precio_base: precioBase,
                ubicacion: ubicacion,
                duracion: duracion,
                mensaje: mensaje,
                to_email: 'carlosfreire777@gmail.com',
                subject: 'Nuevo pedido de Freire FPV',
                message: `
Nuevo pedido de Freire FPV
Tipo de servicio: ${tipoServicio}
Precio base: ${precioBase}
Ubicación: ${ubicacion}
Duración aproximada: ${duracion}
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
${mensaje ? 'Mensaje adicional: ' + mensaje : ''}
`
            };
            
            // Parámetros para enviar al cliente (confirmación de pedido)
            const clientParams = {
                from_name: 'Freire FPV',
                to_email: email,
                subject: 'Confirmación de tu pedido - Freire FPV',
                message: `
Hola ${nombre},

¡Gracias por solicitar nuestros servicios de grabación con drones FPV!

Hemos recibido tu pedido:
- Servicio: ${tipoServicio}
- Ubicación: ${ubicacion}
- Duración: ${duracion}

Te contactaremos en un plazo máximo de 24 horas para confirmar todos los detalles.

Saludos,
Carlos Freire
Freire FPV
`
            };
            
            // Mostrar en la consola los parámetros que se envían
            console.log('Enviando email con parámetros:', adminParams);
            
            // Primero enviar email a Carlos (admin) usando template_1exdmsp
            emailjs.send('service_k65jk6c', 'template_1exdmsp', adminParams)
                .then(function(response) {
                    console.log('Email al admin enviado correctamente:', response.status, response.text);
                    
                    // Mostrar en la consola los parámetros del cliente
                    console.log('Enviando email al cliente con parámetros:', clientParams);
                    
                    // Luego enviar email al cliente usando template_tnzvsui
                    return emailjs.send('service_k65jk6c', 'template_tnzvsui', clientParams);
                })
                .then(function(response) {
                    console.log('Email al cliente enviado correctamente:', response.status, response.text);
                    
                    // Hide modal and show success message
                    modal.classList.remove('show');
                    successMessage.style.display = 'flex';
                    
                    // Reset form
                    servicioForm.reset();
                    
                    // Crear y mostrar el dron volador
                    const flyingDrone = document.createElement('div');
                    flyingDrone.className = 'flying-drone';
                    document.body.appendChild(flyingDrone);
                    
                    // Eliminar el dron después de que termine la animación (5 segundos)
                    setTimeout(() => {
                        document.body.removeChild(flyingDrone);
                    }, 5000);
                    
                    // Ya no mostramos alerta del navegador, solo el mensaje en la aplicación
                    console.log("Pedido enviado correctamente");
                })
                .catch(function(error) {
                    console.log('FAILED...', error);
                    console.log('Error detallado:', JSON.stringify(error));
                    alert("Error al enviar, intenta de nuevo");
                });
        });
    }
    
    // Close success message
    if (closeSuccessButton) {
        closeSuccessButton.addEventListener('click', function() {
            successMessage.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Ref al botón de enviar
        const contactSubmitBtn = document.getElementById('contacto-submit-btn');
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aplicar la animación de "enviando" al botón
            contactSubmitBtn.classList.add('sending');
            contactSubmitBtn.innerHTML = '<span>Enviando...</span>';
            
            // Get form data
            const nombre = document.getElementById('nombre-contacto').value;
            const email = document.getElementById('email-contacto').value;
            const telefono = document.getElementById('telefono-contacto').value;
            const asunto = document.getElementById('asunto').value;
            const mensaje = document.getElementById('mensaje-contacto').value;
            
            // Prepare template parameters for EmailJS
            console.log('Enviando email de contacto');
            
            // Parámetros para enviar a Carlos (toda la información)
            const adminContactParams = {
                from_name: nombre,
                email: email,
                telefono: telefono,
                asunto: asunto,
                mensaje: mensaje,
                to_email: 'carlosfreire777@gmail.com',
                subject: 'Consulta de contacto - Freire FPV',
                message: `
Consulta de contacto - Freire FPV
Asunto: ${asunto}
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Mensaje: ${mensaje}
`
            };
            
            // Parámetros para enviar al cliente (confirmación de contacto)
            const clientContactParams = {
                from_name: 'Freire FPV',
                to_email: email,
                subject: 'Hemos recibido tu consulta - Freire FPV',
                message: `
Hola ${nombre},

¡Gracias por contactar con Freire FPV!

Hemos recibido tu consulta sobre "${asunto}" y te responderemos a la mayor brevedad posible.

Te contactaremos en un plazo máximo de 24 horas.

Saludos,
Carlos Freire
Freire FPV
`
            };
            
            // Mostrar en la consola los parámetros que se envían
            console.log('Enviando email de contacto con parámetros:', adminContactParams);
            
            // Primero enviar email a Carlos (admin) usando template_1exdmsp
            emailjs.send('service_k65jk6c', 'template_1exdmsp', adminContactParams)
                .then(function(response) {
                    console.log('Email al admin enviado correctamente:', response.status, response.text);
                    
                    // Mostrar en la consola los parámetros del cliente
                    console.log('Enviando email al cliente con parámetros:', clientContactParams);
                    
                    // Luego enviar email al cliente usando template_tnzvsui
                    return emailjs.send('service_k65jk6c', 'template_tnzvsui', clientContactParams);
                })
                .then(function(response) {
                    console.log('Email al cliente enviado correctamente:', response.status, response.text);
                    
                    // Cambiar animación del botón a "enviado"
                    contactSubmitBtn.classList.remove('sending');
                    contactSubmitBtn.classList.add('sent');
                    contactSubmitBtn.innerHTML = '<span>¡Enviado!</span>';
                    
                    // Show success message
                    successMessage.style.display = 'flex';
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Crear y mostrar el dron volador
                    const flyingDrone = document.createElement('div');
                    flyingDrone.className = 'flying-drone';
                    document.body.appendChild(flyingDrone);
                    
                    // Eliminar el dron después de que termine la animación (5 segundos)
                    setTimeout(() => {
                        document.body.removeChild(flyingDrone);
                    }, 5000);
                    
                    // Restaurar el botón después de 3 segundos
                    setTimeout(() => {
                        contactSubmitBtn.classList.remove('sent');
                        contactSubmitBtn.innerHTML = '<span>Enviar Mensaje</span>';
                    }, 3000);
                    
                    // Ya no mostramos alerta del navegador, solo el mensaje en la aplicación
                    console.log("Mensaje enviado correctamente");
                })
                .catch(function(error) {
                    console.log('FAILED...', error);
                    console.log('Error detallado:', JSON.stringify(error));
                    
                    // Restaurar el botón en caso de error
                    contactSubmitBtn.classList.remove('sending');
                    contactSubmitBtn.innerHTML = '<span>Enviar Mensaje</span>';
                    
                    alert("Error al enviar, intenta de nuevo");
                });
        });
    }

    // Accordion functionality - Versión mejorada con animaciones CSS
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    // Mostrar el primer elemento del acordeón por defecto
    if(accordionItems.length > 0) {
        const firstItem = accordionItems[0];
        const firstIcon = firstItem.querySelector('.accordion-icon');
        firstItem.classList.add('active');
        firstIcon.textContent = '−';
    }
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const icon = item.querySelector('.accordion-icon');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cerrar todos los demás acordeones
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherIcon = otherItem.querySelector('.accordion-icon');
                    otherIcon.textContent = '+';
                }
            });
            
            // Alternar el estado del acordeón actual
            if (isActive) {
                item.classList.remove('active');
                icon.textContent = '+';
            } else {
                item.classList.add('active');
                icon.textContent = '−';
            }
            
            // Desplazar suavemente a la posición del acordeón si se abrió
            if (!isActive) {
                setTimeout(() => {
                    header.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
});
