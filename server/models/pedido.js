
const mongoose = require("mongoose");

const pedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },

    productos: [
      {
        id: Number,
        nombre: String,
        precio: Number,
        cantidad: Number
      }
    ],

    total: {
      type: Number,
      required: true
    },

    estado: {
      type: String,
      default: "Pendiente"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Pedido", pedidoSchema);
