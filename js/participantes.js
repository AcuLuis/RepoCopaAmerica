// Página de participantes: tarjetas generadas desde los datos, filtro por
// grupo o confederación, búsqueda y detalle de partidos de cada selección.
(function () {
    "use strict";

    const Torneo = window.Torneo;
    const UI = window.UI;
    const hoy = Torneo.fechaISO(Torneo.ahora(window.location.search));

    const rejilla = document.getElementById("rejillaEquipos");
    const buscador = document.getElementById("buscarEquipo");
    const filtros = document.getElementById("filtrosEquipos");
    const conteo = document.getElementById("conteoEquipos");

    let filtroActivo = "todos";

    function coincideFiltro(equipo) {
        if (filtroActivo === "todos") {
            return true;
        }
        if (filtroActivo.startsWith("grupo-")) {
            return equipo.grupo === filtroActivo.slice(6);
        }
        return equipo.confederacion.toLowerCase() === filtroActivo;
    }

    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    function coincideBusqueda(equipo) {
        const consulta = normalizar(buscador.value.trim());
        return !consulta || normalizar(equipo.nombre + " " + equipo.entrenador).includes(consulta);
    }

    function verPartidos(equipo) {
        const contenido = UI.crear("div");
        const stats = Torneo.estadisticasEquipo(equipo.codigo, hoy);
        const resumen = UI.crear("p", "dialogo__resumen");
        resumen.append(UI.insignia(Torneo.resultadoEquipo(equipo.codigo, hoy)));
        resumen.append(UI.crear("span", null,
            stats.pj + " jugados · " + stats.g + " ganados · " + stats.e + " empatados · " +
            stats.p + " perdidos · " + stats.gf + " goles a favor · " + stats.gc + " en contra"));
        contenido.append(resumen);
        contenido.append(UI.listaDePartidos(Torneo.partidosDeEquipo(equipo.codigo), hoy));
        UI.abrirDialogo("Partidos de " + equipo.nombre, contenido);
    }

    function tarjeta(equipo) {
        const articulo = UI.crear("article", "tarjeta");
        const imagen = UI.crear("img", "tarjeta__imagen tarjeta__imagen--bandera");
        imagen.src = "images/banderas/" + equipo.iso + ".png";
        imagen.alt = "Bandera de " + equipo.nombre;
        imagen.loading = "lazy";
        imagen.width = 640;
        imagen.height = 427;
        articulo.append(imagen);

        const cuerpo = UI.crear("div", "tarjeta__cuerpo");
        const cabecera = UI.crear("div", "tarjeta__cabecera");
        cabecera.append(UI.crear("h2", "tarjeta__titulo", equipo.nombre));
        cabecera.append(UI.insignia(Torneo.resultadoEquipo(equipo.codigo, hoy)));
        cuerpo.append(cabecera);
        cuerpo.append(UI.crear("p", "tarjeta__meta", "Grupo " + equipo.grupo + " · " + equipo.confederacion));

        const dt = UI.crear("p", "tarjeta__dato", "Director técnico: ");
        dt.append(UI.crear("strong", null, equipo.entrenador));
        cuerpo.append(dt);

        const stats = Torneo.estadisticasEquipo(equipo.codigo, hoy);
        if (stats.pj > 0) {
            const linea = UI.crear("p", "tarjeta__dato", "Récord: ");
            linea.append(UI.crear("strong", null, stats.g + "G " + stats.e + "E " + stats.p + "P"));
            linea.append(document.createTextNode(" · Goles: "));
            linea.append(UI.crear("strong", null, stats.gf + "-" + stats.gc));
            cuerpo.append(linea);
        }

        const acciones = UI.crear("div", "tarjeta__acciones");
        const boton = UI.crear("button", "boton boton--secundario", "Ver partidos");
        boton.type = "button";
        boton.setAttribute("aria-label", "Ver partidos de " + equipo.nombre);
        boton.addEventListener("click", function () {
            verPartidos(equipo);
        });
        acciones.append(boton);
        cuerpo.append(acciones);

        articulo.append(cuerpo);
        return articulo;
    }

    function pintar() {
        const visibles = Torneo.datos.equipos.filter(function (e) {
            return coincideFiltro(e) && coincideBusqueda(e);
        });
        rejilla.replaceChildren.apply(rejilla, visibles.map(tarjeta));
        if (visibles.length === 0) {
            rejilla.append(UI.crear("p", "sin-resultados", "No hay selecciones que coincidan con la búsqueda."));
        }
        conteo.textContent = visibles.length === 1
            ? "1 selección"
            : visibles.length + " selecciones";
    }

    filtros.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-filtro]");
        if (!boton) {
            return;
        }
        filtroActivo = boton.dataset.filtro;
        filtros.querySelectorAll("[data-filtro]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === boton));
        });
        pintar();
    });

    buscador.addEventListener("input", pintar);

    pintar();
})();
