const carrito = [];
let carritoEnStorage = JSON.parse(localStorage.getItem("carrito")) || [];
const productosEnStorage = JSON.parse(localStorage.getItem("productos")) || [];
const contenedorProductos = document.getElementById("contenedorProductos");
const loadingIcon = document.getElementById("loading");
let filtroCategoria = "todos";
let filtroPrecio = null;
const filtradoPorCategoria = document.getElementById("productosFiltrados");
const filtrarPorPrecio = document.getElementById("filtroPrecio");
const btnCarrito = document.getElementById("btnCarrito");
const carritoTable = document.getElementById("carritoTable");
const footCarrito = document.getElementById("totales");
let costoTotal = 0;

const traerDatosJson = async () => {
    try {
        const response = await fetch('/json/productos.json');
        const data = await response.json();
        if (!localStorage.getItem("productos")) {
            localStorage.setItem("productos", JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error al obtener los datos del servidor:', error);
        return []; // Devuelve un arreglo vacío en caso de error.
    }
};

// Función para mostrar el ícono de carga
const mostrarCargando = () => {
    contenedorProductos.innerHTML = "";
    loadingIcon.style.display = "block";
};

// Función para ocultar el ícono de carga
const ocultarCargando = () => {
    loadingIcon.style.display = "none";
};

// Creamos la funcion mostrarProductos
const mostrarProductos = (productos) => {
    contenedorProductos.innerHTML = "";
    
    productos.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("col-xl-4", "col-md-6", "col-sm-12");

        card.innerHTML = `
            <div class="card">
                <img src= "${producto.imagen}" class="card-img-top imgProductos" alt="${producto.nombre}">
                <div class="text-center">
                    <h2>${producto.nombre}</h2>
                    <p class="desc">${producto.descripcion}</p>
                    <b>$${producto.precio}</b><br>
                    <button class= "btn colorBoton" id="boton${producto.id}">Agregar</button>
                </div>
            </div>
        `

        contenedorProductos.appendChild(card);

        const boton = document.getElementById(`boton${producto.id}`);

        boton.addEventListener("click", () => {
            agregarAlCarrito(producto.id);
        });
    });
}

const simularCargaProductos = (productos) => {
    mostrarCargando();
    setTimeout(() => {
        mostrarProductos(productos);
        ocultarCargando();
    }, 600);
};

// Cargo los productos y los muestro cuando se carga la pagina
window.addEventListener("load", async () => {
    const productos = await traerDatosJson();
    mostrarProductos(productos);
});

filtradoPorCategoria.addEventListener("click", (e) => {
    filtroCategoria = e.target.getAttribute("data-filter");
    aplicarFiltros();
});

filtrarPorPrecio.addEventListener("click", (e) => {
    filtroPrecio = e.target.innerHTML;
    aplicarFiltros();
});

const aplicarFiltros = () => {
    let productosFiltrados = productosEnStorage;

    // Filtrar por categoría
    if (filtroCategoria !== 'todos') {
        productosFiltrados = productosFiltrados.filter((producto) =>
            producto.categoria === filtroCategoria.toLowerCase()
        );
    }

    // Filtrar por precio
    if (filtroPrecio) {
        if (filtroPrecio === "Menor a Mayor") {
            productosFiltrados = productosFiltrados.sort((a, b) => a.precio - b.precio);
        } else if (filtroPrecio === "Mayor a Menor") {
            productosFiltrados = productosFiltrados.sort((a, b) => b.precio - a.precio);
        }
    }

    simularCargaProductos(productosFiltrados);
};

const agregarAlCarrito = async (id) => {

    const productos = await traerDatosJson();

    const productoEnCarrito = carritoEnStorage.find(producto => producto.id === id);

    if (productoEnCarrito) {
        // Si el producto ya está en el carrito, simplemente aumenta la cantidad.
        productoEnCarrito.cantidad++;

    } else {
        // Si el producto no está en el carrito, agrégalo con cantidad 1.
        const productoSeleccionado = productos.find(producto => producto.id === id);
        carritoEnStorage.push(productoSeleccionado);
    }

    // Recalcula el precio total para todos los productos en el carrito.
    const total = carritoEnStorage.reduce((acc, producto) => {
        producto.precioTotal = producto.precio * producto.cantidad;
        return acc + producto.precioTotal
    }, 0);

    // Guarda los datos actualizados en sessionStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));

    // Actualiza el total en el carrito
    localStorage.setItem("total", total);

    // Libreria SweetAlert()
    swal("Producto agregado al carrito.", {
        icon: "success",
    });

    dibujarCarrito();
}

// Evento de boton carrito
btnCarrito.addEventListener("click", () => {
    if (carritoTable) {
        if (carritoTable.style.display === "block") {
            carritoTable.style.display = "none";
        } else {
            carritoTable.style.display = "block";
            dibujarCarrito();
        }
    }
});

