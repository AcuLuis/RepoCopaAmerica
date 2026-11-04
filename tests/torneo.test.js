// Pruebas de los datos y la lógica del torneo. Ejecutar con: node --test
const { test } = require("node:test");
const assert = require("node:assert/strict");

const datos = require("../js/datos.js");
const Torneo = require("../js/torneo.js");

const FIN = "2024-07-20"; // Cualquier día posterior a la final
const codigos = (tabla) => tabla.map((fila) => fila.equipo.codigo);

test("los datos están completos y son coherentes", () => {
    assert.equal(datos.equipos.length, 16);
    assert.equal(datos.estadios.length, 14);
    assert.equal(datos.partidos.length, 32);

    const codigosEquipos = new Set(datos.equipos.map((e) => e.codigo));
    const idsEstadios = new Set(datos.estadios.map((e) => e.id));
    for (const p of datos.partidos) {
        assert.ok(codigosEquipos.has(p.local), `equipo desconocido ${p.local}`);
        assert.ok(codigosEquipos.has(p.visitante), `equipo desconocido ${p.visitante}`);
        assert.ok(idsEstadios.has(p.estadio), `estadio desconocido ${p.estadio}`);
    }

    // Todos los estadios recibieron al menos un partido.
    for (const e of datos.estadios) {
        assert.ok(Torneo.partidosEnEstadio(e.id).length > 0, `${e.nombre} sin partidos`);
    }

    // Cada selección juega 3 partidos de grupo contra rivales de su grupo.
    for (const e of datos.equipos) {
        const deGrupo = Torneo.partidosDeEquipo(e.codigo).filter((p) => p.fase === "grupos");
        assert.equal(deGrupo.length, 3, e.nombre);
        assert.ok(deGrupo.every((p) => p.grupo === e.grupo));
    }
});

test("las tablas de posiciones finales son correctas", () => {
    assert.deepEqual(codigos(Torneo.tablaDeGrupo("A", FIN)), ["ARG", "CAN", "CHI", "PER"]);
    assert.deepEqual(codigos(Torneo.tablaDeGrupo("B", FIN)), ["VEN", "ECU", "MEX", "JAM"]);
    assert.deepEqual(codigos(Torneo.tablaDeGrupo("C", FIN)), ["URU", "PAN", "USA", "BOL"]);
    assert.deepEqual(codigos(Torneo.tablaDeGrupo("D", FIN)), ["COL", "BRA", "CRC", "PAR"]);

    const argentina = Torneo.tablaDeGrupo("A", FIN)[0];
    assert.deepEqual(
        { pj: argentina.pj, g: argentina.g, gf: argentina.gf, gc: argentina.gc, pts: argentina.pts },
        { pj: 3, g: 3, gf: 5, gc: 0, pts: 9 }
    );

    // Ecuador supera a México por diferencia de gol (ambos con 4 puntos).
    const [, ecuador, mexico] = Torneo.tablaDeGrupo("B", FIN);
    assert.equal(ecuador.pts, mexico.pts);
    assert.ok(ecuador.dg > mexico.dg);
});

test("las llaves de eliminación coinciden con los partidos jugados", () => {
    for (const fase of ["cuartos", "semifinal", "tercer", "final"]) {
        for (const llave of datos.llaves[fase]) {
            const partido = datos.partidos.find((p) => p.id === llave.partido);
            assert.equal(Torneo.resolverLlave(llave.local, FIN), partido.local, `${fase} ${llave.local}`);
            assert.equal(Torneo.resolverLlave(llave.visitante, FIN), partido.visitante, `${fase} ${llave.visitante}`);
        }
    }
});

test("los partidos de eliminación siempre tienen ganador", () => {
    for (const p of datos.partidos.filter((p) => p.fase !== "grupos")) {
        assert.ok(Torneo.ganador(p), `partido ${p.id} sin ganador`);
    }
});

test("el resultado de cada selección es el correcto", () => {
    const esperado = {
        ARG: "Campeón",
        COL: "Subcampeón",
        URU: "Tercer lugar",
        CAN: "Cuarto lugar",
        BRA: "Cuartos de final",
        ECU: "Cuartos de final",
        PER: "Fase de grupos",
        MEX: "Fase de grupos"
    };
    for (const [codigo, texto] of Object.entries(esperado)) {
        assert.equal(Torneo.resultadoEquipo(codigo, FIN).texto, texto, codigo);
    }
    assert.equal(Torneo.campeon(FIN), "ARG");
    assert.equal(Torneo.golesTotales(FIN), 70);
});

test("el estado del torneo depende de la fecha", () => {
    assert.equal(Torneo.estadoTorneo(new Date("2024-06-01T12:00:00-04:00")), "antes");
    assert.equal(Torneo.estadoTorneo(new Date("2024-06-20T19:59:00-04:00")), "antes");
    assert.equal(Torneo.estadoTorneo(new Date("2024-06-20T20:00:00-04:00")), "durante");
    assert.equal(Torneo.estadoTorneo(new Date("2024-07-14T23:00:00-04:00")), "durante");
    assert.equal(Torneo.estadoTorneo(new Date("2024-07-15T09:00:00-04:00")), "despues");
});

test("a mitad del torneo solo cuentan los partidos ya jugados", () => {
    const hoy = "2024-06-25"; // Antes de la segunda fecha del grupo A
    const tablaA = Torneo.tablaDeGrupo("A", hoy);
    assert.equal(tablaA[0].equipo.codigo, "ARG");
    assert.equal(tablaA[0].pts, 3);
    assert.ok(tablaA.every((fila) => fila.pj === 1));

    assert.equal(Torneo.campeon(hoy), null);
    assert.equal(Torneo.resolverLlave("1A", hoy), null);
    assert.equal(Torneo.resultadoEquipo("PER", hoy).texto, "En competencia");
    assert.deepEqual(Torneo.proximosPartidos(hoy).map((p) => p.id), [9, 10]);
    assert.deepEqual(Torneo.ultimosResultados(hoy).map((p) => p.id), [7, 8]);
});

test("la fecha simulada se lee de la URL", () => {
    assert.equal(Torneo.fechaSimulada("?fecha=2024-06-25"), "2024-06-25");
    assert.equal(Torneo.fechaSimulada("?fecha=hola"), null);
    assert.equal(Torneo.fechaSimulada(""), null);
    assert.equal(Torneo.fechaISO(Torneo.ahora("?fecha=2024-06-25")), "2024-06-25");
});
