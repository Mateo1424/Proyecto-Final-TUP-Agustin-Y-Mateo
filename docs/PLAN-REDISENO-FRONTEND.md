# Plan de rediseño del frontend

Fecha: 2026-11-20. Estado: planificación aprobada en dirección visual; implementación pendiente.
Aplicación objetivo: `Frontend/`. Referencia: `Prueba-Front/`.

## Decisiones del usuario

- «Usemos el mismo estilo de Prueba-Front».
- «solo modo oscuro».
- «el dashboard centrado en la actividad personal».
- «empezar por el layout y el listado de torneos».
- «el plan se divida en fases que esten separadas por cada una de las paginas que hay».

Este documento autoriza la planificación, no inicia el rediseño. Cada página tiene
su propia fase; el layout compartido tiene una fase previa. Se mantienen rutas,
permisos y comportamientos existentes, incluidos detalles flotantes de torneos,
confirmación por nombre para eliminar y ocultación de cancelados en el listado.
No se agregan páginas sin ruta actual ni se modifica el prototipo.

## Referencia visual y criterios comunes

Tomar como fuente `Prueba-Front/src/App.css`, `src/index.css` y los componentes
del prototipo. Adaptar su identidad a una aplicación con datos, no copiar la
estructura de una landing en todas las pantallas.

- Fondo `#0b0e0d`, superficie `#121816`, bordes `#293631`, texto `#f1f6ee`.
- Coral `#ff704f` para acciones principales; lima `#c7f36b` para énfasis y selección.
  Ámbar y cian del prototipo quedan como apoyo semántico, sin competir con el CTA.
- Tipografía de títulos Avenir Next Condensed/Arial Narrow; cuerpo Avenir Next/
  Trebuchet MS, con alternativas disponibles en el sistema. No descargar fuentes
  ni crear recursos gráficos nuevos sin acordarlo.
- Mantener composición contundente, títulos condensados, superficies oscuras y
  detalles angulares. Reducir adornos y movimiento en formularios y datos densos.
- Botones, campos, diálogos, avisos, paginación y estados compartidos se construyen
  una vez y se reutilizan. No copiar clases y lógica completas entre páginas.
- React modular, Tailwind, Wouter, Axios, Zustand, lazy loading y RHF/Zod siguen
  siendo el stack. Reutilizar hooks/API/reglas existentes; no migrarlos por estética.
- Solo tema oscuro: sin selector de tema ni estilos de modo claro.
- Estados de carga, vacío, error, éxito, deshabilitado y permisos forman parte del
  diseño de cada fase. Sin números, resultados, cuentas o logros inventados.
- Móvil desde 320px: contenido sin desbordamiento global, controles utilizables y
  tablas/bracket con desplazamiento local señalado cuando corresponda.
- Etiquetas asociadas, controles nativos, foco visible, teclado/Escape, devolución
  de foco en diálogos, contraste AA y respeto a movimiento reducido.

## Fases por página

Cada fase comienza pendiente. El orden inicial es layout → listado de torneos;
esas dos entregas sirven para validar la dirección antes de extenderla al resto.

### Fase 0. Layout y componentes compartidos

**Archivos:** `components/layout/MainLayout.jsx`, `LoadingScreen.jsx`,
`LedBackground.jsx`, estilos globales y componentes comunes que se extraigan.

- Sustituir la identidad LED roja actual por la identidad del prototipo.
- Navegación de escritorio coherente con Prueba-Front, estados activos y saldo
  visible. En móvil, menú compacto desplegable en lugar de una columna fija que
  deje sin espacio al contenido. Mantener todos los destinos actuales.
- Definir tokens y variantes compartidas para evitar divergencias entre fases.
- Mantener cierre de sesión, guardas, mensajes de error y carga diferida.

**Aceptación:** navegación por teclado y móvil, menú abre/cierra, saldo real y
logout funcionan; ninguna ruta queda inaccesible ni se exponen acciones staff.

### Fase 1. Listado de torneos

**Ruta:** `/tournaments`. **Página:** `TournamentsPage.jsx`.

- Rediseñar encabezado y tarjetas: juego, nombre, estado, horario, cupo,
  costo por jugador y premio, con jerarquía clara y CTA nativo de detalles.
- Mantener ocultos los cancelados y creación solo para staff.
- Preparar lista vacía, carga y error recuperable; no inventar eventos destacados.

**Aceptación:** tarjetas legibles en móvil, datos API correctos, detalles abre el
flotante y volver no requiere recargar. Primera muestra para aprobación visual.

### Fase 2. Dashboard de actividad personal

**Ruta:** `/dashboard`. **Página:** `DashboardPage.jsx`.

