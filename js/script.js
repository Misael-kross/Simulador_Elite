let ultimaCategoria = "biblioteca";
let categoriaActual = "";
let materiaActualSeleccionada = "";

let examenActual = null;
let preguntas = [];
let preguntaActual = 0;
let respuestasUsuario = {};
let contadorIntervalo = null;
let tiempoRestanteSegundos = 0;
let contadorActivado = false;
let respuestasOcultasActivadas = true;
let respuestaVisible = null;

const rutasBase = {
  ECOEMS: "preguntas/ecoems/",
  "CENEVAL EXANI I": "preguntas/ceneval_exani_i/",
  "UACH Bachillerato": "preguntas/uach_bachillerato/",

  UNAM: "preguntas/unam/",
  IPN: "preguntas/ipn/",
  UAM: "preguntas/uam/",
  "EXANI II": "preguntas/exani_ii/",
  "UACH Universidad": "preguntas/uach_universidad/"
};

const materiasPorCategoria = {
  ECOEMS: [
    "Habilidad Verbal",
    "Habilidad Matemática",
    "Matemáticas",
    "Física",
    "Química",
    "Biología",
    "Español",
    "Historia de México",
    "Historia Universal",
    "Geografía",
    "Formación Cívica y Ética"
  ],

  "CENEVAL EXANI I": [
    "Pensamiento científico",
    "Comprensión lectora",
    "Redacción indirecta",
    "Pensamiento matemático"
  ],

  "UACH Bachillerato": [
    "Habilidades numéricas",
    "Habilidades verbales",
    "Matemáticas",
    "Física",
    "Química",
    "Biología",
    "Geografía",
    "Lengua y Literatura",
    "Historia mundial",
    "Historia de México"
  ],

  UNAM: [
    "Español",
    "Física",
    "Matemáticas",
    "Literatura",
    "Geografía",
    "Biología",
    "Química",
    "Historia Universal",
    "Historia de México"
  ],

  IPN: [
    "Matemáticas",
    "Competencia escrita",
    "Competencia lectora",
    "Inglés",
    "Historia",
    "Biología",
    "Química",
    "Física"
  ],

  UAM: [
    "Razonamiento verbal",
    "Comprensión lectora",
    "Comunicación escrita",
    "Razonamiento matemático",
    "Ciencias Básicas e Ingeniería",
    "Ciencias Biológicas y de la Salud",
    "Ciencias Sociales y Humanidades",
    "Ciencias y Artes para el Diseño"
  ],

  "EXANI II": [
    "Comprensión lectora",
    "Redacción indirecta",
    "Pensamiento matemático",
    "Inglés como lengua extranjera diagnóstico",
    "Administración",
    "Aritmética",
    "Biología",
    "Cálculo diferencial e integral",
    "Ciencias de la salud",
    "Derecho",
    "Economía",
    "Filosofía",
    "Física",
    "Historia",
    "Literatura",
    "Matemáticas financieras",
    "Premedicina",
    "Probabilidad y estadística",
    "Psicología",
    "Química",
    "Ciencias experimentales",
    "Ciencias sociales"
  ],

  "UACH Universidad": [
    "Habilidades numéricas",
    "Habilidades verbales",
    "Matemáticas",
    "Física",
    "Química",
    "Biología",
    "Geografía",
    "Lengua y Literatura",
    "Historia mundial",
    "Historia de México"
  ]
};


function renderizarMatematicas(elemento = document.body) {
  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise([elemento]).catch(error => {
      console.error("Error al renderizar matemáticas:", error);
    });
  }
}

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion, .examen-pantalla").forEach(seccion => {
    seccion.classList.add("oculto");
  });

  document.getElementById(id).classList.remove("oculto");
}

