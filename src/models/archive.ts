/* eslint-disable camelcase */
export interface B2AuthResp {
  absoluteMinimumPartSize: number;
  accountId: string;
  allowed: {
    bucketId: string;
    bucketName: string;
    capabilities: string[];
    namePrefix: null;
  };
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
  recommendedPartSize: number;
  s3ApiUrl: String;
}

export interface B2UpUrlResp {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
}

export interface B2UploadResp {
  fileId: string;
  fileName: string;
  accountId: string;
  bucketId: string;
  contentLength: number;
  contentSha1: string;
  contentType: string;
  fileInfo: {
    author: string;
  };
  serverSideEncryption: {
    algorithm: string;
    mode: string;
  };
}

export interface B2Error {
  status: number;
  code: string;
  message: string;
}

export interface B2AuthTokens {
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
  recommendedPartSize: number;
}

export interface B2UploadTokens {
  endpoint: string;
  authToken: string;
  downloadUrl: string;
}

export interface Meta {
  name: string;
  table: string;
  schema: string;
}

export interface Fields {
  author?: string;
  archive?: string;
  content?: string;
  creator?: string;
  id?: string;
  site?: string;
  dead: boolean;
  subreddit?: string;
  tags: string[];
  title?: string;
  tweet?: string;
  url: string;
}

export interface FileTypeOps {
  file: string;
  mime: string;
}

export interface FileTypes {
  articles: FileTypeOps;
  comics: FileTypeOps;
  podcasts: FileTypeOps;
  reddits: FileTypeOps;
  videos: FileTypeOps;
  [key: string]: FileTypeOps;
}

export interface MediaBooks {
  title: string;
  author: string;
  genre: string;
}

export interface MediaGames {
  title: string;
  studio: string;
  genre: string;
  platform: string;
}

export interface MediaMovies {
  title: string;
  director: string;
  genre: string;
}

export interface MediaShows {
  title: string;
  director: string;
  genre: string;
}

export interface Shelf {
  category: string;
  comments: string;
  completed: boolean;
  cover: string;
  creator: string;
  genre: string;
  name: string;
  rating: number;
}

export interface RecordsBookstores {
  name: string;
  location: string;
  url: string;
}

export interface RecordsClients {
  name: string;
  company: string;
  stack: string[];
  start: string;
  end: string | null;
}

export interface RecordsJobs {
  company: string;
  position: string;
  start: string;
  end: string | null;
}

export type BackupData =
  | Meta[]
  | Fields[]
  | MediaBooks[]
  | MediaGames[]
  | MediaMovies[]
  | MediaShows[]
  | Shelf[]
  | RecordsBookstores[]
  | RecordsClients[]
  | RecordsJobs[];

export interface HasuraBKQueryResp {
  data: {
    articles: Fields[];
    comics: Fields[];
    podcasts: Fields[];
    reddits: Fields[];
    tweets: Fields[];
    videos: Fields[];
    [key: string]: Fields[];
  };
}

export interface HasuraBackupQueryResp {
  data: {
    meta_categories: Meta[];
    meta_genres: Meta[];
    meta_platforms: Meta[];
    meta_tags: Meta[];
    bookmarks_articles: Fields[];
    bookmarks_comics: Fields[];
    bookmarks_podcasts: Fields[];
    bookmarks_reddits: Fields[];
    bookmarks_tweets: Fields[];
    bookmarks_videos: Fields[];
    media_books: MediaBooks[];
    media_games: MediaGames[];
    media_movies: MediaMovies[];
    media_shows: MediaShows[];
    media_shelf: Shelf[];
    records_bookstores: RecordsBookstores[];
    records_clients: RecordsClients[];
    records_jobs: RecordsJobs[];
    [key: string]: BackupData;
  };
}
