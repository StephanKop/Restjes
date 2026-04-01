export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  consumer_id: string;
  merchant_id: string;
  reservation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationPreview = Conversation & {
  last_message: Message | null;
  other_participant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  unread_count: number;
};
