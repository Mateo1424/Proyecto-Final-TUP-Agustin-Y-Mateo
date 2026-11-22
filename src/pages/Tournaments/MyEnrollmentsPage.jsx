import { useState } from 'react';
import { getStoredUser } from '../../utils/Roles.js';
import { useTournamentInbox } from '../../hooks/useTournamentInbox.js';
import EnrollmentInbox from '../../components/tournaments/EnrollmentInbox.jsx';
import './enrollment-inbox.css';

export default function MyEnrollmentsPage() {
  const user=getStoredUser();
  const [filter,setFilter]=useState({status:'',page:1});
  const inbox=useTournamentInbox(user?.id,filter.status,filter.page);
  return <EnrollmentInbox {...inbox} userId={user?.id} filter={filter}
    onFilter={status => setFilter({status,page:1})}
    onPrevious={() => setFilter(old => ({...old,page:old.page-1}))}
    onNext={() => setFilter(old => ({...old,page:old.page+1}))} />;
}
