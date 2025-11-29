# Proyecto Final – Foobar  

## Plataforma Web de Cursos Online

```
Autor: Fernando Becerra Ortiz  
Centro I.E.S. Suárez de Figueroa  
Tutor José Antonio Rodríguez Argueta  
Ciclo Formativo Desarrollo de Aplicaciones Web  
Curso 2025  
```

<div align="center">
  <img src="docs/logo.png" alt="Logo Foobar" width="100px">
  <img src="docs/iessuarezdefigueroa.png" alt="Logo del IES Suarez de Figueroa" width="340px">
</div>

---

# Índice

1. [Introducción](#1-introducción)  
2. [Objetivos del proyecto](#2-objetivos-del-proyecto)  
   - 2.1 [Objetivo general](#21-objetivo-general)  
   - 2.2 [Objetivos específicos](#22-objetivos-específicos)
3. [Marco teórico](#3-marco-teórico)  
4. [Desarrollo del proyecto](#4-desarrollo-del-proyecto)  
   - 4.1 [Análisis Inicial](#41-análisis-inicial)
   - 4.2 [Diseño](#42-diseño)  
   - 4.3 [Implementación](#43-implementación)
   - 4.4 [Problemas detectados y soluciones aplicadas](#44-problemas-detectados-y-soluciones)  
5. [Conclusiones](#5-conclusiones)  
6. [Bibliografía](#6-bibliografía)  
7. [Anexo I – Manual de usuario](#7-anexo-i--manual-de-usuario)  
8. [Anexo II – Manual de instalación](#8-anexo-ii--manual-de-instalación)  
9. [Otros anexos](#9-otros-anexos)

---

# 1. Introducción

**Foobar** es una plataforma web de cursos online desarrollada como Proyecto Final del CFGS en Desarrollo de Aplicaciones Web.

Éstas son algunas de las funcionalidades que dispone:

- Explorar cursos por categorías  
- Filtrar cursos dinámicamente  
- Utilizar un carrito con Offcanvas  
- Inscribirse en cursos  
- Reproducir lecciones con contenido y vídeo  
- Obtener certificados en PDF  
- Acceso privado según rol  
- Administración completa del sistema  

**Tecnologías principales:**

- **Frontend:** HTML5, CSS3, Bootstrap 5, jQuery  
- **Backend:** PHP 8 (con fpdf y phpmailer)  
- **Base de Datos:** MySQL 8  
- **Arquitectura:** Cliente-Servidor + AJAX  
- **Despliegue:** Docker  

---

# 2. Objetivos del proyecto

## 2.1 Objetivo general  

- Desarrollar una plataforma web funcional que permita gestionar cursos online diferenciando roles y proporcionando un entorno dinámico e intuitivo.

## 2.2 Objetivos específicos

> ### Funcionales

- Sistema de registro e inicio de sesión  
- Gestión de usuarios por rol: alumno, profesor, administrador  
- Listado y filtrado dinámico de cursos  
- Carrito Offcanvas  
- Gestión del progreso y certificado  
- Panel administrativo con CRUD de:
  - Usuarios  
  - Cursos  
  - Lecciones  
  - Categorías  

> ### Técnicos

- Diseño responsive completo  
- Código JavaScript modular  
- PHP con consultas preparadas  
- Contraseñas cifradas con `password_hash`  
- Cachés locales para optimización  
- Manejo correcto de AJAX y fetch  
- UI reactiva y accesible  

---

# 3. Marco teórico

> ### HTML5 y CSS3  

- Base de la estructura y estilos generales o muy específicos.

> ### Bootstrap 5  

- Se emplea para lograr una interfaz moderna, consistente y responsive.  
- Componentes usados: Grid, Offcanvas, Cards y Modales entre otros.

> ### JavaScript + jQuery  

- Manejo de AJAX, manipulación del DOM, carga dinámica de contenido y adaptación de la web sin recargar páginas.

> ### PHP 8  

- Gestiona sesiones, acceso a base de datos, CRUD completos, validaciones y generación de certificados.

> ### MySQL 8  

- Base de datos relacional normalizada con claves foráneas y relaciones entre usuarios, cursos, lecciones, categorías y progreso.

---

# 4. Desarrollo del proyecto

## 4.1 Análisis inicial

- Se identificaron tres tipos de usuario:

> ### Alumno

   - Compra cursos  
   - Visualiza lecciones  
   - Descarga certificados  
   - Gestiona su perfil  

> ### Profesor

   - Gestiona cursos propios  
   - Sube lecciones  
   - Visualiza inscritos y su progreso en los cursos 
   - Da de baja alumnos  

> ### Administrador

   - Control total del sistema  
   - CRUD sobre usuarios, cursos, categorías y lecciones  
   - Gestión de roles  

---

## 4.2 Diseño

- El diseño se subdivide en 3 apartados, estructura interna de archivos, aspecto standard de escritorio del sítio web y responsividad (capacidad para visualizar correctamente el sítio en móviles, tablets y televisores)

### 4.2.1 Estructura de páginas

> #### Páginas públicas

- `index.html`: Introducción del sitio web, presentación de los profesores y opiniones de los mismos acerca del sitio
- `cursos.html`: Listado de todos los cursos filtrable por categoria de los mismos así como opiniones de clientes. El usuario promedio se inscribirá a los cursos desde esta página
- `precios.html`: Información detallada de los servicios ofrecidos así como información adicional
- `contacto.html`: Dudas frecuentes, información de contacto con la empresa y formulario para hablar con administradores/gestores del sitio web

#### Área privada – `perfil.html`

Secciones cargadas por AJAX:
- Panel  
- Mis cursos  
- Progreso  
- Lecciones  
- Certificados  
- Ajustes  

### 4.2.2 Diseño responsive

Problemas solucionados:
- Sidebar móvil sin respuesta  
- Footer no fijo  
- Render incorrecto de los contenidos que debe tratar el administrador a diferencia del profesor 
- Botones compatibles con pantallas pequeñas  

### 4.2.3 Identidad visual

- Colores de marca identificables con armonía de color 
- Componentes limpios, responsive, concisos y faciles de leer
- Uso de Bootstrap Icons  

---

## 4.3 Implementación

### 4.3.1 Frontend – JavaScript

> #### `script.js`

- Render de cursos  
- Filtro por categorías  
- Carrito dinámico  

> #### `perfil.js`

- Operaciones del usuario  
- Progreso y certificados  
- Lecciones  
- Ajustes del perfil  
- Correcciones de eventos  

> #### `administrador.js`

Incluye:
- CRUD de usuarios  
- CRUD de cursos  
- CRUD de lecciones  
- Categorías  
- Filtros avanzados  
- Modales seguros  
- Cargar Offcanvas dinámico  
- Caches locales  

### 4.3.2 Backend – PHP

Más de **30 archivos PHP**, encargados de:

- Login / Registro  
- CRUD de usuarios  
- CRUD de cursos  
- CRUD de lecciones  
- Inscripciones  
- Progreso  
- Envío de correo (PHPMailer)  
- Generación de PDF (FPDF)  
- Gestión de categorías  

Todos devuelven **JSON estructurado** para AJAX.

### 4.3.3 Librerías PHP utilizadas

<p align="center">
  <a href="https://www.fpdf.org/" target="_blank"> 
      <img src="docs/fpdf.gif" alt="Logo FPDF">
  </a>
</p>

**Generación de certificados en tiempo real para acreditar que el usuario ha completado un curso**

<p align="center">
   <a href="https://github.com/PHPMailer/PHPMailer" target="_blank">
      <img src="docs/phpmailer.png" alt="Logo PHPMailer">
   </a>
</p>

**Envío de correos electrónicos al email del administrador**   


### 4.3.4 Base de datos – MySQL

Las tablas que componen la base de datos son:

- `usuarios`  
- `cursos`  
- `categorias`  
- `cursos_categorias`  
- `lecciones`  
- `progreso`  
- `inscripciones`  

Validaciones:
- Emails válidos 
- Roles correctos  
- Contraseñas seguras  
- Inscripción única por curso  

---

## 4.4 Problemas detectados y soluciones

> ### Frontend

- Sidebar móvil -> Reorganizar cuando se ejecutan determinadas funciones y que funciones se llaman entre ellas
- Los botones no hacian nada -> Aliases de php incorrectos provocaba que no se asignasen los IDs y al recibir el dato por ajax, estaba vacio
- Edición de cursos -> Reconstrucción del modal completamente y comprobar a base de prueba y error que todos los campos se rellenan con los valores de la base de datos 
- Eliminado de elementos -> Que se actualice la lista de elementos a tiempo real cuando se elimina uno de ellos

> ### Backend

- Contraseñas en texto plano -> Uso de las funciones php `password_hash`, `password_get_info`, `password_verify` y `hash_equals` para crear y tratar las contraseñas encriptadas en CRUD
- Fallos de método al que se accede la información (acceder directamente a la página de perfil sin haberse logueado) -> Control con `$_SERVER['REQUEST_METHOD']` en las funciones en las que se realizan operaciones CRUD  
- Respuestas inconsistentes -> Mandar los resultados mediantes JSONs codificados correctamente esperando a ser tratados en los success de los bloques de código AJAX  

> ### Base de datos

- IDs inconsistentes  
- Progreso incorrecto  
- Lecciones sin numerar
- Asignar correctamente las lecciones a los cursos
- Orden de las lecciones dentro de los cursos
- Almacenar el progreso de los alumnos

---

# 5. Conclusiones

> ### Logros

- Desarrollo de una plataforma funcional  
- Interfaz moderna y responsive  
- Roles correctamente implementados  
- CRUD completos  
- Certificados PDF  
- Temas claro/oscuro  
- Sistema de correo funcional  

> ### Dificultades superadas

- Render dinámico complejo  
- Depuración de AJAX  
- Integración PHP + jQuery  
- Refactorización completa del panel admin  

> ### Futuras mejoras

- Pagos online reales  
- Chat interno alumno con profesor  
- Mejoras SEO y de accesibilidad
- Permitir a los profesores adjuntar materiales
- Integración con APIs externas para el alojamiento de videos en portales como Daylimotion o Vimeo 

---

# 6. Bibliografía

- Bootstrap 5 Docs
- PHP Manual  
- MySQL 8 Reference  
- PHPMailer Docs  
- FPDF Docs  
- jQuery API  
- MDN Web Docs  
- StackOverflow  

---

# 7. Anexo I – Manual de usuario

> ### <a href="docs/Manual de usuario Foobar.pdf" target="_blank">Descargar</a>

---

# 8. Anexo II – Manual de instalación

> ### <a href="docs/Manual de instalación Foobar.pdf" target="_blank">Descargar</a>

---

# 9. Otros anexos

> ## Diagrama de casos de uso

![Diagrama de Casos de uso](docs/Diagrama%20de%20Casos%20de%20Uso.png)

> ## Diagrama Entidad–Relación

![Diagrama Entidad Relacion](docs/Diagrama%20Entidad%20Relacion%20Foobar.png)

> ## Modelo relacional

![Modelo Relacional](docs/Modelo%20Relacional%20Foobar.png)

---
