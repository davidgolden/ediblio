var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    deferredPrompt = e;
    var installBtn = document.querySelector('#installAppButton');
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener("click", function(e) {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt = null;
    })
});
