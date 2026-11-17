
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
    console.log("MONGODB_URI existe:", !!process.env.MONGODB_URI);
console.log("MONGODB_URI empieza bien:", process.env.MONGODB_URI?.startsWith("mongodb+srv://"));

await mongoose.connect(process.env.MONGODB_URI);

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
