# Plan de rediseño del frontend

Fecha: 2026-11-20. Actualización: 2026-11-22. Estado: fases 0 a 16 implementadas con navegación superior; validación real y hallazgos de auditorías pendientes según cada fase.
Aplicación objetivo: `Frontend/`. Referencia: `Prueba-Front/`.

## Decisiones del usuario

- «Usemos el mismo estilo de Prueba-Front».
- «solo modo oscuro».
- «el dashboard centrado en la actividad personal».
- «empezar por el layout y el listado de torneos».
- «el plan se divida en fases que esten separadas por cada una de las paginas que hay».
- «en las demas paginas implementes tener una barra superior en vez de lateral».

**Actualización de navegación (2026-11-21):** la dirección final es una barra
superior compartida para las páginas autenticadas, reemplazando la lateral de la
primera entrega. Mantener destinos, selección activa, saldo, cierre de sesión y
menú desplegable móvil. Este ajuste se implementó junto con fase 4 y aplica también
a las páginas ya rediseñadas desde el layout compartido. El login conserva una
cabecera de marca propia, sin navegación privada. No se agrega otra fase.

El usuario autorizó implementar cada fase de forma incremental, incluida la
continuación tras «Okey podemos avanzar con el plan». Cada página tiene
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

**Estado:** implementada, incluido el ajuste solicitado de barra superior durante
fase 4. Navegación, saldo, tokens compartidos y carga estática, sin fondo LED.
La lateral se reemplazó en `MainLayout` para todas las páginas autenticadas;
los ocho destinos, saldo, errores/reintentos, logout y guardas se conservan.
Menú desplegable en anchos de hasta 1000px, Escape devuelve foco al botón y
elegir un destino cierra el menú. Sin duplicar navegación en cada página.

**Archivos:** `components/layout/MainLayout.jsx`, `LoadingScreen.jsx`,
`LedBackground.jsx`, estilos globales y componentes comunes que se extraigan.

- Sustituir la identidad LED roja actual por la identidad del prototipo.
- Barra superior de escritorio coherente con Prueba-Front, estados activos y
  saldo visible, sin columna lateral. En móvil, menú compacto desplegable desde
  la cabecera que deje espacio al contenido. Mantener todos los destinos actuales.
- Definir tokens y variantes compartidas para evitar divergencias entre fases.
- Mantener cierre de sesión, guardas, mensajes de error y carga diferida.

**Aceptación:** navegación por teclado y móvil, menú abre/cierra, saldo real y
logout funcionan; ninguna ruta queda inaccesible ni se exponen acciones staff.

### Fase 1. Listado de torneos

**Estado:** implementada. Tarjetas extraídas a `TournamentCard`, encabezado,
horario, cupos, entrada/premios y estados de carga/vacío/error con reintento.
Se mantienen filtro de cancelados, creación para staff y detalles flotantes.

**Ruta:** `/tournaments`. **Página:** `TournamentsPage.jsx`.

- Rediseñar encabezado y tarjetas: juego, nombre, estado, horario, cupo,
  costo por jugador y premio, con jerarquía clara y CTA nativo de detalles.
- Mantener ocultos los cancelados y creación solo para staff.
- Preparar lista vacía, carga y error recuperable; no inventar eventos destacados.

**Aceptación:** tarjetas legibles en móvil, datos API correctos, detalles abre el
flotante y volver no requiere recargar. Primera muestra para aprobación visual.

### Fase 2. Dashboard de actividad personal

**Estado:** implementada. Solicitudes pendientes, invitaciones vigentes y torneos
propios próximos/en curso, con enlaces a su gestión. Saldo y Elo por juego separados.
Se eliminaron los RP, win rate, equipo, partidos y torneos demostrativos.

**Datos y límites:** reutiliza `/users/me/tournament-enrollments` (Pending y
Admitted), `/team-invitations`, `/profile/me`, rankings individuales y el store
de billetera. No se agregaron endpoints. El resumen toma la primera página de
seis solicitudes por estado, muestra hasta tres vigentes ordenadas por inicio y
enlaza siempre a la bandeja completa. No afirma totales ni una agenda exhaustiva.
Las participaciones antiguas sin solicitud de inscripción no aparecen en esa API.

