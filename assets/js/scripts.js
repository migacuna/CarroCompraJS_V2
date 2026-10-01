// =========================================================================
// LISTA DE PRODUCTOS / DATOS (Administrables localmente o mapeados desde Django)
// =========================================================================
const productosDisponibles = [
    {
        id: 1,
        titulo: "Rafting Río Maipo",
        precio: 45000,
        detalle: "Adrenalina pura nivel avanzado en rápidos de clase IV con equipo completo incluido.",
        imagen_url: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        titulo: "Trekking Glaciar",
        precio: 35000,
        detalle: "Caminata panorámica de montaña con vistas increíbles y guía certificado de alta montaña.",
        imagen_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        titulo: "Escalada en Roca",
        precio: 28000,
        detalle: "Aprende técnicas básicas, aseguramiento y práctica de rápel en murallas naturales.",
        imagen_url: "https://images.unsplash.com/photo-1522163182402-834f877fd9a1?auto=format&fit=crop&w=500&q=80"
    }
];

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

function removerItem(index) {
    carrito.splice(index, 1);
    actualizarCarroUI();
}

// Enviar solicitud POST vía fetch nativo al endpoint de Django
async function procesarCompra() {
    if (carrito.length === 0) {
        alert("Por favor agrega al menos una aventura a tu carro antes de pagar.");
        return;
    }

    const montoTotal = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    const payload = {
        cliente_nombre: "Cliente Web Vértigo",
        cliente_email: "cliente@vertigo.cl",
        monto_total: montoTotal,
        items: carrito.map(i => ({
            aventura: i.id,
            cantidad: i.cantidad,
            precio_unitario: i.precio
        }))
    };

    try {
        const response = await fetch(`${API_URL}/comprar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const recibo = await response.json();
        mostrarBoletaModal(recibo);

        carrito = [];
        actualizarCarroUI();
    } catch (error) {
        alert("No se pudo conectar con el backend de Django: " + error.message);
    }
}

function mostrarBoletaModal(r) {
    const contenido = document.getElementById('contenido-boleta');
    contenido.innerHTML = `
                <h3>🧾 Comprobante Electrónico</h3>
                <p><strong>Código de Canje:</strong> <span style="color:var(--accent); font-size:1.1rem;">${r.codigo_canje}</span></p>
                <p style="margin-top:0.5rem;"><strong>Titular:</strong> ${r.orden.cliente_nombre}</p>
                <p><strong>Monto Total:</strong> $${Number(r.orden.monto_total).toLocaleString()}</p>
                <hr style="margin: 1rem 0; border:0; border-top:1px solid var(--border-color);">
                <h4 style="margin-bottom:0.4rem; font-size:0.95rem;">Instrucciones:</h4>
                <p style="white-space: pre-line; background:var(--bg-light); padding:10px; border-radius:4px; font-size:0.85rem; color:#475569;">${r.instrucciones}</p>
                <button class="btn-comprar" style="margin-top: 1.5rem;" onclick="document.getElementById('modalBoleta').style.display='none'">Entendido / Cerrar</button>
            `;
    document.getElementById('modalBoleta').style.display = 'flex';
}

// Inicializar interfaz al cargar
cargarCatalogo();