// Dibujar el Carrito
const dibujarCarrito = () => {
    // Selecciona el elemento de la lista del carrito
    const listaCarrito = document.getElementById("items");

    // Limpia el contenido anterior del carrito
    listaCarrito.innerHTML = '';

    carritoEnStorage.forEach(productosEnStorage => {
        const { imagen, nombre, cantidad, precio, id } = productosEnStorage;
        // Crea una fila para el producto en el carrito
        const row = document.createElement("tr");
        row.className = "productoCarrito";
        row.innerHTML = `
            <td><img src="${imagen}" alt="${nombre}"/></td>
            <td>${nombre}</td>
            <td>${cantidad}</td>
            <td>$${precio}</td>
            <td>$${productosEnStorage.precioTotal}</td>
            <td>
                <button id="+${id}" class="btn btn-success">+</button>
                <button id="-${id}" class="btn btn-danger">-</button>
            </td>
        `;

        // Agrega la fila al carrito
        listaCarrito.appendChild(row);

        // Agrega eventos a los botones de aumento y disminución
        const btnAgregar = document.getElementById(`+${id}`);
        const btnRestar = document.getElementById(`-${id}`);

        btnAgregar.addEventListener("click", () => aumentarCantidad(id));
        btnRestar.addEventListener("click", () => restarCantidad(id));
    });

    dibujarFooter();
};

// Aumenta la cantidad del producto en el carrito
const aumentarCantidad = (id) => {
    const indexProductoCarrito = carritoEnStorage.findIndex((productosEnStorage) => productosEnStorage.id === id);

    if (indexProductoCarrito !== -1) {
        carritoEnStorage[indexProductoCarrito].cantidad++;
        carritoEnStorage[indexProductoCarrito].precioTotal = carritoEnStorage[indexProductoCarrito].cantidad * carritoEnStorage[indexProductoCarrito].precio;
    }

    // Guarda los datos actualizados en sessionStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
    dibujarCarrito();
}

// Disminuye la cantidad del producto en el carrito
const restarCantidad = (id) => {
    const indexProductoCarrito = carritoEnStorage.findIndex((productosEnStorage) => productosEnStorage.id === id);

    if (indexProductoCarrito !== -1) {
        if (carritoEnStorage[indexProductoCarrito].cantidad > 1) {
            carritoEnStorage[indexProductoCarrito].cantidad--;
            carritoEnStorage[indexProductoCarrito].precioTotal = carritoEnStorage[indexProductoCarrito].cantidad * carritoEnStorage[indexProductoCarrito].precio;
        } else {
            // Si la cantidad es 1 o menor, simplemente elimina el producto del carrito
            carritoEnStorage.splice(indexProductoCarrito, 1);
        }
    }

    // Guarda los datos actualizados en sessionStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
    dibujarCarrito();
}

// Genera el total a pagar 
const generarTotales = () => {
    costoTotal = carritoEnStorage.reduce((total, { precioTotal }) => total + precioTotal, 0)
    const cantidadTotal = carritoEnStorage.reduce((total, { cantidad }) => total + cantidad, 0)

    return {
        costoTotal: costoTotal,
        cantidadTotal: cantidadTotal
    }
}

// Dibujar Footer
const dibujarFooter = () => {
    if (carritoEnStorage.length > 0) {
        footCarrito.innerHTML = "";

        let footer = document.createElement("tr");

        footer.innerHTML = `
            <th>
                <b>Totales:</b>
            </th>
            <td></td>
            <td>${generarTotales().cantidadTotal}</td>
            <td></td>
            <td>$${generarTotales().costoTotal}</td>
            <td>
                <button id="btnFinalizarCompra" class="btn btn-success">Finalizar Compra</button>
            </td>
        `;

        footCarrito.append(footer);
    } else {
        footCarrito.innerHTML = "<h3>No hay producto en carrito</h3>";
    }
    const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", () => Comprar());
    }
};

// Finalizar la compra y vaciar el carrito
const Comprar = () => {
    if (carritoEnStorage.length > 0) {
        swal({
            title: "¿Desea continuar con la compra?",
            text: "Una vez realizada la compra, el carrito se vaciará.",
            icon: "warning",
            buttons: ["Cancelar", "Continuar"],
            dangerMode: true,
        }).then((item) => {
            if (item) {
                carritoEnStorage = [];
                localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
                dibujarCarrito();
                swal("Compra realizada con éxito.", {
                    icon: "success",
                });
            } else {
                swal("Compra cancelada.", {
                    icon: "info",
                });
            }
        });
    } else {
        swal("El carrito está vacío.", {
            icon: "info",
        });
    }
}