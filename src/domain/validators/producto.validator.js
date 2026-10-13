import { exigir, texto } from "../../utils/validaciones.js";

export const ESTADOS_PRODUCTO = ["activo", "inactivo"];

/** Valida y normaliza los datos de un Producto. */
export function validarProducto(datos) {
  exigir(datos && typeof datos === "object", "Se requiere un objeto con los datos del producto");
  exigir(texto(datos.nombre), "nombre es obligatorio");
  exigir(texto(datos.categoria), "categoria es obligatoria");
  exigir(
    typeof datos.precio === "number" && Number.isFinite(datos.precio) && datos.precio >= 0,
    "precio debe ser un número mayor o igual a cero",
  );
  const estado = datos.estado ?? "activo";
  exigir(ESTADOS_PRODUCTO.includes(estado), "estado debe ser activo o inactivo");
  return {
    id: datos.id,
    nombre: datos.nombre.trim(),
    categoria: datos.categoria.trim(),
    precio: datos.precio,
    estado,
  };
}
