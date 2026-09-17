const { exigir, texto } = require('../utils/validaciones');

class Producto {
  constructor({ id, nombre, categoria, precio, estado = 'activo' }) {
    exigir(texto(nombre), 'nombre es obligatorio');
    exigir(texto(categoria), 'categoria es obligatoria');
    exigir(typeof precio === 'number' && Number.isFinite(precio) && precio >= 0, 'precio debe ser un número mayor o igual a cero');
    exigir(['activo', 'inactivo'].includes(estado), 'estado debe ser activo o inactivo');
    Object.assign(this, { id, nombre: nombre.trim(), categoria: categoria.trim(), precio, estado });
  }
}

module.exports = Producto;
