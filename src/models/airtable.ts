export interface Endpoints {
  Bookmarks: string;
  Favorites: string;
  Media: string;
  Records: string;
  [key: string]: string;
}

export interface BKWebFields {
  archive: string;
  creator: string;
  title: string;
  url: string;
  tags: string[];
}

export interface BKTweetFields {
  creator: string;
  tweet: string;
  url: string;
  tags: string[];
}

export interface MDRedditFields {
  content: string;
  date: string;
  subreddit: string;
  tags: string[];
  title: string;
  url: string;
}

export interface MDTweetFields {
  tweet: string;
  date: string;
  url: string;
}

export interface MDVideoFields {
  director: string;
  genre: string;
  title: string;
}

export interface MDAnimeFields {
  creator: string;
  genre: string;
  title: string;
}

export interface MDBookFields {
  author: string;
  genre: string;
  title: string;
}

export interface MDGameFields {
  genre: string;
  studio: string;
  title: string;
}

export interface RCFeedFields {
  category: string;
  title: string;
  rss: string;
  url: string;
}

export interface RCClientsFields {
  company: string;
  end: string | null;
  name: string;
  stack: string[];
  start: string;
}

export interface RCJobsFields {
  company: string;
  end: string | null;
  position: string;
  start: string;
}

export type Fields =
  | BKWebFields
  | BKTweetFields
  | MDRedditFields
  | MDTweetFields
  | MDVideoFields
  | MDAnimeFields
  | MDBookFields
  | MDGameFields
  | RCFeedFields
  | RCClientsFields
  | RCJobsFields;

export interface Records {
  id: string;
  fields: Fields;
  createdTime: string;
}

export interface AirtableResp {
  records: Records[];
  offset: string;
}

export interface List {
  [key: string]: Records[];
}

export interface Bases {
  Bookmarks: List;
  Favorites: List;
  Media: List;
  Records: List;
  [key: string]: List;
}