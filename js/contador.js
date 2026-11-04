// Cuenta regresiva hacia el partido inaugural.
// Las fechas usan la hora del Este de EE. UU. para ser iguales en cualquier país.
(function () {
    "use strict";

    const INICIO_TORNEO = new Date("2024-06-20T20:00:00-04:00"); // Argentina vs. Canadá, Atlanta
    const FIN_TORNEO = new Date("2024-07-15T00:00:00-04:00");    // Día siguiente a la final

    const MS_SEGUNDO = 1000;
    const MS_MINUTO = 60 * MS_SEGUNDO;
    const MS_HORA = 60 * MS_MINUTO;
    const MS_DIA = 24 * MS_HORA;

    const contador = document.querySelector("[data-contador]");
    const aviso = document.querySelector("[data-contador-aviso]");
    const titulo = document.getElementById("tituloContador");

    if (!contador || !aviso) {
        return;
    }

    const valores = {
        dias: contador.querySelector("[data-unidad='dias']"),
        horas: contador.querySelector("[data-unidad='horas']"),
        minutos: contador.querySelector("[data-unidad='minutos']"),
        segundos: contador.querySelector("[data-unidad='segundos']")
    };

    function mostrarAviso(textoTitulo, encabezado, detalle) {
        titulo.textContent = textoTitulo;
        contador.hidden = true;
        aviso.hidden = false;
        aviso.querySelector("[data-aviso-titulo]").textContent = encabezado;
        aviso.querySelector("[data-aviso-detalle]").textContent = detalle;
    }

    function dosDigitos(numero) {
        return String(numero).padStart(2, "0");
    }

    function actualizar() {
        const ahora = Date.now();

        if (ahora >= FIN_TORNEO) {
            mostrarAviso(
                "La Copa América 2024 finalizó",
                "Argentina, campeón de la Copa América 2024",
                "Venció 1-0 a Colombia en la final jugada el 14 de julio en el Hard Rock Stadium de Miami."
            );
            clearInterval(intervalo);
            return;
        }

        if (ahora >= INICIO_TORNEO) {
            mostrarAviso(
                "La Copa América 2024 está en juego",
                "¡El torneo ya comenzó!",
                "La final se jugará el 14 de julio en el Hard Rock Stadium de Miami."
            );
            return;
        }

        const diferencia = INICIO_TORNEO - ahora;
        valores.dias.textContent = Math.floor(diferencia / MS_DIA);
        valores.horas.textContent = dosDigitos(Math.floor((diferencia % MS_DIA) / MS_HORA));
        valores.minutos.textContent = dosDigitos(Math.floor((diferencia % MS_HORA) / MS_MINUTO));
        valores.segundos.textContent = dosDigitos(Math.floor((diferencia % MS_MINUTO) / MS_SEGUNDO));
    }

    const intervalo = setInterval(actualizar, 1000);
    actualizar();
})();
