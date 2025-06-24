// Inicialización de Supabase
const { createClient } = supabase; // Aseguramos que se use el objeto supabase
const supabaseUrl = 'https://vicvgsjoivzlqbzxuoop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY3Znc2pvaXZ6bHFienh1b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjM4MjAsImV4cCI6MjA2NjI5OTgyMH0.69f3qDkUqJwBYJQgc7brBVU9k_eCXQ43qa66FnGyG-0';
const supabase = createClient(supabaseUrl, supabaseKey);

let medidasTemporales = [];

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.classList.remove('exito', 'error');
    mensaje.classList.add(tipo);
    mensaje.style.display = tipo ? 'block' : 'none';
    if (tipo) setTimeout(() => (mensaje.style.display = 'none'), 3000);
}

async function cargarTemporadas() {
    const temporadaSelect = document.getElementById('temporada');
    const { data, error } = await supabase.from('temporadas').select('nombre');
    if (error) return mostrarMensaje('Error al cargar temporadas: ' + error.message, 'error');
    temporadaSelect.innerHTML = '<option value="">Selecciona Temporada</option>';
    data.forEach(temporada => {
        const option = document.createElement('option');
        option.value = temporada.nombre;
        option.text = temporada.nombre;
        temporadaSelect.appendChild(option);
    });
}

async function cargarTiposPrenda() {
    const tipoPrendaSelect = document.getElementById('tipoPrenda');
    const { data, error } = await supabase.from('tipos_prenda').select('nombre');
    if (error) return mostrarMensaje('Error al cargar tipos de prenda: ' + error.message, 'error');
    tipoPrendaSelect.innerHTML = '';
    data.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.nombre;
        option.text = tipo.nombre;
        tipoPrendaSelect.appendChild(option);
    });
}

async function agregarTemporada() {
    const nombre = document.getElementById('nuevaTemporada').value.trim();
    if (!nombre) return mostrarMensaje('Ingrese un nombre válido', 'error');
    const { error } = await supabase.from('temporadas').insert([{ nombre }]);
    if (error) return mostrarMensaje('Error al agregar temporada: ' + error.message, 'error');
    document.getElementById('nuevaTemporada').value = '';
    cargarTemporadas();
    mostrarMensaje('Temporada agregada', 'exito');
}

function agregarMedida() {
    const medida = document.getElementById('nuevaMedida').value.trim();
    if (!medida) return mostrarMensaje('Ingrese una medida válida', 'error');
    medidasTemporales.push(medida);
    const medidasList = document.getElementById('medidasList');
    medidasList.innerHTML = '';
    medidasTemporales.forEach((medida, index) => {
        const li = document.createElement('li');
        li.textContent = medida;
        const btn = document.createElement('button');
        btn.textContent = 'Eliminar';
        btn.onclick = () => {
            medidasTemporales.splice(index, 1);
            agregarMedida();
        };
        li.appendChild(btn);
        medidasList.appendChild(li);
    });
    document.getElementById('nuevaMedida').value = '';
}

async function guardarTipoPrenda() {
    const nombre = document.getElementById('nuevoTipoPrenda').value.trim();
    if (!nombre || medidasTemporales.length === 0) return mostrarMensaje('Ingrese nombre y al menos una medida', 'error');
    const { error } = await supabase.from('tipos_prenda').insert([{ nombre, medidas: medidasTemporales }]);
    if (error) return mostrarMensaje('Error al guardar tipo de prenda: ' + error.message, 'error');
    document.getElementById('nuevoTipoPrenda').value = '';
    medidasTemporales = [];
    document.getElementById('medidasList').innerHTML = '';
    cargarTiposPrenda();
    mostrarMensaje('Tipo de prenda guardado', 'exito');
}

function mostrarMedidas(tipoPrenda) {
    const medidasContainer = document.getElementById('medidasContainer');
    medidasContainer.innerHTML = '';
    let medidas = [];
    if (tipoPrenda === 'Pantalones') {
        medidas = ['Largo', 'Cintura', 'Cadera', 'Rodilla', 'Ruedo', 'Tiro'];
    } else if (tipoPrenda === 'Camisas') {
        medidas = ['Largo', 'Hombro', 'Pecho', 'Espalda', 'Manga', 'Cuello'];
    } else {
        supabase.from('tipos_prenda').select('medidas').eq('nombre', tipoPrenda).single()
            .then(({ data, error }) => {
                if (error) return mostrarMensaje('Error al cargar medidas: ' + error.message, 'error');
                if (data) medidas = data.medidas;
                medidas.forEach(medida => {
                    const div = document.createElement('div');
                    div.innerHTML = `<label class="block text-gray-700">${medida}: <input type="number" id="medida_${medida.replace(/\s/g, '_')}" required class="w-full p-2 border rounded"></label>`;
                    medidasContainer.appendChild(div);
                });
            });
    }
    if (medidas.length > 0) {
        medidas.forEach(medida => {
            const div = document.createElement('div');
            div.innerHTML = `<label class="block text-gray-700">${medida}: <input type="number" id="medida_${medida.replace(/\s/g, '_')}" required class="w-full p-2 border rounded"></label>`;
            medidasContainer.appendChild(div);
        });
    }
}

document.getElementById('clientForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const tipoPrenda = document.getElementById('tipoPrenda').value;
    const temporada = document.getElementById('temporada').value;
    if (!temporada) return mostrarMensaje('Seleccione una temporada', 'error');
    let medidas = {};
    if (tipoPrenda === 'Pantalones') {
        medidas = {
            largo: document.getElementById('medida_Largo')?.value,
            cintura: document.getElementById('medida_Cintura')?.value,
            cadera: document.getElementById('medida_Cadera')?.value,
            rodilla: document.getElementById('medida_Rodilla')?.value,
            ruedo: document.getElementById('medida_Ruedo')?.value,
            tiro: document.getElementById('medida_Tiro')?.value
        };
    } else if (tipoPrenda === 'Camisas') {
        medidas = {
            largo: document.getElementById('medida_Largo')?.value,
            hombro: document.getElementById('medida_Hombro')?.value,
            pecho: document.getElementById('medida_Pecho')?.value,
            espalda: document.getElementById('medida_Espalda')?.value,
            manga: document.getElementById('medida_Manga')?.value,
            cuello: document.getElementById('medida_Cuello')?.value
        };
    } else {
        const { data, error } = await supabase.from('tipos_prenda').select('medidas').eq('nombre', tipoPrenda).single();
        if (error) return mostrarMensaje('Error al cargar medidas: ' + error.message, 'error');
        data.medidas.forEach(medida => {
            medidas[medida] = document.getElementById(`medida_${medida.replace(/\s/g, '_')}`)?.value;
        });
    }
    for (let key in medidas) {
        if (!medidas[key] || isNaN(medidas[key])) {
            return mostrarMensaje(`La medida ${key.replace(/_/g, ' ')} debe ser un número válido`, 'error');
        }
        medidas[key] = Number(medidas[key]);
    }

    const celular = `506${document.getElementById('celular').value.trim().replace(/[^\d]/g, '')}`;
    if (!celular.match(/^506\d{8}$/)) {
        return mostrarMensaje('El celular debe tener 8 dígitos', 'error');
    }

    const cliente = {
        nombre: document.getElementById('nombre').value.trim(),
        celular: celular,
        sexo: document.getElementById('sexo').value,
        tipo_prenda: tipoPrenda,
        temporada: temporada,
        estado: document.getElementById('estado').value,
        medidas: medidas,
        observaciones: document.getElementById('observaciones').value.trim()
    };

    console.log('Datos enviados a Supabase:', JSON.stringify(cliente, null, 2));
    const { data, error } = await supabase.from('clientes').insert([cliente]);
    if (error) {
        console.error('Error detallado de Supabase:', error);
        mostrarMensaje('Error al guardar cliente: ' + error.message, 'error');
    } else {
        document.getElementById('clientForm').reset();
        mostrarMedidas(tipoPrenda);
        mostrarMensaje('Cliente guardado con éxito', 'exito');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarTemporadas();
    cargarTiposPrenda();
    document.getElementById('tipoPrenda').addEventListener('change', () => {
        mostrarMedidas(document.getElementById('tipoPrenda').value);
    });
});
