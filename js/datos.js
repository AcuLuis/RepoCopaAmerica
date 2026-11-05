// Datos de la Copa América 2024: selecciones, estadios, partidos y premios.
// Es la única fuente de información del sitio; las páginas y los cálculos
// (tablas de posiciones, resultados, cifras) se generan a partir de aquí.
(function (raiz, fabrica) {
    "use strict";
    const datos = fabrica();
    if (typeof module === "object" && module.exports) {
        module.exports = datos;
    } else {
        raiz.CopaDatos = datos;
    }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const torneo = {
        nombre: "Copa América 2024",
        edicion: 48,
        sede: "Estados Unidos",
        // Hora del Este de EE. UU. (UTC-4 en verano).
        zonaHoraria: "America/New_York",
        inicio: "2024-06-20T20:00:00-04:00"
    };

    // codigo: código FIFA · iso: código del archivo de bandera (images/banderas/iso.png)
    const equipos = [
        { codigo: "ARG", nombre: "Argentina", iso: "ar", confederacion: "Conmebol", grupo: "A", entrenador: "Lionel Scaloni" },
        { codigo: "PER", nombre: "Perú", iso: "pe", confederacion: "Conmebol", grupo: "A", entrenador: "Jorge Fossati" },
        { codigo: "CHI", nombre: "Chile", iso: "cl", confederacion: "Conmebol", grupo: "A", entrenador: "Ricardo Gareca" },
        { codigo: "CAN", nombre: "Canadá", iso: "ca", confederacion: "Concacaf", grupo: "A", entrenador: "Jesse Marsch" },

        { codigo: "MEX", nombre: "México", iso: "mx", confederacion: "Concacaf", grupo: "B", entrenador: "Jaime Lozano" },
        { codigo: "ECU", nombre: "Ecuador", iso: "ec", confederacion: "Conmebol", grupo: "B", entrenador: "Félix Sánchez Bas" },
        { codigo: "VEN", nombre: "Venezuela", iso: "ve", confederacion: "Conmebol", grupo: "B", entrenador: "Fernando Batista" },
        { codigo: "JAM", nombre: "Jamaica", iso: "jm", confederacion: "Concacaf", grupo: "B", entrenador: "Heimir Hallgrímsson" },

        { codigo: "USA", nombre: "Estados Unidos", iso: "us", confederacion: "Concacaf", grupo: "C", entrenador: "Gregg Berhalter" },
        { codigo: "URU", nombre: "Uruguay", iso: "uy", confederacion: "Conmebol", grupo: "C", entrenador: "Marcelo Bielsa" },
        { codigo: "PAN", nombre: "Panamá", iso: "pa", confederacion: "Concacaf", grupo: "C", entrenador: "Thomas Christiansen" },
        { codigo: "BOL", nombre: "Bolivia", iso: "bo", confederacion: "Conmebol", grupo: "C", entrenador: "Antônio Carlos Zago" },

        { codigo: "BRA", nombre: "Brasil", iso: "br", confederacion: "Conmebol", grupo: "D", entrenador: "Dorival Júnior" },
        { codigo: "COL", nombre: "Colombia", iso: "co", confederacion: "Conmebol", grupo: "D", entrenador: "Néstor Lorenzo" },
        { codigo: "PAR", nombre: "Paraguay", iso: "py", confederacion: "Conmebol", grupo: "D", entrenador: "Daniel Garnero" },
        { codigo: "CRC", nombre: "Costa Rica", iso: "cr", confederacion: "Concacaf", grupo: "D", entrenador: "Gustavo Alfaro" }
    ];

    const estadios = [
        { id: "allegiant", nombre: "Allegiant Stadium", ciudad: "Las Vegas", estado: "Nevada", capacidad: 65000, imagen: "allegiant_stadium.jpg" },
        { id: "att", nombre: "AT&T Stadium", ciudad: "Arlington", estado: "Texas", capacidad: 80000, imagen: "att_stadium.jpg" },
        { id: "bank-of-america", nombre: "Bank of America Stadium", ciudad: "Charlotte", estado: "Carolina del Norte", capacidad: 74867, imagen: "bank_of_america_stadium.jpg" },
        { id: "childrens-mercy", nombre: "Children's Mercy Park", ciudad: "Kansas City", estado: "Kansas", capacidad: 18467, imagen: "childrens_mercy_park.jpg",
            credito: { autor: "Lectrician2", licencia: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Children%27s_Mercy_Park_Aerial.jpg" } },
        { id: "arrowhead", nombre: "GEHA Field at Arrowhead Stadium", ciudad: "Kansas City", estado: "Misuri", capacidad: 76416, imagen: "geha_field_arrowhead_stadium.jpg" },
        { id: "hard-rock", nombre: "Hard Rock Stadium", ciudad: "Miami Gardens", estado: "Florida", capacidad: 65326, imagen: "hard_rock_stadium.jpg" },
        { id: "inter-co", nombre: "Inter&Co Stadium", ciudad: "Orlando", estado: "Florida", capacidad: 25500, imagen: "inter_co_stadium.jpg" },
        { id: "levis", nombre: "Levi's Stadium", ciudad: "Santa Clara", estado: "California", capacidad: 68500, imagen: "levis_stadium.jpg",
            credito: { autor: "U.S. Customs and Border Protection", licencia: "Dominio público", url: "https://commons.wikimedia.org/wiki/File:Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_(24398261729).jpg" } },
        { id: "mercedes-benz", nombre: "Mercedes-Benz Stadium", ciudad: "Atlanta", estado: "Georgia", capacidad: 73000, imagen: "mercedes_benz_stadium.jpg" },
        { id: "metlife", nombre: "MetLife Stadium", ciudad: "East Rutherford", estado: "Nueva Jersey", capacidad: 82500, imagen: "metlife_stadium.jpg" },
        { id: "nrg", nombre: "NRG Stadium", ciudad: "Houston", estado: "Texas", capacidad: 72220, imagen: "nrg_stadium.jpg" },
        { id: "q2", nombre: "Q2 Stadium", ciudad: "Austin", estado: "Texas", capacidad: 20738, imagen: "q2_stadium.jpg" },
        { id: "sofi", nombre: "SoFi Stadium", ciudad: "Inglewood", estado: "California", capacidad: 70000, imagen: "sofi_stadium.jpg" },
        { id: "state-farm", nombre: "State Farm Stadium", ciudad: "Glendale", estado: "Arizona", capacidad: 63400, imagen: "state_farm_stadium.jpg" }
    ];

    // Fechas en hora del Este de EE. UU. Los penales se guardan como [local, visitante].
    function p(id, fase, grupo, fecha, local, golesLocal, golesVisitante, visitante, estadio, extra) {
        return Object.assign({
            id: id, fase: fase, grupo: grupo, fecha: fecha,
            local: local, visitante: visitante,
            golesLocal: golesLocal, golesVisitante: golesVisitante,
            estadio: estadio
        }, extra || {});
    }

    const partidos = [
        // Fase de grupos - Fecha 1
        p(1, "grupos", "A", "2024-06-20", "ARG", 2, 0, "CAN", "mercedes-benz", { inaugural: true }),
        p(2, "grupos", "A", "2024-06-21", "PER", 0, 0, "CHI", "att"),
        p(3, "grupos", "B", "2024-06-22", "ECU", 1, 2, "VEN", "levis"),
        p(4, "grupos", "B", "2024-06-22", "MEX", 1, 0, "JAM", "nrg"),
        p(5, "grupos", "C", "2024-06-23", "USA", 2, 0, "BOL", "att"),
        p(6, "grupos", "C", "2024-06-23", "URU", 3, 1, "PAN", "hard-rock"),
        p(7, "grupos", "D", "2024-06-24", "COL", 2, 1, "PAR", "nrg"),
        p(8, "grupos", "D", "2024-06-24", "BRA", 0, 0, "CRC", "sofi"),
        // Fecha 2
        p(9, "grupos", "A", "2024-06-25", "PER", 0, 1, "CAN", "childrens-mercy"),
        p(10, "grupos", "A", "2024-06-25", "CHI", 0, 1, "ARG", "metlife"),
        p(11, "grupos", "B", "2024-06-26", "ECU", 3, 1, "JAM", "allegiant"),
        p(12, "grupos", "B", "2024-06-26", "VEN", 1, 0, "MEX", "sofi"),
        p(13, "grupos", "C", "2024-06-27", "PAN", 2, 1, "USA", "mercedes-benz"),
        p(14, "grupos", "C", "2024-06-27", "URU", 5, 0, "BOL", "metlife"),
        p(15, "grupos", "D", "2024-06-28", "PAR", 1, 4, "BRA", "allegiant"),
        p(16, "grupos", "D", "2024-06-28", "COL", 3, 0, "CRC", "state-farm"),
        // Fecha 3
        p(17, "grupos", "A", "2024-06-29", "ARG", 2, 0, "PER", "hard-rock"),
        p(18, "grupos", "A", "2024-06-29", "CAN", 0, 0, "CHI", "inter-co"),
        p(19, "grupos", "B", "2024-06-30", "MEX", 0, 0, "ECU", "state-farm"),
        p(20, "grupos", "B", "2024-06-30", "JAM", 0, 3, "VEN", "q2"),
        p(21, "grupos", "C", "2024-07-01", "BOL", 1, 3, "PAN", "inter-co"),
        p(22, "grupos", "C", "2024-07-01", "USA", 0, 1, "URU", "arrowhead"),
        p(23, "grupos", "D", "2024-07-02", "BRA", 1, 1, "COL", "levis"),
        p(24, "grupos", "D", "2024-07-02", "CRC", 2, 1, "PAR", "q2"),
        // Cuartos de final
        p(25, "cuartos", null, "2024-07-04", "ARG", 1, 1, "ECU", "nrg", { penales: [4, 2] }),
        p(26, "cuartos", null, "2024-07-05", "VEN", 1, 1, "CAN", "att", { penales: [3, 4] }),
        p(27, "cuartos", null, "2024-07-06", "COL", 5, 0, "PAN", "state-farm"),
        p(28, "cuartos", null, "2024-07-06", "URU", 0, 0, "BRA", "allegiant", { penales: [4, 2] }),
        // Semifinales
        p(29, "semifinal", null, "2024-07-09", "ARG", 2, 0, "CAN", "metlife"),
        p(30, "semifinal", null, "2024-07-10", "URU", 0, 1, "COL", "bank-of-america"),
        // Tercer lugar y final
        p(31, "tercer", null, "2024-07-13", "URU", 2, 2, "CAN", "bank-of-america", { penales: [4, 3] }),
        p(32, "final", null, "2024-07-14", "ARG", 1, 0, "COL", "hard-rock", { prorroga: true, goles: "Lautaro Martínez (112')" })
    ];

    // Llaves de cuartos de final según la posición en cada grupo.
    const llaves = {
        cuartos: [
            { partido: 25, local: "1A", visitante: "2B" },
            { partido: 26, local: "1B", visitante: "2A" },
            { partido: 27, local: "1D", visitante: "2C" },
            { partido: 28, local: "1C", visitante: "2D" }
        ],
        semifinal: [
            { partido: 29, local: "G25", visitante: "G26" },
            { partido: 30, local: "G28", visitante: "G27" }
        ],
        tercer: [{ partido: 31, local: "P30", visitante: "P29" }],
        final: [{ partido: 32, local: "G29", visitante: "G30" }]
    };

    const premios = [
        { titulo: "Bota de Oro", ganador: "Lautaro Martínez", equipo: "ARG", detalle: "5 goles" },
        { titulo: "Mejor jugador", ganador: "James Rodríguez", equipo: "COL" },
        { titulo: "Mejor arquero", ganador: "Emiliano Martínez", equipo: "ARG" }
    ];

    const fases = {
        grupos: "Fase de grupos",
        cuartos: "Cuartos de final",
        semifinal: "Semifinal",
        tercer: "Tercer lugar",
        final: "Final"
    };

    return {
        torneo: torneo,
        equipos: equipos,
        estadios: estadios,
        partidos: partidos,
        llaves: llaves,
        premios: premios,
        fases: fases
    };
});
