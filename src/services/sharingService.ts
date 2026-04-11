import { apiClient } from '../apiClient';

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

export const sharingService = {
  // Members
  getListMembers: async (listId: string): Promise<ListMember[]> => {
    const response = await apiClient.get<ListMember[]>(`/lists/${listId}/members`);
    return response.data;
  },

  inviteMember: async (listId: string, email: string, role: Role): Promise<ListMember> => {
    const response = await apiClient.post<ListMember>(`/lists/${listId}/members/invite`, {
      email,
      role,
    });
    return response.data;
  },

  updateMemberRole: async (_listId: string, memberId: string, role: Role): Promise<ListMember> => {
    const response = await apiClient.put<ListMember>(`/lists/members/${memberId}/role`, {
      role,
    });
    return response.data;
  },

  removeMember: async (_listId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/lists/members/${memberId}`);
  },

  generateInviteLink: async (listId: string): Promise<string> => {
    const response = await apiClient.post<{ link: string; token: string }>(`/lists/${listId}/invite-link`);
    return response.data.link || `${window.location.origin}/invite/${response.data.token}`;
  },

  // Presence — fetches current online members
  getActiveUsers: async (listId: string): Promise<ListMember[]> => {
    const members = await sharingService.getListMembers(listId);
    return members.filter(m => m.isOnline);
  },
};
