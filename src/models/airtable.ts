import { FieldStatus } from './archive';

export interface Endpoints {
  Bookmarks: string;
  Favorites: string;
  Media: string;
  Records: string;
  [key: string]: string;
}

export interface BKArticleFields {
  archive: string;
  author: string;
  dead?: boolean;
  site: string;
  status?: FieldStatus;
  tags: string[];
  title: string;
  url: string;
}

export interface BKWebFields {
  archive: string;
  creator: string;
  dead?: boolean;
  status?: FieldStatus;
  tags: string[];
  title: string;
  url: string;
}

export interface BKRedditFields {
  content: string;
  date: string;
  dead?: boolean;
  status?: FieldStatus;
  subreddit: string;
  tags: string[];
  title: string;
  url: string;
}

export interface BKTweetFields {
  status?: FieldStatus;
  tags: string[];
  tweet: string;
  url: string;
  user: string;
}

export interface FeedFields {
  category: string;
  title: string;
  rss: string;
  url: string;
}

export interface GitHubFields {
  repository: string;
  owner: string;
  description: string;
  language: string[];
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

interface ShelfCoverThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface MDShelfFields {
  name: string;
  creator: string;
  rating: number;
  category: string;
  cover?: {
    id: string;
    width: number;
    height: number;
    url: string;
    filename: string;
    size: number;
    type: string;
    thumbnails: {
      small: ShelfCoverThumbnail;
      large: ShelfCoverThumbnail;
      full: ShelfCoverThumbnail;
    };
  }[];
  genre: string;
  completed?: boolean;
  comments: string;
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

export interface StackExchangeFields {
  title: string;
  question: string;
  answer: string;
  tags: string[];
}

export type Fields =
  | BKArticleFields
  | BKRedditFields
  | BKTweetFields
  | BKWebFields
  | FeedFields
  | GitHubFields
  | MDAnimeFields
  | MDBookFields
  | MDGameFields
  | MDShelfFields
  | MDTweetFields
  | MDVideoFields
  | RCClientsFields
  | RCJobsFields
  | StackExchangeFields;

export interface Record {
  id: string;
  fields: Fields;
  createdTime: string;
}

export interface AirtableResp {
  records: Record[];
  offset?: string;
}

export interface List {
  [key: string]: Record[];
}

export interface Bases {
  Bookmarks: List;
  Development: List;
  Favorites: List;
  Feeds: List;
  Media: List;
  Records: List;
  [key: string]: List;
}
