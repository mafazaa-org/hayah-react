export type Role = 'owner' | 'editor' | 'viewer';

export interface ListMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: Role;
  joinedAt: string;
  isOnline?: boolean;
}

export interface UserPresence {
  userId: string;
  listId: string;
  lastActive: string;
  isViewing: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock members
let mockMembers: ListMember[] = [
  {
    id: 'mem-1',
    user: { id: 'usr-1', name: 'أحمد محمود', email: 'ahmed@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    role: 'owner',
    joinedAt: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: 'mem-2',
    user: { id: 'usr-2', name: 'سارة محمد', email: 'sara@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    role: 'editor',
    joinedAt: new Date().toISOString(),
    isOnline: false,
  },
];

export const sharingService = {
  // Members
  getListMembers: async (/* listId */): Promise<ListMember[]> => {
    await delay(400);
    return [...mockMembers];
  },

  inviteMember: async (_listId: string, email: string, role: Role): Promise<ListMember> => {
    await delay(600);
    const newMember: ListMember = {
      id: `mem-${Date.now()}`,
      user: {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0], // Mock name from email
        email,
      },
      role,
      joinedAt: new Date().toISOString(),
      isOnline: false,
    };
    mockMembers.push(newMember);
    return newMember;
  },

  updateMemberRole: async (_listId: string, memberId: string, role: Role): Promise<ListMember> => {
    await delay(300);
    const memberIndex = mockMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) throw new Error('Member not found');

    mockMembers[memberIndex] = { ...mockMembers[memberIndex], role };
    return mockMembers[memberIndex];
  },

  removeMember: async (_listId: string, memberId: string): Promise<void> => {
    await delay(400);
    mockMembers = mockMembers.filter(m => m.id !== memberId);
  },

  generateInviteLink: async (listId: string): Promise<string> => {
    await delay(300);
    return `https://hayah.app/invite/${listId}?token=${Math.random().toString(36).substring(7)}`;
  },

  // Presence
  getActiveUsers: async (/* listId */): Promise<ListMember[]> => {
    await delay(200);
    // Just returning a subset of members who are "online"
    return mockMembers.filter(m => m.isOnline);
  }
};
