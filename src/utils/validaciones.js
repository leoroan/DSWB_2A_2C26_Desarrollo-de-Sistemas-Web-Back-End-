function exigir(condicion, mensaje, status = 400) {
  if (!condicion) throw Object.assign(new Error(mensaje), { status });
}

function idValido(valor) {
  return Number.isSafeInteger(valor) && valor > 0;
}

function texto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function fechaValida(valor) {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
    && Number.isFinite(Date.parse(valor))
    && new Date(valor).toISOString().slice(0, 10) === valor;
}

module.exports = { exigir, idValido, texto, fechaValida };
