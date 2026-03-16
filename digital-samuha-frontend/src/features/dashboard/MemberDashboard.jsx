import { Dashboard } from './Dashboard';

const MemberDashboard = ({ user, onLogout, onNavigate, currentPath }) => {
    return <Dashboard role="member" user={user} onLogout={onLogout} onNavigate={onNavigate} currentPath={currentPath} />;
};

export default MemberDashboard;
