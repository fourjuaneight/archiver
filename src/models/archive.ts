export interface CFReqBody {
  base: string;
  name: string;
  type: string;
  url: string;
}

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

export type FieldStatus = 'alive' | 'dead';

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

export interface Record {
  id: string;
  fields: Fields;
  createdTime?: string;
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
  [key: string]: List;
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
