
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

const router = express.Router();

// REGISTRO
router.post("/registro", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await Usuario.findOne({
      correo: correoNormalizado
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado"
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 12);

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      password: passwordEncriptada
    });

    res.status(201).json({
      mensaje: "Cuenta creada correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo
      }
    });
  } catch (error) {
    console.error("Error en registro:", error.message);

    res.status(500).json({
      mensaje: "Error al registrar el usuario"
    });
  }
});

// INICIO DE SESIÓN
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: "Correo y contraseña son obligatorios"
      });
    }

    const usuario = await Usuario.findOne({
      correo: correo.trim().toLowerCase()
    }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Inicio de sesión correcto",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error("Error en login:", error.message);

    res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
});

module.exports = router;
