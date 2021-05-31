export interface RepositoryNode {
  name: string;
  owner: {
    login: string;
  };
  description: string;
  url: string;
  primaryLanguage: {
    name: string;
  } | null;
}

export interface Repository {
  node: RepositoryNode;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface StarredRepositories {
  edges: Repository[];
  pageInfo: PageInfo;
}

export interface LatestStars {
  user: {
    starredRepositories: StarredRepositories;
  };
}

export interface CleanRepo {
  repository: string;
  owner: string;
  description: string;
  url: string;
  language: string;
}

export interface Records {
  id: string;
  fields: CleanRepo;
  createdTime: string;
}

export interface AirtableResp {
  records: Records[];
}
