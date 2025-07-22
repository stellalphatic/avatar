// src/dashboard_pages/IntegrationsPage.jsx
import React, { useState } from 'react';
import { GitPullRequestIcon, X, Mic, Volume2, ArrowRight } from 'lucide-react'; // Import necessary icons
import { motion, AnimatePresence } from 'framer-motion'; // For modal animations

const IntegrationsPage = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [selectedIntegrationName, setSelectedIntegrationName] = useState('');

    // Mock data for integrations
    const integrations = [
        {
            name: "Zoom Call",
            description: "Integrate your avatars into Zoom meetings for interactive presentations or virtual assistants. Requires local audio setup.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Zoom_logo.svg/1200px-Zoom_logo.svg.png",
            status: "Requires Setup",
            connectAction: () => {
                setSelectedIntegrationName("Zoom Call");
                setShowIntegrationModal(true);
            },
            disabled: false // Now enabled for setup
        },
        {
            name: "Google Meet",
            description: "Bring your AI avatars into Google Meet sessions for dynamic interactions. Requires local audio setup.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Meet_icon_%282020%29.svg/1200px-Google_Meet_icon_%282020%29.svg.png",
            status: "Requires Setup",
            connectAction: () => {
                setSelectedIntegrationName("Google Meet");
                setShowIntegrationModal(true);
            },
            disabled: false // Now enabled for setup
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
                            {integration.status === "Coming Soon" ? "Coming Soon" : "Configure"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Integration Setup Modal */}
            <AnimatePresence>
                {showIntegrationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowIntegrationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card p-8 rounded-xl shadow-2xl max-w-3xl w-full relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowIntegrationModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-input hover:bg-accent transition-colors"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                Configure {selectedIntegrationName} Integration
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                To integrate your AI avatar with {selectedIntegrationName} for real-time audio conversations, you'll need to set up virtual audio devices on your computer.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight size={20} /> Step 1: Install Virtual Audio Cable Software</h3>
                                    <p className="text-muted-foreground mb-2">
                                        Download and install a virtual audio cable software. Popular options include:
                                    </p>
                                    <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                                        <li><a href="https://vb-audio.com/Cable/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">VB-Cable (Windows)</a></li>
                                        <li><a href="https://rogueamoeba.com/loopback/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Loopback (macOS - paid)</a> or <a href="https://github.com/ExistentialAudio/BlackHole" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">BlackHole (macOS - free)</a></li>
                                    </ul>
                                    <p className="text-sm text-yellow-400 mt-2">
                                        *This software creates virtual microphone and speaker devices on your system.*
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight size={20} /> Step 2: Configure {selectedIntegrationName} Audio Output</h3>
                                    <p className="text-muted-foreground mb-2">
                                        In your {selectedIntegrationName} application, go to its audio settings:
                                    </p>
                                    <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                                        <li>Set your **Speaker** (audio output) to the **Virtual Cable Input** (e.g., "CABLE Input (VB-Audio Virtual Cable)"). This routes meeting audio to the virtual cable.</li>
                                        <li>Make sure your physical speakers are set to listen to the Virtual Cable Output, so you can still hear the meeting.</li>
                                    </ul>
                                    <p className="text-sm text-yellow-400 mt-2">
                                        *This sends all meeting audio into the virtual cable, which your browser can then capture.*
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight size={20} /> Step 3: Configure Your Avatar App's Audio Input</h3>
                                    <p className="text-muted-foreground mb-2">
                                        In your browser, when you start a voice call with your avatar, you will be prompted for microphone access.
                                    </p>
                                    <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                                        <li>When prompted, select the **Virtual Cable Output** (e.g., "CABLE Output (VB-Audio Virtual Cable)") as your microphone.</li>
                                        <li>This allows your avatar app to "hear" the audio coming from the {selectedIntegrationName} meeting.</li>
                                    </ul>
                                    <p className="text-sm text-yellow-400 mt-2">
                                        *Your app will capture this audio, send it to your backend for Speech-to-Text (STT), process with AI, and generate a response.*
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight size={20} /> Step 4: Configure {selectedIntegrationName} Audio Input</h3>
                                    <p className="text-muted-foreground mb-2">
                                        In your {selectedIntegrationName} application, go back to its audio settings:
                                    </p>
                                    <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                                        <li>Set your **Microphone** (audio input) to the **Virtual Cable Input** (e.g., "CABLE Input (VB-Audio Virtual Cable)").</li>
                                        <li>Your avatar app will play its generated speech through the Virtual Cable Output, which will then be picked up by the Virtual Cable Input and fed into {selectedIntegrationName}.</li>
                                    </ul>
                                    <p className="text-sm text-yellow-400 mt-2">
                                        *This sends your avatar's voice directly into the meeting.*
                                    </p>
                                </div>

                                <p className="text-lg text-center text-primary font-semibold mt-8">
                                    This setup allows your avatar to act as a participant in your {selectedIntegrationName} calls.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IntegrationsPage;