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

export interface Fields {
  author?: string;
  archive?: string;
  content?: string;
  creator?: string;
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
    articles: Fields[];
    comics: Fields[];
    podcasts: Fields[];
    reddits: Fields[];
    tweets: Fields[];
    videos: Fields[];
    shelf: Shelf[];
    [key: string]: Fields[] | Shelf[];
  };
}
