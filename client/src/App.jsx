
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE_URL}/api/usuarios`;
const PEDIDOS_URL = `${API_BASE_URL}/api/pedidos`;

const productos = [
  { id: 1, nombre: "Jordan 1 Retro", precio: 699900, imagen: "/img/jordan1.jpg", categoria: "Jordan", etiqueta: "MÁS VENDIDO" },
  { id: 2, nombre: "Nike Air Force 1", precio: 549900, imagen: "/img/airforce1.jpg", categoria: "Nike", etiqueta: "CLÁSICO" },
  { id: 3, nombre: "Nike Air Max 90", precio: 599900, imagen: "/img/airmax90.jpg", categoria: "Nike", etiqueta: "URBAN STYLE" },
  { id: 4, nombre: "Adidas Campus 00s", precio: 479900, imagen: "/img/campus00.jpg", categoria: "Adidas", etiqueta: "TENDENCIA" },
  { id: 5, nombre: "Jordan 4", precio: 899900, imagen: "/img/jordan4.jpg", categoria: "Jordan", etiqueta: "PREMIUM" },
  { id: 6, nombre: "Nike Dunk Low", precio: 499900, imagen: "/img/nikedunk.jpg", categoria: "Nike", etiqueta: "FAVORITO" },
  { id: 7, nombre: "New Balance 550", precio: 579900, imagen: "/img/newbalance550.jpg", categoria: "New Balance", etiqueta: "EXCLUSIVO" },
  { id: 8, nombre: "Adidas Forum", precio: 529900, imagen: "/img/adidasforum.jpg", categoria: "Adidas", etiqueta: "STREETWEAR" },
  { id: 9, nombre: "Adidas Superstar", precio: 399900, imagen: "/img/superstar.jpg", categoria: "Adidas", etiqueta: "CLÁSICO" },
];

function formatoPrecio(precio) {
  return Number(precio || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function App() {
  // CARGAR EL CARRITO GUARDADO
  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem("sneakhub_carrito");
      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch (error) {
      return [];
    }
  });

  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [modalAuth, setModalAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeAuth, setMensajeAuth] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // GUARDAR EL CARRITO CADA VEZ QUE CAMBIE
  useEffect(() => {
    localStorage.setItem("sneakhub_carrito", JSON.stringify(carrito));
  }, [carrito]);

  // CONTADOR DE PRODUCTOS
  const cantidadTotal = useMemo(() => {
    return carrito.reduce(
      (total, producto) =>
        total + (Number(producto.cantidad) || 0),
      0
    );
  }, [carrito]);

  // TOTAL DE LA COMPRA
  const totalCompra = useMemo(() => {
    return carrito.reduce(
      (total, producto) =>
        total +
        (Number(producto.precio) || 0) *
        (Number(producto.cantidad) || 0),
      0
    );
  }, [carrito]);

  // BUSCADOR
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda]);

  // AGREGAR PRODUCTOS AL CARRITO
  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      const existe = actual.find(
        (item) => Number(item.id) === Number(producto.id)
      );

      if (existe) {
        return actual.map((item) =>
          Number(item.id) === Number(producto.id)
            ? {
                ...item,
                cantidad: (Number(item.cantidad) || 0) + 1,
              }
            : item
        );
      }

      return [
        ...actual,
        {
          ...producto,
          precio: Number(producto.precio),
          cantidad: 1,
        },
      ];
    });

    setCarritoAbierto(true);
  }

  // AUMENTAR O DISMINUIR CANTIDAD
  function cambiarCantidad(id, cambio) {
    setCarrito((actual) =>
      actual
        .map((producto) =>
          Number(producto.id) === Number(id)
            ? {
                ...producto,
                cantidad:
                  (Number(producto.cantidad) || 0) + cambio,
              }
            : producto
        )
        .filter((producto) => producto.cantidad > 0)
    );
  }

  // ELIMINAR PRODUCTO
  function eliminarProducto(id) {
    setCarrito((actual) =>
      actual.filter(
        (producto) => Number(producto.id) !== Number(id)
      )
    );
  }

  // VACIAR CARRITO
  function vaciarCarrito() {
    setCarrito([]);
    setCarritoAbierto(false);
  }

  // ABRIR LOGIN O REGISTRO
  function abrirAuth(modo = "login") {
    setModoAuth(modo);
    setMensajeAuth("");
    setTipoMensaje("");
    setModalAuth(true);
  }

  // CERRAR LOGIN O REGISTRO
  function cerrarAuth() {
    if (cargando) return;

    setModalAuth(false);
    setMensajeAuth("");
    setTipoMensaje("");
    setPassword("");
  }

  // REGISTRO E INICIO DE SESIÓN
  async function enviarFormulario(evento) {
    evento.preventDefault();

    setMensajeAuth("");
    setTipoMensaje("");

    if (modoAuth === "registro" && password.length < 8) {
      setMensajeAuth("La contraseña debe tener mínimo 8 caracteres.");
      setTipoMensaje("error");
      return;
    }

    setCargando(true);

    try {
      const ruta =
        modoAuth === "registro" ? "/registro" : "/login";

      const datos =
        modoAuth === "registro"
          ? { nombre, correo, password }
          : { correo, password };

      const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
          "No fue posible completar la solicitud."
        );
      }

      if (modoAuth === "registro") {
        setMensajeAuth(
          "¡Cuenta creada correctamente! Ahora puedes iniciar sesión."
        );
        setTipoMensaje("exito");
        setModoAuth("login");
        setNombre("");
        setPassword("");
      } else {
        sessionStorage.setItem(
          "sneakhub_token",
          resultado.token
        );

        setUsuario(resultado.usuario);

        setMensajeAuth(
          `¡Bienvenido a SneakHub, ${resultado.usuario.nombre}!`
        );

        setTipoMensaje("exito");
        setPassword("");

        setTimeout(() => {
          setModalAuth(false);
          setMensajeAuth("");
          setTipoMensaje("");
        }, 1200);
      }
    } catch (error) {
      setMensajeAuth(
        error.message ||
        "No se pudo conectar con el servidor."
      );
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  // CERRAR SESIÓN
  function cerrarSesion() {
    sessionStorage.removeItem("sneakhub_token");
    setUsuario(null);
    setMensajeAuth("");
    setTipoMensaje("");
    alert("Has cerrado sesión correctamente.");
  }

  // FINALIZAR COMPRA Y GUARDAR PEDIDO EN MONGODB
  async function finalizarCompra() {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!usuario) {
      setCarritoAbierto(false);
      abrirAuth("login");
      setMensajeAuth(
        "Inicia sesión para continuar con tu compra."
      );
      setTipoMensaje("info");
      return;
    }

    try {
      const token = sessionStorage.getItem("sneakhub_token");

      if (!token) {
        alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
        cerrarSesion();
        return;
      }

      const respuesta = await fetch(PEDIDOS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productos: carrito,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(
          resultado.mensaje ||
          "No se pudo registrar el pedido."
        );
        return;
      }

      alert(
        `¡Pedido registrado correctamente!\nNúmero: ${resultado.pedido}\nTotal: ${formatoPrecio(resultado.total)}`
      );

      vaciarCarrito();
    } catch (error) {
      console.error("Error al finalizar compra:", error);
      alert(
        "No se pudo conectar con el servidor. Inténtalo nuevamente."
      );
    }
  }

  return (
    <div className="app">
      <header className="encabezado">
        <a href="#inicio" className="logo">
          SNEAK<span>HUB</span>.
        </a>

        <nav className="navegacion">
          <a href="#inicio">Inicio</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="acciones-header">
          {usuario ? (
            <button
              className="boton-login"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              className="boton-login"
              onClick={() => abrirAuth("login")}
            >
              Iniciar sesión
            </button>
          )}

          <button
            key={`carrito-${cantidadTotal}`}
            type="button"
            className="boton-carrito"
            onClick={() => setCarritoAbierto(true)}
          >
            🛒 Carrito (<span>{cantidadTotal}</span>)
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-contenido">
            <p className="hero-etiqueta">
              TU ESTILO, TUS REGLAS
            </p>

            <h1>
              ENCUENTRA TU
              <br />
              PRÓXIMO PAR
              <br />
              <span>FAVORITO.</span>
            </h1>

            <p className="hero-descripcion">
              Descubre los mejores sneakers de Nike, Jordan y Adidas.
              Encuentra tu estilo y lleva tu outfit al siguiente nivel.
            </p>

            <a href="#catalogo" className="boton-principal">
              EXPLORAR CATÁLOGO →
            </a>
          </div>
        </section>

        <section className="beneficios">
          <div>
            <span>🚚</span>
            <div>
              <h3>Envíos nacionales</h3>
              <p>Compra desde cualquier lugar</p>
            </div>
          </div>

          <div>
            <span>👟</span>
            <div>
              <h3>Estilo urbano</h3>
              <p>Modelos para todos los gustos</p>
            </div>
          </div>

          <div>
            <span>🔒</span>
            <div>
              <h3>Compra segura</h3>
              <p>Tu experiencia es importante</p>
            </div>
          </div>
        </section>

        <section className="catalogo" id="catalogo">
          <div className="titulo-seccion">
            <p>COLECCIÓN SNEAKHUB</p>
            <h2>DESCUBRE LOS SNEAKERS</h2>
            <span>
              Encuentra el modelo perfecto para tu estilo.
            </span>
          </div>

          <div className="buscador-contenedor">
            <input
              type="text"
              placeholder="Buscar sneakers..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
            />
            <span>⌕</span>
          </div>

          <div className="productos-grid">
            {productosFiltrados.map((producto) => (
              <article className="producto" key={producto.id}>
                <div className="producto-imagen">
                  <span className="etiqueta-producto">
                    {producto.etiqueta}
                  </span>

                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                  />
                </div>

                <div className="producto-info">
                  <span className="categoria-producto">
                    {producto.categoria}
                  </span>

                  <h3>{producto.nombre}</h3>

                  <p className="precio">
                    {formatoPrecio(producto.precio)}
                  </p>

                  <button
                    className="boton-comprar"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    AGREGAR AL CARRITO +
                  </button>
                </div>
              </article>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <p className="sin-resultados">
              No encontramos sneakers con ese nombre.
            </p>
          )}
        </section>

        <section className="ofertas" id="ofertas">
          <p>NO TE QUEDES SIN EL TUYO</p>
          <h2>EL ESTILO NO ESPERA.</h2>
          <a href="#catalogo">VER COLECCIÓN →</a>
        </section>

        <section className="contacto" id="contacto">
          <h2>¿NECESITAS AYUDA?</h2>
          <p>
            En SneakHub queremos ayudarte a encontrar tus sneakers favoritos.
          </p>
          <p>Contacto: contacto@sneakhub.com</p>
        </section>
      </main>

      <footer className="footer">
        <a href="#inicio" className="logo">
          SNEAK<span>HUB</span>.
        </a>
        <p>© 2026 SneakHub. Todos los derechos reservados.</p>
        <p>Tu estilo comienza aquí. 👟</p>
      </footer>

      {/* VENTANA DE INICIO DE SESIÓN Y REGISTRO */}
      {modalAuth && (
        <div
          className="auth-overlay"
          onClick={cerrarAuth}
        >
          <section
            className="auth-panel"
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              className="auth-cerrar"
              onClick={cerrarAuth}
              disabled={cargando}
              aria-label="Cerrar ventana"
            >
              ✕
            </button>

            <div className="auth-logo">
              SNEAK<span>HUB</span>.
            </div>

            <p className="auth-etiqueta">
              TU ESTILO COMIENZA AQUÍ
            </p>

            <h2>
              {modoAuth === "login"
                ? "Inicia sesión"
                : "Crea tu cuenta"}
            </h2>

            <p className="auth-descripcion">
              {modoAuth === "login"
                ? "Ingresa a tu cuenta para continuar."
                : "Regístrate para formar parte de SneakHub."}
            </p>

            <form onSubmit={enviarFormulario}>
              {modoAuth === "registro" && (
                <label className="auth-campo">
                  Nombre completo
                  <input
                    type="text"
                    placeholder="Escribe tu nombre"
                    value={nombre}
                    onChange={(evento) =>
                      setNombre(evento.target.value)
                    }
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label className="auth-campo">
                Correo electrónico
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(evento) =>
                    setCorreo(evento.target.value)
                  }
                  required
                  autoComplete="email"
                />
              </label>

              <label className="auth-campo">
                Contraseña
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(evento) =>
                    setPassword(evento.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete={
                    modoAuth === "login"
                      ? "current-password"
                      : "new-password"
                  }
                />
              </label>

              {mensajeAuth && (
                <p className={`auth-mensaje ${tipoMensaje}`}>
                  {mensajeAuth}
                </p>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={cargando}
              >
                {cargando
                  ? "PROCESANDO..."
                  : modoAuth === "login"
                    ? "INICIAR SESIÓN"
                    : "CREAR CUENTA"}
              </button>
            </form>

            <div className="auth-cambio">
              {modoAuth === "login" ? (
                <p>
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModoAuth("registro");
                      setMensajeAuth("");
                      setTipoMensaje("");
                    }}
                  >
                    Regístrate
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModoAuth("login");
                      setMensajeAuth("");
                      setTipoMensaje("");
                    }}
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* CARRITO DE COMPRAS */}
      {carritoAbierto && (
        <div
          className="overlay"
          onClick={() => setCarritoAbierto(false)}
        >
          <aside
            className="panel-carrito"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="carrito-encabezado">
              <h2>🛒 Mi carrito ({cantidadTotal})</h2>

              <button
                className="cerrar-carrito"
                onClick={() => setCarritoAbierto(false)}
              >
                ✕
              </button>
            </div>

            {carrito.length === 0 ? (
              <p className="carrito-vacio">
                Tu carrito está vacío. ¡Agrega tus sneakers favoritos!
              </p>
            ) : (
              <div className="lista-carrito">
                {carrito.map((producto) => (
                  <div
                    className="item-carrito"
                    key={producto.id}
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                    />

                    <div className="item-detalles">
                      <h3>{producto.nombre}</h3>

                      <p>{formatoPrecio(producto.precio)}</p>

                      <div className="cantidad-controles">
                        <button
                          onClick={() =>
                            cambiarCantidad(producto.id, -1)
                          }
                        >
                          −
                        </button>

                        <span>{producto.cantidad}</span>

                        <button
                          onClick={() =>
                            cambiarCantidad(producto.id, 1)
                          }
                        >
                          +
                        </button>

                        <button
                          className="eliminar-item"
                          onClick={() =>
                            eliminarProducto(producto.id)
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="carrito-pie">
              <div className="total-carrito">
                <span>Total:</span>
                <strong>{formatoPrecio(totalCompra)}</strong>
              </div>

              <button
                className="boton-finalizar"
                onClick={finalizarCompra}
                disabled={carrito.length === 0}
              >
                CONTINUAR COMPRA
              </button>

              <button
                className="boton-vaciar"
                onClick={vaciarCarrito}
                disabled={carrito.length === 0}
              >
                VACIAR CARRITO
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
