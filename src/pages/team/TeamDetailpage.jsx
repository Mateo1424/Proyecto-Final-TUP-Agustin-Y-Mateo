import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from '../../routing/navigation';
import { apiFetch } from '../../config';
import { getStoredUser } from '../../utils/Roles';
import TeamInvitationsPanel from '../../components/team/TeamInvitationsPanel';
import CurrentEloPanel from '../../components/rankings/CurrentEloPanel';
import { TeamIdentity, TeamRoster } from '../../components/teams/TeamDetails';
import TeamEditDialog from '../../components/teams/TeamEditDialog';
import './team-detail.css';

export default function TeamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [saving, setSaving] = useState(false);
    const actionLock = useRef(false);
    const teamRequest = useRef(null);

    // Estados de edición para el capitán (RF-10)
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamForm, setEditTeamForm] = useState({ name: '', tag: '', logoUrl: '', isPrivate: false });

    const user = getStoredUser();

    const fetchTeam = useCallback(() => {
        teamRequest.current?.abort();
        const controller = new AbortController();
        teamRequest.current = controller;
        apiFetch(`/teams/${id}`, { signal: controller.signal })
            .then(res => {
                if (res.status === 404) throw new Error('Equipo no encontrado.');
                if (!res.ok) throw new Error('No se pudo cargar el detalle del equipo.');
                return res.json();
            })
            .then(data => {
                if (controller.signal.aborted) return;
                setTeam(data);
                setEditTeamForm({ name: data.name, tag: data.tag, logoUrl: data.logoUrl, isPrivate: Boolean(data.isPrivate) });
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchTeam();
        return () => teamRequest.current?.abort();
    }, [fetchTeam]);

    const handleSessionExpired = () => {
        localStorage.removeItem('user');
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        navigate('/login');
    };

    const readBody = async (response) => {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return null;
        }
    };

    const handleJoin = async () => {
        if (team?.isPrivate || actionLock.current) return;
        if (!user) {
            alert('Tenés que iniciar sesión para unirte a un equipo.');
            navigate('/login');
            return;
        }

        actionLock.current = true;
        setJoining(true);
        try {
            const response = await apiFetch(`/teams/${id}/join`, { method: 'POST' });
            if (response.status === 401) { handleSessionExpired(); return; }
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al unirse');
            alert(data?.message || '¡Te uniste al equipo!');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            actionLock.current = false;
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm(`¿Seguro que querés abandonar el equipo "${team.name}"?`)) return;

        setLeaving(true);
        try {
            const response = await apiFetch(`/teams/${id}/leave`, { method: 'POST' });
            if (response.status === 401) { handleSessionExpired(); return; }
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al abandonar');
            alert('Abandonaste el equipo.');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setLeaving(false);
        }
    };

    // RF-10: Guardar cambios del equipo
    const handleUpdateTeamSubmit = async (e) => {
        e.preventDefault();
        if (actionLock.current) return;
        actionLock.current = true;
        setSaving(true);
        try {
            const response = await apiFetch(`/teams/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editTeamForm)
            });
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al actualizar equipo');
            alert('Equipo actualizado con éxito.');
            setIsEditingTeam(false);
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            actionLock.current = false;
            setSaving(false);
        }
    };

    // RF-13: Expulsar miembro
    const handleRemoveMember = async (memberUserId, memberName) => {
        if (!window.confirm(`¿Expulsar a ${memberName} del equipo?`)) return;
        try {
            const response = await apiFetch(`/teams/${id}/members/${memberUserId}`, { method: 'DELETE' });
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al expulsar');
            alert('Integrante eliminado.');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        }
    };

    // RF-14 / RF-15: Cambiar estado Titular/Suplente o Rol
    const handleToggleStarter = async (member) => {
        try {
            const response = await apiFetch(`/teams/${id}/members/${member.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: member.role || 'Member', isStarter: !member.isStarter })
            });
            if (!response.ok) throw new Error('Error al actualizar rol');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading || (!error && team && team.id !== id)) return <div className="team-detail arena-state" role="status">Cargando detalles del equipo...</div>;
    if (error) return <div className="team-detail"><div className="team-detail-panel" role="alert"><h1>No se pudo mostrar el equipo</h1><p>{error}</p><button className="arena-button" onClick={fetchTeam}>Reintentar</button></div></div>;
    if (!team) return <div className="team-detail arena-state">Equipo no encontrado.</div>;

    const members = team.members || [];
    const isMember = user ? members.some(m => m.userId === user.id) : false;
    const isCaptain = user ? team.captainId === user.id : false;

    return (
        <div className="team-detail">
            <button onClick={() => navigate(-1)} className="arena-detail-link team-detail-back">← Volver a equipos</button>
            <TeamIdentity team={team} members={members} isCaptain={isCaptain} isMember={isMember} joining={joining} leaving={leaving} onEdit={() => setIsEditingTeam(true)} onJoin={handleJoin} onLeave={handleLeave} />
            <TeamRoster team={team} members={members} user={user} isCaptain={isCaptain} onToggleStarter={handleToggleStarter} onRemoveMember={handleRemoveMember} />
            <div className="team-detail-elo"><CurrentEloPanel prototype kind="teams" entityId={team.id} games={[team.gameName]} /></div>
            {isCaptain && <div className="team-detail-invitations"><TeamInvitationsPanel key={team.id} teamId={team.id} /></div>}
            {isCaptain && isEditingTeam && <TeamEditDialog form={editTeamForm} setForm={setEditTeamForm} saving={saving} onSubmit={handleUpdateTeamSubmit} onClose={() => setIsEditingTeam(false)} />}
        </div>
    );
}
