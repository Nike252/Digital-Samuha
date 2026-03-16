import { Dashboard } from './Dashboard';

const AdhakshyaDashboard = ({ user, onLogout, onNavigate, currentPath }) => {
    return <Dashboard role="adhakshya" user={user} onLogout={onLogout} onNavigate={onNavigate} currentPath={currentPath} />;
};

export default AdhakshyaDashboard;
