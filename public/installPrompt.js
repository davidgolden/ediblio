var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    deferredPrompt = e;
    deferredPrompt.prompt();
});
