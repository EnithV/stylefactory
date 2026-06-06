"""Download external Cloudinary/Pinterest images into assets/images/."""
from __future__ import annotations

import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "assets" / "images"

# url -> relative path under assets/images/
IMAGE_MAP: dict[str, str] = {
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957455/logo_fondo_transparente_mrrgwk.png": "branding/logo-transparente.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776620229/logo_fondo_dorado_atruxi.png": "branding/logo-dorado.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957534/bannerInicio_opgwmt.png": "branding/banner-inicio.png",
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
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1778718642/About_1_zlodxh.png": "about/about-1.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1778718642/About_2_y32kzh.png": "about/about-2.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1778718641/About_3_ovsrgv.png": "about/about-3.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1778718641/About_4_tbgpaz.png": "about/about-4.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776620190/camilo_kcmnnw.png": "equipo/camilo.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776620185/marcela_ruxl7p.jpg": "equipo/marcela.jpg",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776620186/luis_lfbqcn.jpg": "equipo/luis.jpg",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776620188/enith_xnun0r.png": "equipo/enith.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957597/angie_hku0vj.jpg": "equipo/angie.jpg",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776783907/rese%C3%B1a_5_ib29gl.png": "reviews/resena-5.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776783907/rese%C3%B1a_2_rshpsx.png": "reviews/resena-2.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776783907/rese%C3%B1a_1_o2ynzv.png": "reviews/resena-1.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776619972/Style1_zajaih.png": "sucursales/style1.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776619969/Style2_rgxkqp.png": "sucursales/style2.png",
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776619970/Style3_glqcl7.png": "sucursales/style3.png",
    "https://res.cloudinary.com/dh9dfyyuv/image/upload/v1777676567/Hair_salon_interior_neon_sign_202605011801_w1tb3w.jpg": "index/salon-neon.jpg",
    "https://res.cloudinary.com/dh9dfyyuv/image/upload/v1777677042/Stylists_working_in_hair_salon_202605011810_vq1ihm.jpg": "index/stylists-working.jpg",
    "https://res.cloudinary.com/dh9dfyyuv/image/upload/v1777677425/Barbershop_interior_with_clients__202605011816_zi1uzd.jpg": "index/barbershop-interior.jpg",
    "https://i.pinimg.com/1200x/ce/4e/08/ce4e08428382942df4c291b100abac6e.jpg": "contact/gallery-1.jpg",
    "https://i.pinimg.com/736x/24/d3/4a/24d34a0347d21010fa30e1beeb6e2fb9.jpg": "contact/gallery-2.jpg",
    "https://i.pinimg.com/736x/13/d9/c9/13d9c9557c20368b767a7675b6e5ade3.jpg": "contact/gallery-3.jpg",
}

PUBLIC_BASE = "https://enithv.github.io/stylefactory/assets/images"


def download_all() -> None:
    for url, rel_path in IMAGE_MAP.items():
        dest = IMAGES_DIR / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size > 0:
            print(f"skip {rel_path}")
            continue
        print(f"get  {rel_path}")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())


def replace_in_tree() -> None:
    exts = {".html", ".css", ".js", ".sql"}
    skip_dirs = {"scripts", ".git", "node_modules"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in exts:
            continue
        if any(part in skip_dirs for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        original = text
        for url, rel_path in IMAGE_MAP.items():
            local_ref = f"/assets/images/{rel_path}"
            public_ref = f"{PUBLIC_BASE}/{rel_path}"
            if path.suffix == ".sql":
                text = text.replace(url, public_ref)
            else:
                text = text.replace(url, local_ref)
            decoded = urllib.parse.unquote(url)
            if decoded != url:
                if path.suffix == ".sql":
                    text = text.replace(decoded, public_ref)
                else:
                    text = text.replace(decoded, local_ref)
        if text != original:
            path.write_text(text, encoding="utf-8")
            print(f"updated {path.relative_to(ROOT)}")


if __name__ == "__main__":
    download_all()
    replace_in_tree()
    print("done")
