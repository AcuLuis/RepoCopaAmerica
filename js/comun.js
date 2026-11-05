// Comportamiento compartido por todas las páginas: menú en pantallas pequeñas.
(function () {
    "use strict";

    const boton = document.querySelector(".menu-boton");
    const navegacion = document.getElementById("navegacion");

    if (!boton || !navegacion) {
        return;
    }

    function cambiarMenu(abrir) {
        boton.setAttribute("aria-expanded", String(abrir));
        navegacion.classList.toggle("abierta", abrir);
    }

    boton.addEventListener("click", function () {
        cambiarMenu(boton.getAttribute("aria-expanded") !== "true");
    });

    // Cerrar al elegir una opción (útil para los enlaces a secciones de la misma página).
    navegacion.addEventListener("click", function (evento) {
        if (evento.target.closest("a")) {
            cambiarMenu(false);
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
            cambiarMenu(false);
            boton.focus();
        }
    });
})();
