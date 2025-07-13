// src/dashboard_pages/IntegrationsPage.jsx
import React from 'react';
import { GitPullRequestIcon } from '../utils/icons'; // Import an icon

const IntegrationsPage = () => {
    // Mock data for integrations
    const integrations = [
        {
            name: "Zoom Call",
            description: "Integrate your avatars into Zoom meetings for interactive presentations or virtual assistants.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Zoom_logo.svg/1200px-Zoom_logo.svg.png",
            status: "Coming Soon",
            connectAction: () => alert("Zoom integration coming soon!"),
            disabled: true
        },
        {
            name: "Google Meet",
            description: "Bring your AI avatars into Google Meet sessions for dynamic interactions.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Meet_icon_%282020%29.svg/1200px-Google_Meet_icon_%282020%29.svg.png",
            status: "Coming Soon",
            connectAction: () => alert("Google Meet integration coming soon!"),
            disabled: true
        },
        {
            name: "Slack",
            description: "Deploy avatars as conversational bots in your Slack channels for quick responses and support.",
            icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
            status: "Coming Soon",
            connectAction: () => alert("Slack integration coming soon!"),
            disabled: true
        },
        {
            name: "Custom Webhook",
            description: "Connect your avatars to any service that supports webhooks for custom automation workflows.",
            icon: "https://www.svgrepo.com/show/303494/webhook-logo.svg",
            status: "Available",
            connectAction: () => alert("Webhook integration is available. Configure it from your settings."),
            disabled: false
        },
        // Add more integrations as you plan them
    ];

    const connectedIntegrations = [
        // This array would be populated from your backend/database
        // e.g., { name: "Example CRM", status: "Connected", avatarLinked: "Finance Expert" }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-bold text-foreground mb-8 flex items-center gap-3">
                <GitPullRequestIcon size={36} /> Integrations & Automations
            </h2>

            {connectedIntegrations.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">My Connected Integrations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connectedIntegrations.map((integration, index) => (
                            <div key={index} className="bg-card p-6 rounded-lg shadow border border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {integration.icon && <img src={integration.icon} alt={integration.name} className="w-12 h-12 object-contain" />}
                                    <div>
                                        <h4 className="text-xl font-semibold text-foreground">{integration.name}</h4>
                                        <p className="text-sm text-muted-foreground">Status: {integration.status}</p>
                                        {integration.avatarLinked && (
                                            <p className="text-xs text-muted-foreground">Linked to: {integration.avatarLinked}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    Manage
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h3 className="text-2xl font-semibold text-foreground mb-4">Available Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration, index) => (
                    <div key={index} className="bg-card p-6 rounded-lg shadow border border-border flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            {integration.icon && <img src={integration.icon} alt={integration.name} className="w-12 h-12 object-contain" />}
                            <h4 className="text-xl font-semibold text-foreground">{integration.name}</h4>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 flex-grow">{integration.description}</p>
                        <button
                            onClick={integration.connectAction}
                            disabled={integration.disabled}
                            className={`mt-auto px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200
                                ${integration.disabled
                                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                }`}
                        >
                            {integration.status === "Coming Soon" ? "Coming Soon" : "Connect"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntegrationsPage;