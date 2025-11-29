/// <reference types="jquery" />

$(function () {
    // Filtro simple para el sidebar de lecciones
    document.addEventListener('input', function (e) {
        if (e.target && e.target.id == 'filterLessons') {
            const term = e.target.value.toLowerCase()
            document.querySelectorAll('#leccionesList .list-group-item').forEach(function (item) {
                const text = item.textContent.toLowerCase()
                item.classList.toggle('d-none', !text.includes(term))
            })
        }
    })

    try {
        const raw = localStorage.getItem('usuarioLoggeado');
        if (!raw) {
            window.location.href = '/'
            return
        }
        const user = JSON.parse(raw)
        // acepta ID o id
        const uid = user && (user.id || user.ID)
        if (!uid) {
            window.location.href = '/'
            return
        }
        // guarda en memoria global por si se necesita
        window.usuarioActual = user
    } catch (e) {
        window.location.href = '/'
    }

    function getJson(url, data) {
        return $.getJSON(url, data || {}).catch(function () { return null })
    }

    function showAdminMsg(txt, type) {
        const $a = $('#adminMsg')
        if (!$a.length) {
            return
        }
        $a.removeClass('d-none alert-success alert-danger alert-info alert-warning').addClass('alert-' + (type || 'success')).text(txt || '')
        setTimeout(() => $a.addClass('d-none'), 4000)
    }

    // Secciones y navegación
    let SECTIONS = {
        panel: '#seccion-panel',
        cursos: '#seccion-cursos',
        certificados: '#seccion-certificados',
        ajustes: '#seccion-ajustes',
        alumnos: '#seccion-alumnos'
    }

    function resetDynamicContent() {
        // Contenedores de rejillas
        $('#misCursos').empty()
        $('#listaCertificados').empty()

        // Zona de curso/lecciones
        $('#leccionesList').empty()
        $('#tituloCursoActual').text('').removeAttr('data-curso-id')

        $('#tituloLeccion').text('')
        $('#contenidoLeccion').empty().html('<div class="text-muted">Selecciona una lección…</div>')

        $('#videoIframe').attr('src', '')
        $('#videoWrapper').addClass('d-none')
    }

    function showOnlySection(sectionSelector) {
        $('.seccion-perfil').addClass('d-none')
        $('#seccion-curso').addClass('d-none')
        $('#seccion-ajustes').addClass('d-none')
        $('#seccion-alumnos').addClass('d-none')

        const $section = $(sectionSelector)

        // Mostrar la sección solicitada
        $section.removeClass('d-none')

        if ($section.hasClass('tab-pane')) {
            const $tabContent = $section.closest('.tab-content')
            if ($tabContent.length) {
                $tabContent.find('.tab-pane').removeClass('show active')
            }
            $section.addClass('show active')
        }

        // Marca activo en los botones del sidebar / offcanvas
        $('.js-nav').removeClass('active')
        Object.keys(SECTIONS).forEach(function (key) {
            if (SECTIONS[key] == sectionSelector) {
                $('.js-nav[data-section="' + key + '"]').addClass('active')
            }
        })
    }

    // Visibilidad de administración (escritorio + móvil)
    function applyAdminVisibility() {
        let visible = false
        try {
            const u = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
            const t = u && (u.tipo || u.rol || u.role)
            visible = t && (String(t).toLowerCase() == 'profesor' || String(t).toLowerCase() == 'admin')
        } catch (e) {
            console.log("Error al leer usuario loggeado:", e)
        }

        // Sidebar de escritorio
        $('#seccion-admin').toggleClass('d-none', !visible)
        // Sidebar móvil (offcanvas)
        $('#offcanvas-admin').toggleClass('d-none', !visible)
    }

    function navigateTo(sectionKey) {
        let selector = SECTIONS[sectionKey] || '#seccion-panel'
        resetDynamicContent()
        showOnlySection(selector)

        if (sectionKey == 'panel') {
            loadKpis()
        } else if (sectionKey == 'cursos') {
            loadMyCourses()
        } else if (sectionKey == 'certificados') {
            loadCertificates()
        } else if (sectionKey == 'ajustes') {
            initAccountSettingsForm()
        }
    }

    // Router unificado (sidebar escritorio + offcanvas móvil)
    $(document).on('click', '.js-nav,[data-bs-target^="#seccion-"]', function (evt) {
        let $el = $(this)
        let explicitSection = $el.data('section')
        let bsTarget = $el.data('bsTarget')
        if (!explicitSection && !bsTarget) {
            return
        }
        evt.preventDefault()

        let sectionKey = explicitSection || String(bsTarget).replace('#seccion-', '')
        navigateTo(sectionKey)

        // Cerrar el offcanvas en móvil si procede
        let offcanvasEl = document.getElementById('sidebarOffcanvas')
        if (window.bootstrap && offcanvasEl) {
            let off = bootstrap.Offcanvas.getInstance(offcanvasEl)
            if (off) {
                off.hide()
            }
        }
    })

    // KPIs (panel)
    function paintKpis(values) {
        let activos = parseInt(values.cursos_activos || 0)
        let completados = parseInt(values.cursos_completados || 0)
        let pendientes = parseInt(values.lecciones_pendientes || 0)
        $('#kpi-activos').text(activos)
        $('#kpi-completados').text(completados)
        $('#kpi-pendientes').text(pendientes)
    }

    async function computeKpisFromClient() {
        let loggedUser = null
        try {
            loggedUser = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
        } catch (e) {
            console.log("Usuario no loggeado")
        }

        let query = {}

        if (loggedUser) {
            if (loggedUser.id) {
                query = { user_id: loggedUser.id }
            } else if (loggedUser.ID) {
                query = { user_id: loggedUser.ID }
            }
        }

        let coursesResp = await getJson('php/usuario_mis_cursos.php', query)
        let userCourses = []

        if (coursesResp && Array.isArray(coursesResp.cursos)) {
            userCourses = coursesResp.cursos
        } else if (coursesResp && Array.isArray(coursesResp.success)) {
            userCourses = coursesResp.success
        } else {
            userCourses = []
        }

        if (!userCourses.length) {
            paintKpis({ cursos_activos: 0, cursos_completados: 0, lecciones_pendientes: 0 })
            return
        }

        let completedCourses = 0
        let pendingLessonsTotal = 0

        for (let i = 0; i < userCourses.length; i++) {
            let course = userCourses[i]
            let courseId = course.id != null ? course.id : course.id_curso

            // Asegura progreso de servidor en cache para KPIs
            await cargarProgresoServidor(courseId)

            let lessonsResp = await getJson('php/lecciones_listar.php', { curso_id: courseId })
            let lessons = []

            if (lessonsResp && Array.isArray(lessonsResp.lecciones)) {
                lessons = lessonsResp.lecciones
            } else if (lessonsResp && Array.isArray(lessonsResp.success)) {
                lessons = lessonsResp.success
            } else {
                lessons = []
            }
            if (!lessons.length) {
                continue
            }

            let completedInCourse = 0
            for (let j = 0; j < lessons.length; j++) {
                let lesson = lessons[j]
                if (estaLeccionCompletada(courseId, lesson.id)) completedInCourse++
            }

            if (completedInCourse == lessons.length) completedCourses++
            pendingLessonsTotal += (lessons.length - completedInCourse)
        }

        let activeCourses = Math.max(0, userCourses.length - completedCourses)
        paintKpis({
            cursos_activos: activeCourses,
            cursos_completados: completedCourses,
            lecciones_pendientes: pendingLessonsTotal
        })
    }

    async function loadKpis() {
        try {
            const panelResp = await getJson('php/usuario_panel.php')
            if (panelResp && panelResp.panel) {
                paintKpis(panelResp.panel)
            }
        } catch (e) {
            console.log("Error al cargar los Kpis")
        }
        await computeKpisFromClient()
    }

    // Progreso en servidor (cache + helpers)
    const progresoServidorCache = new Map()  // { [cursoId]: Set<leccionId> }

    function cargarProgresoServidor(cursoId) {
        const key = String(cursoId)
        // Si ya lo tenemos cargado, devuelve promesa resuelta
        if (progresoServidorCache.has(key)) return Promise.resolve()

        return $.getJSON('php/progreso_estado.php', { curso_id: cursoId })
            .then(function (resp) {
                if (resp && resp.ok) {
                    const setIds = new Set(resp.completadas || [])
                    progresoServidorCache.set(key, setIds)
                    // Sincroniza con localStorage
                    try {
                        const lsKey = `progreso_curso_${cursoId}`
                        const ls = JSON.parse(localStorage.getItem(lsKey) || '{}')
                        ls.completadas = Array.from(setIds)
                        localStorage.setItem(lsKey, JSON.stringify(ls))
                    } catch (e) {
                        console.log("Error al actualizar el estado de los progresos")
                    }
                }
            })
            .catch(function () {
                // Ignora errores de red, seguiremos con localStorage
            })
    }

    function estaLeccionCompletada(cursoId, leccionId) {
        const set = progresoServidorCache.get(String(cursoId))
        if (set && set.has(parseInt(leccionId))) {
            return true
        }

        // Fallback a localStorage
        try {
            const key = `progreso_curso_${cursoId}`
            const ls = JSON.parse(localStorage.getItem(key) || '{}')
            const arr = []
            if (Array.isArray(ls.completadas)) {
                arr = ls.completadas
            } else {
                arr = []
            }
            return arr.map(Number).includes(parseInt(leccionId))
        } catch (e) {
            return false
        }
    }

    // Mis cursos (listado)
    function renderCourseCard(course) {
        let courseId = (course.id != null) ? course.id : (course.id_curso != null ? course.id_curso : 0)
        let cover = course.imagen_portada || 'assets/images/courses/placeholder.webp'
        let teacherAvatar = (course.foto_perfil && String(course.foto_perfil).trim()) ? course.foto_perfil : 'assets/images/person.svg'
        let level = course.nivel || ''
        let durationText = (course.duracion != null && course.duracion != '') ? (course.duracion + 'h') : ''
        let teacherName = course.profesor || 'Instructor'

        return `
            <div class="col-lg-4 mb-2">
                <div class="card h-100 shadow border-0">
                    <img class="card-img-top" src="${cover}" alt="">
                    <div class="card-body py-2 px-4">
                        <h5 class="card-title mb-2">${course.titulo || ''}</h5>
                        <p class="card-text small mb-0">${course.descripcion || ''}</p>
                        </div>
                    <div class="card-footer p-3 bg-transparent border-top-0">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <img class="rounded-circle me-2" src="assets/images/${teacherAvatar}" alt="Profesor" width="40" height="40">
                                <div class="fw-bold me-3">${teacherName}</div>
                            <div class="small text-muted">
                                ${level}${level && durationText ? ' · ' : ''}${durationText}
                            </div>
                            </div>
                                <button class="btn btn-danger open-curso"
                                data-curso-id="${courseId}"
                                data-curso-titulo="${course.titulo || ''}">
                                Cursar
                                </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    async function loadMyCourses() {
        let $grid = $('#misCursos').empty()

        let loggedUser = null
        try {
            loggedUser = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
        } catch (e) {
            console.log("Usuario no loggeado al cargar los cursos")
        }

        let query = (loggedUser && (loggedUser.id || loggedUser.ID)) ? { user_id: (loggedUser.id || loggedUser.ID) } : {}

        let resp = await getJson('php/usuario_mis_cursos.php', query)
        let list = []
        if (resp && Array.isArray(resp.cursos)) {
            list = resp.cursos
        } else if (resp && Array.isArray(resp.success)) {
            list = resp.success
        } else {
            list = []
        }

        if (!list.length) {
            $grid.html('<div class="card my-4">\
                            <div class="card-body">\
                                <p class="text-muted">Aún no estás inscrito en ningún curso.</p>\
                            </div>\
                        </div>')
            return
        }

        $grid.html(list.map(renderCourseCard).join(''))
    }

    // Certificados
    function renderCertificateCard(cert) {
        let dateText = (cert && cert.fecha ? String(cert.fecha).slice(0, 10) : '')
        let url = (cert && cert.certificado_url) ? cert.certificado_url : '#'

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow border-0">
                    <div class="card-body">
                        <h6 class="card-title">${cert && cert.titulo ? cert.titulo : ''}</h6>
                        <p class="text-muted small mb-3">Fecha: ${dateText || '-'}</p>
                        <a class="btn btn-outline-danger" target="_blank" rel="noopener" href="${url}">
                            Ver / Descargar
                        </a>
                    </div>
                </div>
            </div>
        `
    }

    async function loadCertificates() {
        let $zone = $('#listaCertificados').empty()
        let resp = await getJson('php/certificados_listar.php')

        let list = Array.isArray(resp && resp.certificados) ? resp.certificados : (Array.isArray(resp && resp.success) ? resp.success : [])

        if (!list.length) {
            $zone.html('<div class="card my-4">\
                            <div class="card-body">\
                                <p class="text-muted">Aún no tienes certificados.</p>\
                            </div>\
                        </div>')
            return
        }
        $zone.html(list.map(renderCertificateCard).join(''))
    }

    // Ajustes de cuenta
    function initAccountSettingsForm() {
        let $form = $('#formAjustes')
        if (!$form.length) {
            return
        }

        $form.off('submit').on('submit', async function (evt) {
            evt.preventDefault()
            let result = await $.post(
                'php/usuario_cuenta_actualizar.php',
                $form.serialize(),
                null,
                'json'
            ).catch(function () {
                return null
            })

            if (result && result.ok) {
                $("#alertDatosActualizados").fadeIn().delay(3000).fadeOut()
            } else {
                console.log((result && result.error) ? result.error : 'No se pudo guardar')
            }
        })
    }

    // Lecciones: LS, progreso, notas, quiz, playground
    function getLoggedUserId() {
        try {
            let u = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
            return (u && (u.id || u.ID)) ? (u.id || u.ID) : null
        } catch (e) {
            return null
        }
    }

    function storageKey(base, courseId, lessonId) {
        let uid = getLoggedUserId() || 'anon'
        return 'fbo:' + base + ':u' + uid + ':c' + courseId + ':l' + lessonId
    }

    function setLessonDone(courseId, lessonId, done) {
        localStorage.setItem(storageKey('done', courseId, lessonId), done ? '1' : '0')
    }

    function isLessonDone(courseId, lessonId) {
        // Primero servidor (si hay cache)
        const set = progresoServidorCache.get(String(courseId))
        if (set && set.has(parseInt(lessonId))) return true

        // Fallback a localStorage
        return localStorage.getItem(storageKey('done', courseId, lessonId)) == '1'
    }

    function setLessonNotes(courseId, lessonId, text) {
        localStorage.setItem(storageKey('notes', courseId, lessonId), text || '')
    }
    function getLessonNotes(courseId, lessonId) {
        return localStorage.getItem(storageKey('notes', courseId, lessonId)) || ''
    }

    function updateCourseProgressBar(courseId) {
        let lessonsArray = Object.values(window.__LECCIONES_CACHE__ || {})
        let completed = lessonsArray.filter(function (l) { return isLessonDone(courseId, l.id) }).length
        let percentage = lessonsArray.length ? Math.round((completed * 100) / lessonsArray.length) : 0

        $('#progresoCursoBar').css('width', percentage + '%').attr('aria-valuenow', percentage)
        $('#progresoCursoPct').text(percentage + '%')
    }

    function refreshCompleteButtonState(courseId, lessonId) {
        let completed = isLessonDone(courseId, lessonId)
        $('#btnToggleCompletada')
            .toggleClass('btn-success', completed)
            .toggleClass('btn-outline-success', !completed)
            .html(completed ? '<i class="bi bi-check2-circle me-1"></i> Lección completada' : '<i class="bi bi-check2-circle me-1"></i> Marcar lección como completada')
    }

    // Quiz
    window.QUIZZES = window.QUIZZES || {}
    function defaultQuizFor(lesson) {
        let title = lesson.titulo || 'esta lección'
        return [
            { q: '¿Has entendido el objetivo principal de "' + title + '"?', options: ['Sí', 'No'], a: 0 },
            { q: '¿Qué vas a hacer a continuación?', options: ['Practicar un ejemplo', 'Seguir adelante'], a: 0 }
        ]
    }
    function renderQuiz(courseId, lesson) {
        let key = courseId + ':' + lesson.id
        let items = window.QUIZZES[key] || defaultQuizFor(lesson)
        let $quizZone = $('#quizZone').empty()

        items.forEach(function (it, index) {
            let inputName = ['q', courseId, lesson.id, index].join('_')

            let optionsHtml = it.options.map(function (option, j) {
                let id = inputName + '_' + j
                return [
                    '<div class="form-check mb-1">',
                    '<input class="form-check-input" type="radio" name="', inputName, '" id="', id, '" value="', j, '">',
                    '<label class="form-check-label" for="', id, '">', option, '</label>',
                    '</div>'
                ].join('')
            }).join('')

            $quizZone.append('<div class="mb-3">' + '<div class="fw-semibold mb-1">' + (index + 1) + '. ' + it.q + '</div>' + optionsHtml + '</div>')
        })

        $('#btnQuizCheck').off('click').on('click', function () {
            let correct = 0, total = items.length
            items.forEach(function (it, i) {
                let name = ['q', courseId, lesson.id, i].join('_')
                let selected = $('input[name="' + name + '"]:checked').val()
                if (selected != null && parseInt(selected) == parseInt(it.a)) correct++
            })

            $('#quizFeedback').removeClass('text-danger text-success').addClass(correct == total ? 'text-success' : 'text-danger').text('Aciertos: ' + correct + '/' + total)
        })

        $('#btnQuizReset').off('click').on('click', function () {
            $('#quizZone input[type="radio"]').prop('checked', false)
            $('#quizFeedback').text('')
        })
    }

    function toHtml(text) {
        return text ? String(text).replace(/\n/g, '<br>') : ''
    }

    function youtubeEmbed(url) {
        if (!url) {
            return null
        }
        let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/i)
        return m ? ('https://www.youtube.com/embed/' + m[1]) : null
    }

    function renderLesson(lesson) {
        $('#tituloLeccion').text(lesson.titulo || '').attr('data-leccion-id', lesson.id)

        let emb = youtubeEmbed(lesson.video_url)
        if (emb) {
            $('#videoIframe').attr('src', emb)
            $('#videoWrapper').removeClass('d-none')
        } else {
            $('#videoIframe').attr('src', '')
            $('#videoWrapper').addClass('d-none')
            if (lesson.video_url) {
                $('#contenidoLeccion').append('<p class="mt-3"><a href="' + lesson.video_url + '" target="_blank" rel="noopener">Ver vídeo</a></p>')
            }
        }

        $('#contenidoLeccion').html(
            lesson.contenido_html || toHtml(lesson.contenido) || '<p class="text-muted mb-0">Esta lección no tiene contenido.</p>'
        )

        let courseId = parseInt($('#tituloCursoActual').data('cursoId') || 0)
        let lessonId = parseInt(lesson.id)

        $('#notaLeccion').data({ cursoId: courseId, lessonId: lessonId }).val(getLessonNotes(courseId, lessonId))
        $('#btnToggleCompletada').data({ cursoId: courseId, lessonId: lessonId })

        refreshCompleteButtonState(courseId, lessonId)
        updateCourseProgressBar(courseId)
        renderQuiz(courseId, lesson)
    }

    function renderLessonListItem(lesson) {
        let durationBadge = ""

        if (lesson.duracion != null && lesson.duracion != "") {
            durationBadge = '<span class="badge text-bg-secondary ms-2">' + lesson.duracion + ' min</span>'
        } else {
            durationBadge = ""
        }
        let orderPrefix = ""

        if (lesson.orden != null && lesson.orden != "") {
            orderPrefix = lesson.orden + ". "
        } else {
            orderPrefix = ""
        }

        return [
            '<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-lesson-id="', lesson.id, '">',
            '<span class="text-start">', orderPrefix, (lesson.titulo || ('Lección ' + lesson.id)), '</span>', durationBadge, '</button>'
        ].join('')
    }

    async function loadLessonsForCourse(courseId, courseTitle) {
        $('#tituloCursoActual').text(courseTitle || '').attr('data-curso-id', courseId)
        $('#seccion-curso').removeClass('d-none')

        // 1) Trae progreso del servidor para este curso antes de pintar
        await cargarProgresoServidor(courseId)

        let $list = $('#leccionesList').html('<div class="p-3 text-muted">Cargando lecciones…</div>')

        let lessonsResp = await getJson('php/lecciones_listar.php', { curso_id: courseId })
        let lessons = []

        if (lessonsResp && Array.isArray(lessonsResp.lecciones)) {
            lessons = lessonsResp.lecciones
        } else if (lessonsResp && Array.isArray(lessonsResp.success)) {
            lessons = lessonsResp.success
        } else {
            lessons = []
        }

        if (!lessons.length) {
            $list.html('<div class="card my-4">\
                            <div class="card-body">\
                                <p class="text-muted">Este curso aún no tiene lecciones.</p>\
                            </div>\
                        </div>')
            $('#tituloLeccion').text('')
            $('#contenidoLeccion').html('<div class="text-muted">Selecciona un curso con lecciones disponibles.</div>')
            $('#videoIframe').attr('src', '')
            $('#videoWrapper').addClass('d-none')
            updateCourseProgressBar(courseId)
            return
        }

        // Cache de lecciones
        window.__LECCIONES_CACHE__ = {}
        lessons.forEach(function (l) {
            window.__LECCIONES_CACHE__[String(l.id)] = l
        })

        $list.html(lessons.map(renderLessonListItem).join(''))

        // Selecciona y muestra la primera
        let first = lessons[0]
        $('#leccionesList .list-group-item').removeClass('active')
        $('#leccionesList .list-group-item[data-lesson-id="' + first.id + '"]').addClass('active')
        renderLesson(first)
    }

    // Delegados UI
    $(document).on('click', '.open-curso', function (evt) {
        evt.preventDefault()
        showOnlySection('#seccion-curso')
        loadLessonsForCourse($(this).data('cursoId'), $(this).data('cursoTitulo') || '')
    })

    $(document).on('click', '#leccionesList .list-group-item', function (evt) {
        evt.preventDefault()
        let lessonId = String($(this).data('lessonId'))

        $('#leccionesList .list-group-item').removeClass('active')
        $(this).addClass('active')

        let cache = (window.__LECCIONES_CACHE__ || {})
        if (cache[lessonId]) {
            renderLesson(cache[lessonId])
            if (window.innerWidth < 768) {
                $('html,body').animate({ scrollTop: $('#tituloLeccion').offset().top - 16 }, 250)
            }
        }
    })

    $(document).on('click', '.js-volver-cursos', function (evt) {
        evt.preventDefault()
        navigateTo('cursos')
    })

    $(document).on('input', '#notaLeccion', function () {
        let courseId = parseInt($(this).data('cursoId'))
        let lessonId = parseInt($(this).data('lessonId'))
        setLessonNotes(courseId, lessonId, $(this).val())
        $('#notaGuardadaInfo').removeClass('d-none')
        setTimeout(function () { $('#notaGuardadaInfo').addClass('d-none') }, 900)
    })

    $(document).on('click', '#btnPlayRun', function () {
        let html = $('#playHtml').val() || ''
        let css = $('#playCss').val() || ''
        let js = $('#playJs').val() || ''
        let doc = [
            '<!doctype html>',
            '<html><head><meta charset="utf-8"><style>', css, '</style></head>',
            '<body class="p-3">', html, '<script>', js, '<\\/script></body></html>'
        ].join('')
        document.getElementById('playOutput').srcdoc = doc
    })

    // Toggle completada: sincroniza BD y UI
    $(document).off('click.progreso').on('click.progreso', '#btnToggleCompletada', async function () {
        const courseId = parseInt($(this).data('cursoId'))
        const lessonId = parseInt($(this).data('lessonId'))

        const nowCompleted = !isLessonDone(courseId, lessonId)
        setLessonDone(courseId, lessonId, nowCompleted)

        refreshCompleteButtonState(courseId, lessonId)
        updateCourseProgressBar(courseId)

        // Recalcular contadores inmediatamente desde cliente
        await computeKpisFromClient()
    })

    // Alumnos (admin/profesor)
    function tipoUsuarioLS() {
        try {
            const u = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
            const t = u && (u.tipo || u.rol || u.role)
            return t ? String(t).toLowerCase() : null
        } catch {
            return null
        }
    }

    function canSeeAlumnos() {
        const t = tipoUsuarioLS()
        return t == 'profesor' || t == 'admin'
    }

    function isAdmin() {
        return tipoUsuarioLS() == 'admin'
    }

    function isProfesor() {
        return tipoUsuarioLS() == 'profesor'
    }

    function renderAlumnosTabla(alumnos) {
        const $tb = $('#tablaAlumnos tbody')
        const esAdmin = isAdmin()

        if (!Array.isArray(alumnos) || alumnos.length == 0) {
            $tb.html('<tr><td colspan="8" class="text-muted">No hay alumnos todavía.</td></tr>')
            return
        }

        const rows = alumnos.map(a => {
            let id = ''
            if (a) {
                if (a.id != undefined && a.id != null) {
                    id = a.id
                } else if (a.ID != undefined && a.ID != null) {
                    id = a.ID
                } else {
                    id = ''
                }
            }

            let nombre = ''
            if (a && a.nombre) {
                nombre = String(a.nombre).replace(/</g, '&lt;')
            }

            let email = ''
            if (a && a.email) {
                email = String(a.email).replace(/</g, '&lt;')
            }

            let tipo = ''
            if (a) {
                if (a.tipo) tipo = a.tipo.toString().toLowerCase()
                else if (a.rol) tipo = a.rol.toString().toLowerCase()
                else if (a.role) tipo = a.role.toString().toLowerCase()
                else tipo = ''
            }

            let fecha = ''
            if (a && a.fecha_registro) {
                fecha = a.fecha_registro.toString().slice(0, 19).replace('T', ' ')
            }

            let progreso = '-'
            if (a) {
                if (a.progreso_resumen) {
                    progreso = a.progreso_resumen.toString()
                } else if (a.progreso) {
                    progreso = a.progreso.toString()
                } else {
                    progreso = '-'
                }
            }

            let badgeClass = 'secondary'
            if (tipo == 'admin') {
                badgeClass = 'danger'
            } else if (tipo == 'profesor') {
                badgeClass = 'info'
            } else if (tipo == 'estudiante') {
                badgeClass = 'success'
            }


            let tipoHtml = ""
            if (tipo) {
                tipoHtml = `
                    <span class="badge text-bg-${badgeClass} text-uppercase">
                        ${tipo}
                    </span>
                `
            } else {
                tipoHtml = ""
            }

            let acciones = ""
            if (esAdmin) {
                acciones = `
                    <div class="d-flex justify-content-end gap-1">
                        <button type="button"
                                class="btn btn-outline-secondary btn-sm btnEditarAlumno"
                                data-id="${id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button"
                                class="btn btn-outline-danger btn-sm btnEliminarUsuario"
                                data-id="${id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `
            } else {
                acciones = ""
            }


            return `
                <tr data-id="${id}">
                    <td>${id}</td>
                    <td>${nombre}</td>
                    <td>${email}</td>
                    <td>${tipoHtml}</td>
                    <td>${fecha || '-'}</td>
                    <td>-</td>
                    <td>${progreso}</td>
                    <td>${acciones}</td>
                </tr>
            `
        })

        $tb.html(rows)
    }

    function renderAlumnosProfesorTabla(alumnosCurso) {
        const $tb = $('#tablaAlumnos tbody')

        if (!Array.isArray(alumnosCurso) || alumnosCurso.length == 0) {
            $tb.html('<tr><td colspan="8" class="text-muted">No hay alumnos inscritos en tus cursos.</td></tr>')
            return
        }

        const rows = alumnosCurso.map(function (r) {
            let id = ''
            if (r) {
                if (r.alumno_id != undefined && r.alumno_id != null) {
                    id = r.alumno_id
                } else if (r.id != undefined && r.id != null) {
                    id = r.id
                } else {
                    id = ''
                }
            }

            let nombre = ''
            if (r) {
                if (r.nombre) {
                    nombre = r.nombre.toString()
                } else if (r.alumno_nombre) {
                    nombre = r.alumno_nombre.toString()
                } else {
                    nombre = ''
                }
            }

            let email = ''
            if (r) {
                if (r.email) {
                    email = r.email.toString()
                } else if (r.alumno_email) {
                    email = r.alumno_email.toString()
                } else {
                    email = ''
                }
            }

            let tipoRaw = 'estudiante'
            if (r) {
                if (r.tipo) {
                    tipoRaw = r.tipo.toString().toLowerCase()
                } else if (r.alumno_tipo) {
                    tipoRaw = r.alumno_tipo.toString().toLowerCase()
                } else {
                    tipoRaw = 'estudiante'
                }
            }

            let fecha = ''
            if (r) {
                if (r.fecha_registro) {
                    fecha = r.fecha_registro.toString().slice(0, 19).replace('T', ' ')
                } else if (r.fecha_inscripcion) {
                    fecha = r.fecha_inscripcion.toString().slice(0, 19).replace('T', ' ')
                } else {
                    fecha = ''
                }
            }

            let curso = ''
            if (r) {
                if (r.curso) {
                    curso = r.curso.toString()
                } else if (r.curso_titulo) {
                    curso = r.curso_titulo.toString()
                } else {
                    curso = ''
                }
            }

            let cursoId = ''
            if (r && r.curso_id) {
                cursoId = r.curso_id
            }

            let progNum = 0
            if (r && r.progreso) {
                progNum = parseInt(r.progreso, 10)
            }

            let progreso = 0
            if (!isNaN(progNum)) {
                progreso = Math.max(0, Math.min(100, progNum))
            } else {
                progreso = 0
            }

            let badgeClass = 'secondary'

            if (tipoRaw == 'admin') {
                badgeClass = 'danger'
            } else if (tipoRaw == 'profesor') {
                badgeClass = 'info'
            } else if (tipoRaw == 'estudiante') {
                badgeClass = 'success'
            }

            let tipoHtml = `
                <span class="badge text-bg-${badgeClass} text-uppercase">
                    ${tipoRaw}
                </span>
                `

            return `
                <tr data-id="${id}" data-curso-id="${cursoId}">
                    <td>${id}</td>
                    <td>${nombre}</td>
                    <td>${email}</td>
                    <td>${tipoHtml}</td>
                    <td>${fecha || '-'}</td>
                    <td>${curso}</td>
                    <td>
                        <div class="progress h-25" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progreso}">
                            <div class="progress-bar fw-bolder" style="width:${progreso}%;">
                                ${progreso}%
                            </div>
                        </div>
                    </td>
                    <td class="text-end">
                        <button type="button"
                                class="btn btn-outline-danger btn-sm btnBajaAlumnoCurso"
                                data-alumno-id="${id}"
                                data-curso-id="${cursoId}">
                            <i class="bi bi-person-dash"></i> Dar de baja
                        </button>
                    </td>
                </tr>
                `
        })

        $tb.html(rows)
    }

    async function loadAlumnos() {
        if (!canSeeAlumnos()) {
            $('#seccion-alumnos').addClass('d-none')
            return
        }

        // Mostrar/ocultar botón "Nuevo usuario" según rol (solo admin)
        $('#btnNuevoAlumno').toggleClass('d-none', !isAdmin())

        showOnlySection('#seccion-alumnos')

        const $tbody = $('#tablaAlumnos tbody')
        $tbody.html('<tr><td colspan="8" class="text-muted">Cargando...</td></tr>')

        // ADMIN -> tabla global de usuarios
        if (isAdmin()) {
            try {
                const resp = await $.getJSON('php/admin_alumnos.php')
                let lista = []
                if (resp && Array.isArray(resp.alumnos)) {
                    lista = resp.alumnos
                } 
                else if (resp && Array.isArray(resp.success)) {
                    lista = resp.success
                } 
                else {
                    lista = []
                }

                window.__ALUMNOS_CACHE__ = lista
                renderAlumnosTabla(lista)
            } catch (e) {
                console.error('Error al cargar alumnos (admin)', e)
                $tbody.html('<tr><td colspan="8" class="text-danger">Error al cargar alumnos</td></tr>')
            }
            return
        }

        // PROFESOR -> tabla de cursos con su progreso
        if (isProfesor()) {
            try {
                const usuario = JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null') || {}
                const profesorId = usuario.id || usuario.ID
                if (!profesorId) {
                    $tbody.html('<tr><td colspan="8" class="text-danger">Profesor no válido</td></tr>')
                    return
                }

                const resp = await $.getJSON('php/profesor_alumnos_cursos.php', { profesor_id: profesorId })
                let lista = []

                if (resp && Array.isArray(resp.data)) {
                    lista = resp.data
                } else {
                    lista = []
                }

                window.__ALUMNOS_CACHE__ = lista
                renderAlumnosProfesorTabla(lista)
            } catch (e) {
                console.error('Error al cargar alumnos (profesor)', e)
                $tbody.html('<tr><td colspan="8" class="text-danger">Error al cargar alumnos de tus cursos</td></tr>')
            }
            return
        }

        // Si no es admin ni profesor (caso raro, pero por seguridad)
        $tbody.html('<tr><td colspan="8" class="text-muted">No tienes permisos para ver alumnos.</td></tr>')
    }


    // Click en "Gestionar alumnos" (menú escritorio + móvil)
    $(document).on('click', '[data-section="mostrar-alumnos"]', function (e) {
        e.preventDefault()
        loadAlumnos()
    })

    // Filtro en tiempo real
    $(document).on('input', '#filtroAlumnos', function () {
        const q = $(this).val().toString().toLowerCase().trim()
        const base = window.__ALUMNOS_CACHE__ || []

        let render

        if (isProfesor()) {
            render = renderAlumnosProfesorTabla
        } else {
            render = renderAlumnosTabla
        }

        if (!q) {
            return render(base)
        }

        const filtered = base.filter(a => {
            const nom = (a.nombre || a.alumno_nombre || '').toString().toLowerCase()
            const em = (a.email || a.alumno_email || '').toString().toLowerCase()
            return nom.includes(q) || em.includes(q)
        })

        render(filtered)
    })

    // CRUD admin y profesor (dar de baja alumno)
    // Nuevo usuario
    $(document).on('click', '#btnNuevoAlumno', function () {
        if (!isAdmin()) return

        $('#modalAlumnoAdminLabel').text('Nuevo usuario')
        $('#alumno_id').val('')
        $('#alumno_nombre').val('')
        $('#alumno_email').val('')
        $('#alumno_tipo').val('estudiante')
        $('#alumno_password').val('')
        $('#alumno_accion').val('crear')
        $('#modalAlumnoAdmin').modal('show')
    })

    // Editar usuario
    $(document).on('click', '.btnEditarAlumno', function () {
        if (!isAdmin()) {
            return
        }

        const id = parseInt($(this).data('id'))
        const lista = window.__ALUMNOS_CACHE__ || []
        const a = lista.find(x => (x.id || x.ID) == id)
        if (!a) {
            return
        }

        $('#modalAlumnoAdminLabel').text('Editar usuario')
        $('#alumno_id').val(id)
        $('#alumno_nombre').val(a.nombre || '')
        $('#alumno_email').val(a.email || '')
        $('#alumno_tipo').val((a.tipo || a.rol || a.role || 'estudiante').toLowerCase())
        $('#alumno_password').val('')
        $('#alumno_accion').val('actualizar')
        $('#modalAlumnoAdmin').modal('show')
    })

    // Guardar (crear / actualizar)
    $(document).on('submit', '#formAlumnoAdmin', function (e) {
        e.preventDefault()
        if (!isAdmin()) {
            return
        }
        const formData = $(this).serialize()

        $.post('php/admin_alumnos.php', formData, function (resp) {
            if (resp && (resp.ok || resp.success)) {
                $('#modalAlumnoAdmin').modal('hide')
                loadAlumnos()
            } else {
                showAdminMsg((resp && resp.error) || 'No se ha podido guardar el usuario', 'danger')
            }
        }, 'json').fail(function () {
            showAdminMsg('Error de comunicación con el servidor', 'danger')
        })
    })

    // Acciones desde el sidebar móvil (Administración)
    $(document).on('click', '#offcanvas-admin [data-section="modificar-curso"]', function (e) {
        e.preventDefault()

        // Cierra el offcanvas
        const offEl = document.getElementById('sidebarOffcanvas')
        if (window.bootstrap && offEl) {
            const off = bootstrap.Offcanvas.getInstance(offEl)
            if (off) {
                off.hide()
            }
        }

        // Reutilizamos la lógica de administrador.js disparando el botón del sidebar de escritorio
        $('#seccion-admin [data-section="modificar-curso"]').trigger('click')
    })

    $(document).on('click', '#offcanvas-admin [data-section="mostrar-alumnos"]', function (e) {
        e.preventDefault()

        const offEl = document.getElementById('sidebarOffcanvas')
        if (window.bootstrap && offEl) {
            const off = bootstrap.Offcanvas.getInstance(offEl)
            if (off) {
                off.hide()
            }
        }
        // Usa la función ya existente
        if (typeof loadAlumnos == 'function') {
            loadAlumnos()
        } else {
            // Fallback visual por si el script se carga más tarde
            $('.seccion-perfil').addClass('d-none')
            $('#seccion-alumnos').removeClass('d-none')
        }
    })

    let bajaAlumnoIdProfesor = null
    let bajaCursoIdProfesor  = null

    // Abrir modal de confirmación "Dar de baja" (profesor)
    $(document).on('click', '.btnBajaAlumnoCurso', function () {
        const alumnoId = $(this).data('alumno-id')
        const cursoId  = $(this).data('curso-id')

        if (!alumnoId || !cursoId) {
            return
        }

        bajaAlumnoIdProfesor = alumnoId
        bajaCursoIdProfesor = cursoId

        const modalEl = document.getElementById('modalDarDeBajaUsuarioProfesor')
        if (!modalEl) {
            return
        }

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl)
        modal.show()
    })

        // Confirmar "Dar de baja" en el modal (profesor)
    $(document).on('click', '#btnConfirmDarDeBajaUsuarioProfesor', async function () {
        if (!bajaAlumnoIdProfesor || !bajaCursoIdProfesor) {
            return
        }

        const $btn = $(this)
        $btn.prop('disabled', true).text('Dando de baja...')

        try {
            const resp = await $.ajax({
                url: 'php/profesor_baja_alumno.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    alumno_id: bajaAlumnoIdProfesor,
                    curso_id: bajaCursoIdProfesor
                }
            })

            if (resp && resp.ok) {
                // Cerrar modal
                const modalEl = document.getElementById('modalDarDeBajaUsuarioProfesor')
                const modal = bootstrap.Modal.getInstance(modalEl)
                if (modal) {
                    modal.hide()
                }

                // Reset variables
                bajaAlumnoIdProfesor = null
                bajaCursoIdProfesor = null

                // Recargar la tabla de alumnos del profesor
                if (typeof loadAlumnos == 'function') {
                    loadAlumnos()
                }
            } else {
                showAdminMsg((resp && resp.error) || 'No se ha podido dar de baja al alumno del curso.')
            }
        } catch (e) {
            console.error('Error al dar de baja alumno', e)
        } finally {
            $btn.prop('disabled', false).text('Dar de baja')
        }
    })

    // Visibilidad del sidebar móvil y gating de administración
    function tipoUsuario() {
        try {
            const raw = localStorage.getItem('usuarioLoggeado')
            if (!raw) {
                return null
            }
            const u = JSON.parse(raw)
            let resultado = null
            if (u) {
                let valorRol = null

                if (u.tipo) {
                    valorRol = u.tipo
                } else if (u.rol) {
                    valorRol = u.rol
                } else if (u.role) {
                    valorRol = u.role
                }

                if (valorRol != null) {
                    resultado = String(valorRol).toLowerCase()
                }
            }

            return resultado
        } catch {
            return null
        }
    }

    function inicializarSidebarPerfil() {
        const t = tipoUsuario()
        // Mostrar siempre el botón del menú móvil y el offcanvas
        let btnWrap = document.getElementById('perfilMenuBtnWrap')
        if (btnWrap) {
            btnWrap.classList.remove('d-none')
        }

        let offcanvas = document.getElementById('sidebarOffcanvas')
        if (offcanvas) {
            offcanvas.classList.remove('d-none')
        }

        // Mostrar el bloque de administración SOLO si es profesor/admin
        let adminBlock = document.getElementById('offcanvas-admin')
        if (adminBlock) {
            if (t == 'profesor' || t == 'admin') {
                adminBlock.classList.remove('d-none')
            } else {
                adminBlock.classList.add('d-none')
            }
        }
    }

    // Ejecuta al cargar el DOM (compatible si ya usas jQuery)
    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarSidebarPerfil)
    } else {
        inicializarSidebarPerfil()
    }

    //  Init
    navigateTo('panel')
    applyAdminVisibility()
    window.addEventListener('storage', function (e) {
        if (e.key == 'usuarioLoggeado') {
            applyAdminVisibility()
        }
    })

}) 
