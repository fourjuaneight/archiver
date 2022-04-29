/* eslint-disable camelcase */
export interface StackExchangeData {
  title: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface Records {
  id: string;
  fields: StackExchangeData;
  createdTime: string;
}

export interface AirtableResp {
  records: Records[];
  offset?: string;
}

export interface AirtableError {
  errors: {
    error: string;
    message: string;
  }[];
}

export interface QuestionOwner {
  account_id: number;
  reputation: number;
  user_id: number;
  user_type: string;
  accept_rate: number;
  profile_image: string;
  display_name: string;
  link: string;
}

export interface QuestionItems {
  tags: string[];
  owner: QuestionOwner;
  is_answered: boolean;
  view_count: number;
  protected_date: number;
  accepted_answer_id: number;
  answer_count: number;
  community_owned_date: number;
  score: number;
  locked_date: number;
  last_activity_date: number;
  creation_date: number;
  last_edit_date: number;
  question_id: number;
  content_license: string;
  link: string;
  title: string;
}

export interface StackExchangeResponse {
  items: QuestionItems[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

export interface BookmarkTagsResponse {
  tags: string[];
  location: string;
}