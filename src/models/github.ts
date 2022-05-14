interface RepositoryNode {
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

interface Repository {
  node: RepositoryNode;
  starredAt: string;
}

interface PageInfo {
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