**Verificación:** prueba nueva observada fallando antes de implementar; después,
32 pruebas frontend, lint y build aprobados. Navegador con respuestas aisladas:
actividad poblada, ausencia de actividad/juegos, Elo nulo, fallo de solicitudes
sin perder otros bloques, reintento exitoso, enlace a la bandeja y ancho 320px
sin desbordamiento. Sin certificación de integración real contra Atlas.
Auditoría posterior: `Frontend/anti-slop/audit-003-2026-11-21.md`.

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

**Estado:** implementada. Cabecera de marca y composición coral/lima de
Prueba-Front; formulario móvil compacto, etiquetas vinculadas, autocompletado y
errores asociados a los campos; estado de envío y error del servidor visibles.
Se conserva POST `/auth/login`, esquema RHF/Zod, sesión por cookie, redirección
al dashboard, acceso Google y enlace a registro. Sin cambios de permisos.

**Corrección observada:** la vista no recibía cambios de `formState` a través del
hook compilado. El login ahora se suscribe mediante `useFormState({ control })`
y excluye este componente de la memoización del compilador; el hook compartido
y otros formularios no se modificaron. Validación y estado de envío comprobados
en el navegador con React Compiler activo.

**Verificación:** 33 pruebas, lint y build; prueba de presentación RED antes de
implementar y GREEN después. Navegador con respuestas aisladas: formulario vacío,
rechazo, envío deshabilitado y acceso al dashboard, aviso de retorno Google,
enlace a registro y 320px sin desbordamiento. No se ejecutó OAuth real ni se
verificaron cookies contra Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-004-2026-11-21.md`.

**Ruta:** `/login`. **Página:** `LoginPage.jsx`.

- Adaptar formulario y marca al prototipo, con correo/contraseña, estados de envío,
  errores accesibles y acceso Google existente. Asociar etiquetas a los campos.

**Aceptación:** login local, errores y navegación a registro conservan su conducta;
sin cambios en cookies, guardas o almacenamiento de credenciales.

### Fase 4. Registro

**Estado:** implementada. Cabecera de marca y formulario Prueba-Front dividido
en cuenta, perfil competitivo y contraseña. Campos y selector nativos con
etiquetas/errores vinculados, autocompletado y bloqueo durante el envío.
`RegistrationFields` reutiliza el estilo del login sin cambiar su formulario.
Se conservan esquema RHF/Zod, cuatro juegos, payload `games` con rango Unranked,
sesión/redirección, acceso Google y vuelta al login.

**Verificación:** pruebas RED para etiquetas/grupos y navegación dentro de la
cabecera, luego GREEN. 34 pruebas frontend, lint y build aprobados. Navegador con
respuestas aisladas: campos vacíos, contraseñas distintas, selector Rocket League,
payload esperado, rechazo 409, envío bloqueado y reintento con Enter que abre el
dashboard. Registro y navegación a 320px sin desbordamiento; enlaces login/registro
operativos. Barra superior: cambio Inicio/Torneos, menú/Escape/foco/cierre al navegar,
fallo de saldo/reintento y logout fallido conservando sesión seguido de logout
correcto. Google OAuth real y Atlas no se probaron. Auditoría posterior:
`Frontend/anti-slop/audit-005-2026-11-21.md`.

**Ruta:** `/register`. **Página:** `RegisterPage.jsx`.

- Ordenar identidad, juego/perfil competitivo y contraseña/confirmación.
- Unificar campos, selector de los cuatro juegos y errores RHF/Zod.
- Conservar acceso Google y enlace de vuelta al login.

**Aceptación:** formulario completo desde móvil y teclado; validaciones y payload
existentes preservados; envío doble bloqueado y errores del servidor visibles.

### Fase 5. Perfil propio

**Estado:** implementada. Identidad/avatar, estadísticas recibidas de la API,
videojuegos, equipo y Elo con estilo Prueba-Front, manteniendo la barra superior.
Se reutilizan consultas de Elo/historial/paginación con apariencia optativa para
este perfil; las vistas públicas y de equipo mantienen su presentación previa.

**Edición:** avatar independiente de estadísticas. Se corrigió el flujo anterior
que intentaba guardar estadísticas antes del avatar y fallaba con 403 para
usuarios comunes. La edición de estadísticas sigue disponible para staff y su
permiso se valida en el backend existente. Sin cambios de permisos/endpoints.
Vincular/modificar juegos conserva payloads y confirmación al eliminar; diálogo
nativo con Escape y devolución de foco. Fallos al cargar equipo no se muestran
como ausencia de membresía. Carga y operaciones tienen errores/reintentos visibles.

**Verificación:** nueva prueba RED y luego GREEN; 35 pruebas frontend, lint,
build y diff check aprobados. Verificación independiente: roles, avatar,
rechazos y comparación exacta de la apariencia Elo predeterminada contra la base,
sin bloqueantes. Navegador con respuestas aisladas: avatar con fallo/reintento
sin escritura de estadísticas, alta/edición de juego, diálogo/Escape/foco,
estadísticas de staff, carga/reintento del perfil y equipo, vacío, Elo sin
clasificación, cambio de juego e historial paginado. 320px sin desbordamiento.
La confirmación nativa de eliminación bloqueó la automatización; no se completó
ese recorrido en navegador (método/ruta DELETE cubiertos por prueba). Sin Atlas.
Auditoría posterior: `Frontend/anti-slop/audit-006-2026-11-21.md`.

**Ruta:** `/profile`. **Página:** `profile/ProfilePage.jsx`.

- Reorganizar identidad, avatar, juegos, equipo y clasificación por juego.
- Integrar edición/vinculación de juegos y avatar en el lenguaje visual común.
- Mantener historial Elo y estado sin clasificación sin fabricar un rating.

**Aceptación:** editar perfil/juegos conserva sus efectos; saldo y Elo no se
confunden y todas las acciones mantienen nombres accesibles.

### Fase 6. Perfil público de jugador

**Estado:** implementada. Reutiliza identidad, juegos, equipo y Elo con apariencia
Prueba-Front y barra superior, en modo público sin edición propia/staff ni correo.
Conserva el acceso al equipo, vuelta, rankings y la redirección a `/profile` al
abrir el usuario propio. Muestra la fecha real de última actividad en lugar de
inferir presencia en línea. No consulta saldo ni movimientos del jugador visitado.

**Estados y verificación:** solicitudes cancelables y componente con clave por
ID, para evitar datos anteriores al cambiar de jugador. 404, errores/reintento,
vacío y Elo sin clasificación tienen estados explícitos; 401 conserva vuelta al
login. Prueba RED y luego GREEN; suite final de 36 pruebas, lint, build y diff
check aprobados. Revisión independiente sin bloqueantes: modo público sin edición,
campos privados ausentes, membresía por ID y valores por defecto propios intactos.
Navegador con respuestas aisladas: jugador A, salto rápido desde solicitud lenta
a B sin datos previos, 404, redirección propia, sesión vencida y móvil 320px sin
desbordamiento. Sin cambios de backend ni consulta/escritura de Atlas.
Auditoría posterior: `Frontend/anti-slop/audit-007-2026-11-21.md`.

**Ruta:** `/users/:id`. **Página:** `profile/UserProfilePage.jsx`.

- Reutilizar presentación del perfil propio, retirando controles de edición propia.
- Jerarquizar identidad pública, juegos, equipo, Elo e historial existentes.

**Aceptación:** cambiar de jugador no deja datos anteriores; perfiles inexistentes
y sin resultados tienen estados propios; no se muestran movimientos privados.

### Fase 7. Crear torneo

**Estado:** implementada. Formulario Prueba-Front con barra superior existente,
selección nativa individual/equipos y videojuego, secciones de fechas/reglas y
resumen de cupos, entrada y premios previo al envío. Gratuito/pago actualiza el
resumen; ningún costo o premio es editable. Etiquetas y errores vinculados,
campos y botón bloqueados durante el envío, y valores conservados ante rechazo.

**Verificación:** prueba RED y luego GREEN; 37 pruebas, lint, build y diff check
aprobados. Navegador con respuestas aisladas: vacío inválido, modalidades,
atajos de 2/5 minutos con fin una hora después, payload UTC con ocho cupos y
prizePool 0, rechazo recuperable y éxito con regreso al listado. Móvil 320px sin
desbordamiento del formulario. No se crearon torneos en Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-008-2026-11-21.md`.

