-- Actualiza URLs de Cloudinary a imágenes locales en GitHub Pages.
-- Ejecutar en Supabase/PostgreSQL si la BD ya tiene datos del seed anterior.

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty1.png'
WHERE url LIKE '%Sty1_wj2bmn%';

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty2.png'
WHERE url LIKE '%Sty2_z1upkm%';

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty3.png'
WHERE url LIKE '%Sty3_hk8sdy%';

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty4.png'
WHERE url LIKE '%Sty4_yhgjef%';

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty5.png'
WHERE url LIKE '%Sty5_wnafrw%';

UPDATE empleados SET url = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty6.png'
WHERE url LIKE '%Sty6_vgztvb%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/corte-premium.png'
WHERE url_imagen LIKE '%cortePremium%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/tinte-coloracion.png'
WHERE url_imagen LIKE '%tinteColoracion%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/keratina.png'
WHERE url_imagen LIKE '%keratina_bjqvof%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/barba-afeitado.png'
WHERE url_imagen LIKE '%barbaAfeitado%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/peinado-eventos.png'
WHERE url_imagen LIKE '%peinadoEventos%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/mechas-reflejos.png'
WHERE url_imagen LIKE '%mechasReflejos%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/tratamiento-capilar.png'
WHERE url_imagen LIKE '%tratamientoCapilar%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/cepillado-brasileno.png'
WHERE url_imagen LIKE '%cepilladoBrasile%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/maquillaje-profesional.png'
WHERE url_imagen LIKE '%maquillajeProfesional%';

UPDATE servicios SET url_imagen = 'https://enithv.github.io/stylefactory/assets/images/servicios/limpieza-facial.png'
WHERE url_imagen LIKE '%limpiezaFacial%';
