// Cada noticia mantiene juntas su imagen, su enlace y su texto alternativo,
// así el enlace siempre corresponde a la imagen que se está mostrando.
var carruseles = [
    {
        enlace: "enlace1",
        imagen: "imagen1",
        indice: 0,
        noticias: [
            {
                imagen: "images_noticias/copa_gestion.avif",
                url: "https://gestion.pe/noticias/copa-america/",
                titulo: "Copa América 2024: últimas noticias (Gestión)"
            },
            {
                imagen: "images_noticias/gareca_infobae.avif",
                url: "https://es.soccerway.com/noticias/futbol-copa-america-gareca-entrenador-de-chile-se-reencuentra-con-peru-en-la-copa-america/OpVxirAD",
                titulo: "Gareca, entrenador de Chile, se reencuentra con Perú en la Copa América (Soccerway)"
            },
            {
                imagen: "images_noticias/gareca_libero.webp",
                url: "https://libero.pe/futbol-internacional/copa-america/2024/04/10/peru-tiene-chances-ganar-copa-america-ricardo-gareca-sorprendio-pronostico-666870",
                titulo: "Ricardo Gareca y las chances de Perú en la Copa América (Líbero)"
            }
        ]
    },
    {
        enlace: "enlace2",
        imagen: "imagen2",
        indice: 0,
        noticias: [
            {
                imagen: "images_noticias/israel_firma_rpp.webp",
                url: "https://rpp.pe/futbol/futbol-mundial/conmebol-firmo-acuerdo-con-israel-y-podia-jugar-la-copa-america-noticia-1547258",
                titulo: "Israel firmó acuerdo con la Conmebol y se ilusiona con jugar la Copa América (RPP)"
            },
            {
                imagen: "images_noticias/israel_peru21.avif",
                url: "https://www.tudn.com/futbol/copa-america/israel-firma-acuerdo-trabajo-conmebol-puede-participar-copa-america",
                titulo: "Israel puede aparecer en la Copa América tras acuerdo de trabajo con Conmebol (TUDN)"
            }
        ]
    }
];

function mostrarNoticia(carrusel) {
    var noticia = carrusel.noticias[carrusel.indice];
    var enlace = document.getElementById(carrusel.enlace);
    var imagen = document.getElementById(carrusel.imagen);
    if (!enlace || !imagen) {
        return;
    }
    enlace.href = noticia.url;
    imagen.src = noticia.imagen;
    imagen.alt = noticia.titulo;
}

function avanzarCarruseles() {
    for (var i = 0; i < carruseles.length; i++) {
        var carrusel = carruseles[i];
        carrusel.indice = (carrusel.indice + 1) % carrusel.noticias.length;
        mostrarNoticia(carrusel);
    }
}

setInterval(avanzarCarruseles, 5000);
