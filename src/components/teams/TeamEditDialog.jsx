import { useEffect, useRef } from 'react';

export default function TeamEditDialog({ form, setForm, saving, onSubmit, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const update = (field, value) => setForm(previous => ({ ...previous, [field]: value }));
  return <dialog ref={dialog} className="team-edit-dialog" aria-labelledby="team-edit-heading" onCancel={event => { if (saving) event.preventDefault(); else onClose(); }}>
    <p className="arena-eyebrow">Configuración del equipo</p>
    <h2 id="team-edit-heading">Editar equipo</h2>
    <form onSubmit={onSubmit} aria-busy={saving}>
      <fieldset disabled={saving}>
        <div><label htmlFor="team-edit-name">Nombre</label><input id="team-edit-name" value={form.name ?? ''} onChange={event => update('name', event.target.value)} required /></div>
        <div><label htmlFor="team-edit-tag">Tag / Siglas</label><input id="team-edit-tag" value={form.tag ?? ''} onChange={event => update('tag', event.target.value)} required /></div>
        <div><label htmlFor="team-edit-logo">Logo URL</label><input id="team-edit-logo" type="text" inputMode="url" value={form.logoUrl ?? ''} onChange={event => update('logoUrl', event.target.value)} /></div>
        <div><label htmlFor="team-edit-privacy">Privacidad</label><select id="team-edit-privacy" value={String(form.isPrivate)} onChange={event => update('isPrivate', event.target.value === 'true')} aria-describedby="team-edit-privacy-help"><option value="false">Público</option><option value="true">Privado</option></select></div>
      </fieldset>
      <p id="team-edit-privacy-help" className="arena-muted">Privado exige invitación; el equipo y sus integrantes siguen siendo visibles. Cambiar esta opción no expulsa miembros.</p>
      <div className="team-detail-actions"><button disabled={saving} type="submit" className="arena-button arena-button-primary">{saving ? 'Guardando...' : 'Guardar cambios'}</button><button disabled={saving} type="button" onClick={onClose} className="arena-button">Cancelar</button></div>
    </form>
  </dialog>;
}
