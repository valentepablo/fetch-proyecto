const btnCarrito = document.getElementById('btn-carrito');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const displayCarrito = document.getElementById('carrito');

class Libro {
  constructor(obj) {
    this.nombre = obj.nombre;
    this.id = obj.id;
    this.cantidad = obj.cantidad;
    this.precio = 50;
    this.precioIva = this.agregarIva();
  }

  agregarIva() {
    return this.precio + (this.precio * 21) / 100;
  }
}

const guardarProductosStorage = () => {
  localStorage.setItem('carrito', JSON.stringify(carrito));
};

const cargarProductosStorage = () => {
  return JSON.parse(localStorage.getItem('carrito')) || [];
};

const carrito = cargarProductosStorage();

const generarHtmlCatalogo = async () => {
  const inputBusqueda = document.querySelector('.filtros [name="busqueda"]');
  inputBusqueda.addEventListener('keyup', async (e) => {
    await filtrarLibros(e);
  });

  let catalogo = document.querySelector('#catalogo');

  let response = await fetch('./db.json');

  const libros = await response.json();

  libros.forEach((libro) => {
    let elemento = document.createElement('div');
    elemento.id = `card-${libro.id}`;
    elemento.className = 'card';
    elemento.innerHTML = `
      <img class="card__img" src="images/${libro.imagen}">
      <div class="card__info">
        <p class="card__nombre">${libro.nombre}</p>
        <p class="card__precio">$${libro.precio}</p>
      </div>
      <button class="card__btn">
        <p class="card__btn-text">Agregar</p>
        <span class="material-icons">
          add_shopping_cart
        </span>
      </button>
      `;

    const img = elemento.querySelector('.card__img');

    img.addEventListener('mouseenter', (e) => {
      let infoCard = document.createElement('div');
      infoCard.classList.add('info-card');
      infoCard.innerHTML = `
        <h3>${libro.nombre}</h3>
        <p class="autor">Autor: <b>${libro.autor}</b></p>
        <p class="publicacion">Fecha de publicacion: <b>${libro.publicacion}</b></p>
        <p class="descripcion">${libro.descripcion}</p>
        `;
      document.body.appendChild(infoCard);

      console.log('mouseenter');

      setTimeout(() => {
        infoCard.style.opacity = 1;
      }, 700);
    });

    img.addEventListener('mousemove', (e) => {
      console.log('mousemove');
      let infoCard = document.querySelector('.info-card');
      let rect = infoCard.getBoundingClientRect();

      if (e.clientX + rect.width >= window.innerWidth - 30) {
        infoCard.style.left = `${e.clientX - rect.width - 5}px`;
      } else {
        infoCard.style.left = `${e.clientX + 10}px`;
      }

      if (e.clientY + rect.height >= window.innerHeight - 10) {
        if (rect.top <= 0) {
          infoCard.style.top = '0';
        } else {
          infoCard.style.top = `${e.clientY - rect.height}px`;
        }
      } else {
        infoCard.style.top = `${e.clientY + 10}px`;
      }
    });

    img.addEventListener('mouseleave', (e) => {
      let infoCard = document.querySelector('.info-card');

      infoCard.remove();
    });

    catalogo.appendChild(elemento);
  });

  cargarLibrosCarrito();
};

const filtrarLibros = async (e) => {
  let catalogo = document.querySelector('#catalogo');
  let value = e.target.value;

  const response = await fetch('./db.json');
  const libros = await response.json();

  const librosFiltrados = libros.filter((libro) =>
    libro.nombre.toLowerCase().includes(value.toLowerCase())
  );

  catalogo.innerHTML = '';

  if (librosFiltrados.length === 0) {
    catalogo.innerHTML = `<h2>No se encontraron productos con la busqueda: "${value}"`;
  } else {
    librosFiltrados.forEach((libro) => {
      let elemento = document.createElement('div');
      elemento.id = `card-${libro.id}`;
      elemento.className = 'card';
      elemento.innerHTML = `
        <img class="card__img" src="images/${libro.imagen}">
        <div class="card__info">
          <p class="card__nombre">${libro.nombre}</p>
          <p class="card__precio">$${libro.precio}</p>
        </div>
        <button class="card__btn">
          <span class="material-icons">
            add_shopping_cart
          </span>
          
        </button>`;

      const img = elemento.querySelector('.card__img');

      img.addEventListener('mouseenter', (e) => {
        let infoCard = document.createElement('div');
        infoCard.classList.add('info-card');
        infoCard.innerHTML = `
        <h3>${libro.nombre}</h3>
        <p class="autor">Autor: <b>${libro.autor}</b></p>
        <p class="publicacion">Fecha de publicacion: <b>${libro.publicacion}</b></p>
        <p class="descripcion">${libro.descripcion}</p>
        `;
        document.body.appendChild(infoCard);

        img.addEventListener('mousemove', (e) => {
          let rect = infoCard.getBoundingClientRect();

          infoCard.style.left = `${e.clientX + 10}px`;

          if (e.clientY + rect.height >= window.innerHeight - 10) {
            infoCard.style.top = `${e.clientY - rect.height}px`;
          } else {
            infoCard.style.top = `${e.clientY + 10}px`;
          }
        });

        setTimeout(() => {
          infoCard.style.opacity = 1;
        }, 700);

        img.addEventListener('mouseleave', (e) => {
          infoCard.remove();
        });
      });

      catalogo.appendChild(elemento);
    });
    cargarLibrosCarrito();
  }
};

