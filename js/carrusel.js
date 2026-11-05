// Carrusel de noticias con controles, indicadores, pausa y soporte de teclado y gestos.
(function () {
    "use strict";

    const INTERVALO_MS = 6000;
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("[data-carrusel]").forEach(iniciarCarrusel);

    function iniciarCarrusel(raiz) {
        const diapositivas = Array.from(raiz.querySelectorAll(".carrusel__diapositiva"));
        const ventana = raiz.querySelector(".carrusel__ventana");
        const puntos = raiz.querySelector(".carrusel__puntos");
        const botonAnterior = raiz.querySelector("[data-accion='anterior']");
        const botonSiguiente = raiz.querySelector("[data-accion='siguiente']");
        const botonPausa = raiz.querySelector("[data-accion='pausa']");
        const total = diapositivas.length;

        if (total === 0) {
            return;
        }

        let indice = 0;
        let temporizador = null;
        let pausadoPorUsuario = movimientoReducido;

        diapositivas.forEach(function (diapositiva, i) {
            diapositiva.setAttribute("role", "group");
            diapositiva.setAttribute("aria-roledescription", "diapositiva");
            diapositiva.setAttribute("aria-label", (i + 1) + " de " + total);

            const punto = document.createElement("button");
            punto.type = "button";
            punto.className = "carrusel__punto";
            punto.setAttribute("aria-label", "Ir a la noticia " + (i + 1) + " de " + total);
            punto.addEventListener("click", function () {
                mostrar(i);
            });
            puntos.appendChild(punto);
        });

        function mostrar(nuevoIndice) {
            indice = (nuevoIndice + total) % total;
            diapositivas.forEach(function (diapositiva, i) {
                diapositiva.hidden = i !== indice;
            });
            Array.from(puntos.children).forEach(function (punto, i) {
                punto.setAttribute("aria-current", i === indice ? "true" : "false");
            });
        }

        function detener() {
            clearInterval(temporizador);
            temporizador = null;
        }

        function reanudar() {
            detener();
            if (!pausadoPorUsuario) {
                temporizador = setInterval(function () {
                    mostrar(indice + 1);
                }, INTERVALO_MS);
            }
            // Los lectores de pantalla solo anuncian cambios cuando el usuario controla el carrusel.
            ventana.setAttribute("aria-live", pausadoPorUsuario ? "polite" : "off");
        }

        function actualizarBotonPausa() {
            if (!botonPausa) {
                return;
            }
            botonPausa.textContent = pausadoPorUsuario ? "Reanudar" : "Pausar";
            botonPausa.setAttribute("aria-pressed", String(pausadoPorUsuario));
        }

        botonAnterior.addEventListener("click", function () {
            mostrar(indice - 1);
        });

        botonSiguiente.addEventListener("click", function () {
            mostrar(indice + 1);
        });

        if (botonPausa) {
            botonPausa.addEventListener("click", function () {
                pausadoPorUsuario = !pausadoPorUsuario;
                actualizarBotonPausa();
                reanudar();
            });
        }

        // Pausa temporal mientras el usuario lee o navega dentro del carrusel.
        raiz.addEventListener("mouseenter", detener);
        raiz.addEventListener("mouseleave", reanudar);
        raiz.addEventListener("focusin", detener);
        raiz.addEventListener("focusout", function (evento) {
            if (!raiz.contains(evento.relatedTarget)) {
                reanudar();
            }
        });

        raiz.addEventListener("keydown", function (evento) {
            if (evento.key === "ArrowLeft") {
                mostrar(indice - 1);
            } else if (evento.key === "ArrowRight") {
                mostrar(indice + 1);
            }
        });

        // Deslizar con el dedo en pantallas táctiles.
        let inicioX = null;
        ventana.addEventListener("pointerdown", function (evento) {
            inicioX = evento.clientX;
        });
        ventana.addEventListener("pointerup", function (evento) {
            if (inicioX === null) {
                return;
            }
            const distancia = evento.clientX - inicioX;
            if (Math.abs(distancia) > 50) {
                mostrar(distancia < 0 ? indice + 1 : indice - 1);
            }
            inicioX = null;
        });

        mostrar(0);
        actualizarBotonPausa();
        reanudar();
    }
})();
