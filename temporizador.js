// Fechas con zona horaria explícita (hora del Este de EE. UU.) para que la
// cuenta regresiva sea la misma sin importar el país desde donde se visite.
var INICIO_TORNEO = new Date("2024-06-20T20:00:00-04:00").getTime(); // Argentina vs. Canadá
var FIN_TORNEO = new Date("2024-07-15T00:00:00-04:00").getTime();    // Día siguiente a la final

var MS_SEGUNDO = 1000;
var MS_MINUTO = 60 * MS_SEGUNDO;
var MS_HORA = 60 * MS_MINUTO;
var MS_DIA = 24 * MS_HORA;

function plural(cantidad, singular, plural) {
    return cantidad + " " + (cantidad === 1 ? singular : plural);
}

function actualizarContador() {
    var contador = document.getElementById("contador");
    var titulo = document.getElementById("tituloContador");
    var ahora = Date.now();

    if (ahora >= FIN_TORNEO) {
        if (titulo) titulo.textContent = "La Copa América 2024 finalizó";
        contador.textContent = "Campeón: Argentina (1-0 a Colombia en la final)";
        clearInterval(temporizador);
        return;
    }

    if (ahora >= INICIO_TORNEO) {
        if (titulo) titulo.textContent = "La Copa América 2024 está en juego";
        contador.textContent = "¡El torneo ya comenzó!";
        return;
    }

    var diferencia = INICIO_TORNEO - ahora;
    var dias = Math.floor(diferencia / MS_DIA);
    var horas = Math.floor((diferencia % MS_DIA) / MS_HORA);
    var minutos = Math.floor((diferencia % MS_HORA) / MS_MINUTO);
    var segundos = Math.floor((diferencia % MS_MINUTO) / MS_SEGUNDO);

    contador.textContent = plural(dias, "día", "días") + " " +
        plural(horas, "hora", "horas") + " " +
        plural(minutos, "minuto", "minutos") + " " +
        plural(segundos, "segundo", "segundos");
}

var temporizador = setInterval(actualizarContador, 1000);
actualizarContador();
