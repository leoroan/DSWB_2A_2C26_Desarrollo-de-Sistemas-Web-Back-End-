class Producto {
  constructor({ id, nombre, categoria, precio, estado = "activo" } = {}) {
    Object.assign(this, { id, nombre, categoria, precio, estado });
  }
}

export default Producto;

