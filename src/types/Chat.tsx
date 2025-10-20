export interface Chat {
  id: string;
  participants: string[];
  participantProfiles?: {uid: string, displayName: string}[]
  lastMessageID: string;
  updatedAt: Date;
  messages: Message[]
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
}