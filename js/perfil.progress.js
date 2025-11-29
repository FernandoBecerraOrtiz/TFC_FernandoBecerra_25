/// <reference types="jquery" />

$(function () {

  function getUserFromLS() {
    try {
      return JSON.parse(localStorage.getItem('usuarioLoggeado') || 'null')
    } catch {
      return null
    }
  }

  function getLoggedUserId() {
    const u = getUserFromLS()
    return u && (u.id || u.ID) ? (u.id || u.ID) : null
  }

  function currentCourseId() {
    return parseInt($('#tituloCursoActual').data('cursoId') || 0)
  }

  function currentLessonId() {
    return parseInt($('#tituloLeccion').attr('data-leccion-id') || $('#tituloLeccion').data('leccionId') || 0)
  }

  // Acceso a la caché creada en perfil.js (si existe)
  function ensureServerCacheSet(courseId) {
    window.progresoServidorCache = window.progresoServidorCache || new Map()
    const k = String(courseId)
    if (!window.progresoServidorCache.has(k)) {
      window.progresoServidorCache.set(k, new Set())
    }
    return window.progresoServidorCache.get(k)
  }

  // Actualiza el texto/estilo del botón según estado
  function paintButton(completed) {
    const $b = $('#btnToggleCompletada')
    if (completed) {
      $b.removeClass('btn-outline-success').addClass('btn-success')
        .html('<i class="bi bi-check2-circle me-1"></i> Lección completada')
        .attr('aria-pressed', 'true')
    } else {
      $b.removeClass('btn-success').addClass('btn-outline-success')
        .html('<i class="bi bi-check2-circle me-1"></i> Marcar lección como completada')
        .attr('aria-pressed', 'false')
    }
  }

  // Sincroniza también localStorage
  function syncLocalStorage(courseId, lessonId, completed) {
    try {
      const key = `progreso_curso_${courseId}`
      const ls = JSON.parse(localStorage.getItem(key) || '{}')
      const set = new Set(Array.isArray(ls.completadas) ? ls.completadas.map(Number) : [])
      if (completed) {
        set.add(parseInt(lessonId))
      } else {
        set.delete(parseInt(lessonId))
      }

      ls.completadas = Array.from(set)
      localStorage.setItem(key, JSON.stringify(ls))
    } catch {
      console.log('No se pudo sincronizar localStorage de progreso')
    }
  }

  // Click: delegamos toda la lógica de alternar al servidor
  $(document).off('click.progresoToggle').on('click.progresoToggle', '#btnToggleCompletada', function () {
    const cid = currentCourseId()
    const lid = currentLessonId()
    if (!cid || !lid) {
      return
    }

    const uid = getLoggedUserId()
    const payload = { curso_id: cid, leccion_id: lid }
    if (uid) {
      payload.user_id = uid
    }

    const $btn = $(this).prop('disabled', true)

    $.ajax({
      url: 'php/progreso_toggle.php',
      method: 'POST',
      dataType: 'json',
      data: payload
    }).done(function (r) {
        if (!r || !r.ok) {
          return
        }

        // r.completado = 1 (marcado) | 0 (desmarcado tras delete)
        const completed = parseInt(r.completado) == 1

        // 1) Pintar botón
        paintButton(completed)

        // 2) Actualizar caché servidor en memoria
        const set = ensureServerCacheSet(cid)
        if (completed) {
          set.add(parseInt(lid))
        } else {
          set.delete(parseInt(lid))
        }

        // 3) Sincronizar localStorage para consistencia
        syncLocalStorage(cid, lid, completed);

        // 4) Actualizar UI extra (barra progreso si existe esa función)
        if (typeof updateCourseProgressBar == 'function') {
          updateCourseProgressBar(cid)
        }
        if (typeof refreshKpisImmediately == 'function') {
          refreshKpisImmediately()
        }
      }).fail(function (xhr) {
        console.warn('Error sincronizando progreso:', xhr && xhr.responseText)
      }).always(function () {
        $btn.prop('disabled', false)
      })
  })

}) 
