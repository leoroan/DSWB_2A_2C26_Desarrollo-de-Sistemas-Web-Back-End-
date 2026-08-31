function mostrarDocumentacion(req, res) {
  res.render("documentacion", {
    titulo: "FreshRoute B2B - Documentación Académica",
  });
}

module.exports = {
  mostrarDocumentacion,
};
