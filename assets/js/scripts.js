// =========================================================================
// LISTA DE PRODUCTOS / DATOS (Administrables localmente o mapeados desde Django)
// =========================================================================

let productosDisponibles = [];

//cargas los "Productos" desde la BD
async function cargarProductosDesdeBackend() {
    try {
        console.log("Intentando conectar con Django...");
        const response = await fetch('http://127.0.0.1:8000/api/aventuras/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        productosDisponibles = await response.json();
        console.log("Datos recibidos de Django:", productosDisponibles);
        
        renderProducts();
    } catch (error) {
        console.error("Fallo al conectar con la API:", error);
    }
}

function renderProducts() {
    const grid = document.getElementById('catalogo-grid');
    if (!grid) {
        console.error("No se encontró el elemento #catalogo-grid en el HTML.");
        return;
    }
    
    // Limpiar el contenedor usando JavaScript puro
    grid.innerHTML = '';
    
    productosDisponibles.forEach(adv => {
        let dificultad = adv.dificultad || 'Intermedio'; 
        let badgeClass = dificultad === 'Avanzado' ? 'bg-danger' : dificultad === 'Intermedio' ? 'bg-warning text-dark' : 'bg-success';
        let imagen = adv.imagen_url || adv.img || '';
        let ubicacion = adv.ubicacion || 'Chile';

        // Crear la tarjeta como un elemento del DOM
        const col = document.createElement('div');
        col.className = "col-md-6 col-lg-3 mb-4";
        
        col.innerHTML = `
            <div class="card card-adventure h-100 shadow-sm">
                <div class="card-img-container">
                    <img src="${imagen}" alt="${adv.titulo}" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <span class="badge ${badgeClass} badge-difficulty">${dificultad}</span>
                </div>
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title fw-bold">${adv.titulo}</h5>
                        <p class="text-muted small mb-2"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${ubicacion}</p>
                    </div>
                    <div class="d-flex align-items-center justify-content-between mt-3">
                        <span class="price-tag fw-bold">$${Number(adv.precio).toLocaleString('es-CL')}</span>
                        <button type="buton" class="btn btn-custom-primary btn-sm add-to-cart">
                            <i class="fa-solid fa-cart-plus me-1"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Asignar el evento de clic al botón de manera segura
        col.querySelector('button').addEventListener('click', () => {
            agregarAlCarro(adv.id);
        });

        grid.appendChild(col);
    });
}

// Inicializar de forma nativa al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDesdeBackend();
});

// Ejecutar al cargar la ventana
window.addEventListener('DOMContentLoaded', cargarProductosDesdeBackend);

let carrito = [];
const API_URL = "http://127.0.0.1:8000/api"; // Endpoint base de tu backend Django

// Renderizar Catálogo en formato Cards
function cargarCatalogo() {
    const grid = document.getElementById('catalogo-grid');
    grid.innerHTML = productosDisponibles.map(p => `
                <div class="card">
                    <img src="${p.imagen_url}" alt="${p.titulo}">
                    <div class="card-body">
                        <div>
                            <div class="card-title">${p.titulo}</div>
                            <div class="card-desc">${p.detalle}</div>
                        </div>
                        <div class="card-footer-info">
                            <span class="precio">$${p.precio.toLocaleString()}</span>
                            <button class="btn-add" onclick="agregarAlCarro(${p.id})">Agregar</button>
                        </div>
                    </div>
                </div>
            `).join('');
}

//agregamos elementos al carro
function agregarAlCarro(id) {
    const prod = productosDisponibles.find(p => p.id === id);
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    actualizarCarroUI();
}

//actualiza el carro (agrega o elimina u elemento de este)
function actualizarCarroUI() {
    const contenedor = document.getElementById('lista-carrito');
    const contador = document.getElementById('contador-carro');
    const totalEl = document.getElementById('total-carro');

    contador.innerText = carrito.reduce((sum, i) => sum + i.cantidad, 0);

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem; text-align: center; padding: 1rem 0;">Tu carro está vacío</p>';
        totalEl.innerText = '$0';
        return;
    }

    let total = 0;
    contenedor.innerHTML = carrito.map((i, index) => {
        let subtotal = i.precio * i.cantidad;
        total += subtotal;
        return `
                    <div class="item-carrito">
                        <div class="item-carrito-info">
                            <strong>${i.titulo}</strong><br>
                            <span style="color:#64748b; font-size:0.8rem;">${i.cantidad} x $${i.precio.toLocaleString()}</span>
                        </div>
                        <div class="item-carrito-acciones">
                            <span style="font-weight:600;">$${subtotal.toLocaleString()}</span>
                            <button class="btn-eliminar" onclick="removerItem(${index})" title="Eliminar">×</button>
                        </div>
                    </div>
                `;
    }).join('');
    totalEl.innerText = `$${total.toLocaleString()}`;
}

//Elimina elemnetos del carro
function removerItem(index) {
    carrito.splice(index, 1);
    actualizarCarroUI();
}

// Enviar solicitud POST vía fetch nativo al endpoint de Django
async function procesarCompra(event) {
    if (event) {
        event.preventDefault();
    }
    
    if (carrito.length === 0) {
        alert("Por favor agrega al menos una aventura a tu carro antes de pagar.");
        return;
    }

    const montoTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const payload = {
        cliente_nombre: "Cliente Web Vértigo",
        cliente_email: "cliente@vertigo.cl",
        monto_total: montoTotal,
        items: carrito.map(item => ({
            aventura: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
        }))
    };

    try {
        const response = await fetch(`${API_URL}/comprar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Leemos la respuesta una sola vez como texto plano primero
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText); // Intentamos convertirla a JSON si es posible
        } catch (e) {
            data = { detalle: responseText };
        }

        if (!response.ok) {
            //const errorData = await response.json();
            //const errorText = await response.text();
            console.error("detalle del error del backend", data)
            //throw new Error("Error en la respuesta del servidor (${response.status}): ${errorText}");
            throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
        } 

        //const recibo = await response.json();
        mostrarBoletaModal(data);
        console.log("Compra exitosa", data)

        carrito = [];
        actualizarCarroUI();
    } catch (error) {
        console.error("fallo capturado", error)
        alert("No se pudo conectar con el backend de Django: " + error.message);
    }
}

function mostrarBoletaModal(r) {
    const contenido = document.getElementById('contenido-boleta');
    contenido.innerHTML = `
        <h3>🧾 Comprobante Electrónico</h3>
        <p><strong>Código de Canje:</strong> <span style="color:var(--accent); font-size:1.1rem;">${r.codigo_canje}</span></p>
        <p style="margin-top:0.5rem;"><strong>Titular:</strong> ${r.cliente || 'Cliente'}</p>
        <p><strong>Monto Total:</strong> $${Number(r.total_pagado || 0).toLocaleString('es-CL')}</p>
        <hr style="margin: 1rem 0; border:0; border-top:1px solid var(--border-color);">
        <h4 style="margin-bottom:0.4rem; font-size:0.95rem;">Instrucciones:</h4>
        <p style="white-space: pre-line; background:var(--bg-light); padding:10px; border-radius:4px; font-size:0.85rem; color:#475569;">${r.instrucciones}</p>
        <button class="btn-comprar" style="margin-top: 1.5rem;" onclick="document.getElementById('modalBoleta').style.display='none'">Entendido / Cerrar</button>
    `;
    document.getElementById('modalBoleta').style.display = 'flex';
}

// Inicializar interfaz al cargar
cargarCatalogo();
