let ultimaCategoria = "biblioteca";
let examenActual = null;
let preguntas = [];
let preguntaActual = 0;
let respuestasUsuario = {};
let contadorIntervalo = null;
let tiempoRestanteSegundos = 0;
let contadorActivado = false;
let respuestaVisible = null;

const rutasSimuladores = {
  ECOEMS_1: "preguntas/ecoems/simulador_1.json",
  UNAM_1: "preguntas/unam/simulador_1.json"
};

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion, .examen-pantalla").forEach(s => {
    s.classList.add("oculto");
  });
  document.getElementById(id).classList.remove("oculto");
}

function mostrarSimuladores(nombreCategoria, origen) {
  const titulo = document.getElementById("tituloSimulador");
  const contenedor = document.getElementById("contenedorSimuladores");

  titulo.textContent = "Simuladores - " + nombreCategoria;
  contenedor.innerHTML = "";
  ultimaCategoria = origen;

  for (let i = 1; i <= 10; i++) {
    const b = document.createElement("button");
    b.className = "boton-simulador";
    b.textContent = "Simulador " + i;

    if (i === 1 && (nombreCategoria === "UNAM" || nombreCategoria === "ECOEMS")) {
      b.onclick = () => abrirConfiguracionExamen(nombreCategoria, i);
    } else {
      b.disabled = true;
    }

    contenedor.appendChild(b);
  }

  mostrarSeccion("simuladores");
}

function regresarCategoria() {
  mostrarSeccion(ultimaCategoria);
}

