
/* =====================================================
   SNEAKHUB - FUNCIONES PRINCIPALES
   Buscador + carrito + cantidades + total + persistencia
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 SneakHub iniciado correctamente");

    // ==========================================
    // 1. ELEMENTOS DEL HTML
    // ==========================================

    const botonCarrito = document.getElementById("carrito");
    const contadorCarrito = document.getElementById("contador-carrito");
    const panelCarrito = document.getElementById("lista-carrito");
    const overlay = document.getElementById("overlay");
    const cerrarCarrito = document.getElementById("cerrar-carrito");

    const listaProductosCarrito = document.getElementById("productos-carrito");
    const mensajeCarritoVacio = document.getElementById("carrito-vacio");
    const totalTexto = document.getElementById("total");
    const botonVaciar = document.getElementById("vaciar-carrito");

    const buscador = document.getElementById("buscador-productos");
    const productos = document.querySelectorAll(".producto");
    const mensajeSinResultados = document.getElementById("sin-resultados");
    const cantidadProductos = document.getElementById("cantidad-productos");

    // ==========================================
    // 2. VERIFICAR QUE EXISTA EL HTML NECESARIO
    // ==========================================

    const elementosNecesarios = [
        botonCarrito,
        contadorCarrito,
        panelCarrito,
        overlay,
        cerrarCarrito,
        listaProductosCarrito,
        mensajeCarritoVacio,
        totalTexto,
        botonVaciar,
        buscador
    ];

    if (elementosNecesarios.some(elemento => !elemento)) {
        console.error("Error: falta un elemento del HTML de SneakHub.");
        return;
    }

    // ==========================================
    // 3. CONFIGURACIÓN DEL CARRITO
    // ==========================================

    let carrito = [];

    // Usamos una clave nueva para evitar recuperar
    // el contador antiguo que aparecía en 3.
    const CLAVE_CARRITO = "sneakHubCarritoV2";

    // Formato de moneda colombiana.
    const formatoMoneda = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });

    // ==========================================
    // 4. CARGAR CARRITO GUARDADO
    // ==========================================

    function cargarCarrito() {
        try {
            const datosGuardados = localStorage.getItem(CLAVE_CARRITO);

            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);

                if (Array.isArray(datos)) {
                    carrito = datos.filter(producto =>
                        producto &&
                        typeof producto.nombre === "string" &&
                        Number.isFinite(Number(producto.precio)) &&
                        Number(producto.precio) > 0 &&
                        Number.isInteger(Number(producto.cantidad)) &&
                        Number(producto.cantidad) > 0
                    );
                }
            }
        } catch (error) {
            console.error("No se pudo cargar el carrito:", error);
            carrito = [];
        }
    }

    // ==========================================
    // 5. GUARDAR CARRITO
    // ==========================================

    function guardarCarrito() {
        try {
            localStorage.setItem(
                CLAVE_CARRITO,
                JSON.stringify(carrito)
            );
        } catch (error) {
            console.error("No se pudo guardar el carrito:", error);
        }
    }

    // ==========================================
    // 6. ACTUALIZAR CONTADOR
    // ==========================================

    function actualizarContador() {
        const cantidadTotal = carrito.reduce(
            (acumulado, producto) => acumulado + producto.cantidad,
            0
        );

        contadorCarrito.textContent = cantidadTotal;
    }

    // ==========================================
    // 7. CALCULAR TOTAL
    // ==========================================

    function calcularTotal() {
        return carrito.reduce(
            (acumulado, producto) =>
                acumulado + producto.precio * producto.cantidad,
            0
        );
    }

    // ==========================================
    // 8. MOSTRAR LOS PRODUCTOS DEL CARRITO
    // ==========================================

    function mostrarCarrito() {

        listaProductosCarrito.replaceChildren();

        if (carrito.length === 0) {
            mensajeCarritoVacio.hidden = false;
        } else {
            mensajeCarritoVacio.hidden = true;
        }

        carrito.forEach((producto, indice) => {

            const item = document.createElement("li");
            item.className = "item-carrito";

            const informacion = document.createElement("div");
            informacion.className = "producto-carrito-info";

            const nombre = document.createElement("span");
            nombre.className = "nombre-producto-carrito";
            nombre.textContent = producto.nombre;

            const precio = document.createElement("span");
            precio.className = "precio-producto-carrito";
            precio.textContent =
                formatoMoneda.format(producto.precio * producto.cantidad);

            informacion.append(nombre, precio);

            const controles = document.createElement("div");
            controles.className = "controles-cantidad";

            const disminuir = document.createElement("button");
            disminuir.type = "button";
            disminuir.textContent = "−";
            disminuir.setAttribute("aria-label", "Disminuir cantidad");
            disminuir.dataset.accion = "disminuir";
            disminuir.dataset.indice = indice;

            const cantidad = document.createElement("span");
            cantidad.className = "cantidad-producto";
            cantidad.textContent = producto.cantidad;

            const aumentar = document.createElement("button");
            aumentar.type = "button";
            aumentar.textContent = "+";
            aumentar.setAttribute("aria-label", "Aumentar cantidad");
            aumentar.dataset.accion = "aumentar";
            aumentar.dataset.indice = indice;

            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.textContent = "×";
            eliminar.className = "eliminar";
            eliminar.setAttribute("aria-label", "Eliminar producto");
            eliminar.dataset.accion = "eliminar";
            eliminar.dataset.indice = indice;

            controles.append(
                disminuir,
                cantidad,
                aumentar,
                eliminar
            );

            item.append(informacion, controles);
            listaProductosCarrito.appendChild(item);
        });

        // Actualizar el total y el contador.
        totalTexto.textContent = formatoMoneda.format(calcularTotal());
        actualizarContador();

        // Desactivar el botón de vaciar cuando no hay productos.
        botonVaciar.disabled = carrito.length === 0;

        // Guardar los cambios.
        guardarCarrito();
    }

    // ==========================================
    // 9. AGREGAR PRODUCTOS
    // ==========================================

    function agregarProducto(nombre, precio) {

        const productoExistente = carrito.find(
            producto => producto.nombre === nombre
        );

        if (productoExistente) {

            productoExistente.cantidad++;

        } else {

            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });

        }

        mostrarCarrito();
        abrirCarrito();

    }

    // Escuchar los botones de agregar.
    document.addEventListener("click", (evento) => {

        const boton = evento.target.closest(".comprar");

        if (!boton) return;

        const nombre = boton.dataset.producto;
        const precio = Number(boton.dataset.precio);

        if (!nombre || !Number.isFinite(precio) || precio <= 0) {
            console.error("Producto o precio incorrecto.");
            return;
        }

        agregarProducto(nombre, precio);

    });

    // ==========================================
    // 10. CONTROLES DE CANTIDAD Y ELIMINACIÓN
    // ==========================================

    listaProductosCarrito.addEventListener("click", (evento) => {

        const boton = evento.target.closest("button[data-accion]");

        if (!boton) return;

        const indice = Number(boton.dataset.indice);

        if (
            !Number.isInteger(indice) ||
            indice < 0 ||
            indice >= carrito.length
        ) {
            return;
        }

        const accion = boton.dataset.accion;

        if (accion === "aumentar") {
            carrito[indice].cantidad++;
        }

        if (accion === "disminuir") {
            carrito[indice].cantidad--;

            if (carrito[indice].cantidad <= 0) {
                carrito.splice(indice, 1);
            }
        }

        if (accion === "eliminar") {
            carrito.splice(indice, 1);
        }

        mostrarCarrito();

    });

    // ==========================================
    // 11. VACIAR CARRITO
    // ==========================================

    botonVaciar.addEventListener("click", () => {

        carrito = [];

        mostrarCarrito();

    });

    // ==========================================
    // 12. ABRIR CARRITO
    // ==========================================

    function abrirCarrito() {

        panelCarrito.classList.add("abierto");

        panelCarrito.setAttribute("aria-hidden", "false");
        panelCarrito.inert = false;

        overlay.hidden = false;

        botonCarrito.setAttribute("aria-expanded", "true");

        document.body.style.overflow = "hidden";

    }

    // ==========================================
    // 13. CERRAR CARRITO
    // ==========================================

    function cerrarPanelCarrito() {

        panelCarrito.classList.remove("abierto");

        panelCarrito.setAttribute("aria-hidden", "true");
        panelCarrito.inert = true;

        overlay.hidden = true;

        botonCarrito.setAttribute("aria-expanded", "false");

        document.body.style.overflow = "";

    }

    botonCarrito.addEventListener("click", abrirCarrito);

    cerrarCarrito.addEventListener("click", cerrarPanelCarrito);

    overlay.addEventListener("click", cerrarPanelCarrito);

    // Cerrar también con la tecla Escape.
    document.addEventListener("keydown", (evento) => {

        if (evento.key === "Escape") {
            cerrarPanelCarrito();
        }

    });

    // ==========================================
    // 14. BUSCADOR DE SNEAKERS
    // ==========================================

    buscador.addEventListener("input", () => {

        const busqueda = buscador.value
            .trim()
            .toLowerCase();

        let resultados = 0;

        productos.forEach(producto => {

            const nombre = producto.textContent.toLowerCase();

            const coincide = nombre.includes(busqueda);

            producto.hidden = !coincide;

            if (coincide) {
                resultados++;
            }

        });

        mensajeSinResultados.hidden = resultados !== 0;

        if (cantidadProductos) {
            cantidadProductos.textContent =
                String(resultados).padStart(2, "0") + " MODELOS";
        }

    });

    // ==========================================
    // 15. INICIAR LA TIENDA
    // ==========================================

    cargarCarrito();

    // El carrito empieza cerrado.
    cerrarPanelCarrito();

    // Dibujar los datos iniciales.
    mostrarCarrito();

    console.log("✅ Catálogo y carrito listos.");

});
