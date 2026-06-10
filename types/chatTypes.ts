/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChatMessagePayload {
  message: string;
  conversation_uuid?: string;
}

export interface ChatStreamEvent {
  type: "status" | "tool_call" | "tool_result" | "token" | "done";
  text?: string;
  turn_id?: string;
  conversation_uuid?: string;
  tool_name?: string;
  call_id?: string;
  args?: Record<string, any>;
  outcome?: string;
  result?: any;
  status?: string;
  total_ms?: number;
  tool_calls?: number;
}

export interface ConfirmDraftPayload {
  confirm_id: string;
}

export interface ConfirmDraftResponse {
  status: string;
  message: string;
  data?: {
    invoice_id?: string;
    expense_id?: string;
    total_amount?: number;
  };
}

export interface Conversation {
  uuid: string;
  title: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

export interface ConversationMessage {
  uuid: string;
  role: "user" | "assistant";
  content: string;
  turn_id: string;
  created_at: string;
}

export interface ConversationsResponse {
  items: Conversation[];
  has_more: boolean;
  limit: number;
  offset: number;
}