**Ruta:** `/tournaments/create`. **Página:** `CreateTournament.jsx`.

- Rediseñar selección individual/equipos y juego con controles nativos accesibles.
- Agrupar fechas, reglas, rango, banner opcional y modalidad gratuita/paga.
- Explicar ocho cupos, costo y premios establecidos por backend antes del envío.

**Aceptación:** campos accesibles, validación existente y atajos de fecha funcionan;
no se habilita edición de premios/costos que el contrato no permita.

### Fase 8. Detalles flotantes del torneo

**Estado:** implementada. Diálogo Prueba-Front sobre el listado y barra superior
existente. Cabecera con juego/formato, estado y fechas; inscripción, economía,
solicitudes propias, reglas, participantes y llaves separados de moderación.
Conserva cancelación, cierre definitivo y eliminación por nombre exacto con sus
restricciones/confirmaciones existentes. Finalizado y cerrado definitivamente
se distinguen explícitamente. Las llaves tienen región desplazable propia y
controles/editores etiquetados. Al cerrar se enfoca el título del listado.

**Verificación:** RED y GREEN de presentación; 38 pruebas, lint/build y diff check
aprobados. Navegador aislado: carga, error/reintento, cerrar/Escape/Atrás sin página
negra, foco al listado, eliminación con coincidencia exacta/rechazo, cierre
definitivo sin edición y solicitudes por equipo. A 320px, documento de 320px y
diálogo de 299px sin desbordamiento; rondas desplazan 1098px dentro de 259px.
Hook/API, bloqueo de mutaciones y confirmaciones nativas de cobro conservados;
sin pagos, liquidación ni cambios en Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-009-2026-11-21.md`.

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

**Estado:** implementada. Vista Prueba-Front con barra superior existente,
marcador destacado por rival, estado real, juego/ronda, ganador y estadísticas
dinámicas del backend. Presentación modular en `MatchPresentation`; comparación
en dos columnas y controles de 44px adaptables a móvil. Se conservan formatos
de porcentaje/moneda/KDA, límites y guardado al salir del campo o presionar Enter.
Etiquetas por estadística/jugador, errores accesibles y reintento de lectura.

**Verificación:** prueba de presentación RED y GREEN; 39 pruebas, lint/build y
diff check aprobados. Navegador aislado: marcador POST y estadística PUT con
payloads originales, controles bloqueados durante envío, límite 100 aplicado,
rechazo visible sin valor inventado y reenvío exitoso. Cambio lento→rápido sin
reemplazo tardío; error/reintento; cierre definitivo y usuario común sin edición;
retorno al diálogo del torneo. Vista de 320px con scrollWidth 320. Sin cambios
en backend, resultados reales ni Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-010-2026-11-21.md`.

