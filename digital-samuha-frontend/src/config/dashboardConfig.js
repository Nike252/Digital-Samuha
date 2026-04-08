import { Home, DollarSign, Users, FileText, Wallet, CreditCard, Calendar, MessageCircle, Settings, Shield, Plus, FilePlus, CheckCircle, Mic, MessageSquare, ShieldCheck } from 'lucide-react';

export const ROLE_CONFIG = {
    adhakshya: {
        sidebarMenu: [
            { label: 'My Dashboard', icon: Home, path: '/dashboard' },
            { label: 'Financial Ledger', icon: DollarSign, path: '/ledger' },
            { label: 'Attendance', icon: Calendar, path: '/attendance' },
            { label: 'Members', icon: Users, path: '/members' },
            { label: 'Documents', icon: FileText, path: '/docs' },
            { label: 'Group Chat', icon: MessageCircle, path: '/chat' },

            { label: 'Settings', icon: Settings, path: '/settings' }
        ],
        stats: [
            { label: 'Total Savings', value: 'Loading...', color: 'bg-green-100 text-green-600', icon: Wallet },
            { label: 'Active Loan', value: 'Loading...', color: 'bg-blue-100 text-blue-600', icon: CreditCard },
            { label: 'Next Meeting', value: 'Loading...', color: 'bg-purple-100 text-purple-600', icon: Calendar },
            { label: 'Total Members', value: '...', color: 'bg-indigo-100 text-indigo-600', icon: Users }
        ],
        quickActions: [
            { label: 'Add Saving', action: 'add_saving', icon: 'Plus' },
            { label: 'Create Meeting', action: 'create_meeting', icon: 'Calendar' },
            { label: 'Approve Loan', action: 'approve_loan', icon: 'CheckCircle' }
        ],
        welcomeMsg: "Welcome back, Adhakshya. Here is your community overview."
    },
    co_adhakshya: {
        sidebarMenu: [
            { label: 'My Dashboard', icon: Home, path: '/dashboard' },
            { label: 'Financial Ledger', icon: DollarSign, path: '/ledger' },
            { label: 'Attendance', icon: Calendar, path: '/attendance' },
            { label: 'Members', icon: Users, path: '/members' },
            { label: 'Documents', icon: FileText, path: '/docs' },
            { label: 'Group Chat', icon: MessageCircle, path: '/chat' },
            { label: 'Settings', icon: Settings, path: '/settings' }
        ],
        stats: [
            { label: 'Total Savings', value: 'Loading...', color: 'bg-green-100 text-green-600', icon: Wallet },
            { label: 'Active Loan', value: 'Loading...', color: 'bg-blue-100 text-blue-600', icon: CreditCard },
            { label: 'Next Meeting', value: 'Loading...', color: 'bg-purple-100 text-purple-600', icon: Calendar },
            { label: 'Total Members', value: '...', color: 'bg-indigo-100 text-indigo-600', icon: Users }
        ],
        quickActions: [
            { label: 'Record Meeting', action: 'record_meeting', icon: 'Mic' },
            { label: 'Add Saving', action: 'add_saving', icon: 'Plus' }
        ],
        welcomeMsg: "Namaste, Co-Adhakshya. Ready to manage the records?"
    },
    member: {
        sidebarMenu: [
            { label: 'My Dashboard', icon: Home, path: '/dashboard' },
            { label: 'Financial Ledger', icon: Wallet, path: '/ledger' },
            { label: 'Members', icon: Users, path: '/members' },
            { label: 'Documents', icon: FileText, path: '/docs' },
            { label: 'Group Chat', icon: MessageCircle, path: '/chat' },
            { label: 'Settings', icon: Settings, path: '/settings' }
        ],
        stats: [
            { label: 'Total Savings', value: 'Loading...', color: 'bg-green-100 text-green-600', icon: Wallet },
            { label: 'Active Loan', value: 'Loading...', color: 'bg-blue-100 text-blue-600', icon: CreditCard },
            { label: 'Next Meeting', value: 'Loading...', color: 'bg-purple-100 text-purple-600', icon: Calendar },
            { label: 'Total Members', value: '...', color: 'bg-indigo-100 text-indigo-600', icon: Users }
        ],
        quickActions: [
            { label: 'Ask AI Bot', action: 'chat_ai', icon: 'MessageSquare' },
            { label: 'Request Loan', action: 'req_loan', icon: 'DollarSign' }
        ],
        welcomeMsg: "Namaste. Here is your personal financial status."
    },
    super_admin: {
        sidebarMenu: [
            { label: 'Registrations', icon: ShieldCheck, path: '/dashboard' },
            { label: 'Settings', icon: Settings, path: '/settings' }
        ],
        stats: [
            { label: 'Pending Samuhas', value: '0', color: 'bg-orange-900/20 text-orange-400', icon: Shield },
            { label: 'Active Samuhas', value: '0', color: 'bg-emerald-900/20 text-emerald-400', icon: CheckCircle }
        ],
        quickActions: [],
        welcomeMsg: "Welcome, Super Admin. Manage and verify new Samuha registrations."
    }
};
