// Script para verificar la configuración de EmailJS

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si EmailJS está inicializado correctamente
    console.log('%c Verificación de EmailJS', 'background: #333; color: #fff; padding: 5px; border-radius: 5px;');
    
    // Verificar conexión con EmailJS
    if (typeof emailjs !== 'undefined') {
        console.log('✅ EmailJS cargado correctamente');
        
        // Verificar credenciales
        if (typeof window._emailjsInit !== 'undefined') {
            console.log('✅ EmailJS inicializado con una clave pública');
        } else {
            console.log('❌ EmailJS no se ha inicializado con una clave pública. Puede haber problemas con el envío de emails.');
        }
        
        // Información sobre cómo verificar servicios
        console.log('📋 Servicio actual configurado: service_k65jk6c');
        console.log('📋 Template actual configurado: template_tnzvsui');
        
        // Información de depuración
        console.log('📢 Para usar EmailJS exitosamente, necesitas:');
        console.log('  1. Una cuenta en EmailJS.com');
        console.log('  2. Un servicio configurado (p.ej.: Gmail, SMTP)');
        console.log('  3. Una plantilla (template) configurada');
        console.log('  4. Tu clave pública (USER_ID/PUBLIC_KEY) configurada correctamente');

        // Verificar si el formulario de contacto existe
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            console.log('✅ Formulario de contacto detectado en la página');
        }
        
        // Verificar si el formulario de servicios existe
        const servicioForm = document.getElementById('servicio-form');
        if (servicioForm) {
            console.log('✅ Formulario de servicios detectado en la página');
        }
    } else {
        console.log('❌ EmailJS no está cargado. Verifica que la biblioteca esté incluida correctamente.');
    }
});