var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    deferredPrompt = e;
    var installBtn = document.querySelector('#installAppButton');
    installBtn.addEventListener("click", function(e) {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt = null;
    })
});
