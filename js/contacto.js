/// <reference types="jquery" />

$(function () {
    $("#contact-form").on("submit", function (e) {
        e.preventDefault()

        $.ajax({
            url: "php/enviar_contacto.php",
            type: "POST",
            data: $(this).serialize(),
            dataType: "text", // <- tolerante a salidas no JSON
            success: function (raw) {
                let resp = null
                try { resp = JSON.parse(raw); } catch (e) {
                    console.error("Respuesta no JSON:", raw)
                    $("#alertFalloForm").fadeIn()
                    setTimeout(() => $("#alertFalloForm").fadeOut(), 4000)
                    return
                }

                if (resp.ok) {
                    $("#alertCorrectoForm").fadeIn()
                    setTimeout(() => $("#alertCorrectoForm").fadeOut(), 3000)
                    $("#contact-form")[0].reset()
                } else {
                    // Mostrar motivo devuelto por el servidor si lo hay
                    if (resp.message) {
                        $("#alertFalloForm").find('.bi-exclamation-triangle-fill').parent().contents().last().replaceWith(' ' + resp.message)
                    }
                    $("#alertFalloForm").fadeIn();
                    setTimeout(() => $("#alertFalloForm").fadeOut(), 5000)
                }
            },
            error: function (xhr) {
                console.error("AJAX error", xhr.status, xhr.responseText)
                $("#alertFalloForm").fadeIn()
                setTimeout(() => $("#alertFalloForm").fadeOut(), 5000)
            }
        })
    })
})