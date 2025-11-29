/// <reference types="jquery" />

$(function () {

  function getQueryParam(name) {
    let params = new URLSearchParams(window.location.search) 
    return params.get(name) 
  }

  function buildLessonItem(lec) {
    let id = lec.id 
    let titulo = lec.titulo || ('Lección ' + id) 
    let duracion = (lec.duracion != null && lec.duracion != '') ? (lec.duracion + ' min') : '' 
    let orden = (lec.orden != null && lec.orden != '') ? lec.orden : '' 

    return `
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-lesson-id="'${id}'">
        <span class="text-start">${(orden ? (orden + '. ') : '') + titulo}</span>
        ${duracion ? ('<span class="badge text-bg-secondary ms-2">' + duracion + '</span>') : ''}
      </button>`
  }

  function toHtmlFromText(text) {
    if (!text) {
      return ''
    }
    // Convierte saltos de línea en <br> para mostrar texto plano decentemente
    return String(text).replace(/\n/g, '<br>') 
  }

  function embedVideo(url) {
    // Soporte básico para YouTube. Si no es YouTube, devolvemos null para que se muestre como enlace.
    if (!url) return null 
    let ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/i) 
    if (ytMatch && ytMatch[1]) {
      return 'https://www.youtube.com/embed/' + ytMatch[1] 
    }
    return null 
  }

  function renderLesson(lec) {
    let titulo = lec.titulo || '' 
    let contenidoHTML = '' 
    // Acepta 'contenido_html' (si tu backend lo usa) o 'contenido' (según tu init.sql)
    if (lec.contenido_html) {
      contenidoHTML = lec.contenido_html 
    } else if (lec.contenido) {
      contenidoHTML = toHtmlFromText(lec.contenido) 
    }

    $('#tituloLeccion').text(titulo) 
    $('#contenidoLeccion').html(contenidoHTML || '<p class="text-muted">Esta lección no tiene contenido.</p>') 

    // Vídeo
    let video = lec.video_url || '' 
    let emb = embedVideo(video) 
    if (emb) {
      $('#videoIframe').attr('src', emb) 
      $('#videoWrapper').removeClass('d-none') 
    } else {
      $('#videoIframe').attr('src', '') 
      $('#videoWrapper').addClass('d-none') 
      // Si hay URL de video pero no embebible, añadimos un enlace al final del contenido
      if (video) {
        $('#contenidoLeccion').append(
          '<p class="mt-3"><a href="'+ video +'" target="_blank" rel="noopener">Ver vídeo</a></p>'
        ) 
      }
    }
  }

  function setActiveLesson(lessonId) {
    $('#leccionesList .list-group-item').removeClass('active') 
    $('#leccionesList .list-group-item[data-lesson-id="'+ lessonId +'"]').addClass('active') 
  }

  function loadLessons(cursoId) {
    let $list = $('#leccionesList') 
    $list.html('<div class="p-3 text-muted">Cargando lecciones…</div>') 

    $.getJSON('php/lecciones_listar.php', {
      curso_id: cursoId
    }).done(function(res) {
        let lecciones = [] 
        if (res) {
          if (Array.isArray(res.lecciones)) {
            lecciones = res.lecciones 
          } else if (Array.isArray(res.success)) {
            lecciones = res.success 
          }
        }

        if (!lecciones.length) {
          $list.html('<div class="p-3 text-muted">Este curso aún no tiene lecciones.</div>') 
          $('#tituloLeccion').text('') 
          $('#contenidoLeccion').html('<div class="text-muted">Selecciona un curso con lecciones disponibles.</div>') 
          $('#videoIframe').attr('src','') 
          $('#videoWrapper').addClass('d-none') 
          return 
        }

        // Sidebar
        let htmlItems = [] 
        for (let i = 0; i < lecciones.length; i++) {
          htmlItems.push(buildLessonItem(lecciones[i])) 
        }
        $list.html(htmlItems.join('')) 

        // Seleccionar la primera automáticamente
        let primera = lecciones[0] 
        setActiveLesson(primera.id) 
        renderLesson(primera) 

        // Cache memoria
        window.__LECCIONES_CACHE__ = {} 
        for (let j = 0; j < lecciones.length; j++) {
          window.__LECCIONES_CACHE__[ String(lecciones[j].id) ] = lecciones[j] 
        }
      }).fail(function(xhr){
        console.error('Lecciones - fallo AJAX:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        }) 
        $list.html('<div class="p-3 text-danger">No se pudieron cargar las lecciones.</div>') 
        $('#tituloLeccion').text('') 
        $('#contenidoLeccion').html('<div class="text-danger">Inténtalo de nuevo más tarde.</div>') 
        $('#videoIframe').attr('src','') 
        $('#videoWrapper').addClass('d-none') 
      }) 
  }

  // Delegado de clicks en el sidebar
  $(document).on('click', '#leccionesList .list-group-item', function (e) {
    e.preventDefault() 
    let lessonId = String($(this).data('lessonId')) 
    setActiveLesson(lessonId) 
    let cache = window.__LECCIONES_CACHE__ || {} 
    let lec = cache[lessonId] 
    if (lec) {
      renderLesson(lec) 
      if (window.innerWidth < 768) {
        $('html, body').animate({ scrollTop: $('#tituloLeccion').offset().top - 16 }, 250) 
      }
    }
  }) 

  // Inicio
  $(function(){
    let cursoId = getQueryParam('curso_id') 
    if (!cursoId) {
      $('#leccionesList').html('<div class="p-3 text-danger">Falta el parámetro curso_id en la URL.</div>') 
      return 
    }
    loadLessons(cursoId) 
  }) 

})
