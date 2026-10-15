export const TIPOS_CLIENTE = ["Restaurante", "Comedor"];
export const ESTADOS_CLIENTE = ["Activo", "Inactivo"];

function esTexto(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

/** Valida los campos obligatorios de un Cliente. Lanza Error si algo es inválido. */
export function validarCliente(datos, { parcial = false } = {}) {
  const obligatorio = (campo, mensaje) => {
    if (parcial && datos[campo] === undefined) return;
    if (!esTexto(datos[campo])) throw new Error(mensaje);
  };
  obligatorio("nombre", "El nombre del cliente es obligatorio");
  obligatorio("email", "El email del cliente es obligatorio");
  obligatorio("telefono", "El teléfono del cliente es obligatorio");
  obligatorio("domicilioDeEntrega", "El domicilio de entrega es obligatorio");
  if (!parcial || datos.tipo !== undefined) {
    if (!datos.tipo) throw new Error("El tipo de cliente es obligatorio");
    if (!TIPOS_CLIENTE.includes(datos.tipo)) throw new Error("El tipo de cliente no es válido");
  }
  if (datos.estado !== undefined && !ESTADOS_CLIENTE.includes(datos.estado)) {
    throw new Error("El estado del cliente no es válido");
  }
}

/** Normaliza (trim) los campos de texto de un Cliente. */
export function normalizarCliente(datos) {
  const salida = { ...datos };
  for (const campo of ["nombre", "email", "telefono", "domicilioDeEntrega"]) {
    if (typeof salida[campo] === "string") salida[campo] = salida[campo].trim();
  }
  return salida;
}
