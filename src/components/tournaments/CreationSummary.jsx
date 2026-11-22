export default function CreationSummary({ isFree, tournamentType, gameName }) {
  const teams = tournamentType === 'Equipo';
  return <section className="creation-summary" aria-labelledby="creation-summary-heading">
    <p className="arena-eyebrow">Antes de publicar</p>
    <h2 id="creation-summary-heading">Tu competencia</h2>
    <p className="creation-summary-game">{gameName}</p>
    <dl className="creation-facts">
      <div><dt>Cupos fijos</dt><dd>8 {teams ? 'equipos' : 'jugadores'}</dd></div>
      {teams && <div><dt>Por equipo</dt><dd>5 titulares</dd></div>}
      <div><dt>Entrada por jugador</dt><dd>{isFree ? 'Gratis' : '250 pts'}</dd></div>
    </dl>
    <h3>{isFree ? 'Puntos por participación' : 'Premios por jugador'}</h3>
    {isFree ? <>
      <dl className="creation-prizes"><div><dt>Completar</dt><dd>50 pts</dd></div><div><dt>Ganar, adicional</dt><dd>100 pts</dd></div></dl>
      <p className="creation-hint">Hasta 200 puntos diarios. Requiere participación válida, sin abandono ni pase libre.</p>
    </> : <>
      <dl className="creation-prizes"><div><dt>Campeón</dt><dd>1.000 pts</dd></div><div><dt>Subcampeón</dt><dd>600 pts</dd></div><div><dt>Semifinalista</dt><dd>200 pts</dd></div></dl>
      <p className="creation-hint">Se acreditan al cierre definitivo. Si no se completan los cupos al iniciar, se cancela y se devuelven las entradas.</p>
    </>}
    <p className="creation-summary-note">Los cupos, costos y premios están fijados por el sistema.</p>
  </section>;
}
