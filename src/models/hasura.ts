/* eslint-disable camelcase */
export interface HasuraMutationResp {
  [key: string]: {
    returning: {
      id: string;
    }[];
  };
}

export interface HasuraQueryResp {
  [key: string]: {
    [key: string]: any;
  };
}

export interface HasuraErrors {
  errors: {
    extensions: {
      path: string;
      code: string;
    };
    message: string;
  }[];
}

export interface MangaFeed {
  author: string;
  id?: string;
  mangadex_id: string;
  title: string;
}

export interface HasuraMangaFeedQueryResp {
  data: {
    feeds_manga: MangaFeed[];
  };
}
