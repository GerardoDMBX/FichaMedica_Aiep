// app.js
// Módulo de almacenamiento temporal (memoria)
const registros = {};

// Helper: limitar inputs a dígitos y manejar mensajes personalizados
function aplicarFiltroSoloDigitos(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  // On input, elimina caracteres no numéricos
  el.addEventListener('input', () => {
    const antes = el.value;
    const despues = antes.replace(/\D/g, '');
    if (antes !== despues) {
      el.value = despues;
    }
    // limpia mensaje de validación personalizado
    el.setCustomValidity('');
  });

  // custom validity para mostrar mensajes en invalid
  el.addEventListener('invalid', () => {
    if (el.validity.valueMissing) {
      el.setCustomValidity('Este campo es obligatorio.');
    } else if (el.validity.patternMismatch) {
      el.setCustomValidity('Ingrese solo números.');
    } else {
      el.setCustomValidity('');
    }
  });

  el.addEventListener('input', () => el.setCustomValidity(''));
}

// Inicializar filtros en RUT y Teléfono
aplicarFiltroSoloDigitos('rut');
aplicarFiltroSoloDigitos('telefono');

// Referencias DOM
const form = document.getElementById('fichaForm');
const listaResultados = document.getElementById('listaResultados');
const btnBuscar = document.getElementById('btnBuscar');
const buscarApellidoInput = document.getElementById('buscarApellido');
const btnLimpiar = document.getElementById('btnLimpiar');
const btnCerrar = document.getElementById('btnCerrar');

// Manejo del submit (guardar)
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  guardar();
});

function validarFormulario() {
  // usa validación nativa + Bootstrap visual
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  return true;
}

// Guardar registro (alta/actualización)
function guardar() {
  if (!validarFormulario()) return;

  const rut = document.getElementById('rut').value.trim();
  const data = {
    rut,
    nombres: document.getElementById('nombres').value.trim(),
    apellidos: document.getElementById('apellidos').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
    ciudad: document.getElementById('ciudad').value.trim(),
    pais: document.getElementById('pais').value,
    telefono: document.getElementById('telefono').value.trim(),
    email: document.getElementById('email').value.trim(),
    fechaNac: document.getElementById('fechaNac').value,
    estadoCivil: document.getElementById('estadoCivil').value,
    comentarios: document.getElementById('comentarios').value.trim()
  };

  if (registros[rut]) {
    const ok = confirm('El RUT ya existe. ¿Desea sobrescribir el registro?');
    if (!ok) {
      return;
    }
    registros[rut] = data;
    alert('Registro actualizado correctamente.');
  } else {
    registros[rut] = data;
    alert('Registro guardado correctamente.');
  }

  // opcional: limpiar verificación visual
  form.classList.remove('was-validated');
  // refrescar lista de resultados si hay búsqueda activa
  if (buscarApellidoInput.value.trim()) {
    buscar();
  }
}

// Buscar por apellido y listar resultados (clic para cargar)
function buscar() {
  const q = buscarApellidoInput.value.trim().toLowerCase();
  listaResultados.innerHTML = '';
  let encontrados = 0;

  for (const key in registros) {
    const reg = registros[key];
    if (reg.apellidos.toLowerCase().includes(q)) {
      encontrados++;
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      li.tabIndex = 0;
      li.innerHTML = `<strong>${escapeHtml(reg.nombres)} ${escapeHtml(reg.apellidos)}</strong>
                      <br><small>${escapeHtml(reg.rut)} — ${escapeHtml(reg.ciudad)}, ${escapeHtml(reg.pais)}</small>`;
      li.dataset.rut = reg.rut;
      // click y enter para cargar datos al form
      li.addEventListener('click', () => cargarRegistro(reg.rut));
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter') cargarRegistro(reg.rut); });
      listaResultados.appendChild(li);
    }
  }

  if (!encontrados) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted';
    li.textContent = 'No se encontraron resultados.';
    listaResultados.appendChild(li);
  }
}

// Cargar un registro en el formulario
function cargarRegistro(rut) {
  const reg = registros[rut];
  if (!reg) return;
  document.getElementById('rut').value = reg.rut;
  document.getElementById('nombres').value = reg.nombres;
  document.getElementById('apellidos').value = reg.apellidos;
  document.getElementById('direccion').value = reg.direccion;
  document.getElementById('ciudad').value = reg.ciudad;
  document.getElementById('pais').value = reg.pais;
  document.getElementById('telefono').value = reg.telefono;
  document.getElementById('email').value = reg.email;
  document.getElementById('fechaNac').value = reg.fechaNac;
  document.getElementById('estadoCivil').value = reg.estadoCivil;
  document.getElementById('comentarios').value = reg.comentarios;

  // quitar validación visual hasta que haga otra acción
  form.classList.remove('was-validated');

  // scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Limpiar form (no borra registros guardados)
btnLimpiar.addEventListener('click', () => {
  form.reset();
  form.classList.remove('was-validated');
  listaResultados.innerHTML = '';
  buscarApellidoInput.value = '';
});

// Cerrar ventana (puede no funcionar si no se abrió desde ventana scriptable)
btnCerrar.addEventListener('click', () => {
  if (confirm('¿Desea cerrar la aplicación?')) {
    window.close();
  }
});

// Buscar al hacer click en el botón
btnBuscar.addEventListener('click', buscar);

// Escape muy simple para evitar inyección en el listado
function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// --- (opcional) datos de ejemplo para pruebas ---
registros['12345678'] = {
  rut: '12345678',
  nombres: 'Juan',
  apellidos: 'Pérez',
  direccion: 'Calle Falsa 123',
  ciudad: 'Santiago',
  pais: 'Chile',
  telefono: '912345678',
  email: 'juan.perez@mail.com',
  fechaNac: '1990-01-01',
  estadoCivil: 'Soltero(a)',
  comentarios: 'Paciente de prueba'
};
registros['98765432'] = {
  rut: '98765432',
  nombres: 'María',
  apellidos: 'González',
  direccion: 'Av. Siempre Viva 742',
  ciudad: 'Valparaíso',
  pais: 'Chile',
  telefono: '912345679',
  email: 'maria.g@mail.com',
  fechaNac: '1985-05-10',
  estadoCivil: 'Casado(a)',
  comentarios: 'Registro demo'
};
