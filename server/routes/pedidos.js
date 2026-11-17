
const express = require("express");
const jwt = require("jsonwebtoken");
const Pedido = require("../models/pedido");

const router = express.Router();

// REGISTRAR UN PEDIDO
router.post("/", async (req, res) => {
  try {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión para realizar el pedido."
      });
    }

    const token = autorizacion.split(" ")[1];
    const datosToken = jwt.verify(token, process.env.JWT_SECRET);

    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "El pedido no tiene productos."
      });
    }

    const productosValidados = productos.map((producto) => {
      const id = Number(producto.id);
      const precio = Number(producto.precio);
      const cantidad = Number(producto.cantidad);

      if (
        !Number.isFinite(id) ||
        !producto.nombre ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !Number.isInteger(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error("Uno de los productos no tiene datos válidos.");
      }

      return {
        id,
        nombre: String(producto.nombre),
        precio,
        cantidad
      };
    });

    const total = productosValidados.reduce(
      (suma, producto) =>
        suma + producto.precio * producto.cantidad,
      0
    );

    const nuevoPedido = await Pedido.create({
      usuario: datosToken.id,
      productos: productosValidados,
      total
    });

    return res.status(201).json({
      mensaje: "¡Pedido registrado correctamente!",
      pedido: nuevoPedido._id,
      total: nuevoPedido.total,
      estado: nuevoPedido.estado
    });
  } catch (error) {
    console.error("Error al registrar pedido:", error.message);

    return res.status(400).json({
      mensaje: "No se pudo registrar el pedido. Verifica los datos e inténtalo nuevamente."
    });
  }
});

module.exports = router;