**Ruta:** `/tournaments/:id/matches/:matchId`. **Página:** `MatchDetailsPage.jsx`.

- Dar protagonismo a rivales, resultado, estado y estadísticas pertinentes al juego.
- Unificar controles de resultados del moderador, mensajes y retorno al torneo.

**Aceptación:** usuarios comunes no ven edición; cierre definitivo bloquea
controles; datos tardíos de otro partido no reemplazan la vista actual.

### Fase 10. Mis inscripciones

**Estado:** implementada. Bandeja Prueba-Front con barra superior, filtro nativo,
tarjetas por torneo y presentación de solicitud con estado del servidor, entrada
por jugador, confirmación propia y progreso de cinco titulares (o confirmación
individual). Pendiente, admitido y cancelado diferenciados sin inventar pagos.
La variante `inbox` de EnrollmentCard conserva la presentación anterior por
defecto y reutiliza sus mismas reglas de acción. Hook/API sin cambios.

**Verificación:** prueba RED y GREEN; 40 pruebas, lint/build y diff check aprobados.
Navegador aislado: error/reintento, estados, paginación y filtro con vuelta a página
1, vacío y acciones propias. Confirmación simulada rechazada: cero POST; aceptada:
un POST sin identidad ni cuerpo y actualización 2→3 de cinco desde respuesta nueva.
Cancelación simulada termina en Cancelado tras refresco del servidor. Durante envío
se bloquean acciones/filtro/paginación. Móvil 320px con scrollWidth320, botón largo
de 230px y paginación dentro del ancho. No hubo cobros ni cambios en Atlas.
Auditoría posterior `Frontend/anti-slop/audit-011-2026-11-21.md`: aviso previo de
éxito persiste al cambiar filtro, cobertura nativa/real y contraste pendientes.

