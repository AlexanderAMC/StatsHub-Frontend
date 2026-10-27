import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ProfileModal from './ProfileModal';
import Sidebar from './Sidebar';
import { MATCH_STATUS } from '../data/constants';
import { useMatches } from '../hooks/useMatches';
import { useTournaments } from '../hooks/useTournaments';

// Aquí vive el estado compartido. Las páginas lo leen con useOutletContext().
// Cuando exista el backend, estos dos hooks se reemplazan por llamadas a la API.
export default function Layout() {
  const matchesApi = useMatches();
  const tournamentsApi = useTournaments();
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const liveCount = matchesApi.matches.filter((m) => m.status === MATCH_STATUS.LIVE).length;

  return (
    <div className="d-flex w-100 min-vh-100">
      <Sidebar
        showMenu={showMenu}
        onCloseMenu={() => setShowMenu(false)}
        onOpenProfile={() => setShowProfile(true)}
      />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Header
          liveCount={liveCount}
          onOpenMenu={() => setShowMenu(true)}
          onOpenProfile={() => setShowProfile(true)}
        />
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet context={{ ...matchesApi, ...tournamentsApi }} />
        </main>
      </div>

      <ProfileModal show={showProfile} onHide={() => setShowProfile(false)} />
    </div>
  );
}
