// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    HomeIcon, UsersIcon, MicIcon, MessageCircleIcon,
    DollarSignIcon, SettingsIcon, FolderIcon, UploadIcon,
    GlobeIcon, PlusCircleIcon, CpuIcon, BoxIcon, LayoutGridIcon,
    GitPullRequestIcon, BellIcon, HandshakeIcon
} from '../utils/icons'; // Import all icons

const Sidebar = ({ onUpgradeClick }) => {
    const { user, signOut } = useAuth(); // Assuming signOut is available

    // Define sidebar navigation items
    const navItems = [
        { name: "Home", path: "/dashboard", icon: HomeIcon },
        { name: "Projects", path: "/dashboard/projects", icon: FolderIcon, disabled: true }, // Placeholder
        { name: "Templates", path: "/dashboard/templates", icon: LayoutGridIcon, disabled: true }, // Placeholder
    ];

    const avatarSection = [
        { name: "My Creations", path: "/dashboard/avatars/my", icon: UsersIcon },
        { name: "Public Gallery", path: "/dashboard/avatars/public", icon: GlobeIcon },
        { name: "Create New Avatar", path: "/dashboard/avatars/create", icon: PlusCircleIcon },
    ];

    const voiceSection = [
        { name: "Voices", path: "/dashboard/voices", icon: MicIcon },
        // You can add sub-links for My Voices, Public Voices, Upload Voice inside VoicesPage
    ];

    const otherSections = [
        { name: "AI Voice", path: "/dashboard/ai-voice", icon: CpuIcon, disabled: true }, // Placeholder, can merge with Voices
        { name: "Brand", path: "/dashboard/brand", icon: BoxIcon, disabled: true }, // Placeholder
        { name: "Uploads", path: "/dashboard/uploads", icon: UploadIcon, disabled: true }, // Placeholder
        { name: "Integrations", path: "/dashboard/integrations", icon: GitPullRequestIcon },
        { name: "Notifications", path: "/dashboard/notifications", icon: BellIcon, disabled: true }, // Placeholder
    ];

    return (
        <aside className="w-64 bg-card p-6 flex flex-col border-r border-border shadow-lg">
            <div className="flex items-center justify-center mb-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AVATAR</h1>
            </div>

            <nav className="flex-grow space-y-4">
                <div className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                                ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`
                            }
                            disabled={item.disabled}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 ml-3">Avatars</h3>
                    {avatarSection.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                                ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 ml-3">Voice & Content</h3>
                    {voiceSection.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                                ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                    {otherSections.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                                ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                            }
                            disabled={item.disabled}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 ml-3">Tools</h3>
                    <NavLink
                        to="/dashboard/chat"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                            ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`
                        }
                    >
                        <MessageCircleIcon size={20} />
                        <span>Chat with Avatar</span>
                    </NavLink>
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 ml-3">Account</h3>
                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-accent transition-colors
                            ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`
                        }
                    >
                        <SettingsIcon size={20} />
                        <span>Settings</span>
                    </NavLink>
                    <button
                        onClick={onUpgradeClick}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    >
                        <DollarSignIcon size={20} />
                        <span>Upgrade</span>
                    </button>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 mt-4"
                    >
                        Sign Out
                    </button>
                </div>

            </nav>
        </aside>
    );
};

export default Sidebar;