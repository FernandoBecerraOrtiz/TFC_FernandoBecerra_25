/// <reference types="jquery" />

$(function () {

    // Función helper para mostrar alertas estilo Login
    function mostrarAlertaRegistro(msg) {
        $("#alertaRegistroTexto").text(msg)
        $("#alertaRegistro").removeClass("d-none").fadeIn()

        setTimeout(() => {
            $("#alertaRegistro").fadeOut()
        }, 3000)
    }

    // Prefill del email si venimos de login con ?email=
    const params = new URLSearchParams(window.location.search)
    const emailFromQuery = params.get('email')
    if (emailFromQuery) {
        $('#floatingInput').val(emailFromQuery)
    }

    // Ojo mostrar/ocultar contraseña (igual que login)
    $('#togglePasswordRegistro').on('click', function () {
        const $input = $('#floatingPassword')
        const $icon = $(this).find('i')

        if ($input.attr('type') == 'password') {
            $input.attr('type', 'text')
            $icon.removeClass('bi-eye').addClass('bi-eye-slash')
        } else {
            $input.attr('type', 'password')
            $icon.removeClass('bi-eye-slash').addClass('bi-eye')
        }
    })
    
    // 3) Envío del formulario de registro
    $('#formRegistro').on('submit', function (e) {
        e.preventDefault()

        const email = $('#floatingInput').val().trim()
        const password = $('#floatingPassword').val().trim()

        // Validación email estilo Login
        const emailRegex = /^[^@\s]{3,}@[^\s@]{3,}\.(com|es)$/i

        if (!emailRegex.test(email)) {
            mostrarAlertaRegistro("Introduce un email válido (mínimo 3 caracteres antes y después de @ y terminado en .com o .es)")
            return
        }

        if (!password) {
            mostrarAlertaRegistro("La contraseña es obligatoria")
            return
        }

        // Nombre automático antes de @
        const nombre = email.split('@')[0]

        $.ajax({
            url: 'php/insertUsuario.php',
            method: 'POST',
            dataType: 'json',
            data: {
                nombre: nombre,
                email: email,
                password: password,
                tipo: 'estudiante'
            }
        }).done(function (resp) {
            if (resp && resp.ok && resp.usuario) {

                // Guardar sesión local
                try {
                    localStorage.setItem('usuarioLoggeado', JSON.stringify(resp.usuario))
                } catch (e) {
                    console.error("No se pudo guardar la sesión en localStorage", e)
                }

                // Redirigir a perfil
                window.location.href = 'perfil'
            } else {
                mostrarAlertaRegistro(resp.error || "No se pudo crear la cuenta")
            }
        }).fail(function () {
            mostrarAlertaRegistro("Error al contactar con el servidor")
        })
    })

})
