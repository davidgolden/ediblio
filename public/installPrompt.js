var deferredPrompt;
console.log('install prompt loaded')
window.addEventListener('beforeinstallprompt', function(e) {
    console.log('install prompt event fired')
    e.preventDefault();
    deferredPrompt = e;
    var installBtn = document.querySelector('#installAppButton');
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener("click", function(e) {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt = null;
    })
});
