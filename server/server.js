
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios");
const pedidosRoutes = require("./routes/pedidos");
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración
app.use(cors());
app.use(express.json());

// Rutas de usuarios
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/pedidos", pedidosRoutes);
// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "SneakHub API funcionando correctamente"
  });
});

// Estado de la conexión
app.get("/api/estado", (req, res) => {
  res.json({
    servidor: "Funcionando",
    baseDeDatos:
      mongoose.connection.readyState === 1
        ? "Conectada"
        : "Desconectada"
  });
});

// Conectar MongoDB e iniciar servidor
async function iniciarServidor() {
  try {
const uri = process.env.MONGODB_URI;

console.log("VARIABLE EXISTE:", Boolean(uri));
console.log("FORMATO SRV:", uri && uri.startsWith("mongodb+srv://"));
console.log("LONGITUD:", uri ? uri.length : 0);
try {
  const datos = new URL(uri);
  console.log("USUARIO:", datos.username.length);
  console.log("PASSWORD:", datos.password.length);
  console.log("BASE DE DATOS:", datos.pathname);
  console.log("PARAMETROS:", datos.search);
} catch (error) {
  console.log("URI INVALIDA");
}

await mongoose.connect(uri);

    console.log("MongoDB conectado correctamente");

    app.listen(PORT, () => {
      console.log(`SneakHub funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar SneakHub:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
