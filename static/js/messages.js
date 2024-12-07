window.addEventListener('DOMContentLoaded', (event) => {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach((message) => {
        setTimeout(() => {
            message.remove();
        }, 3500);
    });
});
