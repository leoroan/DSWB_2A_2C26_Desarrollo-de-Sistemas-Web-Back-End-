function mostrarDocumentacion(req, res) {
  res.render("documentacion", {
    titulo: "FreshRoute B2B - Documentación Académica",
  });
}

function mostrarDashboard(req, res) {
  res.render("dashboard", {
    titulo: "Pagina inicial",
  });
}

module.exports = {
  mostrarDashboard,
  mostrarDocumentacion,
};
