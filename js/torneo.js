// Lógica del torneo: tablas de posiciones, ganadores, estado del torneo y
// resultado de cada selección. Son funciones puras (no tocan la página), por eso
// se pueden probar con Node (ver tests/torneo.test.js).
(function (raiz, fabrica) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        module.exports = fabrica(require("./datos.js"));
    } else {
        raiz.Torneo = fabrica(raiz.CopaDatos);
    }
})(typeof self !== "undefined" ? self : this, function (datos) {
    "use strict";

    const ORDEN_FASES = ["grupos", "cuartos", "semifinal", "tercer", "final"];
    const FASE_PREVIA = { cuartos: "grupos", semifinal: "cuartos", tercer: "semifinal", final: "semifinal" };

    const equiposPorCodigo = new Map(datos.equipos.map(function (e) { return [e.codigo, e]; }));
    const estadiosPorId = new Map(datos.estadios.map(function (e) { return [e.id, e]; }));
    const partidosPorId = new Map(datos.partidos.map(function (p) { return [p.id, p]; }));

    // ---------- Fechas ----------

    // Fecha (AAAA-MM-DD) de un instante, según la hora del Este de EE. UU.
    function fechaISO(instante) {
        const partes = new Intl.DateTimeFormat("en-CA", {
            timeZone: datos.torneo.zonaHoraria,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(instante);
        const valor = function (tipo) {
            return partes.find(function (p) { return p.type === tipo; }).value;
        };
        return valor("year") + "-" + valor("month") + "-" + valor("day");
    }

    function esFechaValida(texto) {
        return /^\d{4}-\d{2}-\d{2}$/.test(texto || "") && !isNaN(new Date(texto + "T12:00:00Z"));
    }

    // Permite simular otro día con ?fecha=AAAA-MM-DD (útil para ver el sitio
    // como se veía antes o durante el torneo). Se toma el mediodía de ese día.
    function fechaSimulada(busqueda) {
        const fecha = new URLSearchParams(busqueda || "").get("fecha");
        return esFechaValida(fecha) ? fecha : null;
    }

    function ahora(busqueda) {
        const simulada = fechaSimulada(busqueda);
        return simulada ? new Date(simulada + "T12:00:00-04:00") : new Date();
    }

    // ---------- Partidos ----------

    // Un partido se considera jugado cuando su fecha ya pasó. Sin horarios
    // exactos, los partidos del día actual se muestran como pendientes.
    function estaJugado(partido, hoy) {
        return partido.fecha < hoy;
    }

    function partidosJugados(hoy) {
        return datos.partidos.filter(function (p) { return estaJugado(p, hoy); });
    }

    function faseCompleta(fase, hoy) {
        return datos.partidos
            .filter(function (p) { return p.fase === fase; })
            .every(function (p) { return estaJugado(p, hoy); });
    }

    // Los equipos de una llave se conocen cuando termina la fase anterior.
    function equiposDefinidos(partido, hoy) {
        const previa = FASE_PREVIA[partido.fase];
        return !previa || faseCompleta(previa, hoy);
    }

    // Devuelve el código del ganador o null si fue empate en fase de grupos.
    function ganador(partido) {
        if (partido.golesLocal !== partido.golesVisitante) {
            return partido.golesLocal > partido.golesVisitante ? partido.local : partido.visitante;
        }
        if (partido.penales) {
            return partido.penales[0] > partido.penales[1] ? partido.local : partido.visitante;
        }
        return null;
    }

    function perdedor(partido) {
        const g = ganador(partido);
        if (!g) {
            return null;
        }
        return g === partido.local ? partido.visitante : partido.local;
    }

    function partidosDeEquipo(codigo) {
        return datos.partidos.filter(function (p) {
            return p.local === codigo || p.visitante === codigo;
        });
    }

    function partidosEnEstadio(id) {
        return datos.partidos.filter(function (p) { return p.estadio === id; });
    }

    function partidosPorFase(fase) {
        return datos.partidos.filter(function (p) { return p.fase === fase; });
    }

    // ---------- Tablas de posiciones ----------

    function filaVacia(equipo) {
        return { equipo: equipo, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
    }

    function sumarPartido(fila, golesAFavor, golesEnContra) {
        fila.pj += 1;
        fila.gf += golesAFavor;
        fila.gc += golesEnContra;
        fila.dg = fila.gf - fila.gc;
        if (golesAFavor > golesEnContra) {
            fila.g += 1;
            fila.pts += 3;
        } else if (golesAFavor === golesEnContra) {
            fila.e += 1;
            fila.pts += 1;
        } else {
            fila.p += 1;
        }
    }

    // Criterios: puntos, diferencia de gol, goles a favor y, por último, nombre.
    function compararFilas(a, b) {
        return b.pts - a.pts ||
            b.dg - a.dg ||
            b.gf - a.gf ||
            a.equipo.nombre.localeCompare(b.equipo.nombre, "es");
    }

    function tablaDeGrupo(grupo, hoy) {
        const filas = new Map();
        datos.equipos
            .filter(function (e) { return e.grupo === grupo; })
            .forEach(function (e) { filas.set(e.codigo, filaVacia(e)); });

        datos.partidos
            .filter(function (p) { return p.fase === "grupos" && p.grupo === grupo && estaJugado(p, hoy); })
            .forEach(function (p) {
                sumarPartido(filas.get(p.local), p.golesLocal, p.golesVisitante);
                sumarPartido(filas.get(p.visitante), p.golesVisitante, p.golesLocal);
            });

        return Array.from(filas.values()).sort(compararFilas);
    }

    function grupos() {
        return Array.from(new Set(datos.equipos.map(function (e) { return e.grupo; }))).sort();
    }

    // Estadísticas de una selección en todo el torneo (los penales cuentan como empate).
    function estadisticasEquipo(codigo, hoy) {
        const fila = filaVacia(equiposPorCodigo.get(codigo));
        partidosDeEquipo(codigo)
            .filter(function (p) { return estaJugado(p, hoy); })
            .forEach(function (p) {
                const esLocal = p.local === codigo;
                sumarPartido(fila,
                    esLocal ? p.golesLocal : p.golesVisitante,
                    esLocal ? p.golesVisitante : p.golesLocal);
            });
        return fila;
    }

    // Resuelve una referencia de llave ("1A", "G25", "P30") al código del equipo.
    function resolverLlave(referencia, hoy) {
        const tipo = referencia.charAt(0);
        if (tipo === "G" || tipo === "P") {
            const partido = partidosPorId.get(Number(referencia.slice(1)));
            if (!estaJugado(partido, hoy)) {
                return null;
            }
            return tipo === "G" ? ganador(partido) : perdedor(partido);
        }
        const posicion = Number(tipo);
        const grupo = referencia.slice(1);
        if (!faseCompleta("grupos", hoy)) {
            return null;
        }
        return tablaDeGrupo(grupo, hoy)[posicion - 1].equipo.codigo;
    }

    // ---------- Estado del torneo ----------

    function ultimaFecha() {
        return datos.partidos.reduce(function (max, p) { return p.fecha > max ? p.fecha : max; }, "");
    }

    function estadoTorneo(instante) {
        if (instante < new Date(datos.torneo.inicio)) {
            return "antes";
        }
        return fechaISO(instante) > ultimaFecha() ? "despues" : "durante";
    }

    function campeon(hoy) {
        const final = partidosPorFase("final")[0];
        return final && estaJugado(final, hoy) ? ganador(final) : null;
    }

    // Próxima jornada (partidos de la primera fecha sin jugar).
    function proximosPartidos(hoy) {
        const pendientes = datos.partidos.filter(function (p) { return !estaJugado(p, hoy); });
        if (pendientes.length === 0) {
            return [];
        }
        const fecha = pendientes.reduce(function (min, p) { return p.fecha < min ? p.fecha : min; }, pendientes[0].fecha);
        return pendientes.filter(function (p) { return p.fecha === fecha; });
    }

    // Partidos de la última fecha jugada.
    function ultimosResultados(hoy) {
        const jugados = partidosJugados(hoy);
        if (jugados.length === 0) {
            return [];
        }
        const fecha = jugados.reduce(function (max, p) { return p.fecha > max ? p.fecha : max; }, "");
        return jugados.filter(function (p) { return p.fecha === fecha; });
    }

    // Hasta dónde llegó (o va) una selección.
    function resultadoEquipo(codigo, hoy) {
        const jugados = partidosDeEquipo(codigo).filter(function (p) { return estaJugado(p, hoy); });
        const ultimo = jugados[jugados.length - 1];

        if (ultimo && ultimo.fase !== "grupos") {
            const gano = ganador(ultimo) === codigo;
            if (ultimo.fase === "final") {
                return gano ? { clave: "campeon", texto: "Campeón" } : { clave: "subcampeon", texto: "Subcampeón" };
            }
            if (ultimo.fase === "tercer") {
                return gano ? { clave: "tercero", texto: "Tercer lugar" } : { clave: "cuarto", texto: "Cuarto lugar" };
            }
            if (!gano && ultimo.fase === "cuartos") {
                return { clave: "eliminado", texto: "Cuartos de final" };
            }
            if (ultimo.fase === "semifinal") {
                return gano
                    ? { clave: "activo", texto: "Finalista" }
                    : { clave: "activo", texto: "Juega por el tercer lugar" };
            }
            return { clave: "activo", texto: "En competencia" };
        }

        if (faseCompleta("grupos", hoy)) {
            const equipo = equiposPorCodigo.get(codigo);
            const posicion = tablaDeGrupo(equipo.grupo, hoy).findIndex(function (f) { return f.equipo.codigo === codigo; });
            if (posicion > 1) {
                return { clave: "eliminado", texto: "Fase de grupos" };
            }
            return { clave: "activo", texto: "Clasificado a cuartos" };
        }

        return { clave: "activo", texto: jugados.length ? "En competencia" : "Por debutar" };
    }

    function golesTotales(hoy) {
        return partidosJugados(hoy).reduce(function (total, p) {
            return total + p.golesLocal + p.golesVisitante;
        }, 0);
    }

    // ---------- Formatos ----------

    const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
        "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

    function formatearFecha(fecha, conDia) {
        const partes = fecha.split("-").map(Number);
        const d = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2]));
        const texto = partes[2] + " de " + MESES[partes[1] - 1];
        return conDia ? DIAS[d.getUTCDay()] + " " + texto : texto;
    }

    function formatearNumero(numero) {
        return new Intl.NumberFormat("es-PE").format(numero);
    }

    function equipo(codigo) {
        return equiposPorCodigo.get(codigo);
    }

    function estadio(id) {
        return estadiosPorId.get(id);
    }

    return {
        ORDEN_FASES: ORDEN_FASES,
        datos: datos,
        equipo: equipo,
        estadio: estadio,
        fechaISO: fechaISO,
        fechaSimulada: fechaSimulada,
        ahora: ahora,
        estaJugado: estaJugado,
        partidosJugados: partidosJugados,
        faseCompleta: faseCompleta,
        equiposDefinidos: equiposDefinidos,
        ganador: ganador,
        perdedor: perdedor,
        partidosDeEquipo: partidosDeEquipo,
        partidosEnEstadio: partidosEnEstadio,
        partidosPorFase: partidosPorFase,
        tablaDeGrupo: tablaDeGrupo,
        grupos: grupos,
        estadisticasEquipo: estadisticasEquipo,
        resolverLlave: resolverLlave,
        estadoTorneo: estadoTorneo,
        campeon: campeon,
        proximosPartidos: proximosPartidos,
        ultimosResultados: ultimosResultados,
        resultadoEquipo: resultadoEquipo,
        golesTotales: golesTotales,
        formatearFecha: formatearFecha,
        formatearNumero: formatearNumero
    };
});
