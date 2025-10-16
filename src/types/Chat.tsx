export interface Chat {
  id: string;
  participants: string[];
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