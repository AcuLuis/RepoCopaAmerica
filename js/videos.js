// Los videos se muestran como una portada liviana y el reproductor de YouTube
// se carga recién cuando el usuario lo pide. Así la página carga más rápido.
(function () {
    "use strict";

    // YouTube no permite reproducir videos incrustados en páginas abiertas como archivo
    // local (file://). En ese caso se abre el video directamente en YouTube.
    const abiertoComoArchivo = window.location.protocol === "file:";

    document.querySelectorAll("[data-video-id]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const id = boton.dataset.videoId;
            const titulo = boton.dataset.videoTitulo || "Video de YouTube";

            if (abiertoComoArchivo) {
                window.open("https://www.youtube.com/watch?v=" + encodeURIComponent(id), "_blank", "noopener");
                return;
            }

            const iframe = document.createElement("iframe");
            iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
            iframe.title = titulo;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            iframe.allowFullscreen = true;

            boton.replaceWith(iframe);
            iframe.focus();
        });
    });
})();