- Reemplazar contenido demostrativo por actividad del usuario autenticado:
  solicitudes pendientes, inscripciones/torneos propios y accesos a próximas acciones.
- Mostrar saldo y resumen Elo por juego como conceptos separados.
- Priorizar lo que requiere atención antes que promociones o torneos ajenos.
- Si todavía no hay actividad, explicar el estado y enlazar a torneos/equipos.

**Aceptación:** no quedan los RP, win rate, equipo o torneo ficticios actuales.
Cada tarjeta enlaza a su destino real. Si un dato no tiene endpoint, documentar
el faltante antes de prometerlo; no inventar métricas ni ampliar backend automáticamente.

### Fase 3. Inicio de sesión

**Ruta:** `/login`. **Página:** `LoginPage.jsx`.

- Adaptar formulario y marca al prototipo, con correo/contraseña, estados de envío,
  errores accesibles y acceso Google existente. Asociar etiquetas a los campos.

**Aceptación:** login local, errores y navegación a registro conservan su conducta;
sin cambios en cookies, guardas o almacenamiento de credenciales.

### Fase 4. Registro

**Ruta:** `/register`. **Página:** `RegisterPage.jsx`.

- Ordenar identidad, juego/perfil competitivo y contraseña/confirmación.
- Unificar campos, selector de los cuatro juegos y errores RHF/Zod.
- Conservar acceso Google y enlace de vuelta al login.

**Aceptación:** formulario completo desde móvil y teclado; validaciones y payload
existentes preservados; envío doble bloqueado y errores del servidor visibles.

### Fase 5. Perfil propio

**Ruta:** `/profile`. **Página:** `profile/ProfilePage.jsx`.

- Reorganizar identidad, avatar, juegos, equipo y clasificación por juego.
- Integrar edición/vinculación de juegos y avatar en el lenguaje visual común.
- Mantener historial Elo y estado sin clasificación sin fabricar un rating.

**Aceptación:** editar perfil/juegos conserva sus efectos; saldo y Elo no se
confunden y todas las acciones mantienen nombres accesibles.

### Fase 6. Perfil público de jugador

**Ruta:** `/users/:id`. **Página:** `profile/UserProfilePage.jsx`.

- Reutilizar presentación del perfil propio, retirando controles de edición propia.
- Jerarquizar identidad pública, juegos, equipo, Elo e historial existentes.

**Aceptación:** cambiar de jugador no deja datos anteriores; perfiles inexistentes
y sin resultados tienen estados propios; no se muestran movimientos privados.

### Fase 7. Crear torneo

**Ruta:** `/tournaments/create`. **Página:** `CreateTournament.jsx`.

- Rediseñar selección individual/equipos y juego con controles nativos accesibles.
- Agrupar fechas, reglas, rango, banner opcional y modalidad gratuita/paga.
- Explicar ocho cupos, costo y premios establecidos por backend antes del envío.

**Aceptación:** campos accesibles, validación existente y atajos de fecha funcionan;
no se habilita edición de premios/costos que el contrato no permita.

### Fase 8. Detalles flotantes del torneo

**Ruta:** `/tournaments/:id`. **Páginas:** `TournamentDetailsModal.jsx`,
`TournamentDetailsPage.jsx`; componente `TournamentBracket.jsx`.

- Mantener diálogo sobre el listado: cabecera, juego/estado, economía,
  inscripción/confirmaciones propias, reglas, participantes y bracket.
- Separar acciones del participante de moderación y acciones destructivas.
- Rediseñar cancelación, cierre y confirmación por nombre para eliminar, respetando
  restricciones del servidor y distinguiendo finalizado de cerrado definitivamente.
- Bracket adaptable, con desplazamiento propio si es necesario.

**Aceptación:** carga sin leer torneo nulo; cerrar/Escape/Atrás devuelve al listado,
foco controlado; cobros solo tras confirmación y sin doble envío.

### Fase 9. Detalle del partido

**Ruta:** `/tournaments/:id/matches/:matchId`. **Página:** `MatchDetailsPage.jsx`.

- Dar protagonismo a rivales, resultado, estado y estadísticas pertinentes al juego.
- Unificar controles de resultados del moderador, mensajes y retorno al torneo.

**Aceptación:** usuarios comunes no ven edición; cierre definitivo bloquea
controles; datos tardíos de otro partido no reemplazan la vista actual.

### Fase 10. Mis inscripciones

**Ruta:** `/tournament-enrollments`. **Página:** `MyEnrollmentsPage.jsx`.

- Unificar filtros, solicitudes, progreso de cinco titulares y pagos propios.
- Corregir el desbordamiento móvil identificado en la auditoría anterior.
- Diferenciar pendiente, admitido y cancelado; pendiente no reserva plaza.

