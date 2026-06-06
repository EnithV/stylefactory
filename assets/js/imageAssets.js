/**
 * Rutas locales de imágenes bajo assets/images/.
 * Usa la base del sitio (GitHub Pages /stylefactory o raíz en local).
 */
export function assetUrl(relativePath) {
    var clean = String(relativePath || "").replace(/^\/+/, "");
    var ruta = "/assets/images/" + clean;
    if (typeof window !== "undefined" && typeof window.urlApp === "function") {
        return window.urlApp(ruta);
    }
    var base =
        typeof window !== "undefined" && typeof window.obtenerBaseAplicacion === "function"
            ? window.obtenerBaseAplicacion()
            : "";
    return base + ruta;
}

export const IMAGEN_SERVICIO_DEFAULT = assetUrl("servicios/corte-premium.png");

/** Migra URLs antiguas de Cloudinary a assets locales (respuestas del API). */
const LEGACY_IMAGE_MAP = {
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957776/cortePremium_engl79.png": "servicios/corte-premium.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/tinteColoracion_xlsf5v.png": "servicios/tinte-coloracion.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957777/keratina_bjqvof.png": "servicios/keratina.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/barbaAfeitado_fcacso.png": "servicios/barba-afeitado.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/peinadoEventos_bk9cyr.png": "servicios/peinado-eventos.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957780/mechasReflejos_p5hod7.png": "servicios/mechas-reflejos.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957783/tratamientoCapilar_mqkb13.png": "servicios/tratamiento-capilar.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/cepilladoBrasile%C3%B1o_ela99r.png": "servicios/cepillado-brasileno.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957779/maquillajeProfesional_h9vo1k.png": "servicios/maquillaje-profesional.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957778/limpiezaFacial_fmvrnn.png": "servicios/limpieza-facial.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336588/Sty1_wj2bmn.png": "empleados/sty1.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336622/Sty2_z1upkm.png": "empleados/sty2.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336764/Sty3_hk8sdy.png": "empleados/sty3.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336831/Sty4_yhgjef.png": "empleados/sty4.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336977/Sty5_wnafrw.png": "empleados/sty5.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1777337017/Sty6_vgztvb.png": "empleados/sty6.png",
};

export function normalizarUrlImagen(url) {
    if (typeof window !== "undefined" && typeof window.resolverUrlImagen === "function") {
        return window.resolverUrlImagen(url);
    }
    if (!url) return IMAGEN_SERVICIO_DEFAULT;
    var local = LEGACY_IMAGE_MAP[url];
    if (local) return assetUrl(local);
    if (url.indexOf("/assets/images/") !== -1 && url.indexOf("cloudinary.com") === -1) {
        if (url.indexOf("http") === 0) return url;
        return assetUrl(url.replace(/^\/+/, "").replace(/^assets\/images\//, ""));
    }
    return url;
}
