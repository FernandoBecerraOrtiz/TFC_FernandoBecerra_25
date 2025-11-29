DROP DATABASE IF EXISTS foobar;

CREATE DATABASE IF NOT EXISTS foobar
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE foobar;

SET NAMES utf8mb4;

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('estudiante', 'profesor', 'admin') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	foto_perfil VARCHAR (255) NULL,
    twitter VARCHAR(255) DEFAULT NULL,
    github VARCHAR(255) DEFAULT NULL,
    instagram VARCHAR(255) DEFAULT NULL,
    linkedin VARCHAR(255) DEFAULT NULL,
    tecnologias VARCHAR(255) DEFAULT NULL,
    plan_seleccionado ENUM('gratis', 'pro', 'enterprise') DEFAULT 'gratis'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar usuarios con fechas aleatorias
INSERT INTO usuarios (nombre, email, password, tipo, fecha_registro, foto_perfil, twitter, github, instagram, linkedin, tecnologias, plan_seleccionado) VALUES
('Admin Foobar', 'adminfoobar@gmail.com', '$2y$10$CgvSM3RjDD2jYkSNcsvUleR.tANp5PicI2pUI68vaqbWSf0Q6t5vC', 'admin', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
-- Profesores
('José Antonio Rodríguez Argueta', 'jara@gmail.com', '$2y$10$CeyLJvuG/7rZDlYitMm1qOIPgmmpyuvSTVuOUqQY1Z11oMoQEY8.u', 'admin', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Carlos Azaustre', 'carlosazaustre@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/carlosazaustre.webp', 'carlosazaustre', 'carlosazaustre', 'carlosazaustre/', 'carlosazaustre/', 'JavaScript & Web', 'gratis'),
('Carmen Ansio', 'carmenansio@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/carmenansio.webp', 'carmenansio', 'carmenansio', 'carmenansio/', 'carmenansio/', 'Diseño & Accesibilidad', 'gratis'),
('Carlos Santana Vega', 'dotcsv@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/dotcsv.webp', 'DotCSV', 'dotcsv', 'dotcsv/', 'carlossantanavega/', 'IA & Machine Learning', 'gratis'),
('Miguel Ángel Durán', 'midudev@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/midudev.webp', 'midudev', 'midudev', 'midu.dev/', 'midudev/', 'Web Dev & Comunidad', 'gratis'),
('Miriam González', 'miriamgonp@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/miriamgonp.webp', 'miriamgonp', 'miriamgonp', 'miriamgonp/', 'miriamgonp/', 'Fullstack & Inclusión', 'gratis'),
('Brais Moure', 'mouredev@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'profesor', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'team/mouredev.webp', 'mouredev', 'mouredev', 'mouredev/', 'braismoure/', 'Mobile & DevOps', 'gratis'),
-- Alumnos
('Fernando Becerra Ortiz', 'fernando@gmail.com', '$2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Lucía Hernández', 'lucia.ai@gmail.com', '$2y$10$MWyOVKGx0lONtDgGlh0rQuLBo/oaQ3z/VJixvC2UVIXfXFsB4Wm.O', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * 600 DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Andrés Robles', 'andres.ui@gmail.com', '$2y$10$mQTBHo13m.oCzp9aI1xYu.BIWG7hmdyuFxn72f3chcECCobg5HLTi', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * 600 DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Rosa Martínez', 'rosaestudiante@gmail.com', '$2y$10$OPW.ck1.mRNXlmg.XaTv2eLAPQHiWZnjBZVMT1d0EjsV23JzKC1GS', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * 600 DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Javier Ríos', 'javierrios@gmail.com', '$2y$10$GRkKJRu2Ut1o9/FFJXKC4.DOmVHm72C5sGUqBZpsqYD5T3OmhGUCi', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * 600 DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis'),
('Sofía Delgado', 'sofia.ai@gmail.com', '$2y$10$blrvsjapTPoB5u/rmTD8GOiCOQOfU4EJU5Ehne8iluuKAy.cgZ3iW', 'estudiante', DATE_ADD('2024-01-01', INTERVAL RAND() * 600 DAY), 'person.svg', NULL, NULL, NULL, NULL, NULL, 'gratis');
-- 9 - 14

-- Crear tabla de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    profesor_id INT,
    precio DECIMAL(10,2) DEFAULT 0.00,
    nivel ENUM('básico', 'intermedio', 'avanzado') NOT NULL,
    duracion INT NOT NULL,
    imagen_portada VARCHAR(255) DEFAULT NULL,
    CONSTRAINT fk_curso_profesor FOREIGN KEY (profesor_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar cursos con fechas aleatorias
INSERT INTO cursos (titulo, descripcion, profesor_id, precio, nivel, duracion, imagen_portada) VALUES
('Astro: Sitios Ultra Rápidos', 'Descubre cómo crear sitios web ultrarrápidos con Astro. Aprende a combinar componentes de diferentes frameworks, optimizar el rendimiento y desplegar proyectos eficientes.', 3, 29.99, 'intermedio', 10, 'assets/images/courses/astro.webp'),
('Tailwind: Domina el CSS', 'Domina Tailwind CSS, el framework de estilos más eficiente y moderno. Aprende a crear interfaces atractivas sin escribir CSS personalizado.', 4, 24.99, 'básico', 8, 'assets/images/courses/tailwind.webp'),
('Bootstrap: Construye Rápido', 'Aprende a construir sitios web totalmente responsivos con Bootstrap, el framework CSS más popular. Conoce su sistema de grid, componentes interactivos y personalización avanzada para crear proyectos visualmente atractivos en poco tiempo.', 5, 19.99, 'básico', 6, 'assets/images/courses/bootstrap.webp'),
('jQuery: Optimiza tu Código', 'Facilita la manipulación del DOM y la interacción con JavaScript mediante jQuery. Aprende a utilizar selectores, animaciones, eventos y peticiones AJAX para mejorar la experiencia del usuario en tus proyectos.', 6, 14.99, 'intermedio', 7, 'assets/images/courses/jquery.webp'),
('JavaScript: De Básico a Avanzado', 'Aprende JavaScript desde lo más básico hasta técnicas avanzadas, con buenas prácticas y ejemplos prácticos. Ideal para desarrolladores frontend.', 7, 49.99, 'intermedio', 30, 'assets/images/courses/javascript.webp'),
('Python: Machine Learning', 'Aprende cómo aplicar técnicas de Machine Learning usando Python. Desde la teoría básica hasta la implementación de modelos complejos.', 8, 69.99, 'avanzado', 40, 'assets/images/courses/python.webp'),
('PHP: Desarrollo Backend', 'Este curso abarca el desarrollo backend con PHP, cubriendo desde la instalación de servidores locales hasta la creación de aplicaciones web interactivas.', 3, 39.99, 'intermedio', 30, 'assets/images/courses/php.webp'),
('TensorFlow: IA desde Cero', 'Aprende a construir modelos de IA con TensorFlow desde cero.', 4, 89.99, 'avanzado', 35, 'assets/images/courses/tensorflow.webp'),
('Figma: Diseña Interfaces', 'Diseña interfaces profesionales con Figma para apps web y móviles.', 5, 59.99, 'intermedio', 20, 'assets/images/courses/figma.webp'),
('Next.js: Fullstack Moderno', 'Crea aplicaciones web fullstack modernas con Next.js, React y APIs.', 6, 69.99, 'avanzado', 25, 'assets/images/courses/nextjs.webp'),
('PostgreSQL: SQL Avanzado', 'Aprende SQL avanzado, relaciones, funciones y seguridad en PostgreSQL.', 7, 39.99, 'intermedio', 18, 'assets/images/courses/postgresql.webp'),
('GitHub: Gestiona Proyectos', 'Gestiona proyectos colaborativos con Git y GitHub de manera eficiente.', 8, 19.99, 'básico', 6, 'assets/images/courses/gitgithub.webp'),
('React: Crea Apps Modernas', 'Aprende a crear interfaces modernas y dinámicas con React, la biblioteca más popular de JavaScript.', 3, 59.99, 'intermedio', 25, 'assets/images/courses/react.webp'),
('ChatGPT: IA Conversacional', 'Aprende a utilizar ChatGPT para crear aplicaciones interactivas y chatbots inteligentes. Desde la configuración básica hasta la personalización avanzada.', 4, 39.99, 'intermedio', 12, 'assets/images/courses/chatgpt.webp'),
('n8n: Automatiza sin Código', 'Automatiza tus procesos y conecta tus aplicaciones sin escribir una sola línea de código utilizando n8n. Aprende cómo crear flujos de trabajo eficientes.', 5, 49.99, 'intermedio', 15, 'assets/images/courses/n8n.webp');

-- Crear tabla de categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
	descripcion VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Desarrollo Web', 'Todo sobre desarrollo web'),
('Programación', 'Lenguajes de programación'),
('Frontend', 'Diseño y desarrollo del lado del cliente'),
('Backend', 'Lógica de servidor y bases de datos'),
('Bases de Datos', 'Gestión y administración de bases de datos'),
('DevOps', 'Prácticas de desarrollo y operaciones'),
('JavaScript', 'El lenguaje de la web'),
('CSS', 'Hojas de estilo en cascada'),
('PHP', 'Desarrollo backend con PHP'),
('Inteligencia Artificial', 'Cursos relacionados con el desarrollo y uso de Inteligencia Artificial'),
('Automatización', 'Automatización de procesos y flujos de trabajo');

-- Relación cursos-categorías (Muchos a muchos)
CREATE TABLE cursos_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT,
    categoria_id INT,
    CONSTRAINT fk_curso_categoria_curso FOREIGN KEY (curso_id) 
        REFERENCES cursos(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_curso_categoria_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Relacionar cursos con categorías (pertenecen a más de una categoría) relacion N:M
INSERT INTO cursos_categorias (curso_id, categoria_id) VALUES
(1, 1),  -- Curso de Astro -> Desarrollo Web
(1, 4),  -- Curso de Astro -> Frontend
(1, 6),  -- Curso de Astro -> DevOps
(2, 4),  -- Curso de Tailwind -> Frontend
(2, 8),  -- Curso de Tailwind -> CSS
(3, 1),  -- Curso de Bootstrap -> Desarrollo Web
(3, 3),  -- Curso de Bootstrap -> Frontend
(3, 8),  -- Curso de Bootstrap -> CSS
(4, 7),  -- Curso de jQuery -> JavaScript
(4, 4),  -- Curso de jQuery -> Frontend
(5, 7),  -- Curso de JavaScript -> JavaScript
(5, 4),  -- Curso de JavaScript -> Frontend
(6, 2),  -- Curso de Python -> Programación
(6, 5),  -- Curso de Python -> Bases de Datos
(7, 9),  -- Curso de PHP -> PHP
(7, 2),  -- Curso de PHP -> Programación
(8, 2),  -- IA con TensorFlow -> Programación
(8, 5),  -- IA con TensorFlow -> Bases de Datos
(8, 6),  -- IA con TensorFlow -> DevOps
(9, 3),  -- UI con Figma -> Frontend
(9, 1),  -- UI con Figma -> Desarrollo Web
(10, 1), -- Next.js -> Desarrollo Web
(10, 4), -- Next.js -> Frontend
(10, 2), -- Next.js -> Programación
(11, 5), -- PostgreSQL -> Bases de Datos
(11, 4), -- PostgreSQL -> Backend
(12, 6), -- Git y GitHub -> DevOps
(12, 2), -- Git y GitHub -> Programación
(13, 3),  -- React.js -> Frontend
(13, 7),  -- React.js -> JavaScript
(14, 10),  -- Curso de ChatGPT -> Inteligencia Artificial
(15, 10),  -- Curso de n8n -> Inteligencia Artificial
(15, 11);  -- Curso de n8n -> Automatización

-- Crear tabla de lecciones
CREATE TABLE lecciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    video_url VARCHAR(255) DEFAULT NULL,
    orden INT NOT NULL,
    CONSTRAINT fk_leccion_curso FOREIGN KEY (curso_id) 
        REFERENCES cursos(id) ON DELETE SET NULL ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar lecciones
INSERT INTO `lecciones` (`id`, `curso_id`, `titulo`, `contenido`, `video_url`, `orden`) VALUES
(1, 1, 'Introducción a Astro', 'Qué es Astro y por qué usarlo.', 'https://www.youtube.com/watch?v=F2pw1C9eKXw', 1),
(2, 1, 'Instalación y configuración', 'Cómo instalar Astro en tu entorno.', 'https://www.youtube.com/watch?v=JFHmIp58YOU', 2),
(3, 1, 'Componentes en Astro', 'Uso de componentes y slots.', 'https://www.youtube.com/watch?v=rK-rNRPyET0', 3),
(4, 1, 'Integración con Markdown', 'Cómo usar Markdown en Astro.', 'https://www.youtube.com/watch?v=KNtax5dHPfI', 4),
(5, 1, 'Despliegue', 'Cómo desplegar un sitio Astro.', 'https://www.youtube.com/watch?v=-d7L2n6y5PU', 5),
(6, 2, 'Introducción a Tailwind', 'Cómo funciona Tailwind CSS.', 'https://www.youtube.com/watch?v=bxmDnn7lrnk', 1),
(7, 2, 'Configuración del proyecto', 'Configurando Tailwind en un proyecto.', 'https://www.youtube.com/watch?v=3ZMUgga6SsY', 2),
(8, 2, 'Utilidades de diseño', 'Uso de utilidades para diseño rápido.', 'https://www.youtube.com/watch?v=w0KZhi3DD-0', 3),
(9, 2, 'Componentes reutilizables', 'Creando componentes con Tailwind.', 'https://www.youtube.com/watch?v=1g4W2U-l350', 4),
(10, 2, 'Optimización y producción', 'Optimizar Tailwind para producción.', 'https://www.youtube.com/watch?v=6UVQlB1eo5A', 5),
(11, 3, 'Introducción a Bootstrap', 'Qué es Bootstrap y cómo usarlo.', 'https://www.youtube.com/watch?v=O_9u1P5YjVc', 1),
(12, 3, 'Sistema de grid', 'Cómo funciona el sistema de grid o rejilla.', 'https://www.youtube.com/watch?v=YQRmczOYIG0', 2),
(13, 3, 'Componentes esenciales', 'Uso de botones, alertas, modales.', 'https://www.youtube.com/watch?v=iUCyU_U0J2E', 3),
(14, 3, 'Personalización con Sass', 'Personalizando Bootstrap con Sass.', 'https://www.youtube.com/watch?v=ZZXGmoQ4PdI', 4),
(15, 3, 'Despliegue de proyectos', 'Buenas prácticas para usar Bootstrap.', 'https://www.youtube.com/watch?v=nCeHeA7IsvU', 5),
(16, 4, 'Introducción a jQuery', 'Qué es jQuery y sus beneficios.', 'https://www.youtube.com/watch?v=jVe1GBCqFIE', 1),
(17, 4, 'Selección de elementos', 'Cómo seleccionar elementos con jQuery.', 'https://www.youtube.com/watch?v=hcO4JsLsvqg', 2),
(18, 4, 'Eventos en jQuery', 'Manejo de eventos con jQuery.', 'https://www.youtube.com/watch?v=MaEyWOI7Abs', 3),
(19, 4, 'Manipulación del DOM', 'Añadir y eliminar elementos dinámicamente.', 'https://www.youtube.com/watch?v=Z0RcDRsPh1Q', 4),
(20, 4, 'AJAX y jQuery', 'Hacer peticiones AJAX con jQuery.', 'https://www.youtube.com/watch?v=TvYxbPuIqWc', 5),
(21, 5, 'Introducción a JavaScript', 'Aprende los fundamentos de JavaScript, variables, tipos de datos, y operaciones básicas.', 'https://www.youtube.com/watch?v=NRoET8-8cbw', 1),
(22, 5, 'Funciones en JavaScript', 'Cómo crear y utilizar funciones en JavaScript.', 'https://www.youtube.com/watch?v=Q4p8vRQX8uY', 2),
(23, 5, 'Objetos en JavaScript', 'Introducción a los objetos y cómo usarlos en JavaScript.', 'https://www.youtube.com/watch?v=Icev9Oxf0WA', 3),
(24, 5, 'Eventos en JavaScript', 'Manejo de eventos como clics, cambios de formulario, y más.', 'https://www.youtube.com/watch?v=qpU3WIqRz9I', 4),
(25, 5, 'Promesas y asincronía', 'Cómo manejar código asíncrono usando promesas y async/await.', 'https://www.youtube.com/watch?v=vA-AAeqkpxM', 5),
(26, 6, 'Introducción a Python', 'Sintaxis básica, variables, y tipos de datos en Python.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 1),
(27, 6, 'Condiciones y bucles', 'Cómo usar estructuras de control como if, else, while y for en Python.', 'https://www.youtube.com/watch?v=k9TUPpGqYTo', 2),
(28, 6, 'Funciones en Python', 'Cómo definir y usar funciones en Python.', 'https://www.youtube.com/watch?v=khKv-8q7YmY', 3),
(29, 6, 'Manejo de archivos', 'Cómo leer y escribir archivos en Python.', 'https://www.youtube.com/watch?v=W8KRzm-HUcc', 4),
(30, 6, 'Clases y objetos', 'Introducción a la programación orientada a objetos en Python.', 'https://www.youtube.com/watch?v=daefaLgNkw0', 5),
(31, 7, 'Introducción a PHP', 'Qué es PHP y cómo funciona.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 1),
(32, 7, 'Variables y operadores', 'Cómo declarar variables y usar operadores.', 'https://www.youtube.com/watch?v=3B-CnezwEeo', 2),
(33, 7, 'Estructuras de control', 'Condiciones y bucles en PHP.', 'https://www.youtube.com/watch?v=ABcXbZLm5G8', 3),
(34, 7, 'Conexión con MySQL', 'Cómo conectar PHP con bases de datos MySQL.', 'https://www.youtube.com/watch?v=2CXme275t9k', 4),
(35, 7, 'Desarrollo de una app CRUD', 'Crear una app CRUD con PHP.', 'https://www.youtube.com/watch?v=U2EliFC9NrQ', 5),
(36, 8, 'Introducción a la Inteligencia Artificial', 'Explora qué es la IA, tipos de aprendizaje y aplicaciones reales.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 1),
(37, 8, 'TensorFlow: Instalación y primeros pasos', 'Instalación de TensorFlow, entorno virtual y Hello World IA.', 'https://www.youtube.com/watch?v=eGjDYm86H_E', 2),
(38, 8, 'Red Neuronal Multicapa (MLP)', 'Construcción y entrenamiento de una red neuronal simple.', 'https://www.youtube.com/watch?v=s4Lcf9du9L8', 3),
(39, 8, 'Redes Convolucionales (CNN)', 'Clasificación de imágenes con redes convolucionales en TensorFlow.', 'https://www.youtube.com/watch?v=yX8KuPZCAMo', 4),
(40, 8, 'Exportación y despliegue de modelos IA', 'Guardado, conversión y deploy de modelos TensorFlow.', 'https://www.youtube.com/watch?v=Yf-grlh-moY', 5),
(41, 9, 'Fundamentos del diseño UI/UX', 'Principios de diseño centrado en el usuario y heurísticas.', 'https://www.youtube.com/watch?v=bI6q16ffdgQ', 1),
(42, 9, 'Introducción a Figma', 'Explora la interfaz de Figma y crea tu primer proyecto.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 2),
(43, 9, 'Diseño de interfaces móviles', 'Crea wireframes y prototipos de apps móviles.', 'https://www.youtube.com/watch?v=LcY0X10H2wo', 3),
(44, 9, 'Componentes y auto-layout', 'Diseño escalable con componentes reutilizables.', 'https://www.youtube.com/watch?v=Vjw47lNNbeA', 4),
(45, 9, 'Pruebas de usabilidad y feedback', 'Prototipado interactivo y validación con usuarios.', 'https://www.youtube.com/watch?v=lf6jUWeCKMg', 5),
(46, 10, 'Next.js: Introducción y Setup', 'Inicia un proyecto Next.js y entiende su estructura.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 1),
(47, 10, 'Routing y navegación en Next.js', 'Rutas dinámicas, estáticas y navegación entre páginas.', 'https://www.youtube.com/watch?v=7tbMNvWSXqU', 2),
(48, 10, 'Integración con APIs REST y GraphQL', 'Consume datos externos desde tu aplicación Next.js.', 'https://www.youtube.com/watch?v=l6LaQZSQxlU', 3),
(49, 10, 'Autenticación y Middleware', 'Protege rutas y autentica usuarios con JWT y middleware.', 'https://www.youtube.com/watch?v=ctBJuUXZJUc', 4),
(50, 10, 'Despliegue en Vercel y optimización', 'Publica tu app Next.js y mejora su rendimiento.', 'https://www.youtube.com/watch?v=NNrWNyvrIHI', 5),
(51, 11, 'Introducción a PostgreSQL y SQL', 'Historia, instalación y comandos básicos de PostgreSQL.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 1),
(52, 11, 'Consultas y Joins avanzados', 'Uso de INNER JOIN, LEFT JOIN y consultas anidadas.', 'https://www.youtube.com/watch?v=LA17bOvN-yg', 2),
(53, 11, 'Funciones, Vistas y Triggers', 'Automatiza tareas y encapsula lógica con funciones.', 'https://www.youtube.com/watch?v=8-Pd7dy5ljg', 3),
(54, 11, 'Seguridad y roles en PostgreSQL', 'Gestión de usuarios, roles y permisos.', 'https://www.youtube.com/watch?v=CQh10DTR8d8', 4),
(55, 11, 'Backup y rendimiento', 'Backups, restauraciones y optimización de consultas.', 'https://www.youtube.com/watch?v=DlaanycDbQE', 5),
(56, 12, 'Conceptos básicos de Git', 'Qué es Git, cómo funciona y flujo de trabajo local.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 1),
(57, 12, 'Commits, ramas y merge', 'Crea ramas, resuelve conflictos y haz merge.', 'https://www.youtube.com/watch?v=MFtsLRphqDM', 2),
(58, 12, 'GitHub: Repositorios remotos', 'Push, pull, forks y gestión de repos en GitHub.', 'https://www.youtube.com/watch?v=iNP_KmOFqXs', 3),
(59, 12, 'Pull Requests y revisión de código', 'Colabora con revisiones y control de calidad.', 'https://www.youtube.com/watch?v=v0Ch3yWQ-Zc', 4),
(60, 12, 'Workflows con GitHub Actions', 'Automatiza builds y despliegues con GitHub Actions.', 'https://www.youtube.com/watch?v=KngvG8WzYLU', 5),
(61, 13, 'Introducción a React', 'En esta lección aprenderás qué es React, cómo funciona y sus principales características.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 1),
(62, 13, 'Creando tu primer componente en React', 'Aprende a crear un componente funcional en React y cómo estructurarlo correctamente.', 'https://www.youtube.com/watch?v=kVeOpcw4GWY', 2),
(63, 13, 'El sistema de estado en React', 'Descubre cómo utilizar el estado dentro de los componentes de React y cómo manejarlo.', 'https://www.youtube.com/watch?v=9D1x7-2FmTA', 3),
(64, 13, 'Uso de props en React', 'Explora cómo pasar datos entre componentes utilizando las props en React.', 'https://www.youtube.com/watch?v=pnhO8UaCgxg', 4),
(65, 13, 'React Router y navegación', 'Aprende a usar React Router para gestionar la navegación en tu aplicación React.', 'https://www.youtube.com/watch?v=0sSYmRImgRY', 5),
(66, 14, 'Introducción a ChatGPT', 'En esta lección aprenderás qué es ChatGPT, cómo funciona y sus aplicaciones más comunes.', 'https://www.youtube.com/watch?v=9qiRBhyX11c', 1),
(67, 14, 'Configuración básica de ChatGPT', 'Aprende a configurar y personalizar tu cuenta de ChatGPT para obtener mejores resultados.', 'https://www.youtube.com/watch?v=Q9nn4FBe2mU', 2),
(68, 14, 'Interacciones básicas con ChatGPT', 'Descubre cómo interactuar de forma efectiva con ChatGPT, cómo hacer preguntas y obtener respuestas claras.', 'https://www.youtube.com/watch?v=GjyKZNYLEO8', 3),
(69, 14, 'Uso de ChatGPT en proyectos', 'Explora cómo ChatGPT puede integrarse en tus proyectos de software, chatbots o incluso asistencia personal.', 'https://www.youtube.com/watch?v=0h-q6UXlmC0', 4),
(70, 14, 'Consideraciones éticas en el uso de ChatGPT', 'Entiende las implicaciones éticas y cómo usar ChatGPT de manera responsable.', 'https://www.youtube.com/watch?v=Gpxt_7fGW3Q', 5),
(71, 15, 'Introducción a n8n', 'En esta lección aprenderás qué es n8n y cómo puede ayudarte a automatizar flujos de trabajo.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 1),
(72, 15, 'Configuración inicial de n8n', 'Aprende a instalar y configurar n8n en tu sistema para comenzar a crear automatizaciones.', 'https://www.youtube.com/watch?v=y_cpFMF1pzk', 2),
(73, 15, 'Conexión con APIs en n8n', 'Descubre cómo integrar diversas APIs y servicios externos en tus flujos de trabajo con n8n.', 'https://www.youtube.com/watch?v=rCPXBkeBWCQ', 3),
(74, 15, 'Creación de flujos de trabajo simples en n8n', 'Explora cómo crear flujos de trabajo básicos en n8n y automatizar tareas repetitivas.', 'https://www.youtube.com/watch?v=2YfWuNziPE4', 4),
(75, 15, 'Automatización avanzada con n8n', 'Profundiza en las capacidades avanzadas de n8n, como la manipulación de datos y la creación de flujos dinámicos.', 'https://www.youtube.com/watch?v=kkrA7tGHYNo', 5),
(76, 1, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=TnZ8MkddAUA', 6),
(77, 1, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=39qi3YxyiX8', 7),
(78, 1, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=cH4SdQfoFPU', 8),
(79, 1, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=Eq0j71oLsFs', 9),
(80, 1, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=qEo4NSObLwg', 10),
(81, 2, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=Y6q8R-9y6a0', 6),
(82, 2, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=irfbn103AzE', 7),
(83, 2, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=yCCIztB-S_k', 8),
(84, 2, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=7AT1X9Z41sA', 9),
(85, 2, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=NRoET8-8cbw', 10),
(86, 3, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=lsV8JQgSW1s', 6),
(87, 3, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=s5Lu4QTjeL0', 7),
(88, 3, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=W77qmqrhCcA', 8),
(89, 3, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=XKyyM1VWtUE', 9),
(90, 3, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=drEjyBSu33w', 10),
(91, 4, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=jiOZCNY4gQM', 6),
(92, 4, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=Gq3Aez8sVpM', 7),
(93, 4, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=u_srpc8P4H8', 8),
(94, 4, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=AyvAutztG6E', 9),
(95, 4, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=CdGQJgkLQKM', 10),
(96, 5, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=arfDRUIZOiw', 6),
(97, 5, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=WK6u8YDYqak', 7),
(98, 5, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=VYFjvMfVv2o', 8),
(99, 5, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=vqKie-xmcFs', 9),
(100, 5, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=cY0XJY98d3w', 10),
(101, 6, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 6),
(102, 6, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 7),
(103, 6, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 8),
(104, 6, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 9),
(105, 6, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 10),
(106, 7, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 6),
(107, 7, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 7),
(108, 7, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 8),
(109, 7, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 9),
(110, 7, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=pWG7ajC_OVo', 10),
(111, 8, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 6),
(112, 8, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 7),
(113, 8, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 8),
(114, 8, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 9),
(115, 8, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 10),
(116, 9, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 6),
(117, 9, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 7),
(118, 9, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 8),
(119, 9, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 9),
(120, 9, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=d88nvmnj5mU', 10),
(121, 10, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 6),
(122, 10, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 7),
(123, 10, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 8),
(124, 10, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 9),
(125, 10, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=yQhPWGzQZYQ', 10),
(126, 11, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 6),
(127, 11, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 7),
(128, 11, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 8),
(129, 11, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 9),
(130, 11, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=Tn67kCaLElk', 10),
(131, 12, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 6),
(132, 12, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 7),
(133, 12, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 8),
(134, 12, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 9),
(135, 12, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=3RjQznt-8kE', 10),
(136, 13, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 6),
(137, 13, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 7),
(138, 13, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 8),
(139, 13, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 9),
(140, 13, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=j942wKiXFu8', 10),
(141, 14, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 6),
(142, 14, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 7),
(143, 14, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 8),
(144, 14, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 9),
(145, 14, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=OHZqmJwj7n4', 10),
(146, 15, 'Proyecto práctico I', 'Actividad guiada para afianzar conceptos del curso.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 6),
(147, 15, 'Buenas prácticas', 'Patrones, consejos y convenciones recomendadas.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 7),
(148, 15, 'Optimización y rendimiento', 'Técnicas para mejorar tiempos de carga y uso de recursos.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 8),
(149, 15, 'Integración con herramientas externas', 'Cómo conectar el curso con herramientas del ecosistema.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 9),
(150, 15, 'Proyecto final', 'Implementación completa aplicando todo lo aprendido.', 'https://www.youtube.com/watch?v=4BVTkqbn_tY', 10);

-- Seguimiento del progreso de los estudiantes usuario_leccion relacion N:M
CREATE TABLE progreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    leccion_id INT,
    completado BOOLEAN DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_progreso_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_progreso_leccion FOREIGN KEY (leccion_id) 
        REFERENCES lecciones(id) ON DELETE SET NULL ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Registro de progreso del estudiante en todos los cursos
INSERT INTO progreso (usuario_id, leccion_id, completado, fecha_actualizacion) VALUES
(9, 2, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),   -- Curso 1 (Astro), lección 2
(10, 13, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)), -- Curso 3 (Bootstrap), lección 3
(11, 21, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)), -- Curso 6 (Python), lección 1
(12, 27, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)), -- Curso 7 (PHP), lección 2
(13, 43, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)), -- Curso 10 (Next.js), lección 3
(14, 16, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)); -- Curso 5 (JavaScript), lección 1

-- Inscripciones de estudiantes en cursos
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    curso_id INT,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inscripcion_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_inscripcion_curso FOREIGN KEY (curso_id) 
        REFERENCES cursos(id) ON DELETE SET NULL ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Inscripción del estudiante en todos los cursos usuario_curso relacion N:M
INSERT INTO inscripciones (usuario_id, curso_id, fecha_inscripcion) VALUES
(9, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(9, 2, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(9, 3, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(9, 4, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(9, 5, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(10, 2, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(10, 3, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(10, 6, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(10, 7, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(10, 8, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(11, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(11, 4, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(11, 6, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(11, 9, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(11, 10, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(12, 2, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(12, 5, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(12, 7, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(12, 8, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(12, 11, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(13, 3, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(13, 4, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(13, 6, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(13, 10, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(13, 12, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(14, 1, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(14, 5, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(14, 7, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(14, 9, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY)),
(14, 11, DATE_ADD('2024-01-01', INTERVAL RAND() * (DATEDIFF('2025-12-31', '2024-01-01')) DAY));
