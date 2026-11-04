// Página de calendario: tablas de posiciones calculadas a partir de los
// resultados, partidos por grupo y cuadro de eliminación directa.
(function () {
    "use strict";

    const Torneo = window.Torneo;
    const UI = window.UI;
    const hoy = Torneo.fechaISO(Torneo.ahora(window.location.search));

    // ---------- Fase de grupos ----------

    function tablaPosiciones(grupo) {
        const filas = Torneo.tablaDeGrupo(grupo, hoy);
        const grupoCompleto = Torneo.faseCompleta("grupos", hoy);

        const envoltura = UI.crear("div", "tabla-envoltura");
        const tabla = UI.crear("table", "tabla-posiciones");
        tabla.append(UI.crear("caption", "visualmente-oculto", "Tabla de posiciones del grupo " + grupo));

        const cabecera = UI.crear("thead");
        const filaCabecera = UI.crear("tr");
        [
            ["#", "Posición"], ["Selección", null], ["PJ", "Partidos jugados"], ["G", "Ganados"],
            ["E", "Empatados"], ["P", "Perdidos"], ["GF", "Goles a favor"], ["GC", "Goles en contra"],
            ["DG", "Diferencia de gol"], ["Pts", "Puntos"]
        ].forEach(function (col) {
            const th = UI.crear("th", null, col[0]);
            th.scope = "col";
            if (col[1]) {
                th.title = col[1];
                th.setAttribute("aria-label", col[1]);
            }
            filaCabecera.append(th);
        });
        cabecera.append(filaCabecera);
        tabla.append(cabecera);

        const cuerpo = UI.crear("tbody");
        filas.forEach(function (fila, i) {
            const tr = UI.crear("tr");
            if (i < 2 && grupoCompleto) {
                tr.className = "clasificado";
            }
            tr.append(UI.crear("td", null, String(i + 1)));
            const celdaEquipo = UI.crear("th", "tabla-posiciones__equipo");
            celdaEquipo.scope = "row";
            celdaEquipo.append(UI.bandera(fila.equipo), UI.crear("span", null, fila.equipo.nombre));
            tr.append(celdaEquipo);
            [fila.pj, fila.g, fila.e, fila.p, fila.gf, fila.gc, (fila.dg > 0 ? "+" : "") + fila.dg].forEach(function (valor) {
                tr.append(UI.crear("td", null, String(valor)));
            });
            tr.append(UI.crear("td", "tabla-posiciones__puntos", String(fila.pts)));
            cuerpo.append(tr);
        });
        tabla.append(cuerpo);
        envoltura.append(tabla);
        return envoltura;
    }

    function pintarGrupos() {
        const contenedor = document.getElementById("grupos");
        Torneo.grupos().forEach(function (grupo) {
            const tarjeta = UI.crear("section", "grupo");
            tarjeta.setAttribute("aria-labelledby", "titulo-grupo-" + grupo);
            const titulo = UI.crear("h3", "grupo__titulo", "Grupo " + grupo);
            titulo.id = "titulo-grupo-" + grupo;
            tarjeta.append(titulo, tablaPosiciones(grupo));

            const partidos = Torneo.datos.partidos.filter(function (p) {
                return p.fase === "grupos" && p.grupo === grupo;
            });
            const detalle = UI.crear("details", "grupo__partidos");
            detalle.append(UI.crear("summary", null, "Ver los " + partidos.length + " partidos del grupo"));
            detalle.append(UI.listaDePartidos(partidos, hoy, { mostrarFase: false }));
            tarjeta.append(detalle);

            contenedor.append(tarjeta);
        });
    }

    // ---------- Eliminatorias ----------

    function columna(titulo, fase) {
        const col = UI.crear("div", "cuadro__columna");
        col.append(UI.crear("h3", "cuadro__titulo", titulo));
        const lista = UI.crear("div", "cuadro__partidos");
        Torneo.partidosPorFase(fase).forEach(function (p) {
            lista.append(UI.partido(p, hoy, { mostrarFase: false }));
        });
        col.append(lista);
        return col;
    }

    function pintarEliminatorias() {
        const cuadro = document.getElementById("cuadro");
        cuadro.append(
            columna("Cuartos de final", "cuartos"),
            columna("Semifinales", "semifinal"),
            columna("Final", "final")
        );
        const tercero = document.getElementById("tercerLugar");
        Torneo.partidosPorFase("tercer").forEach(function (p) {
            tercero.append(UI.partido(p, hoy, { mostrarFase: false }));
        });
    }

    pintarGrupos();
    pintarEliminatorias();
})();