const buscarLibro = async (id) => {
  const response = await fetch('./db.json');
  const libros = await response.json();

  return libros.find((libro) => libro.id === id);
};

const agregarLibro = (libro) => {
  if (carrito.some((item) => item.id === libro.id)) {
    let duplicado = carrito.find((item) => item.id === libro.id);
    duplicado.cantidad++;
  } else {
    libro.cantidad = 1;
    carrito.push(libro);
  }
  notificacionAgregado(libro);
};

const cargarLibrosCarrito = async () => {
  let cardBtns = document.querySelectorAll('.card__btn');

  cardBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      let itemId = parseInt(e.target.closest('.card').id.slice(5));

      let book = await buscarLibro(itemId);
      agregarLibro(book);
      guardarProductosStorage();
      generarHtmlCarrito();
    });
  });
};

const eliminarLibro = (id) => {
  if (carrito.some((el) => el.id === id)) {
    let eliminado = carrito.find((el) => el.id === id);

    if (eliminado.cantidad === 1) {
      notificacionEliminado(eliminado);
      let posicion = carrito.findIndex((libro) => libro.id === id);
      carrito.splice(posicion, 1);
    } else {
      notificacionEliminado(eliminado);
      eliminado.cantidad--;
    }
  }
};

const eliminarLibrosCarrito = () => {
  let deleteBtns = document.querySelectorAll('.libro__eliminar');

  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      let itemId = parseInt(e.target.closest('.product-container').id.slice(9));

      eliminarLibro(itemId);
      guardarProductosStorage();
      generarHtmlCarrito();
    });
  });
  actualizarCantidadCarrito();
};

const actualizarCantidadCarrito = () => {
  let carritoCantidad = document.querySelector('#carrito-cantidad');

  const productosCarrito = cargarProductosStorage();
  let cantidadProductos = 0;

  productosCarrito.forEach((producto) => {
    cantidadProductos += producto.cantidad;
  });

  carritoCantidad.innerHTML = cantidadProductos;
};

const notificacionAgregado = (producto) => {
  Toastify({
    text: `Se agregó al carrito: "<b>${producto.nombre}</b>"`,
    duration: 2000,
    gravity: 'bottom',
    position: 'left',
    stopOnFocus: true,
    escapeMarkup: false,
    className: 'notificacion-agregado',
    style: {
      background: '#444444',
      border: '1px solid #555555',
      borderRadius: '3px',
      fontSize: '14px',
      maxWidth: '100%',
    },
  }).showToast();
};

const notificacionEliminado = (producto) => {
  Toastify({
    text: `"<b>${producto.nombre}</b>" ha sido eliminado!`,
    duration: 2000,
    gravity: 'bottom',
    position: 'left',
    stopOnFocus: true,
    escapeMarkup: false,
    style: {
      background: '#a64452',
      border: '1px solid #444444',
      borderRadius: '3px',
      fontSize: '14px',
    },
  }).showToast();
};

const vaciarCarrito = () => {
  if (carrito.length === 0) {
    return;
  }
  carrito.splice(0);
  guardarProductosStorage();
  generarHtmlCarrito();

  Toastify({
    text: 'Se eliminaron todos los productos del carrito!',
    duration: 2000,
    gravity: 'bottom',
    position: 'left',
    stopOnFocus: true,
    escapeMarkup: false,
    style: {
      background: '#a64452',
      border: '1px solid #444444',
      borderRadius: '3px',
      fontSize: '14px',
    },
  }).showToast();
};

const generarHtmlCarrito = () => {
  let contenedorCarrito = document.querySelector('.contenedor-carrito');
  let totalCarrito = document.querySelector('.total-carrito');
  let vaciarCarritoBtn = document.querySelector('#vaciar-carrito');

  vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

  const productosCarrito = cargarProductosStorage();

  if (productosCarrito.length === 0) {
    contenedorCarrito.innerHTML = `
    <div class="product-container">
      <h4>No hay productos en tu carrito.</h4>
    </div>
    `;
  } else {
    contenedorCarrito.innerHTML = '';
    productosCarrito.forEach((producto) => {
      let elemento = document.createElement('div');
      elemento.id = `producto-${producto.id}`;
      elemento.className = 'product-container';
      elemento.innerHTML = `
          <img class="libro__img" src="images/${producto.imagen}">
          <div class="libro__info">
            <p class="libro__nombre">${producto.nombre}</p>
            <p class="libro__precio">$${producto.precio}</p>
            <p class="libro__cantidad">Cantidad: ${producto.cantidad}</p>
          </div>
          <span class="material-icons md-16 libro__eliminar">close</span>
        `;
      contenedorCarrito.appendChild(elemento);
    });
  }
  let total = 0;
  let totalIva = 0;

  for (const item of productosCarrito) {
    let libro = new Libro(item);
    libro.agregarIva();
    totalIva += libro.precioIva * libro.cantidad;
    total += libro.precio * libro.cantidad;
  }

  totalCarrito.innerHTML = `
  <span>Precio: $${total.toFixed(2)}</span>
  <span>Impuesto IVA: $${(totalIva - total).toFixed(2)}</span>
  <p>Total a pagar: $${totalIva.toFixed(2)}</p>
  `;

  eliminarLibrosCarrito();
};

generarHtmlCatalogo();
generarHtmlCarrito();
cargarLibrosCarrito();

btnCarrito.addEventListener('click', () => {
  displayCarrito.classList.add('active');
});

cerrarCarrito.addEventListener('click', () => {
  displayCarrito.classList.remove('active');
});
