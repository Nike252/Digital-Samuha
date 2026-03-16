import { Dashboard } from './Dashboard';

const CoAdhakshyaDashboard = ({ user, onLogout, onNavigate, currentPath }) => {
    return <Dashboard role="co_adhakshya" user={user} onLogout={onLogout} onNavigate={onNavigate} currentPath={currentPath} />;
};

export default CoAdhakshyaDashboard;
