// Bloque principal del inicio. Cambia según el momento del torneo:
//  - antes:   cuenta regresiva hacia el partido inaugural
//  - durante: próximos partidos y últimos resultados
//  - después: campeón, final y premios
// Todo se calcula con los datos de js/datos.js mediante js/torneo.js.
(function () {
    "use strict";

    const Torneo = window.Torneo;
    const UI = window.UI;

    const MS_SEGUNDO = 1000;
    const MS_MINUTO = 60 * MS_SEGUNDO;
    const MS_HORA = 60 * MS_MINUTO;
    const MS_DIA = 24 * MS_HORA;

    const titulo = document.getElementById("tituloContador");
    const contador = document.querySelector("[data-contador]");
    const aviso = document.querySelector("[data-contador-aviso]");
    const zonaPartidos = document.querySelector("[data-contador-partidos]");

    if (!titulo || !contador || !aviso || !zonaPartidos) {
        return;
    }

    // Con fecha simulada el reloj parte del mediodía de ese día y sigue corriendo.
    const inicioReal = Date.now();
    const inicioSimulado = Torneo.ahora(window.location.search).getTime();
    function ahora() {
        return new Date(inicioSimulado + (Date.now() - inicioReal));
    }

    const valores = {
        dias: contador.querySelector("[data-unidad='dias']"),
        horas: contador.querySelector("[data-unidad='horas']"),
        minutos: contador.querySelector("[data-unidad='minutos']"),
        segundos: contador.querySelector("[data-unidad='segundos']")
    };

    function dosDigitos(numero) {
        return String(numero).padStart(2, "0");
    }

    // ---------- Antes del torneo ----------
    function actualizarCuentaRegresiva() {
        const diferencia = new Date(Torneo.datos.torneo.inicio) - ahora();
        if (diferencia <= 0) {
            clearInterval(intervalo);
            pintar();
            return;
        }
        valores.dias.textContent = Math.floor(diferencia / MS_DIA);
        valores.horas.textContent = dosDigitos(Math.floor((diferencia % MS_DIA) / MS_HORA));
        valores.minutos.textContent = dosDigitos(Math.floor((diferencia % MS_HORA) / MS_MINUTO));
        valores.segundos.textContent = dosDigitos(Math.floor((diferencia % MS_MINUTO) / MS_SEGUNDO));
    }

    // ---------- Durante el torneo ----------
    function bloquePartidos(texto, partidos, hoy) {
        const bloque = UI.crear("div", "bloque-partidos");
        bloque.append(UI.crear("h3", "bloque-partidos__titulo", texto));
        bloque.append(UI.listaDePartidos(partidos, hoy));
        return bloque;
    }

    function pintarDurante(hoy) {
        titulo.textContent = "La Copa América 2024 está en juego";
        contador.hidden = true;
        aviso.hidden = true;
        zonaPartidos.hidden = false;

        const proximos = Torneo.proximosPartidos(hoy);
        const ultimos = Torneo.ultimosResultados(hoy);
        const bloques = [];
        if (proximos.length) {
            const dia = proximos[0].fecha === hoy ? "Hoy" : "Próxima jornada";
            bloques.push(bloquePartidos(dia + ": " + Torneo.formatearFecha(proximos[0].fecha, true), proximos, hoy));
        }
        if (ultimos.length) {
            bloques.push(bloquePartidos("Últimos resultados: " + Torneo.formatearFecha(ultimos[0].fecha, true), ultimos, hoy));
        }
        zonaPartidos.replaceChildren.apply(zonaPartidos, bloques);
    }

    // ---------- Después del torneo ----------
    function pintarDespues(hoy) {
        const final = Torneo.partidosPorFase("final")[0];
        const campeon = Torneo.equipo(Torneo.ganador(final));
        const subcampeon = Torneo.equipo(Torneo.perdedor(final));
        const estadio = Torneo.estadio(final.estadio);
        const golesCampeon = Math.max(final.golesLocal, final.golesVisitante);
        const golesRival = Math.min(final.golesLocal, final.golesVisitante);

        titulo.textContent = "La Copa América 2024 finalizó";
        contador.hidden = true;
        zonaPartidos.hidden = true;
        aviso.hidden = false;
        aviso.classList.add("aviso--campeon");

        const encabezado = aviso.querySelector("[data-aviso-titulo]");
        encabezado.replaceChildren(
            UI.bandera(campeon, "bandera bandera--grande"),
            UI.crear("span", null, campeon.nombre + ", campeón de la Copa América 2024")
        );

        aviso.querySelector("[data-aviso-detalle]").textContent =
            "Venció " + golesCampeon + "-" + golesRival + " a " + subcampeon.nombre +
            (final.prorroga ? " tras la prórroga" : "") +
            " en la final del " + Torneo.formatearFecha(final.fecha) +
            " en el " + estadio.nombre + " (" + estadio.ciudad + ")." +
            (final.goles ? " Gol de " + final.goles + "." : "");

        const premios = UI.crear("ul", "premios");
        Torneo.datos.premios.forEach(function (premio) {
            const item = UI.crear("li", "premio");
            item.append(UI.crear("span", "premio__titulo", premio.titulo));
            const nombre = UI.crear("span", "premio__ganador");
            nombre.append(UI.bandera(Torneo.equipo(premio.equipo)), UI.crear("span", null, premio.ganador));
            item.append(nombre);
            if (premio.detalle) {
                item.append(UI.crear("span", "premio__detalle", premio.detalle));
            }
            premios.append(item);
        });

        const enlace = UI.crear("a", "boton", "Ver todos los resultados");
        enlace.href = "calendario.html" + (Torneo.fechaSimulada(window.location.search) ? window.location.search : "");

        const extra = aviso.querySelector("[data-aviso-extra]");
        extra.replaceChildren(premios, enlace);
    }

    // ---------- Cifras ----------
    function pintarCifras(hoy) {
        const goles = Torneo.golesTotales(hoy);
        const cifraGoles = document.querySelector("[data-cifra='goles']");
        if (cifraGoles && goles > 0) {
            cifraGoles.querySelector("strong").textContent = goles;
            cifraGoles.querySelector("span").textContent = goles === 1 ? "gol anotado" : "goles anotados";
        }
        const conteos = {
            equipos: Torneo.datos.equipos.length,
            estadios: Torneo.datos.estadios.length,
            partidos: Torneo.datos.partidos.length
        };
        Object.keys(conteos).forEach(function (clave) {
            const cifra = document.querySelector("[data-cifra='" + clave + "'] strong");
            if (cifra) {
                cifra.textContent = conteos[clave];
            }
        });
    }

    let intervalo = null;

    function pintar() {
        const instante = ahora();
        const hoy = Torneo.fechaISO(instante);
        const estado = Torneo.estadoTorneo(instante);

        pintarCifras(hoy);

        if (estado === "antes") {
            titulo.textContent = "La Copa América 2024 inicia en";
            contador.hidden = false;
            aviso.hidden = true;
            zonaPartidos.hidden = true;
            actualizarCuentaRegresiva();
            intervalo = setInterval(actualizarCuentaRegresiva, 1000);
        } else if (estado === "durante") {
            pintarDurante(hoy);
        } else {
            pintarDespues(hoy);
        }
    }

    pintar();
})();