async function abrirConfiguracionExamen(categoria, numeroSimulador) {
  const clave = categoria + "_" + numeroSimulador;
  const ruta = rutasSimuladores[clave];

  if (!ruta) {
    alert("Este simulador todavía no tiene JSON asignado.");
    return;
  }

  try {
    const respuesta = await fetch(ruta + "?v=" + Date.now(), {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error("No se encontró el JSON: " + ruta);
    }

    examenActual = await respuesta.json();
    preguntas = examenActual.preguntas || [];

    console.log("JSON cargado:", ruta);
    console.log("Nombre:", examenActual.nombre);
    console.log("Institución:", examenActual.institucion);
    console.log("Total preguntas:", preguntas.length);
    console.log("Primera pregunta:", preguntas[0]);

    if (!preguntas.length) {
      alert("El JSON cargó, pero no contiene preguntas.");
      return;
    }

    document.getElementById("tituloConfigExamen").textContent =
      examenActual.nombre || "Simulador";

    const duracion = examenActual.configuracion?.duracion_minutos || 180;

    document.getElementById("duracionTexto").textContent =
      "Duración: " + duracion + " minutos";

    document.getElementById("activarContador").checked =
      examenActual.configuracion?.contador_activo_por_defecto || false;

    document.getElementById("activarContador").disabled =
      examenActual.configuracion?.contador_permitido === false;

    mostrarSeccion("configuracionExamen");

  } catch (e) {
    alert("No se pudo cargar el archivo JSON. Revisa la ruta o el formato.");
    console.error(e);
  }
}

function iniciarExamenDesdeConfig() {
  preguntaActual = 0;
  respuestasUsuario = {};
  respuestaVisible = null;
  contadorActivado = document.getElementById("activarContador").checked;

  document.getElementById("franjaInstitucion").textContent =
    examenActual?.institucion || "SIM";

  if (contadorIntervalo) clearInterval(contadorIntervalo);

  if (contadorActivado) {
    const duracion = examenActual.configuracion?.duracion_minutos || 180;
    tiempoRestanteSegundos = duracion * 60;

    document.getElementById("contador").classList.remove("oculto");
    actualizarVistaContador();

    contadorIntervalo = setInterval(() => {
      tiempoRestanteSegundos--;
      actualizarVistaContador();

      if (tiempoRestanteSegundos <= 0) {
        clearInterval(contadorIntervalo);
        finalizarExamen(true);
      }
    }, 1000);
  } else {
    document.getElementById("contador").classList.add("oculto");
  }

  mostrarSeccion("examen");
  cargarPregunta();
}

function actualizarVistaContador() {
  const m = Math.floor(tiempoRestanteSegundos / 60);
  const s = tiempoRestanteSegundos % 60;

  document.getElementById("contador").textContent =
    String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function cargarPregunta() {
  const p = preguntas[preguntaActual];

  document.getElementById("materiaActual").textContent =
    p.materia || "Sin materia";

  document.getElementById("progresoPregunta").textContent =
    "Pregunta " + (preguntaActual + 1) + " de " + preguntas.length;

  respuestaVisible = null;
  mostrarPregunta();
  renderOpciones();
}

function mostrarPregunta() {
  respuestaVisible = null;

  const p = preguntas[preguntaActual];
  const c = document.getElementById("contenidoVisible");

  c.innerHTML = "";

  const n = p.id || preguntaActual + 1;
  const txt = p.pregunta?.contenido || "";

  const par = document.createElement("p");
  par.textContent = txt ? n + ") " + txt : n + ") Pregunta sin contenido.";
  c.appendChild(par);

  if (p.pregunta?.imagen) {
    const img = document.createElement("img");
    img.src = p.pregunta.imagen;
    img.alt = "Imagen de la pregunta " + n;
    c.appendChild(img);
  }

  renderOpciones();
}

function ocultarPreguntaConBoton() {
  const c = document.getElementById("contenidoVisible");
  c.innerHTML = "";

  const b = document.createElement("button");
  b.className = "boton-ver-pregunta";
  b.textContent = "Ver pregunta";
  b.onclick = mostrarPregunta;

  c.appendChild(b);
}

function renderOpciones() {
  const p = preguntas[preguntaActual];
  const c = document.getElementById("zonaOpciones");

  c.innerHTML = "";

  const opciones = p.opciones || [];

  opciones.forEach(op => {
    const fila = document.createElement("div");
    fila.className = "fila-opcion";

    const sel = document.createElement("button");
    sel.className = "selector-opcion";
    sel.title = "Elegir " + op.inciso;

    if (respuestasUsuario[p.id] === op.inciso) {
      sel.classList.add("seleccionada");
    }

    sel.onclick = () => seleccionarRespuesta(op.inciso);

    const inc = document.createElement("div");
    inc.className = "inciso-opcion";
    inc.textContent = op.inciso + ")";

    const ver = document.createElement("button");
    ver.className = "boton-ver-respuesta";
    ver.textContent = "Ver respuesta";
    ver.onclick = () => mostrarRespuestaEnFila(op.inciso);

    fila.append(sel, inc, ver);

    if (respuestaVisible === op.inciso) {
      const rd = document.createElement("div");
      rd.className = "respuesta-desplegada";

      const par = document.createElement("p");
      par.textContent = op.texto || "Opción sin contenido.";
      rd.appendChild(par);

      if (op.imagen) {
        const img = document.createElement("img");
        img.src = op.imagen;
        img.alt = "Imagen opción " + op.inciso;
        rd.appendChild(img);
      }

      fila.appendChild(rd);
    } else {
      fila.appendChild(document.createElement("div"));
    }

    c.appendChild(fila);
  });
}

function mostrarRespuestaEnFila(inciso) {
  respuestaVisible = inciso;
  ocultarPreguntaConBoton();
  renderOpciones();
}

function seleccionarRespuesta(inciso) {
  const p = preguntas[preguntaActual];
  respuestasUsuario[p.id] = inciso;
  renderOpciones();
}

function preguntaAnterior() {
  if (preguntaActual > 0) {
    preguntaActual--;
    cargarPregunta();
  }
}

function preguntaSiguiente() {
  if (preguntaActual < preguntas.length - 1) {
    preguntaActual++;
    cargarPregunta();
  }
}

function finalizarExamen(finalizadoPorTiempo) {
  if (contadorIntervalo) clearInterval(contadorIntervalo);

  const total = preguntas.length;
  let correctas = 0;
  const porMateria = {};

  preguntas.forEach(p => {
    const m = p.materia || "Sin materia";

    if (!porMateria[m]) {
      porMateria[m] = { total: 0, correctas: 0 };
    }

    porMateria[m].total++;

    if (respuestasUsuario[p.id] === p.respuesta_correcta) {
      correctas++;
      porMateria[m].correctas++;
    }
  });

  document.getElementById("resumenResultados").innerHTML = `
    <div class="resultado-card">
      <h3>${finalizadoPorTiempo ? "El tiempo terminó." : "Examen finalizado."}</h3>
      <p><strong>Puntaje total:</strong> ${correctas} / ${total}</p>
      <p><strong>Porcentaje:</strong> ${((correctas / total) * 100).toFixed(2)}%</p>
    </div>
  `;

  const cm = document.getElementById("resultadosPorMateria");
  cm.innerHTML = "";

  Object.keys(porMateria).forEach(m => {
    const d = porMateria[m];
    const div = document.createElement("div");
    div.className = "resultado-card";
    div.innerHTML = `<strong>${m}</strong><p>${d.correctas} / ${d.total}</p>`;
    cm.appendChild(div);
  });

  mostrarSeccion("resultados");
}

function mostrarRevision() {
  const c = document.getElementById("contenedorRevision");
  c.innerHTML = "";

  preguntas.forEach((p, i) => {
    const u = respuestasUsuario[p.id] || "Sin responder";
    const cor = p.respuesta_correcta || "Sin respuesta configurada";
    const ok = u === p.respuesta_correcta;

    const div = document.createElement("div");
    div.className = "revision-card " + (ok ? "correcta" : "incorrecta");

    div.innerHTML = `
      <h3>Pregunta ${i + 1} - ${p.materia || "Sin materia"}</h3>
      <p><strong>Pregunta:</strong> ${p.pregunta?.contenido || "Sin contenido"}</p>
      <p><strong>Tu respuesta:</strong> ${u}</p>
      <p><strong>Respuesta correcta:</strong> ${cor}</p>
      <p><strong>Observaciones:</strong> ${p.observaciones || "Sin observaciones."}</p>
    `;

    c.appendChild(div);
  });

  mostrarSeccion("revision");
}