**Ruta:** `/tournament-enrollments`. **Página:** `MyEnrollmentsPage.jsx`.

- Unificar filtros, solicitudes, progreso de cinco titulares y pagos propios.
- Corregir el desbordamiento móvil identificado en la auditoría anterior.
- Diferenciar pendiente, admitido y cancelado; pendiente no reserva plaza.

**Aceptación:** filtros/paginación y acciones caben en móvil; solo se puede
confirmar el gasto propio y el estado mostrado proviene del servidor.

### Fase 11. Listado de equipos

**Estado:** implementada. Listado Prueba-Front con barra superior existente,
tarjetas modulares con logo/inicial, nombre/tag, juego, acceso público/privado e
integrantes informados por API. Logo faltante o fallido usa inicial; campos
ausentes se indican sin asumir privacidad pública ni fabricar integrantes.
Se conservan enlaces al detalle, crear equipo e invitaciones. Carga/error/reintento
y vacío mantienen la cabecera y acciones disponibles. Consulta `/teams` y permisos
sin cambios.

**Verificación (2026-11-22):** prueba RED y GREEN; 41 pruebas, lint/build y diff
check aprobados. Navegador aislado: error500/reintento, público/privado, logo
ausente/inválido, detalle privado, creación e invitaciones con teclado y regreso
sin refresco, estado vacío. Móvil320px con scrollWidth320 y nombres largos sin
espacios. Sin creación/membresías ni escrituras en Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-012-2026-11-22.md`.

**Ruta:** `/teams`. **Página:** `team/TeamsPage.jsx`.

- Rediseñar tarjetas con identidad, juego, privacidad e integrantes disponibles.
- Unificar accesos a detalle y creación; mostrar estado vacío/error sin datos falsos.

**Aceptación:** tarjetas y acciones existentes funcionan con teclado y móvil;
la privacidad se comunica sin sustituir permisos backend.

### Fase 12. Crear equipo

**Estado:** implementada. Formulario Prueba-Front con barra superior existente,
secciones de identidad/juego/acceso y resumen de privacidad/rol inicial/requisitos.
RHF/Zod muestra errores locales y errores DTO junto a campos etiquetados; nombre
2–40 y tag2–6 coinciden con backend. URL de logo opcional conserva aceptación
previa sin nuevas restricciones. Se envían los mismos cinco campos sin identidad,
trim ni mayúsculas del lado cliente; el backend conserva su normalización.
Privacidad booleana y selección de cuatro juegos nativa. Bloqueo de envío existente
conservado; campos y botón deshabilitados mientras guarda. Reglas de perfil y
membresía siguen en servidor, con explicación y enlace al perfil.

**Verificación (2026-11-22):** pruebas RED y GREEN; 43 pruebas, lint/build y diff
check aprobados. Navegador aislado: vacío inválido sin POST, cambio público/privado,
payload con booleano correcto,400 DTO junto al nombre,409 de membresía con datos
conservados, reintento201 y regreso al listado. Nueva entrada limpia al formulario
y enlace de retorno funcionando; móvil320px con scrollWidth320. Alertas originales
simuladas en fixture; sin creación real ni cambios en Atlas. Auditoría posterior:
`Frontend/anti-slop/audit-013-2026-11-22.md`.

**Ruta:** `/teams/create`. **Página:** `team/CreateTeam.jsx`.

- Adaptar nombre, tag, juego, logo y privacidad a los componentes comunes.
- Explicar consecuencias de público/privado y mostrar validaciones cerca del campo.

**Aceptación:** creación y restricciones actuales preservadas, con envío único,
errores recuperables y selección accesible.

### Fase 13. Detalle del equipo

**Estado:** implementada. Identidad y acceso con estilo Prueba-Front; barra
superior existente conservada. Plantel con capitán, relación propia, titulares y
suplentes; acciones diferenciadas con los predicados originales. Componentes
TeamIdentity/TeamRoster y diálogo TeamEditDialog con campos etiquetados, Escape,
restauración de foco y bloqueo visual durante guardado. Mismo formulario y payload
de edición, sin nuevas restricciones; handlers, confirmaciones y permisos intactos.
Elo e historial reutilizan CurrentEloPanel con datos de la API, sin promedios.
Invitaciones existentes adaptadas mediante CSS limitado al detalle del equipo.

**Verificación (2026-11-22):** RED/GREEN de presentación;44 pruebas, lint/build
aprobados. Navegador aislado verificó edición de privacidad booleana, cambio de
titular, búsqueda/envío/cancelación de invitaciones, expulsión y salida con
confirmación simulada aceptada/rechazada; ingreso emitió POST sin cuerpo. Vista
privada sin ingreso directo, error/reintento, Escape y foco de edición observados.
320px con nombre largo sin overflow; diálogo282px dentro del viewport. No se
hicieron escrituras en Atlas. Integración real/confirmaciones nativas y contraste
completo pendientes en auditoría posterior014.

**Ruta:** `/teams/:id`. **Página:** `team/TeamDetailpage.jsx`.

- Organizar identidad, capitán, miembros/titulares, privacidad, invitaciones y Elo.
- Diferenciar acciones del capitán, integrante y visitante.
- Reutilizar diálogo/formulario común en edición y acciones de membresía existentes.

**Aceptación:** invitar, ingresar, salir, editar y administrar miembros conservan
sus reglas; historial del equipo no se presenta como promedio calculado en React.

### Fase 14. Invitaciones a equipos

**Estado:** implementada. Bandeja TeamInvitationsInbox con estilo Prueba-Front y
barra superior existente. Cada fila reúne equipo enlazado, remitente, estado y
vencimiento; aceptar/rechazar sólo en Pending vigente, reutilizando invitationStatus.
Mensajes de error/resultado y enlace al equipo aceptado, requisitos y acceso al
perfil. Estados vacío/carga y actualización disponibles. Bloqueo global durante
acción y consultas/handlers originales conservados; lista compartida de enviados
del capitán sin cambios.

**Verificación (2026-11-22):** presentación RED/GREEN;45 pruebas, lint/build y
diffcheck aprobados. Navegador aislado:503 de carga y actualización,403 de aceptación
con mensaje conservado, reintento aceptado y enlace al equipo; rechazo confirmado,
estados terminales sin acciones, Pending vencida sin botones, bloqueo de todas las
acciones mientras procesa. POST sin cuerpo/identidad. Vacío y teclado Enter
verificados;320px sin overflow y botones44px con nombres largos. Sin cambios en
Atlas. Auditoría posterior015 registra integración real y contraste completo
pendientes.

**Ruta:** `/team-invitations`. **Página:** `team/TeamInvitationsPage.jsx` y listas asociadas.

- Unificar invitaciones, estado, vigencia y acciones disponibles.
- Hacer visibles aceptación, rechazo, vencimiento, errores y resultado confirmado.

**Aceptación:** no quedan botones activos para invitaciones ya resueltas;
las operaciones conservan comportamiento y permisos actuales.

### Fase 15. Rankings

**Estado:** implementada. RankingsView con estilo Prueba-Front y barra superior
existente. Selector de jugadores/equipos con estado presionado y videojuego con
etiqueta explícita; tabla semántica con identidad enlazada, posición, Elo, partidas
y victorias. Fila propia identificada, rating ausente explícito, saldo separado.
Disposición móvil por filas compactas sin ocultar resultados. Consultas, hook de
cancelación/respuesta vigente, fórmulas y reinicio de página originales conservados.
RankingPagination compartida sin cambios; estilos limitados a la página.

**Verificación (2026-11-22):** RED/GREEN de presentación;46 pruebas, lint/build y
diffcheck aprobados. Tras asociar explícitamente la etiqueta del selector se
repitieron las dos pruebas de rankings, lint/build. Navegador aislado verificó
503/reintento, página2 con posiciones21/22, cambio de tipo/juego con página1,
ausencia de filas viejas durante carga, respuesta tardía descartada, vacío sin
posición ficticia, enlaces propios/públicos/equipos. Móvil320px con tabla270px,
nombres largos y resultados contenidos. Sin cambios en Atlas. Auditoría posterior
016 deja integración real y contraste exhaustivo pendientes.

**Ruta:** `/rankings`. **Página:** `components/layout/Rankings/Leaderboard.jsx`.

- Rediseñar selector de juego/jugadores/equipos, posiciones, rating y paginación.
- Reutilizar identidad de jugador/equipo y enlaces a sus detalles.

**Aceptación:** clasificación legible en móvil, cambio de filtros sin datos viejos,
Elo separado del saldo y sin posiciones inventadas cuando faltan resultados.

### Fase 16. Recompensas

**Estado:** implementada. Catálogo modular con valor/región, compatibilidad, costo
y disponibilidad; saldo y pestañas con estilo Prueba-Front y barra superior.
Comprobantes/códigos ficticios seleccionables y copiables, referencias largas
adaptables, historial de movimientos con importes diferenciados. Enlace a torneo
sólo para tournament_entry/tournament_prize con ObjectId válido; otras referencias
no se interpretan como rutas. Diálogo conserva confirmación/costo/saldo/recuperación
y comportamiento original. Bloques de estado/canje/recuperación y copiado idénticos
a HEAD; APIs, wallet, almacenamiento y clave idempotente sin cambios.

**Verificación (2026-11-22):** RED/GREEN de presentación;47 pruebas, lint/build y
diffcheck aprobados. Navegador aislado verificó error/reintento de catálogo e
historial, canjes vacíos, costo/saldo previsto, Escape/foco sin gasto, timeout
posterior a débito simulado y recuperación con idéntica clave/producto: dos
solicitudes, un débito simulado, saldo consultado2500 y mismo comprobante.
Bloqueo del catálogo mientras hay intento incierto y ningún descuento optimista.
Copiado confirmado, Mis canjes, referencias y enlace de torneo, paginación de
movimientos20/1 verificados.320px sin overflow; códigos230px y diálogo282px.
Sin canjes reales ni escrituras en Atlas. Auditoría posterior017 deja integración
real/sesión y contraste completo pendientes.

**Ruta:** `/rewards`. **Página:** `rewards/RewardsPage.jsx`.

- Consolidar el estilo ya inspirado en el prototipo con los componentes definitivos.
- Mantener Catálogo / Mis canjes / Movimientos, costo, compatibilidad, saldo,
  comprobantes y códigos de prueba copiables.
- Mejorar lectura de referencias largas y accesos a detalles cuando estén disponibles.

**Aceptación:** confirmación clara, recuperación de la misma clave tras error,
sin doble débito ni descuento optimista; códigos siempre identificados como ficticios.

## Cierre y verificación de cada fase

### Evidencia de fases 0 y 1 (2026-11-21)

- 31 pruebas frontend aprobadas; lint, build y `git diff --check` aprobados.
- Navegador con la aplicación real y respuestas aisladas: enlace de detalles
  abre el flotante, Escape devuelve al listado sin recargar; menú móvil abre y
  cierra con Escape devolviendo foco. Consola sin errores en ese recorrido.
- Vistas de 320px y 390px sin desbordamiento horizontal; saldo visible en ambas.
- Capturas de escritorio y móvil guardadas como evidencia de la sesión.
- Esta comprobación visual utiliza mocks: no certifica login/logout real, cada
  destino de navegación, premios ni Elo. La suite conserva las comprobaciones
  existentes de cookies, permisos y contratos. No se alteró Atlas ni el backend.
- Auditoría posterior: `Frontend/anti-slop/audit-002-2026-11-21.md`.
- Al cerrar las fases 0 y 1 restaban la aprobación visual y las fases 2 a 16;
  el avance actual de fase 2 está registrado en su sección.

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
