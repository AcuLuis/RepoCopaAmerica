// Página de estadios: tarjetas generadas desde los datos, búsqueda, orden
// y detalle de los partidos que se jugaron en cada sede.
(function () {
    "use strict";

    const Torneo = window.Torneo;
    const UI = window.UI;
    const hoy = Torneo.fechaISO(Torneo.ahora(window.location.search));

    const rejilla = document.getElementById("rejillaEstadios");
    const buscador = document.getElementById("buscarEstadio");
    const orden = document.getElementById("ordenEstadios");
    const conteo = document.getElementById("conteoEstadios");

    const ORDENES = {
        "capacidad-desc": function (a, b) { return b.capacidad - a.capacidad; },
        "capacidad-asc": function (a, b) { return a.capacidad - b.capacidad; },
        "nombre": function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); },
        "partidos": function (a, b) {
            return Torneo.partidosEnEstadio(b.id).length - Torneo.partidosEnEstadio(a.id).length ||
                a.nombre.localeCompare(b.nombre, "es");
        }
    };

    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    function distinciones(estadio) {
        const partidos = Torneo.partidosEnEstadio(estadio.id);
        const lista = [];
        if (partidos.some(function (p) { return p.inaugural; })) {
            lista.push("Partido inaugural");
        }
        if (partidos.some(function (p) { return p.fase === "final"; })) {
            lista.push("Sede de la final");
        }
        return lista;
    }

    function verPartidos(estadio) {
        const contenido = UI.crear("div");
        contenido.append(UI.crear("p", "dialogo__resumen",
            estadio.ciudad + ", " + estadio.estado + " · Capacidad: " +
            Torneo.formatearNumero(estadio.capacidad) + " espectadores"));
        contenido.append(UI.listaDePartidos(Torneo.partidosEnEstadio(estadio.id), hoy, { mostrarEstadio: false }));
        UI.abrirDialogo(estadio.nombre, contenido);
    }

    function tarjeta(estadio) {
        const articulo = UI.crear("article", "tarjeta");
        const figura = UI.crear("figure", "tarjeta__figura");
        const imagen = UI.crear("img", "tarjeta__imagen");
        imagen.src = "images_estadios/" + estadio.imagen;
        imagen.alt = estadio.nombre;
        imagen.loading = "lazy";
        imagen.width = 900;
        imagen.height = 600;
        figura.append(imagen);

        // Atribución de las fotos con licencia libre.
        if (estadio.credito) {
            const credito = UI.crear("figcaption", "tarjeta__credito", "Foto: ");
            const enlace = UI.crear("a", null, estadio.credito.autor);
            enlace.href = estadio.credito.url;
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";
            credito.append(enlace, document.createTextNode(" · " + estadio.credito.licencia));
            figura.append(credito);
        }
        articulo.append(figura);

        const cuerpo = UI.crear("div", "tarjeta__cuerpo");
        cuerpo.append(UI.crear("h2", "tarjeta__titulo", estadio.nombre));
        cuerpo.append(UI.crear("p", "tarjeta__meta", estadio.ciudad + ", " + estadio.estado));

        const capacidad = UI.crear("p", "tarjeta__dato", "Capacidad: ");
        capacidad.append(UI.crear("strong", null, Torneo.formatearNumero(estadio.capacidad)));
        cuerpo.append(capacidad);

        const total = Torneo.partidosEnEstadio(estadio.id).length;
        const partidos = UI.crear("p", "tarjeta__dato", "Partidos del torneo: ");
        partidos.append(UI.crear("strong", null, String(total)));
        cuerpo.append(partidos);

        const marcas = distinciones(estadio);
        if (marcas.length) {
            const contenedor = UI.crear("p", "tarjeta__insignias");
            marcas.forEach(function (texto) {
                contenedor.append(UI.crear("span", "insignia insignia--campeon", texto));
            });
            cuerpo.append(contenedor);
        }

        const acciones = UI.crear("div", "tarjeta__acciones tarjeta__acciones--doble");
        const boton = UI.crear("button", "boton boton--secundario", "Ver partidos");
        boton.type = "button";
        boton.setAttribute("aria-label", "Ver partidos jugados en " + estadio.nombre);
        boton.addEventListener("click", function () {
            verPartidos(estadio);
        });
        const mapa = UI.crear("a", "tarjeta__enlace", "Ver en el mapa");
        mapa.href = "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(estadio.nombre + ", " + estadio.ciudad);
        mapa.target = "_blank";
        mapa.rel = "noopener noreferrer";
        mapa.setAttribute("aria-label", "Ver " + estadio.nombre + " en Google Maps (se abre en una pestaña nueva)");
        acciones.append(boton, mapa);
        cuerpo.append(acciones);

        articulo.append(cuerpo);
        return articulo;
    }

    function pintar() {
        const consulta = normalizar(buscador.value.trim());
        const visibles = Torneo.datos.estadios
            .filter(function (e) {
                return !consulta || normalizar(e.nombre + " " + e.ciudad + " " + e.estado).includes(consulta);
            })
            .sort(ORDENES[orden.value]);

        rejilla.replaceChildren.apply(rejilla, visibles.map(tarjeta));
        if (visibles.length === 0) {
            rejilla.append(UI.crear("p", "sin-resultados", "No hay estadios que coincidan con la búsqueda."));
        }
        conteo.textContent = visibles.length === 1 ? "1 estadio" : visibles.length + " estadios";
    }

    buscador.addEventListener("input", pintar);
    orden.addEventListener("change", pintar);

    pintar();
})();