**Aceptación:** filtros/paginación y acciones caben en móvil; solo se puede
confirmar el gasto propio y el estado mostrado proviene del servidor.

### Fase 11. Listado de equipos

**Ruta:** `/teams`. **Página:** `team/TeamsPage.jsx`.

- Rediseñar tarjetas con identidad, juego, privacidad e integrantes disponibles.
- Unificar accesos a detalle y creación; mostrar estado vacío/error sin datos falsos.

**Aceptación:** tarjetas y acciones existentes funcionan con teclado y móvil;
la privacidad se comunica sin sustituir permisos backend.

### Fase 12. Crear equipo

**Ruta:** `/teams/create`. **Página:** `team/CreateTeam.jsx`.

- Adaptar nombre, tag, juego, logo y privacidad a los componentes comunes.
- Explicar consecuencias de público/privado y mostrar validaciones cerca del campo.

**Aceptación:** creación y restricciones actuales preservadas, con envío único,
errores recuperables y selección accesible.

### Fase 13. Detalle del equipo

**Ruta:** `/teams/:id`. **Página:** `team/TeamDetailpage.jsx`.

- Organizar identidad, capitán, miembros/titulares, privacidad, invitaciones y Elo.
- Diferenciar acciones del capitán, integrante y visitante.
- Reutilizar diálogo/formulario común en edición y acciones de membresía existentes.

**Aceptación:** invitar, ingresar, salir, editar y administrar miembros conservan
sus reglas; historial del equipo no se presenta como promedio calculado en React.

### Fase 14. Invitaciones a equipos

**Ruta:** `/team-invitations`. **Página:** `team/TeamInvitationsPage.jsx` y listas asociadas.

- Unificar invitaciones, estado, vigencia y acciones disponibles.
- Hacer visibles aceptación, rechazo, vencimiento, errores y resultado confirmado.

**Aceptación:** no quedan botones activos para invitaciones ya resueltas;
las operaciones conservan comportamiento y permisos actuales.

### Fase 15. Rankings

**Ruta:** `/rankings`. **Página:** `components/layout/Rankings/Leaderboard.jsx`.

- Rediseñar selector de juego/jugadores/equipos, posiciones, rating y paginación.
- Reutilizar identidad de jugador/equipo y enlaces a sus detalles.

**Aceptación:** clasificación legible en móvil, cambio de filtros sin datos viejos,
Elo separado del saldo y sin posiciones inventadas cuando faltan resultados.

### Fase 16. Recompensas

**Ruta:** `/rewards`. **Página:** `rewards/RewardsPage.jsx`.

- Consolidar el estilo ya inspirado en el prototipo con los componentes definitivos.
- Mantener Catálogo / Mis canjes / Movimientos, costo, compatibilidad, saldo,
  comprobantes y códigos de prueba copiables.
- Mejorar lectura de referencias largas y accesos a detalles cuando estén disponibles.

**Aceptación:** confirmación clara, recuperación de la misma clave tras error,
sin doble débito ni descuento optimista; códigos siempre identificados como ficticios.

## Cierre y verificación de cada fase

1. Revisar la página y sus flujos actuales antes de cambiar presentación.
2. Aplicar componentes comunes sin reescribir reglas de negocio por estética.
3. Verificar escritorio, móvil, teclado y estados; revisar regresiones pertinentes.
4. Ejecutar pruebas apropiadas, lint y build; registrar fallos o comprobaciones pendientes.
5. Registrar archivos, resultado y evidencia en este plan y actualizar `ESTADO.md`
   cuando una fase importante esté terminada. No marcar completada una fase solo
   porque renderiza ni afirmar integración real basándose únicamente en mocks.

La auditoría antislop continúa en modo DESPUÉS, según la elección vigente del
usuario: presentar hallazgos numerados al terminar y corregir solo los seleccionados.
La referencia ya está definida; no se necesita otra ronda de elección estética.

## Límites y trabajo separado

- La prueba real de Rocket League con premios, Elo y cierre repetido sigue
  pendiente de completarse; el rediseño no la da por aprobada ni la sustituye.
- No incluir rediseño de Swagger/Atlas, cambios de permisos, migraciones de datos,
  nuevos endpoints, notificaciones, foro o una landing nueva sin alcance adicional.
- No borrar historial para que las pantallas queden limpias: usar estados vacíos,
  filtros y datos reales. Mantener cancelados fuera del listado según lo acordado.
- La implementación empezará únicamente cuando el usuario solicite ejecutar las
  fases. Primera entrega prevista: fases 0 y 1, antes de extender el estilo.
