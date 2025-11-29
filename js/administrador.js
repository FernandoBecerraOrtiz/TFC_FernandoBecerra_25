/// <reference types="jquery" />

$(function () {
    // Helpers de usuario (localStorage)
    function getUsuarioLS() {
        try {
            const raw = localStorage.getItem('usuarioLoggeado')
            if (!raw) return null
            return JSON.parse(raw)
        } catch (e) {
            console.warn('Error leyendo usuarioLoggeado:', e)
            return null
        }
    }

    function tipoUsuarioLS() {
        const u = getUsuarioLS()
        if (!u) {
            return null
        }
        const t = u.tipo || u.rol || u.role
        return t ? String(t).toLowerCase() : null
    }

    function esProfesorOAdmin() {
        const t = tipoUsuarioLS()
        return t == 'profesor' || t == 'admin'
    }

    // Inyección de la sección de administración de cursos
    function ensureAdminContent() {
        if ($('#adminContent').length) {
            return
        }
        const html = `
        <section id="adminContent" class="container my-3 seccion-perfil d-none">
            <div class="d-flex justify-content-end mb-3">
                <button id="btnAdminNuevoCurso" class="btn btn-danger">
                    <i class="bi bi-plus-circle me-2"></i>Nuevo curso
                </button>
            </div>

            <div id="adminMsg" class="alert d-none" role="alert"></div>

            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">
                <h4 class="mb-3"><i class="bi bi-gear-wide-connected me-4"></i>Administración de cursos</h3>
                    <div class="table-responsive">
                        <table class="table table-sm align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Nivel</th>
                                    <th>Duración</th>
                                    <th>Precio</th>
                                    <th>Lecciones</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="adminCursosTbody">
                                <tr>
                                    <td colspan="7" class="text-muted">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <!-- Modal alta/edición curso -->
        <div class="modal fade" id="modalCursoAdmin" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalCursoAdminLabel">Modificar curso</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>

                    <div class="modal-body">
                        <form id="formCursoAdmin">
                            <input type="hidden" name="id" id="c_id" />

                            <div class="row g-3">
                                <!-- Columna izquierda: datos básicos -->
                                <div class="col-lg-5">
                                    <div class="mb-2">
                                        <label class="form-label">Título</label>
                                        <input type="text" class="form-control" name="titulo" id="c_titulo" required />
                                    </div>

                                    <div class="mb-2">
                                        <label class="form-label">Descripción</label>
                                        <textarea class="form-control" rows="4" name="descripcion" id="c_descripcion"></textarea>
                                    </div>

                                    <div class="row g-2">
                                        <div class="col-6">
                                            <label class="form-label">Precio (€)</label>
                                            <input type="number" step="0.01" class="form-control" name="precio" id="c_precio" value="0" />
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label">Duración (h)</label>
                                            <input type="number" class="form-control" name="duracion" id="c_duracion" value="10" min="1" />
                                        </div>
                                    </div>

                                    <div class="row g-2 mt-1">
                                        <div class="col-6">
                                            <label class="form-label">Nivel</label>
                                            <select class="form-select" name="nivel" id="c_nivel">
                                                <option value="básico">Básico</option>
                                                <option value="intermedio" selected>Intermedio</option>
                                                <option value="avanzado">Avanzado</option>
                                            </select>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label">Imagen de portada (ruta)</label>
                                            <input type="text"
                                                class="form-control"
                                                name="imagen_portada"
                                                id="c_imagen"
                                                placeholder="assets/images/courses/portada.webp" />
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <label class="form-label">Categorías</label>
                                        <select id="c_categorias" class="form-select" multiple></select>
                                        <small class="text-muted d-block mt-1">
                                            Mantén pulsado Ctrl para seleccionar varias.
                                        </small>
                                    </div>
                                </div>

                                <!-- Columna derecha: lecciones -->
                                <div class="col-lg-7">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <h6 class="mb-0">Lecciones (máx. 10)</h6>
                                        <button type="button" class="btn btn-sm btn-outline-secondary" id="btnAddLeccion">
                                            Añadir lección
                                        </button>
                                    </div>

                                    <div id="adminLeccionesList" class="list-group">
                                    
                                    </div>

                                    <small class="text-muted d-block mt-2">
                                        Cada lección: título, vídeo (opcional) y contenido.
                                    </small>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-danger" id="btnGuardarCursoAdmin">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
        `
        $('#derecha').append(html)
    }

    // Mensajes visuales
    function showAdminMsg(txt, type) {
        const $a = $('#adminMsg')
        if (!$a.length) {
            return
        }
        
        $a.removeClass('d-none alert-success alert-danger alert-info alert-warning').addClass('alert-' + (type || 'success')).text(txt || '')
        setTimeout(() => $a.addClass('d-none'), 4000)
    }

    // Datos: cursos + lecciones (admin_cursos_editar.php)
    function fetchCursos() {
        // Compatible con las dos firmas que usamos en PHP
        return $.getJSON('php/admin_cursos_editar.php', { listar: 1 }).catch(() => $.getJSON('php/admin_cursos_editar.php', { action: 'list' }))
    }

    function renderCursos(resp) {
        const $tb = $('#adminCursosTbody')
        if (!$tb.length) {
            return
        }

        let cursos = []
        let leccionesPorCurso = {}

        if (resp && resp.ok && Array.isArray(resp.cursos)) {
            cursos = resp.cursos
            leccionesPorCurso = resp.lecciones || {}
        } else if (Array.isArray(resp)) {
            cursos = resp
        } else if (resp && resp.cursos) {
            cursos = resp.cursos
        }

        if (!cursos.length) {
            $tb.html('<tr><td colspan="7" class="text-muted">No hay cursos todavía</td></tr>')
            return
        }

        const html = cursos.map(c => {
            let count = 0
            if (leccionesPorCurso && leccionesPorCurso[c.id]) {
                count = leccionesPorCurso[c.id].length
            } else if (Array.isArray(c.lecciones)) {
                count = c.lecciones.length
            }

            const desc = (c.descripcion || '').replace(/"/g, '&quot ')
            const img = (c.imagen_portada || '').replace(/"/g, '&quot ')

            return `
                <tr data-id="${c.id}"
                    data-descripcion="${desc}"
                    data-imagen="${img}">
                    <td>${c.id}</td>
                    <td>${escapeHtml(c.titulo || '')}</td>
                    <td>${escapeHtml(c.nivel || '')}</td>
                    <td>${c.duracion || 0}h</td>
                    <td>${parseFloat(c.precio || 0).toFixed(2)}€</td>
                    <td class="td-lesson-count">${count}</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-secondary btnAdminEditarCurso"><i class="bi bi-pencil"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger ms-1 btnAdminEliminarCurso"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`
        })

        $tb.html(html)

        // Cache de lecciones si viene en la respuesta
        if (resp && resp.ok && resp.lecciones) {
            window._adminLeccionesCache = resp.lecciones
        }
    }

    function saveCurso(payload) {
        return $.ajax({
            url: 'php/admin_cursos_editar.php',
            method: 'POST',
            dataType: 'json',
            data: {
                guardar: 1,
                id: payload.id,
                titulo: payload.titulo,
                descripcion: payload.descripcion,
                precio: payload.precio,
                duracion: payload.duracion,
                nivel: payload.nivel,
                imagen_portada: payload.imagen_portada,
                lecciones: JSON.stringify(payload.lecciones || []),
                eliminar_lecciones: JSON.stringify(payload.eliminar_lecciones || [])
            }
        })
    }

    function deleteCurso(id) {
        return $.post(
            'php/admin_delete_curso.php',
            { id: id },
            function (resp) {
                console.log('Respuesta deleteCurso:', resp)
            },'json'
        )
    }

    // Categorías
    let __CATEGORIAS_CACHE__ = null

    function fetchCategorias() {
        if (__CATEGORIAS_CACHE__) {
            return $.Deferred().resolve(__CATEGORIAS_CACHE__).promise();
        }

        return $.getJSON('php/listarCategorias.php').then(function (resp) {
                let cats = []

                if (Array.isArray(resp)) {
                    cats = resp
                } else if (resp && Array.isArray(resp.success)) {
                    cats = resp.success
                } else if (resp && Array.isArray(resp.categorias)) {
                    cats = resp.categorias
                } else if (resp && resp.ok && Array.isArray(resp.categorias)) {
                    cats = resp.categorias
                }

                __CATEGORIAS_CACHE__ = cats
                return cats
            }).catch(function () {
                return []
            })
    }

    function fillCategoriasSelect(selectedIds) {
        const $sel = $('#c_categorias')
        if (!$sel.length) {
            return
        }

        selectedIds = selectedIds || []
        if (!Array.isArray(selectedIds)) {
            selectedIds = String(selectedIds || '').split(',').map(x => x.trim()).filter(Boolean)
        }
        const selectedSet = new Set(selectedIds.map(String))

        fetchCategorias().done(function (cats) {
            if (!Array.isArray(cats) || !cats.length) {
                $sel.html('<option value="">(Sin categorías)</option>')
                return
            }

            const options = cats.map(c => {
                const id = c.id || c.ID || c.id_categoria
                const nombre = c.nombre || c.titulo || ('Categoría ' + id)
                const sel = selectedSet.has(String(id)) ? ' selected' : ''
                return `<option value="${id}"${sel}>${escapeHtml(nombre)}</option>`
            })

            $sel.html(options)
        })
    }

    function getSelectedCategorias() {
        const $sel = $('#c_categorias')
        if (!$sel.length) {
            return []
        }
        const vals = $sel.val()
        if (!vals) {
            return []
        }
        if (Array.isArray(vals)) {
            return vals
        }
        return [vals]
    }

    function loadCategoriasCurso(cursoId) {
        return $.getJSON('php/cursos_categorias_get.php', { curso_id: cursoId }).then(function (resp) {
                let ids = []
                if (resp && resp.ok && Array.isArray(resp.categorias)) {
                    ids = resp.categorias.map(c => c.id_categoria || c.id)
                } else if (Array.isArray(resp)) {
                    ids = resp.map(c => c.id_categoria || c.id)
                }
                fillCategoriasSelect(ids)
            }).catch(function () {
                fillCategoriasSelect([])
            })
    }

    function saveCategoriasCurso(cursoId) {
        const cats = getSelectedCategorias()
        return $.ajax({
            url: 'php/cursos_categorias_set.php',
            method: 'POST',
            dataType: 'json',
            data: {
                curso_id: cursoId,
                categorias: cats
            }
        }).catch(function () {
            showAdminMsg('Curso guardado, pero las categorías no se han podido actualizar.', 'warning')
        })
    }

    // Lecciones

    // Carga las lecciones de un curso concreto directamente desde PHP
    function fetchLeccionesCurso(cursoId) {
        if (!cursoId) {
            return $.Deferred().resolve([]).promise()
        }

        return $.getJSON('php/admin_cursos_editar.php', {
            curso_id: cursoId, listar_lecciones: 1
        }).then(function (resp) {
                let lista = []

                if (resp) {
                    if (Array.isArray(resp.lecciones)) {
                        lista = resp.lecciones
                    } else if (resp.ok && Array.isArray(resp.lecciones)) {
                        lista = resp.lecciones
                    } else if (Array.isArray(resp)) {
                        lista = resp
                    } else if (resp.curso && Array.isArray(resp.curso.lecciones)) {
                        lista = resp.curso.lecciones
                    }
                }

                if (!window._adminLeccionesCache) {
                    window._adminLeccionesCache = {}
                }
                window._adminLeccionesCache[cursoId] = lista
                return lista
            }).catch(function () {
                return []
            })
    }

    function emptyCourseForm(addFirstRow) {
        $('#c_id').val('')
        $('#c_titulo').val('')
        $('#c_descripcion').val('')
        $('#c_precio').val('')
        $('#c_duracion').val('')
        $('#c_nivel').val('')
        $('#c_imagen').val('')
        $('#adminLeccionesList').empty()
        fillCategoriasSelect([])

        if (addFirstRow) {
            addLeccionRow()
        }
    }

    function renumerarLecciones() {
        $('#adminLeccionesList .lesson-row').not('[data-delete="true"]').each(function (i) {
                const index = i + 1
                $(this).find('.lesson-index').text(index)
                $(this).find('.l-orden').val(index)
            })
    }

    function addLeccionRow(data) {
        const d = data || {}
        const id = d.id || d.ID || ''
        const titulo = d.titulo || ''
        const video = d.video_url || d.url_video || ''
        const contenido = d.contenido || d.contenido_html || ''

        const current = $('#adminLeccionesList .lesson-row').not('[data-delete="true"]').length
        const orden = d.orden || (current + 1)

        const html = `
        <div class="list-group-item lesson-row mb-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Lección <span class="lesson-index">${orden}</span></strong>
                <button type="button" class="btn btn-sm btn-outline-danger btnLeccionQuitar">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <input type="hidden" class="l-id" value="${id}">
            <input type="hidden" class="l-orden" value="${orden}">

            <div class="mb-2">
                <label class="form-label mb-1">Título</label>
                <input type="text" class="form-control l-titulo" value="${escapeAttr(titulo)}">
            </div>

            <div class="mb-2">
                <label class="form-label mb-1">URL Vídeo</label>
                <input type="text" class="form-control l-video" value="${escapeAttr(video)}">
            </div>

            <div class="mb-2">
                <label class="form-label mb-1">Contenido</label>
                <textarea class="form-control l-contenido" rows="3">${escapeHtml(contenido)}</textarea>
            </div>
        </div>`

        $('#adminLeccionesList').append(html)
        renumerarLecciones()
    }

    function fillCourseFormFromRow($tr, cache) {
        const id = parseInt($tr.data('id')) || 0
        const desc = $tr.attr('data-descripcion') || ''
        const img = $tr.attr('data-imagen') || ''

        $('#c_id').val(id)
        $('#c_titulo').val($tr.find('td:nth-child(2)').text().trim())
        $('#c_nivel').val($tr.find('td:nth-child(3)').text().trim().toLowerCase())
        $('#c_duracion').val(String($tr.find('td:nth-child(4)').text().replace('h', '').trim() || ''))
        $('#c_precio').val(String(($tr.find('td:nth-child(5)').text().replace('€', '').trim()) || ''))
        $('#c_descripcion').val(desc.replace(/&quot /g, '"'))
        $('#c_imagen').val(img.replace(/&quot /g, '"'))

        $('#adminLeccionesList').empty()

        const leccionesCache = cache || (window._adminLeccionesCache || {})
        let lista = leccionesCache[id] || []

        const dfd = $.Deferred()

        function renderLista(ls) {
            $('#adminLeccionesList').empty()
            if (Array.isArray(ls) && ls.length) {
                ls.forEach(l => addLeccionRow(l))
            } else {
                addLeccionRow()
            }
            dfd.resolve()
        }

        // Si no tenemos lecciones cacheadas, las pedimos al servidor
        if (id && (!Array.isArray(lista) || !lista.length)) {
            fetchLeccionesCurso(id).done(renderLista).fail(function () {
                    renderLista([])
                })
        } else {
            renderLista(lista)
        }

        // Cargar categorías asociadas
        if (id) {
            loadCategoriasCurso(id)
        } else {
            fillCategoriasSelect([])
        }

        return dfd.promise()
    }

    function serializeCursoForm() {
        const id = parseInt($('#c_id').val() || 0) || null

        const payload = {
            id: id,
            titulo: ($('#c_titulo').val() || '').trim(),
            descripcion: ($('#c_descripcion').val() || '').trim(),
            precio: parseFloat($('#c_precio').val() || 0) || 0,
            duracion: parseInt($('#c_duracion').val() || 0) || 0,
            nivel: ($('#c_nivel').val() || '').trim(),
            imagen_portada: ($('#c_imagen').val() || '').trim(),
            lecciones: [],
            eliminar_lecciones: []
        }

        $('#adminLeccionesList .lesson-row').each(function () {
            const $row = $(this)
            const idL = parseInt($row.find('.l-id').val() || 0)
            const tituloL = ($row.find('.l-titulo').val() || '').trim()
            const videoL = ($row.find('.l-video').val() || '').trim()
            const contenidoL = ($row.find('.l-contenido').val() || '').trim()
            const marcadoBorrar = $row.data('delete') == true

            if (marcadoBorrar && idL > 0) {
                // Así es como el PHP entiende que hay que borrar una lección:
                // $ldel = (int)($L['delete'] ?? 0);
                payload.lecciones.push({
                    id: idL,
                    delete: 1
                })
                return
            }

            // Si está vacía del todo, no la mandamos
            if (!tituloL && !videoL && !contenidoL) {
                return
            }
            
            payload.lecciones.push({
                id: idL > 0 ? idL : null,
                titulo: tituloL,
                contenido: contenidoL,
                video_url: videoL
            })
        })

        return payload
    }

    // Interaccion con la interfaz de usuario. Añadir,modificar,eliminar usuario/curso
    let cursoAEliminar = null
    let usuarioAEliminar = null

    function bindEvents() {
        // Abrir sección "Gestionar cursos" desde el sidebar
        $(document).on('click', '#seccion-admin [data-section="modificar-curso"]', function (e) {
            e.preventDefault()
            if (!esProfesorOAdmin()) {
                return
            }

            $('.seccion-perfil').addClass('d-none')
            $('#seccion-ajustes').addClass('d-none')
            $('#adminContent').removeClass('d-none')

            $('#adminCursosTbody').html('<tr><td colspan="7" class="text-muted">Cargando cursos…</td></tr>')
            fetchCursos().done(resp => {
                if (resp && resp.lecciones) {
                    window._adminLeccionesCache = resp.lecciones
                }
                renderCursos(resp)
            }).fail(() => {
                showAdminMsg('No se pudieron cargar los cursos', 'danger')
                $('#adminCursosTbody').html('<tr><td colspan="7" class="text-danger">Error al cargar la lista de cursos</td></tr>')
            })
        })

        // Nuevo curso
        $(document).on('click', '#btnAdminNuevoCurso', function () {
            if (!esProfesorOAdmin()) {
                return
            }
            emptyCourseForm(true)
            $('#modalCursoAdminLabel').text('Nuevo curso')
            fillCategoriasSelect([])
            $('#modalCursoAdmin').modal('show')
        })

        // Editar curso
        $(document).on('click', '.btnAdminEditarCurso', function () {
            if (!esProfesorOAdmin()) {
                return
            }

            const $tr = $(this).closest('tr')
            const cache = window._adminLeccionesCache || {}
            emptyCourseForm(false)
            fillCourseFormFromRow($tr, cache).always(function () {
                $('#modalCursoAdminLabel').text('Editar curso')
                $('#modalCursoAdmin').modal('show')
            })
        })

        // Click en "Añadir lección"
        $(document).on('click', '#btnAddLeccion', function () {
            if (!esProfesorOAdmin()) return
            addLeccionRow()
        })

        // Quitar lección: marcar para eliminar o quitar del DOM
        $(document).on('click', '.btnLeccionQuitar', function () {
            const $row = $(this).closest('.lesson-row')
            const id = parseInt($row.find('.l-id').val() || 0)

            if (id > 0) {
                $row.data('delete', true).addClass('opacity-50 text-decoration-line-through').find('input,textarea,button').prop('disabled', true)

                $(this).prop('disabled', true).attr('title', 'Se eliminará al guardar')
            } else {
                $row.remove()
            }

            renumerarLecciones()
        })

        // Guardar curso
        $(document).on('click', '#btnGuardarCursoAdmin', function () {
            if (!esProfesorOAdmin()) {
                return
            }

            const payload = serializeCursoForm()

            if (!payload.titulo) {
                showAdminMsg('El título es obligatorio', 'danger')
                return
            }
            if (!payload.nivel) {
                showAdminMsg('Selecciona un nivel', 'danger')
                return
            }
            if (parseInt(payload.duracion || 0) <= 0) {
                showAdminMsg('La duración debe ser mayor que 0', 'danger')
                return
            }

            const $btn = $(this)
            $btn.prop('disabled', true).text('Guardando…')

            saveCurso(payload).done(function (r) {
                if (r && (r.ok || r.success)) {
                    const cursoId = r.curso_id || payload.id || r.id

                    if (cursoId) {
                        saveCategoriasCurso(cursoId).always(function () {
                            $('#modalCursoAdmin').modal('hide')
                            showAdminMsg('Curso guardado correctamente', 'success')
                            fetchCursos().done(resp => {
                                if (resp && resp.lecciones) window._adminLeccionesCache = resp.lecciones
                                renderCursos(resp)
                            })
                        })
                    } else {
                        $('#modalCursoAdmin').modal('hide')
                        showAdminMsg('Curso guardado correctamente', 'success')
                        fetchCursos().done(resp => {
                            if (resp && resp.lecciones) window._adminLeccionesCache = resp.lecciones
                            renderCursos(resp)
                        })
                    }
                } else {
                    showAdminMsg((r && (r.error || r.message)) || 'No se pudo guardar el curso', 'danger')
                }
            }).fail(function (xhr) {
                const txt = xhr && xhr.responseText ? xhr.responseText : ''
                console.error('Guardar curso - fallo AJAX:', txt)
                showAdminMsg('Error de red al guardar' + (txt ? ' — ' + txt : ''), 'danger')
            }).always(function () {
                $btn.prop('disabled', false).text('Guardar')
            })
        })

        // Abrir modal eliminar curso
        $(document).on('click', '.btnAdminEliminarCurso', function () {
            if (!esProfesorOAdmin()) {
                return
            }

            const id = parseInt($(this).closest('tr').data('id'))
            if (!id) {
                return
            }

            cursoAEliminar = id
            $('#modalEliminarCursoAdmin').modal('show')
        })

        // Confirmar eliminación de curso (id corregido a confirmDeleteCurso)
        $(document).on('click', '#confirmDeleteCurso', function () {
            if (!cursoAEliminar) {
                return
            }

            const $btn = $(this)
            $btn.prop('disabled', true).text('Eliminando…')

            deleteCurso(cursoAEliminar).done(function (resp) {
                if (resp && resp.ok) {
                    showAdminMsg('Curso eliminado correctamente', 'success')
                    fetchCursos().done(r => {
                        if (r && r.lecciones) window._adminLeccionesCache = r.lecciones
                        renderCursos(r)
                    })
                } else {
                    showAdminMsg((resp && resp.error) || 'No se ha podido eliminar el curso', 'danger')
                }
            }).fail(function () {
                showAdminMsg('Error al eliminar el curso', 'danger')
            }).always(function () {
                $btn.prop('disabled', false).text('Eliminar')
                $('#modalEliminarCursoAdmin').modal('hide')
                cursoAEliminar = null
            })
        })

        // Eliminar usuario
        $(document).on('click', '.btnEliminarUsuario', function () {
            const id = parseInt($(this).closest('tr').data('id'))
            if (!id) {
                return
            }
            usuarioAEliminar = id

            const m = new bootstrap.Modal($('#modalEliminarUsuarioAdmin'))
            m.show()
        })

        // Confirmar eliminación de usuario (modal)
        $(document).on('click', '#btnConfirmEliminarUsuarioAdmin', function () {
            if (!usuarioAEliminar) {
                return
            }

            const $btn = $(this)
            $btn.prop('disabled', true).text('Eliminando…')

            $.ajax({
                url: 'php/admin_delete_usuario.php',
                method: 'POST',
                dataType: 'json',
                data: { id: usuarioAEliminar }
            }).done(function (resp) {
                if (resp && resp.ok) {
                    showAdminMsg("Usuario eliminado correctamente", "success")

                    if (typeof loadAlumnosAdmin == 'function') {
                        loadAlumnosAdmin()
                    }
                } else {
                    showAdminMsg(resp.error || "No se pudo eliminar el usuario", "danger")
                }

            }).fail(function () {
                showAdminMsg("Error al eliminar el usuario", "danger")
            }).always(function () {
                $btn.prop('disabled', false).text('Eliminar')

                const modalEl = $('#modalEliminarUsuarioAdmin')
                const modal = bootstrap.Modal.getInstance(modalEl)
                modal.hide()

                usuarioAEliminar = null
            })
        })

    }

    // Helpers de escape
    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp ').replace(/</g, '&lt ').replace(/>/g, '&gt ').replace(/"/g, '&quot ').replace(/'/g, '&#039 ')
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot ')
    }

    // Init
    if (esProfesorOAdmin()) {
        ensureAdminContent()
    }

    // Por si el usuario cambia en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key == 'usuarioLoggeado') {
            if (esProfesorOAdmin()) {
                ensureAdminContent()
            } else {
                $('#adminContent').addClass('d-none')
            }
        }
    })

    bindEvents()
})
