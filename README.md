# Rick & Morty Explorer

## Miniaplicación web consumiendo una API REST

**Laboratorio de Programación Web**
**Actividad 4. Miniaplicación web consumiendo una API REST**

🔗 **Sitio publicado:** https://leslynieto64-del.github.io/rick-morty-explorer-practica4/

---

## Objetivo

Integrar una aplicación web con un servicio externo mediante una API REST, utilizando JSON, Fetch API y programación asíncrona para obtener, procesar y presentar información.

## Situación de trabajo

Una organización desea incorporar información proveniente de un servicio externo sin capturarla manualmente. El equipo debe integrar los datos y ofrecer una experiencia clara al usuario.

## Descripción del proyecto

**Rick & Morty Explorer** es una miniaplicación web que consulta en tiempo real la información de los personajes de la serie *Rick and Morty* a partir de una API REST pública. Al abrir la página se cargan automáticamente los primeros 20 personajes, y cada uno se muestra en una tarjeta con su imagen, nombre, número de identificación, estado, especie, género, lugar de origen, última ubicación conocida y número de episodios en los que aparece.

El usuario puede buscar personajes por nombre, filtrarlos por estado, especie y género, y recorrer los resultados con la paginación. La aplicación muestra un mensaje mientras se cargan los datos, avisa cuando no hay resultados y presenta mensajes comprensibles si ocurre un error.

## API utilizada

Se utilizó **[The Rick and Morty API](https://rickandmortyapi.com/documentation)**, una API REST pública y gratuita con información de los personajes, ubicaciones y episodios de la serie. No requiere registro ni clave de acceso y no maneja datos sensibles. Todas las solicitudes se hacen con el método `GET` sobre HTTPS y las respuestas se entregan en formato JSON.

### Endpoint utilizado

```
GET https://rickandmortyapi.com/api/character
```

Ejemplo con filtros:

```
GET https://rickandmortyapi.com/api/character?name=rick&status=alive
```

### Parámetros

| Parámetro | Descripción | Valores aceptados |
|-----------|-------------|-------------------|
| `name` | Nombre del personaje (también encuentra coincidencias parciales) | Texto libre, ej. `rick` |
| `status` | Estado del personaje | `alive`, `dead`, `unknown` |
| `species` | Especie del personaje | Texto libre, ej. `Human`, `Alien` |
| `gender` | Género del personaje | `female`, `male`, `genderless`, `unknown` |
| `page` | Número de página | `1`, `2`, `3`… |

### Formato de respuesta

```json
{
  "info": {
    "count": 826,
    "pages": 42,
    "next": "https://rickandmortyapi.com/api/character?page=2",
    "prev": null
  },
  "results": [
    {
      "id": 1,
      "name": "Rick Sanchez",
      "status": "Alive",
      "species": "Human",
      "gender": "Male",
      "origin": { "name": "Earth (C-137)" },
      "location": { "name": "Citadel of Ricks" },
      "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      "episode": ["https://rickandmortyapi.com/api/episode/1", "..."]
    }
  ]
}
```

- `info`: datos de la paginación (total de personajes, total de páginas y enlaces a la página siguiente y anterior).
- `results`: arreglo con hasta 20 personajes por página.

*Respuesta resumida: solo se muestran los campos que utiliza la aplicación.*

### Códigos de respuesta y manejo de errores

| Código o situación | Significado | Mensaje que muestra la aplicación |
|--------------------|-------------|-----------------------------------|
| `200 OK` | Consulta correcta | Se muestran las tarjetas, el total de personajes y la paginación |
| `404 Not Found` | Ningún personaje coincide con los filtros | "No se encontraron personajes con esos criterios." |
| `429 Too Many Requests` | Demasiadas solicitudes | "La API recibió demasiadas solicitudes. Espera un momento e inténtalo de nuevo." |
| `500` o mayor | Error del servidor de la API | "El servicio no está disponible temporalmente. Inténtalo de nuevo más tarde." |
| Sin conexión | No fue posible contactar a la API | "No fue posible conectar con la API. Revisa tu conexión e inténtalo de nuevo." |

En los casos de error también aparece el botón **Intentar de nuevo**, que repite la última consulta.

## Funcionalidades

- **Consumo asíncrono de la API:** las consultas se realizan con `fetch()` y `async/await`, dentro de un bloque `try...catch...finally`.
- **Búsqueda por nombre:** permite encontrar personajes escribiendo su nombre completo o una parte.
- **Filtros por estado, especie y género:** solo se agregan a la consulta los filtros que el usuario llena.
- **Limpiar filtros:** vacía el formulario y vuelve a cargar la lista completa.
- **Paginación:** botones Anterior y Siguiente con indicador de página actual y total de páginas.
- **Tarjetas creadas dinámicamente en el DOM:** con `createElement()` y `textContent`, sin usar `innerHTML`.
- **Estados de carga, resultado vacío y error:** con mensajes claros y botón para reintentar.
- **Cancelación de solicitudes anteriores:** mediante `AbortController`, para que resultados viejos no reemplacen a los más recientes.
- **Diseño responsivo:** la cuadrícula pasa de 4 a 3, 2 y 1 columna según el tamaño de la pantalla.

## Tecnologías utilizadas

- **HTML5:** Fue utilizado para estructurar la página, el formulario de búsqueda y las secciones de resultados y paginación.
- **CSS3:** Se utilizó para el diseño visual, los colores según el estado del personaje, la cuadrícula de tarjetas y el diseño responsivo con media queries.
- **JavaScript ES6+:** Se utilizó para programar la lógica de la aplicación, usando `const` y `let`, funciones flecha, template literals y métodos de arreglos.
- **Fetch API y async/await:** Se utilizaron para consumir la API de forma asíncrona sin bloquear la página.
- **JSON:** Es el formato en el que la API entrega los datos que procesa la aplicación.
- **Git y GitHub:** Fueron utilizados para el control de versiones y el almacenamiento del código.
- **GitHub Pages:** Se utilizó para publicar el sitio en una URL pública.

## Estructura del proyecto

```
rick-morty-explorer-practica4/
├── index.html    # Estructura de la página
├── style.css     # Estilos y diseño responsivo
├── app.js        # Consumo de la API, filtros, paginación y manejo de errores
├── Capturas/     # Capturas de la aplicación
└── README.md
```

## Instrucciones de uso

### Usar el sitio en línea

1. Abrir el [sitio publicado](https://leslynieto64-del.github.io/rick-morty-explorer-practica4/). Al cargar, se muestran los primeros 20 personajes.
2. Escribir un nombre en el campo **Nombre** y, si se desea, elegir **Estado**, **Especie** (en inglés, por ejemplo `Human` o `Alien`) y **Género**.
3. Presionar **Buscar** para ver los resultados.
4. Usar **Anterior** y **Siguiente** para cambiar de página.
5. Presionar **Limpiar filtros** para volver a la lista completa.
6. Si aparece un mensaje de error, revisar la conexión a internet y presionar **Intentar de nuevo**.

### Ejecutar en local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/leslynieto64-del/rick-morty-explorer-practica4.git
   ```
2. Abrir la carpeta en Visual Studio Code.
3. Abrir `index.html` con la extensión **Live Server** (o directamente en el navegador).

No se necesita instalar dependencias ni configurar claves, pero sí conexión a internet para consultar la API.

## Capturas de la aplicación

A continuación se muestran capturas de la aplicación en su versión para computadora y en dispositivos móviles.

### Vista en computadora

![Rick & Morty Explorer](<Capturas/vista_pc.png>)

### Vista en dispositivo móvil

![Rick & Morty Explorer móvil](<Capturas/vista_movil.png>)

## Reflexión técnica

Este proyecto nos permitió entender cómo una aplicación web puede obtener información de un servicio externo en lugar de tenerla escrita en el código. Antes de programar fue necesario leer la documentación de la API para conocer el endpoint, los parámetros disponibles y la forma de la respuesta JSON, lo que facilitó decidir qué datos mostrar y cómo construir los filtros.

El principal reto fue que la información llega de forma asíncrona y no siempre de manera correcta. Con `async/await` el código resulta más fácil de leer que con promesas encadenadas, pero hubo que considerar qué ocurre mientras se espera la respuesta, cuándo no hay resultados y cuándo falla la conexión. También observamos que la API responde con un código `404` cuando un filtro no encuentra coincidencias, por lo que lo tratamos como un resultado vacío y no como un error. Por último, crear los elementos con `createElement()` y `textContent` en lugar de `innerHTML` nos hizo ver la importancia de manejar con cuidado los datos que provienen de fuentes externas.

---

Datos obtenidos de [The Rick and Morty API](https://rickandmortyapi.com/).
