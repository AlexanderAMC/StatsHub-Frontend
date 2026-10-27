import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ProfileModal from './ProfileModal';
import Sidebar from './Sidebar';
import { MATCH_STATUS } from '../data/constants';
import { useData } from '../hooks/useData';

export default function Layout() {
  const { matches } = useData();
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const liveCount = matches.filter((m) => m.status === MATCH_STATUS.LIVE).length;

  return (
    <div className="d-flex w-100 min-vh-100">
      <Sidebar showMenu={showMenu} onCloseMenu={() => setShowMenu(false)} onOpenProfile={() => setShowProfile(true)} />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Header liveCount={liveCount} onOpenMenu={() => setShowMenu(true)} onOpenProfile={() => setShowProfile(true)} />
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>

      <ProfileModal show={showProfile} onHide={() => setShowProfile(false)} />
    </div>
  );
}