function normalizarNombre(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function obtenerRutaSimulador(categoria, numeroSimulador) {
  const base = rutasBase[categoria];

  if (!base) return null;

  return base + "simulador_" + numeroSimulador + ".json";
}

function obtenerRutaSimuladorMateria(categoria, materia, numeroSimulador) {
  const categoriaNormalizada = normalizarNombre(categoria);
  const materiaNormalizada = normalizarNombre(materia);

  return (
    "preguntas_materia/" +
    categoriaNormalizada +
    "/" +
    materiaNormalizada +
    "/simulador_" +
    numeroSimulador +
    ".json"
  );
}

function mostrarSimuladores(nombreCategoria, origen) {
  const titulo = document.getElementById("tituloSimulador");
  const contenedor = document.getElementById("contenedorSimuladores");

  categoriaActual = nombreCategoria;
  ultimaCategoria = origen;

  titulo.textContent = "Simuladores - " + nombreCategoria;
  contenedor.innerHTML = "";

  const botonMateria = document.createElement("button");
  botonMateria.className = "boton-materia-especial";
  botonMateria.textContent = "Simulador por materia";
  botonMateria.onclick = function () {
    mostrarMateriasSimulador(nombreCategoria);
  };

  contenedor.appendChild(botonMateria);

  for (let i = 1; i <= 10; i++) {
    const boton = document.createElement("button");
    boton.className = "boton-simulador";
    boton.textContent = "Simulador " + i;

    boton.onclick = function () {
      abrirConfiguracionExamen(nombreCategoria, i, false);
    };

    contenedor.appendChild(boton);
  }

  mostrarSeccion("simuladores");
}

function mostrarMateriasSimulador(categoria) {
  const titulo = document.getElementById("tituloMateriasSimulador");
  const contenedor = document.getElementById("contenedorMaterias");

  titulo.textContent = "Simulador por materia - " + categoria;
  contenedor.innerHTML = "";

  const materias = materiasPorCategoria[categoria] || [];

  materias.forEach(materia => {
    const boton = document.createElement("button");
    boton.className = "boton-lista boton-materia";
    boton.textContent = materia;

    boton.onclick = function () {
      mostrarSimuladoresDeMateria(categoria, materia);
    };

    contenedor.appendChild(boton);
  });

  mostrarSeccion("materiasSimulador");
}

function mostrarSimuladoresDeMateria(categoria, materia) {
  const titulo = document.getElementById("tituloSimuladoresMateria");
  const contenedor = document.getElementById("contenedorSimuladoresMateria");

  categoriaActual = categoria;
  materiaActualSeleccionada = materia;

  titulo.textContent = categoria + " - " + materia;
  contenedor.innerHTML = "";

  for (let i = 1; i <= 3; i++) {
    const boton = document.createElement("button");
    boton.className = "boton-simulador-materia";
    boton.textContent = "Simulador " + i;

    boton.onclick = function () {
      abrirConfiguracionExamen(categoria, i, true, materia);
    };

    contenedor.appendChild(boton);
  }

  mostrarSeccion("simuladoresMateria");
}

function regresarCategoria() {
  mostrarSeccion(ultimaCategoria);
}

async function abrirConfiguracionExamen(categoria, numeroSimulador, esPorMateria = false, materia = "") {
  const ruta = esPorMateria
    ? obtenerRutaSimuladorMateria(categoria, materia, numeroSimulador)
    : obtenerRutaSimulador(categoria, numeroSimulador);

  if (!ruta) {
    alert("Esta categoría todavía no tiene ruta configurada.");
    return;
  }

  try {
    const respuesta = await fetch(ruta + "?v=" + Date.now(), {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      alert(
        "Este simulador todavía no tiene JSON cargado.\n\n" +
        "Archivo esperado:\n" +
        ruta
      );
      return;
    }

    examenActual = await respuesta.json();
    preguntas = examenActual.preguntas || [];

    console.log("JSON cargado:", ruta);
    console.log("Nombre:", examenActual.nombre);
    console.log("Institución:", examenActual.institucion);
    console.log("Total preguntas:", preguntas.length);
    console.log("Primera pregunta:", preguntas[0]);

    if (!preguntas.length) {
      alert("El JSON existe, pero no contiene preguntas.");
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

    const activarRespuestasOcultas = document.getElementById("activarRespuestasOcultas");
    if (activarRespuestasOcultas) {
      activarRespuestasOcultas.checked =
        examenActual.configuracion?.respuestas_ocultas_por_defecto !== false;
    }

    mostrarSeccion("configuracionExamen");
  } catch (error) {
    alert(
      "No se pudo cargar este simulador.\n\n" +
      "Revisa que el JSON esté bien escrito y colocado aquí:\n" +
      ruta
    );
    console.error(error);
  }
}

function iniciarExamenDesdeConfig() {
  preguntaActual = 0;
  respuestasUsuario = {};
  respuestaVisible = null;
  contadorActivado = document.getElementById("activarContador").checked;
  respuestasOcultasActivadas =
    document.getElementById("activarRespuestasOcultas")?.checked ?? true;

  document.getElementById("franjaInstitucion").textContent =
    examenActual?.institucion || "SIM";

  if (contadorIntervalo) {
    clearInterval(contadorIntervalo);
  }

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
  const minutos = Math.floor(tiempoRestanteSegundos / 60);
  const segundos = tiempoRestanteSegundos % 60;

  document.getElementById("contador").textContent =
    String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");
}

function cargarPregunta() {
  const pregunta = preguntas[preguntaActual];

  document.getElementById("materiaActual").textContent =
    pregunta.materia || "Sin materia";

  document.getElementById("progresoPregunta").textContent =
    "Pregunta " + (preguntaActual + 1) + " de " + preguntas.length;

  respuestaVisible = null;
  mostrarPregunta();
  renderOpciones();
}

function mostrarPregunta() {
  respuestaVisible = null;

  const pregunta = preguntas[preguntaActual];
  const contenedor = document.getElementById("contenidoVisible");

  contenedor.innerHTML = "";

  const numeroPregunta = pregunta.id || preguntaActual + 1;
  const texto = pregunta.pregunta?.contenido || "";

  const parrafo = document.createElement("p");
  parrafo.textContent = texto
    ? numeroPregunta + ") " + texto
    : numeroPregunta + ") Pregunta sin contenido.";

  contenedor.appendChild(parrafo);

  if (pregunta.pregunta?.imagen) {
    const imagen = document.createElement("img");
    imagen.src = pregunta.pregunta.imagen;
    imagen.alt = "Imagen de la pregunta " + numeroPregunta;
    contenedor.appendChild(imagen);
  }

  renderizarMatematicas(contenedor);
  renderOpciones();
}

function ocultarPreguntaConBoton() {
  const contenedor = document.getElementById("contenidoVisible");
  contenedor.innerHTML = "";

  const boton = document.createElement("button");
  boton.className = "boton-ver-pregunta";
  boton.textContent = "Ver pregunta";
  boton.onclick = mostrarPregunta;

  contenedor.appendChild(boton);
}

function renderOpciones() {
  const pregunta = preguntas[preguntaActual];
  const contenedor = document.getElementById("zonaOpciones");

  contenedor.innerHTML = "";

  const opciones = pregunta.opciones || [];

  opciones.forEach(opcion => {
    const fila = document.createElement("div");
    fila.className = respuestasOcultasActivadas
      ? "fila-opcion"
      : "fila-opcion fila-opcion-visible";

    const selector = document.createElement("button");
    selector.className = "selector-opcion";
    selector.title = "Elegir " + opcion.inciso;

    if (respuestasUsuario[pregunta.id] === opcion.inciso) {
      selector.classList.add("seleccionada");
    }

    selector.onclick = function () {
      seleccionarRespuesta(opcion.inciso);
    };

    const inciso = document.createElement("div");
    inciso.className = "inciso-opcion";
    inciso.textContent = opcion.inciso + ")";

    fila.append(selector, inciso);

    if (respuestasOcultasActivadas) {
      const botonVer = document.createElement("button");
      botonVer.className = "boton-ver-respuesta";
      botonVer.textContent = "Ver respuesta";
      botonVer.onclick = function () {
        mostrarRespuestaEnFila(opcion.inciso);
      };

      fila.appendChild(botonVer);

      if (respuestaVisible === opcion.inciso) {
        const respuestaDiv = crearContenidoRespuesta(opcion);
        fila.appendChild(respuestaDiv);
      } else {
        fila.appendChild(document.createElement("div"));
      }
    } else {
      const respuestaDiv = crearContenidoRespuesta(opcion);
      respuestaDiv.classList.add("respuesta-visible-directa");
      fila.appendChild(respuestaDiv);
    }

    contenedor.appendChild(fila);
  });

  renderizarMatematicas(contenedor);
}

function crearContenidoRespuesta(opcion) {
  const respuestaDiv = document.createElement("div");
  respuestaDiv.className = "respuesta-desplegada";

  const texto = document.createElement("p");
  texto.textContent = opcion.texto || "Opción sin contenido.";
  respuestaDiv.appendChild(texto);

  if (opcion.imagen) {
    const imagen = document.createElement("img");
    imagen.src = opcion.imagen;
    imagen.alt = "Imagen opción " + opcion.inciso;
    respuestaDiv.appendChild(imagen);
  }

  return respuestaDiv;
}

function mostrarRespuestaEnFila(inciso) {
  if (!respuestasOcultasActivadas) return;

  respuestaVisible = inciso;
  ocultarPreguntaConBoton();
  renderOpciones();
}

function seleccionarRespuesta(inciso) {
  const pregunta = preguntas[preguntaActual];
  respuestasUsuario[pregunta.id] = inciso;
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
  if (contadorIntervalo) {
    clearInterval(contadorIntervalo);
  }

  const total = preguntas.length;
  let correctas = 0;
  const porMateria = {};

  preguntas.forEach(pregunta => {
    const materia = pregunta.materia || "Sin materia";

    if (!porMateria[materia]) {
      porMateria[materia] = {
        total: 0,
        correctas: 0
      };
    }

    porMateria[materia].total++;

    if (respuestasUsuario[pregunta.id] === pregunta.respuesta_correcta) {
      correctas++;
      porMateria[materia].correctas++;
    }
  });

  document.getElementById("resumenResultados").innerHTML = `
    <div class="resultado-card">
      <h3>${finalizadoPorTiempo ? "El tiempo terminó." : "Examen finalizado."}</h3>
      <p><strong>Puntaje total:</strong> ${correctas} / ${total}</p>
      <p><strong>Porcentaje:</strong> ${((correctas / total) * 100).toFixed(2)}%</p>
    </div>
  `;

  const contenedorMaterias = document.getElementById("resultadosPorMateria");
  contenedorMaterias.innerHTML = "";

  Object.keys(porMateria).forEach(materia => {
    const datos = porMateria[materia];
    const div = document.createElement("div");

    div.className = "resultado-card";
    div.innerHTML = `
      <strong>${materia}</strong>
      <p>${datos.correctas} / ${datos.total}</p>
    `;

    contenedorMaterias.appendChild(div);
  });

  renderizarMatematicas(document.getElementById("resultados"));
  mostrarSeccion("resultados");
}

function mostrarRevision() {
  const contenedor = document.getElementById("contenedorRevision");
  contenedor.innerHTML = "";

  preguntas.forEach((pregunta, indice) => {
    const usuario = respuestasUsuario[pregunta.id] || "Sin responder";
    const correcta = pregunta.respuesta_correcta || "Sin respuesta configurada";
    const esCorrecta = usuario === pregunta.respuesta_correcta;

    const div = document.createElement("div");
    div.className = "revision-card " + (esCorrecta ? "correcta" : "incorrecta");

    div.innerHTML = `
      <h3>Pregunta ${indice + 1} - ${pregunta.materia || "Sin materia"}</h3>
      <p><strong>Pregunta:</strong> ${pregunta.pregunta?.contenido || "Sin contenido"}</p>
      <p><strong>Tu respuesta:</strong> ${usuario}</p>
      <p><strong>Respuesta correcta:</strong> ${correcta}</p>
      <p><strong>Observaciones:</strong> ${pregunta.observaciones || "Sin observaciones."}</p>
    `;

    contenedor.appendChild(div);
  });

  mostrarSeccion("revision");
}