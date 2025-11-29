/// <reference types="jquery" />

// Estado global
let cursosCarrito = []
let arrayProfesores = []
let arrayCursos = []

// Helpers
function initTogglePassword() {
    $(document).on("click", "#togglePassword", function () {
        const input = $("#pass")
        const icon = $(this).find("i")

        if (input.attr("type") == "password") {
            input.attr("type", "text")
            icon.removeClass("bi-eye").addClass("bi-eye-slash")
        } else {
            input.attr("type", "password")
            icon.removeClass("bi-eye-slash").addClass("bi-eye")
        }
    })
}

function initScrollToTop() {
    let botonSubir = document.getElementById("btn-back-to-top")

    // Cuando el usuario hace scroll 20px, muestra/oculta el botón
    window.onscroll = function () {
        scrollFunction()
    }

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            botonSubir.style.display = "block"
        } else {
            botonSubir.style.display = "none"
        }
    }

    // Cuando el usuario hace clic en el botón, se desplaza hacia arriba en el documento
    botonSubir.addEventListener("click", backToTop);
    function backToTop() {
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
    }
}

function openOffcanvas(id) {
    const elemento = document.getElementById(id)
    if (!elemento) {
        return
    }
    const offCanvas = bootstrap.Offcanvas.getOrCreateInstance(elemento)
    offCanvas.show()
}

function parsePrecioFromCard($card) {
    // Busca "Precio: 123" en un <p class="fw-bold"> y extrae el número
    const textoNumero = ($card.find('.fw-bold:contains("Precio")').text() || "").replace(/[^\d.,]/g, "").replace(",", ".")
    const n = parseInt(textoNumero)
    return isNaN(n) ? 0 : n
}

// Vídeo
function initVideo() {
    $(document).on("click", "#stop, #play", function () {
        const video = document.getElementById("video")
        $("#video").toggleClass("stopped")
        if ($("#video").hasClass("stopped")) video.pause()
        else video.play()
        $("#stop, #play").toggle()
    })
}

// Login / Perfil
function comprobarLoginLocalStorage() {
    let datosLocalStorage = localStorage.getItem("usuarioLoggeado")
    if (!datosLocalStorage) {
        return
    }

    const user = JSON.parse(datosLocalStorage)

    $("#login").addClass("d-none")
    $("#perfil").removeClass("d-none")
    $("#formularioLoginModal").modal && $("#formularioLoginModal").modal("hide")

    $("#perfil").find("a").eq(0).html(`<img class="rounded-circle mx-2" src="assets/images/${user.foto_perfil}" alt="Imagen perfil" width="40" height="40">Hola, ${user.nombre}`)

    $("#perfil").attr("data-id", user.ID)
    $("#nombreUsuario").html(user.nombre)
    $("#alertBienvenidoDeVuelta").fadeIn().delay(3000).fadeOut()
}

function initLogin() {
    // 1) Pinta sesión si la hay (función que ya tienes)
    comprobarLoginLocalStorage()

    // 2) Login contra backend
    $(document).on("click", "#modalLogin", function () {
        const email = $("#mail").val().trim()
        const contrasena = $("#pass").val().trim()

        // Validación mínima en cliente:
        // - mínimo 3 caracteres antes de @
        // - mínimo 3 caracteres después de @
        // - termina en .com o .es
        const emailPattern = /^[^@\s]{3,}@[^\s@]{3,}\.(com|es)$/i
        if (!emailPattern.test(email)) {
            $("#alertaLogin").removeClass("d-none").text("Introduce un email válido que termine en .com o .es")
            return
        }

        if (!contrasena) {
            $("#alertaLogin").removeClass("d-none").text("La contraseña es obligatoria")
            return
        }

        $.ajax({
            url: "php/accesoUsuarios.php",
            type: "POST",
            data: {
                email,
                contrasena
            },
            dataType: "json",
            success: function (respuesta) {
                // Caso: email no encontrado -> ir al registro
                if (respuesta && respuesta.not_found) {
                    // Cierra modal
                    $("#formularioLoginModal").modal && $("#formularioLoginModal").modal("hide")
                    // Redirige a la página de registro
                    window.location.href = "registro?email=" + encodeURIComponent(email)
                    return
                }

                // Caso: login correcto (ok=true + me)
                if (respuesta && (respuesta.me || respuesta.success)) {
                    const me = respuesta.me || respuesta.success

                    $("#login").addClass("d-none")
                    $("#perfil").removeClass("d-none")
                    $("#formularioLoginModal").modal &&
                        $("#formularioLoginModal").modal("hide")

                    $("#perfil").find("a").eq(0).html(`<img class="rounded-circle me-2" src="assets/images/${me.foto_perfil || "person.svg"}" alt="Imagen perfil" width="40" height="40">Hola, ${me.nombre}`)

                    $("#alertInicioSesion").fadeIn().delay(3000).fadeOut()
                    localStorage.setItem("usuarioLoggeado", JSON.stringify(me))
                    $("#alertaLogin").addClass("d-none")
                    return
                }

                // Error de login
                $("#alertaLogin").removeClass("d-none").text((respuesta && respuesta.error) || "Usuario o contraseña incorrectos")
            },
            error: function () {
                console.log("Error al cargar el login")
                $("#alertaLogin").removeClass("d-none").text("Error al contactar con el servidor")
            },
        })
    })
}

