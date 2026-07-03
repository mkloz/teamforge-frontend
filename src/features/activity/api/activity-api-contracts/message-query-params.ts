export interface GetChatMessagesParams {
  limit?: number;
  page?: number;
}

export interface SearchChatMessagesParams extends GetChatMessagesParams {
  query: string;
}
