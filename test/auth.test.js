import { test } from "node:test";
import assert from "node:assert/strict";
import app from "../index.js";
import { Usuario, Sesion } from "../src/models/index.js";
import clientes from "../src/repositories/clientes.repo.js";
import pedidos from "../src/repositories/pedidos.repo.js";
import rutas from "../src/repositories/rutas.repo.js";
import remitos from "../src/repositories/remito.repo.js";
import choferes from "../src/repositories/choferes.repo.js";
import vehiculos from "../src/repositories/vehiculos.repo.js";
import { hashPassword, verificarPassword } from "../src/utils/password.js";
import jwt from "jsonwebtoken";
import config from "../src/config/env.js";
import { verificarJWT, validarSecretoJWT } from "../src/utils/jwt.js";
config.jwtSecret = "secreto-exclusivo-para-pruebas-12345678901234567890";

test("login, protección de páginas y cierre de sesión", async (t) => {
  // Simula la persistencia sin conectar ni escribir en la base del equipo.
  const usuario = { _id: "usuario-prueba", nombre: "Javier", email: "javi@example.com", password: await hashPassword("clave1234"), rol: "admin" };
  const sesiones = new Map();
  for (const repo of [clientes, pedidos, rutas, remitos]) {
    t.mock.method(repo, "obtenerTodas", async () => []);
  }
  for (const repo of [choferes, vehiculos]) {
    t.mock.method(repo, "obtenerTodos", async () => []);
  }
  t.mock.method(Usuario, "findOne", ({ email }) => ({
    select: async () => email === usuario.email ? usuario : null,
  }));
  t.mock.method(Sesion, "create", async (datos) => {
    const sesion = { ...datos, usuario, deleteOne: async () => sesiones.delete(datos.tokenHash) };
    sesiones.set(datos.tokenHash, sesion);
    return sesion;
  });
  t.mock.method(Sesion, "findOne", (query) => ({ populate: async () => {
    const sesion = sesiones.get(query.tokenHash);
    return sesion && sesion.expiresAt > query.expiresAt.$gt ? sesion : null;
  } }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const get = (path, cookie) => fetch(url + path, { redirect: "manual", headers: cookie ? { cookie } : {} });
  const login = (password, email = usuario.email) => fetch(url + "/login", {
    method: "POST", redirect: "manual",
    body: new URLSearchParams({ email, password }),
  });
  for (const path of ["/", "/pedidos", "/clientes", "/documentacion"]) {
    const res = await get(path);
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/login");
  }
  const formulario = await get("/login");
  assert.equal(formulario.status, 200);
  assert.match(await formulario.text(), /Iniciar sesión/);
  assert.equal((await login("incorrecta")).status, 401);
  assert.equal((await get("/api/clientes")).status, 401);
  assert.equal((await fetch(url + "/api/clientes", { method: "POST" })).status, 401);
  assert.equal((await login("clave1234", "nadie@example.com")).status, 401);
  const ingreso = await login("clave1234", " JAVI@example.com ");
  assert.equal(ingreso.status, 302);
  assert.equal(ingreso.headers.get("location"), "/");
  const cookie = ingreso.headers.get("set-cookie").split(";")[0];
  assert.match(ingreso.headers.get("set-cookie"), /HttpOnly/);
  const tokenWeb = cookie.slice(cookie.indexOf("=") + 1);
  assert.equal(verificarJWT(tokenWeb).sub, usuario._id);
  const inicio = await get("/", cookie);
  assert.equal(inicio.status, 200);
  const html = await inicio.text();
  assert.match(html, /Cerrar sesión/);
  assert.match(html, /Panel Operativo FreshRoute B2B/);
  assert.match(html, /Javier/);
  assert.ok(!html.includes(usuario.password));
  assert.equal((await get("/login", cookie)).status, 302);
  const loginAPI = await fetch(url + "/api/auth/login", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: usuario.email, password: "clave1234" }),
  });
  assert.equal(loginAPI.status, 200);
  const datos = await loginAPI.json();
  assert.equal(datos.token_type, "Bearer");
  assert.equal(datos.expires_in, 28800);
  assert.equal(datos.usuario.password, undefined);
  const bearer = (token, path = "/api/clientes", method = "GET") => fetch(url + path, {
    method, headers: { authorization: `Bearer ${token}` },
  });
  assert.equal((await bearer(datos.access_token)).status, 200);
  const invalidos = [
    "invalido", tokenWeb.slice(0, -3) + "xxx",
    jwt.sign({ sub: usuario._id, jti: "prueba", exp: 1 }, config.jwtSecret, { issuer: "freshroute", audience: "freshroute-web-api" }),
    jwt.sign({ sub: usuario._id, jti: "prueba" }, "otra-clave", { expiresIn: 60 }),
    jwt.sign({ sub: usuario._id, jti: "prueba" }, config.jwtSecret, { issuer: "otro", audience: "freshroute-web-api", expiresIn: 60 }),
    jwt.sign({ sub: usuario._id, jti: "prueba" }, config.jwtSecret, { issuer: "freshroute", audience: "otra", expiresIn: 60 }),
    jwt.sign({ sub: usuario._id, jti: "prueba" }, config.jwtSecret, { algorithm: "HS384", expiresIn: 60 }),
  ];
  for (const token of invalidos) assert.equal((await bearer(token)).status, 401);
  assert.equal((await fetch(url + "/api/clientes", { headers: { cookie, authorization: "Basic invalido" } })).status, 401);
  usuario.rol = "operador";
  assert.equal((await bearer(datos.access_token, "/api/clientes", "POST")).status, 403);
  assert.equal((await get("/api/clientes", cookie)).status, 200);
  assert.equal((await fetch(url + "/api/clientes", { method: "POST", headers: { cookie } })).status, 403);
  assert.equal((await fetch(url + "/clientes", { method: "POST", headers: { cookie } })).status, 403);
  usuario.rol = "admin";
  assert.equal((await bearer(datos.access_token, "/api/auth/logout", "POST")).status, 204);
  assert.equal((await bearer(datos.access_token)).status, 401);
  assert.equal((await bearer(datos.access_token, "/api/auth/logout", "POST")).status, 401);
  assert.equal((await fetch(url + "/api/clientes", { method: "POST", headers: { cookie, origin: "https://otro.example" } })).status, 403);
  const salida = await fetch(url + "/logout", { method: "POST", redirect: "manual", headers: { cookie } });
  assert.equal(salida.headers.get("location"), "/login");
  assert.equal((await get("/", cookie)).status, 302);
  const nuevo = await login("clave1234");
  const nuevaCookie = nuevo.headers.get("set-cookie").split(";")[0];
  for (const sesion of sesiones.values()) sesion.expiresAt = new Date(0);
  assert.equal((await get("/", nuevaCookie)).status, 302);
});

test("JWT requiere secreto privado configurado", () => {
  const secret = config.jwtSecret;
  try {
    config.jwtSecret = undefined;
    assert.throws(validarSecretoJWT, /JWT_SECRET/);
    config.jwtSecret = "corto";
    assert.throws(validarSecretoJWT, /JWT_SECRET/);
  } finally { config.jwtSecret = secret; }
});

test("hash con salt, validación y rechazo de texto plano", async () => {
  const hash = await hashPassword("clave1234");
  assert.notEqual(hash, await hashPassword("clave1234"));
  assert.equal(await verificarPassword("clave1234", hash), true);
  assert.equal(await verificarPassword("otra", hash), false);
  assert.equal(await verificarPassword("clave1234", "clave1234"), false);
  await assert.rejects(hashPassword("corta"));
});
