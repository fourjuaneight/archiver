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
