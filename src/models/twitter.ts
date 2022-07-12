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

export interface TwitterList {
  id: string;
  name: string;
}

export interface TwitterUser {
  id?: string;
  name: string;
  username: string;
  description: string | null;
}

export interface TwitterFeed extends TwitterUser {
  list: string;
  url: string;
}

export interface TwitterListResp {
  data: TwitterList[];
  meta: {
    result_count: number;
  };
}

export interface TwitterUserResp {
  data: TwitterUser[];
  meta: {
    result_count: number;
  };
}

export interface Fields {
  id?: string;
  tweet: string;
  date: string;
  url: string;
}

export interface HasuraTWQueryResp {
  data: {
    media_tweets: Fields[];
  };
}

export interface HasuraTWFeedQueryResp {
  data: {
    feeds_twitter: TwitterFeed[];
  };
}
