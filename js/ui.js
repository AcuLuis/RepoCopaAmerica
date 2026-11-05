// Componentes de interfaz reutilizables: banderas, tarjetas de partido,
// ventana de diálogo y aviso de fecha simulada.
(function (raiz) {
    "use strict";

    const Torneo = raiz.Torneo;

    function crear(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase) {
            elemento.className = clase;
        }
        if (texto !== undefined && texto !== null) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    function bandera(equipo, clase) {
        const img = crear("img", clase || "bandera");
        img.src = "images/banderas/" + equipo.iso + ".png";
        img.alt = "";
        img.loading = "lazy";
        img.width = 32;
        img.height = 21;
        return img;
    }

    function insignia(resultado) {
        return crear("span", "insignia insignia--" + resultado.clave, resultado.texto);
    }

    function etiquetaFase(partido) {
        const fase = Torneo.datos.fases[partido.fase];
        return partido.grupo ? fase + " · Grupo " + partido.grupo : fase;
    }

    // Tarjeta de un partido. Si todavía no se juega, muestra "vs" en lugar del marcador
    // y, en eliminatorias, "Por definir" mientras no se conozcan los rivales.
    function partido(p, hoy, opciones) {
        const config = Object.assign({ mostrarEstadio: true, mostrarFase: true }, opciones || {});
        const jugado = Torneo.estaJugado(p, hoy);
        const definidos = Torneo.equiposDefinidos(p, hoy);
        const ganador = jugado ? Torneo.ganador(p) : null;

        const tarjeta = crear("article", "partido" + (jugado ? "" : " partido--pendiente"));

        const cabecera = crear("p", "partido__cabecera");
        cabecera.append(crear("span", null, Torneo.formatearFecha(p.fecha, true)));
        if (config.mostrarFase) {
            cabecera.append(crear("span", "partido__fase", etiquetaFase(p)));
        }
        tarjeta.append(cabecera);

        const lineas = crear("div", "partido__equipos");
        [["local", "golesLocal"], ["visitante", "golesVisitante"]].forEach(function (lado) {
            const linea = crear("div", "partido__linea");
            if (definidos) {
                const equipo = Torneo.equipo(p[lado[0]]);
                if (ganador === equipo.codigo) {
                    linea.classList.add("partido__linea--ganador");
                }
                linea.append(bandera(equipo), crear("span", "partido__equipo", equipo.nombre));
            } else {
                linea.append(crear("span", "bandera bandera--vacia"), crear("span", "partido__equipo", "Por definir"));
            }
            linea.append(crear("span", "partido__goles", jugado ? String(p[lado[1]]) : "–"));
            lineas.append(linea);
        });
        tarjeta.append(lineas);

        const notas = [];
        if (jugado && p.prorroga) {
            notas.push("Tras prórroga");
        }
        if (jugado && p.penales) {
            notas.push("Penales: " + p.penales[0] + "-" + p.penales[1]);
        }
        if (jugado && p.goles) {
            notas.push("Gol: " + p.goles);
        }
        if (!jugado) {
            notas.push("Por jugarse");
        }
        if (notas.length) {
            tarjeta.append(crear("p", "partido__nota", notas.join(" · ")));
        }

        if (config.mostrarEstadio) {
            const estadio = Torneo.estadio(p.estadio);
            tarjeta.append(crear("p", "partido__estadio", estadio.nombre + " · " + estadio.ciudad));
        }

        // Texto completo para lectores de pantalla.
        if (definidos) {
            const local = Torneo.equipo(p.local).nombre;
            const visitante = Torneo.equipo(p.visitante).nombre;
            tarjeta.setAttribute("aria-label", jugado
                ? local + " " + p.golesLocal + ", " + visitante + " " + p.golesVisitante + ". " + etiquetaFase(p) + ", " + Torneo.formatearFecha(p.fecha)
                : local + " contra " + visitante + ". " + etiquetaFase(p) + ", " + Torneo.formatearFecha(p.fecha));
        }
        return tarjeta;
    }

    function listaDePartidos(partidos, hoy, opciones) {
        const lista = crear("div", "lista-partidos");
        partidos.forEach(function (p) {
            lista.append(partido(p, hoy, opciones));
        });
        return lista;
    }

    // ---------- Diálogo ----------
    let dialogo = null;

    function obtenerDialogo() {
        if (dialogo) {
            return dialogo;
        }
        dialogo = crear("dialog", "dialogo");
        dialogo.setAttribute("aria-labelledby", "dialogoTitulo");
        dialogo.innerHTML =
            '<div class="dialogo__cabecera">' +
            '<h2 class="dialogo__titulo" id="dialogoTitulo"></h2>' +
            '<button class="boton-circular" type="button" data-cerrar aria-label="Cerrar">&times;</button>' +
            "</div>" +
            '<div class="dialogo__contenido"></div>';
        dialogo.querySelector("[data-cerrar]").addEventListener("click", function () {
            dialogo.close();
        });
        // Cerrar al hacer clic fuera del contenido.
        dialogo.addEventListener("click", function (evento) {
            if (evento.target === dialogo) {
                dialogo.close();
            }
        });
        document.body.append(dialogo);
        return dialogo;
    }

    function abrirDialogo(titulo, contenido) {
        const d = obtenerDialogo();
        d.querySelector(".dialogo__titulo").textContent = titulo;
        const cuerpo = d.querySelector(".dialogo__contenido");
        cuerpo.replaceChildren(contenido);
        d.showModal();
        cuerpo.scrollTop = 0;
    }

    // ---------- Fecha simulada ----------
    // Con ?fecha=AAAA-MM-DD el sitio se muestra como se veía ese día.
    function avisoSimulacion() {
        const fecha = Torneo.fechaSimulada(window.location.search);
        if (!fecha) {
            return;
        }
        const aviso = crear("div", "simulacion");
        const contenedor = crear("div", "contenedor simulacion__contenido");
        contenedor.append(crear("span", null, "Estás viendo el sitio como el " + Torneo.formatearFecha(fecha, true) + " de " + fecha.slice(0, 4) + "."));
        const salir = crear("a", null, "Volver a la fecha real");
        salir.href = window.location.pathname.split("/").pop() || "index.html";
        contenedor.append(salir);
        aviso.append(contenedor);
        document.querySelector(".cabecera").after(aviso);

        // Mantener la fecha simulada al navegar entre páginas del sitio.
        document.querySelectorAll("a[href]").forEach(function (enlace) {
            const href = enlace.getAttribute("href");
            if (enlace === salir || !/^[\w-]+\.html/.test(href)) {
                return;
            }
            const partes = href.split("#");
            enlace.setAttribute("href", partes[0] + "?fecha=" + fecha + (partes[1] ? "#" + partes[1] : ""));
        });
    }

    raiz.UI = {
        crear: crear,
        bandera: bandera,
        insignia: insignia,
        partido: partido,
        listaDePartidos: listaDePartidos,
        abrirDialogo: abrirDialogo,
        avisoSimulacion: avisoSimulacion
    };

    if (Torneo) {
        avisoSimulacion();
    }
})(window);
