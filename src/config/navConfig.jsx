// src/config/navConfig.js
import React from 'react';
import { Home, MessageSquarePlus, Book, Film, UserPlus, FileVideo, Settings, CreditCard, KeyRound, Users, Mic, GalleryHorizontal } from 'lucide-react';

export const navConfig = [
  {
    type: 'section',
    // Removed 'title: "Home",' as per request
    links: [
      {
        text: 'Dashboard',
        to: '/dashboard',
        icon: <Home />,
        isExact: true, // This ensures it only highlights when exactly on /dashboard
      },
    ],
  },
  {
    type: 'section',
    title: 'Conversation',
    links: [
      {
        text: 'Create Conversation',
        to: '/dashboard/chat', // Maps to ChatWithAvatarPage
        icon: <MessageSquarePlus />,
        isExact: true, // Ensure exact match
      },
      {
        text: 'Conversation Library',
        to: '/dashboard/conversation/library',
        icon: <Book />,
        isExact: true, // Ensure exact match
      },
    ],
  },
  {
    type: 'section',
    title: 'Avatar',
    links: [
      {
        text: 'Create Avatar',
        to: '/dashboard/avatars/create', // Maps to CreateAvatar
        icon: <UserPlus />,
        isExact: true, // Ensure exact match
      },
      {
        text: 'My Avatars', // Maps to MyCreations
        to: '/dashboard/avatars/my',
        icon: <Users />,
        isExact: true, // Ensure exact match
      },
      {
        text: 'Public Gallery', // Maps to PublicGallery
        to: '/dashboard/avatars/public',
        icon: <GalleryHorizontal />,
        isExact: true, // Ensure exact match
      },
      {
        text: 'Voices Library',
        to: '/dashboard/voices',
        icon: <Mic />,
        isExact: true, // Ensure exact match
      },
    ],
  },
  {
    type: 'section',
    title: 'Video',
    links: [
      {
        text: 'Video Generation',
        to: '/dashboard/video/generate',
        icon: <Film />,
        isExact: true, // Ensure exact match
      },
      {
        text: 'Video Library',
        to: '/dashboard/video/library',
        icon: <FileVideo />,
        isExact: true, // Ensure exact match
      },
    ],
  },
];

export const bottomNavConfig = [
  {
    text: 'API Keys',
    to: '/dashboard/integrations', // Maps to IntegrationsPage
    icon: <KeyRound />,
    isExact: true, // Ensure exact match
  },
  {
    text: 'Settings',
    to: '/dashboard/settings', // Maps to SettingsPage
    icon: <Settings />,
    isExact: true, // Ensure exact match
  },
  {
    text: 'Pricing',
    to: '/pricing', // Maps to PricingPage (top-level)
    icon: <CreditCard />,
    isExact: true, // Ensure exact match
  },
];