function initCerrarSesion() {
    $(document).on("click", "#cerrarSesion", function () {
        $("#login").removeClass("d-none")
        $("#perfil").addClass("d-none")
        localStorage.removeItem("usuarioLoggeado")
        window.location.href = "/"
    })
}

//  Profesores
function crearCartaProfesor(profesor) {
    return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="team-card bg-white p-4 text-center text-fbo rounded-4 shadow-sm h-100 transition">
                <img src="assets/images/${profesor.foto_perfil}" alt="${profesor.nombre}" class="rounded-circle mb-3" width="140" height="140">
                <h5 class="fw-bold mb-1">${profesor.nombre}</h5>
                <p class="small">@${profesor.email} - ${profesor.tecnologias || ''}</p>
                <div class="d-flex gap-3 mt-4 justify-content-center">
                    <a href="https://x.com/${profesor.twitter || ''}/" target="_blank" class="btn btn-outline-dark rounded-circle fs-5 social-btn-inv"><i class="bi bi-twitter-x"></i></a>
                    <a href="https://github.com/${profesor.github || ''}/" target="_blank" class="btn btn-outline-dark rounded-circle fs-5 social-btn-inv"><i class="bi bi-github"></i></a>
                    <a href="https://www.instagram.com/${profesor.instagram || ''}/" target="_blank" class="btn btn-outline-dark rounded-circle fs-5 social-btn-inv"><i class="bi bi-instagram"></i></a>
                    <a href="https://es.linkedin.com/in/${profesor.linkedin || ''}/" target="_blank" class="btn btn-outline-dark rounded-circle fs-5 social-btn-inv"><i class="bi bi-linkedin"></i></a>
                </div>
            </div>
        </div>`
}

function cargarProfesores() {
    $.ajax({
        url: "php/listarProfesores.php",
        type: "POST",
        dataType: "json",
        success: function (respuesta) {
            let profesores = respuesta.success
            let html = ""
            for (const profesor of profesores) {
                html += crearCartaProfesor(profesor)
                arrayProfesores.push(profesor)
            }
            $("#listaProfesores").html(html)
        },
        error: function () {
            console.log("Error al cargar la lista de los profesores")
        },
    })
}

// Cursos
function crearCartaCurso(curso) {
    return `
        <div class="team-card col-lg-4 mb-4 transition" data-id='${curso.id}'>
            <div class="card h-100 shadow border-0">
                <img class="card-img-top" src="${curso.imagen_portada}" alt="${curso.titulo}">
                <div class="card-body py-2 px-4">
                    <p class="card-text mb-0">${curso.descripcion}</p>
                </div>
                <div class="card-footer p-4 pt-0 bg-transparent border-top-0">
                    <div class="d-flex align-items-end justify-content-between">
                        <div class="d-flex align-items-center">
                            <img class="rounded-circle me-3 w-25" src="assets/images/${curso.foto_perfil}" alt="${curso.titulo}">
                            <div class="mb-4">
                                <p class="fw-bold">${curso.titulo}</p>
                                <p class="fw-bold">Precio: ${curso.precio}<i class="bi bi-currency-euro"></i></p>
                                <p class="text-muted">Nivel: <i class="bi bi-graph-up-arrow"></i> <span class="fw-bold">${curso.nivel}</span></p>
                                <button type="button" class="btn btn-danger position-absolute end-0 bottom-0 m-3 btn-add-cesta" data-id="${curso.id}">
                                    Añadir a la cesta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}

function cargarCursos() {
    $.ajax({
        url: "php/listarCursos.php",
        type: "POST",
        dataType: "json",
        success: function (respuesta) {
            const cursos = respuesta.success || []

            // Normalizamos para que siempre exista arrayCursos y, si hay categorías, se usen
            arrayCursos = cursos.map(c => {
                const ids = (c.categorias_ids || "")
                    .toString()
                    .split(",")
                    .map(x => x.trim())
                    .filter(Boolean)

                return { ...c, categorias_ids: ids };
            })

            renderListaCursos(arrayCursos)
            renderFiltroCategorias()
        },
        error: function (xhr, status, err) {
            console.log("Error al cargar la lista de los cursos", xhr, status, err)
        },
    })
}

function renderListaCursos(lista) {
    let html = ""
    for (const curso of lista) {
        html += crearCartaCurso(curso)
    }
    $("#listaCursos").html(html)
}

function renderFiltroCategorias() {
    const $wrap = $("#filtroCategoriasCursos")
    if (!$wrap.length) return

    $.getJSON("php/listarCategorias.php", function (resp) {
        const cats = (resp && (resp.success || resp.categorias)) || []

        let html = `
            <button type="button"
                    class="btn btn-sm btn-danger filtro-categoria active"
                    data-cat="">
                Todas
            </button>
        `

        html += cats.map(c => `
            <button type="button"
                    class="btn btn-sm btn-outline-secondary filtro-categoria"
                    data-cat="${c.id}">
                ${c.nombre}
            </button>
        `).join("")

        $wrap.html(html)
    })
}

// Click en botones de categoría
$(document).on("click", ".filtro-categoria", function () {
    const catId = $(this).data("cat").toString()

    $(".filtro-categoria").removeClass("btn-danger active").addClass("btn-outline-secondary")

    $(this).removeClass("btn-outline-secondary").addClass("btn-danger active")

    if (!catId) {
        renderListaCursos(arrayCursos)
        return
    }

    const filtrados = arrayCursos.filter(curso => {
        const ids = curso.categorias_ids || []
        return ids.includes(catId)
    })

    renderListaCursos(filtrados)
})

// Cesta
function crearCartaCesta(curso) {
    return `
        <div class="card mb-3 shadow-sm" data-id-curso="${curso.id}">
            <div class="row g-0">
                <div class="col-4">
                    <img src="${curso.imagen_portada || curso.imagen || ''}" class="img-fluid rounded-start h-100 object-fit-cover" alt="Imagen de ${curso.titulo}">
                </div>
                <div class="col-8">
                    <div class="card-body py-2">
                        <h6 class="card-title mb-1">${curso.titulo}</h6>
                        <p class="mb-2 small text-muted">Precio: <strong>${curso.precio}<i class="bi bi-currency-euro"></i></strong></p>
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-sm btn-outline-danger eliminarCard" data-idcurso="${curso.id}"><i class="bi bi-trash"></i> Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

function renderCesta() {
    const cont = $("#contenidoCestaCanvas")
    if (!cursosCarrito.length) {
        cont.html('<h6 class="text-muted">Tu cesta está vacía.</h6>')
        return
    }
    const html = cursosCarrito.map(crearCartaCesta).join("")
    cont.html(html + '<button id="comprar" type="button" class="btn btn-success w-100 mt-2">Confirmar compra</button>')
}

$(document).on("click", ".btn-add-cesta", function (e) {
    e.preventDefault()
    const idCurso = parseInt($(this).data("id"));
    if (!idCurso){
        return
    }
    if (cursosCarrito.some(c => parseInt(c.id) == idCurso)) {
        openOffcanvas("cestaCanvas")
        return
    }

    const curso = arrayCursos.find(c => parseInt(c.id) == idCurso);
    if (curso) {
        cursosCarrito.push({
            id: curso.id,
            titulo: curso.titulo,
            imagen_portada: curso.imagen_portada,
            precio: curso.precio
        })
    } else {
        // fallback mínimo
        const $card = $(this).closest(".card");
        cursosCarrito.push({
            id: idCurso,
            titulo: ($card.find(".fw-bold").first().text() || "Curso").trim(),
            imagen_portada: $card.find(".card-img-top").attr("src") || "",
            precio: parsePrecioFromCard($card),
        });
    }

    $(this).text("En la cesta").removeClass("btn-danger").addClass("btn-secondary")
    renderCesta()
    openOffcanvas("cestaCanvas")
})

$(document).on("click", ".eliminarCard", function () {
    const idCurso = parseInt($(this).data("idcurso"))
    cursosCarrito = cursosCarrito.filter(c => parseInt(c.id) != idCurso)
    $(`.btn-add-cesta[data-id="${idCurso}"]`).text("Añadir a la cesta").removeClass("btn-secondary").addClass("btn-danger")
    renderCesta()
})

// Mostrar cesta
$(document).on("click", "#btnCesta", function () {
    renderCesta()
    openOffcanvas("cestaCanvas")
})

// Comprar
$(document).on("click", "#comprar", function () {
    const $btn = $(this)
    const usuarioRaw = localStorage.getItem("usuarioLoggeado")
    if (!usuarioRaw) {
        $("#alertErrorCompra").fadeIn().delay(3000).fadeOut()
        return
    }
    const user = JSON.parse(usuarioRaw)
    const usuarioId = user.id || null
    if (!usuarioId) {
        $("#alertErrorCompra").fadeIn().delay(3000).fadeOut()
        return
    }
    if (!Array.isArray(cursosCarrito) || cursosCarrito.length == 0) {
        return
    }

    // Evitar dobles clics
    $btn.prop("disabled", true).text("Procesando...")

    // Dispara una petición por curso
    const peticiones = cursosCarrito.map(curso => {
        return $.ajax({
            url: "php/insertInscripcion.php",
            method: "POST",
            dataType: "json",
            data: { usuario_id: usuarioId, curso_id: curso.id }
        })
    })

    // Esperar a que terminen todas
    $.when.apply($, peticiones)
        .done(function () {
            $("#alertCompra").fadeIn().delay(3000).fadeOut()

            // Vaciar cesta en memoria y UI
            cursosCarrito = []
            renderCesta()

            // Cerrar offcanvas
            const oc = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("cestaCanvas"))
            if (oc) {
                oc.hide()
            }

            // Restaurar los botones "Añadir a la cesta" del grid
            $(".btn-add-cesta.btn-secondary").each(function () {
                $(this).text("Añadir a la cesta").removeClass("btn-secondary").addClass("btn-danger")
            })
        }).fail(function (xhr) {
            console.error("Error al inscribir:", xhr && xhr.responseText)
            $("#alertErrorCompra").text("Ha ocurrido un error al procesar la compra").fadeIn().delay(3000).fadeOut()
        }).always(function () {
            $btn.prop("disabled", false).text("Confirmar compra")
        })
})

// Precios: helpers de resumen y toggle anual
function obtenerPlanSeleccionadoLS() {
    try {
        const raw = localStorage.getItem("usuarioLoggeado")
        if (raw) {
            const u = JSON.parse(raw)
            if (u && (u.plan_seleccionado || u.plan)) {
                return (u.plan_seleccionado || u.plan)
            }
        }
    } catch {
        console.log("Error leyendo plan seleccionado de usuario loggeado")
    }
    const p = localStorage.getItem("planSeleccionado")
    return p || "gratis"
}

function precioBaseDePlan(plan) {
    if (plan == "gratis") {
        return 0
    }
    const $span = $(`[data-plan='${plan}'] .precio-num`)
    if (!$span.length) {
        return 0
    }
    const baseAttr = $span.attr("data-precio-base")
    if (baseAttr != null && baseAttr != "") return parseInt(baseAttr) || 0
    const t = ($span.text() || "").replace(/[^\d.,]/g, "").replace(",", ".")
    const n = parseInt(t)
    return isNaN(n) ? 0 : n
}

function actualizarPreciosSegunToggle() {
    const anual = $("#toggleAnual").prop("checked")

    $(".precio-num").each(function () {
        const $el = $(this)
        const baseAttr = $el.attr("data-precio-base")
        let base = 0

        //  Usar data-precio-base cuando exista y no esté vacío
        if (baseAttr != null && baseAttr != "") {
            base = parseInt(baseAttr) || 0
        } else {
            const t = ($el.text() || "").replace(/[^\d.,]/g, "").replace(",", ".")
            base = parseInt(t) || 0
        }

        const valor = anual ? base * 10 : base // anual = 10x
        $el.text(String(valor))
    })

    actualizarResumenPlan()
}

function actualizarResumenPlan() {
    const plan = obtenerPlanSeleccionadoLS();
    const anual = $("#toggleAnual").prop("checked")
    const base = precioBaseDePlan(plan)
    const precio = anual ? base * 10 : base
    $("#resumenPlanNombre").text(plan.charAt(0).toUpperCase() + plan.slice(1))
    $("#resumenPlanPrecio").text(precio)
}

function resaltarPlan(plan) {
    $("[data-plan]").removeClass("border-primary shadow-lg")
    $(`[data-plan='${plan}']`).addClass("border-primary shadow-lg")
}

function cargarPlanUsuario() {
    const raw = localStorage.getItem("usuarioLoggeado")
    try {
        const user = raw ? JSON.parse(raw) : null
        if (user && user.plan_seleccionado) {
            resaltarPlan(user.plan_seleccionado)
            actualizarResumenPlan()
            return
        }
        const planLocal = localStorage.getItem("planSeleccionado")
        if (planLocal) {
            resaltarPlan(planLocal)
            actualizarResumenPlan()
        }
    } catch (e) {
        console.error("Error cargando plan de usuario:", e)
    }
}

function seleccionarPlan(plan) {
    const raw = localStorage.getItem("usuarioLoggeado") || "{}"
    const user = JSON.parse(raw)

    if (user && (user.ID || user.id)) {
        $.ajax({
            url: "php/guardarPlan.php",
            type: "POST",
            dataType: "json",
            data: { usuario_id: user.ID || user.id, plan },
            success: function (resp) {
                if (resp && resp.ok) {
                    localStorage.setItem(
                        "usuarioLoggeado",
                        JSON.stringify({ ...user, plan_seleccionado: plan })
                    )
                    resaltarPlan(plan)
                    $("#alertCorrectoForm").fadeIn().delay(2500).fadeOut()
                } else {
                    $("#alertFalloForm").fadeIn().delay(2500).fadeOut()
                }
            },
            error: function () {
                $("#alertFalloForm").fadeIn().delay(2500).fadeOut()
            },
        })
    } else {
        localStorage.setItem("planSeleccionado", plan)
        resaltarPlan(plan)
    }
}

// Botones "Elegir plan"
$(document).on("click", ".btn-elegir-plan", function () {
    const plan = $(this).data("plan")
    if (!plan) {
        return
    }
    seleccionarPlan(plan)
})

// Toggle mensual/anual
$(document).on("change", "#toggleAnual", function () {
    actualizarPreciosSegunToggle()
})

// Perfil: mostrar opciones admin en menú móvil si procede
function rolUsuarioLS() {
    try {
        const raw = localStorage.getItem("usuarioLoggeado")
        if (!raw) return null
        const u = JSON.parse(raw)
        const r = u && (u.tipo || u.rol || u.role)
        return r ? String(r).toLowerCase() : null
    } catch {
        return null
    }
}

function exponerOpcionesAdminSiProcede() {
    if (!/perfil\.html(\?|$)/i.test(location.pathname)) return
    const rol = rolUsuarioLS()
    if (rol == "profesor" || rol == "admin") {
        const $items = $('[data-section="modificar-curso"], [data-section="mostrar-alumnos"]')
        $items.removeClass('d-none')
        $items.closest('li, a, button, .list-group-item').removeClass('d-none')
        $('#seccion-admin').removeClass('d-none') // si existe ese contenedor
    }
}

// Inicio automático al cargar el DOM
$(function () {
    initVideo()
    initLogin()
    initCerrarSesion()
    cargarProfesores()
    cargarCursos()
    cargarPlanUsuario()
    initTogglePassword()
    initScrollToTop()
    actualizarPreciosSegunToggle()
    exponerOpcionesAdminSiProcede()
})

// Debug opcional
function mostrarLocalStorage() {
    let cadena = ""
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i)
        const valor = localStorage.getItem(clave)
        cadena += `<h5>Clave: ${clave} - Valor: ${valor}</h5>\n`
    }
    console.log(cadena)
    $("#info").html(cadena)
}

function mostrarEmailsLocalStorage() {
    let emails = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.includes("@")) {
            emails.push(key)
        }
    }
    console.log(emails)
    return emails
}
