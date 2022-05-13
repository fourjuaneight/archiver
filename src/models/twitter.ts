/* eslint-disable camelcase */
export interface LatestTweet {
  id: string;
  text: string;
  created_at: string;
}

export interface TwitterResponse {
  data: LatestTweet[];
  meta: {
    oldest_id: string;
    newest_id: string;
    result_count: number;
    next_token: string;
  };
}

export interface LatestTweetFmt {
  tweet: string;
  date?: string;
  url: string;
}

export interface Fields {
  id?: string;
  tweet: string;
  date: string;
  url: string;
}

export interface Records {
  id: string;
  fields: Fields;
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

export interface HasuraTWQueryResp {
  data: {
    media_tweets: Fields[];
  };
}
