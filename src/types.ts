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

export interface FieldsBase {
  creator: string;
  url: string;
  tags: string[];
  file?: string;
}

export interface BKWebFields extends FieldsBase {
  title: string;
}

export interface BKTweetFields extends FieldsBase {
  tweet: string;
}

export type Fields = BKWebFields | BKTweetFields;

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
  [key: string]: List;
}
