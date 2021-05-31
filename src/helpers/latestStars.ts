import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { CleanStars, LatestStars, StarredRepositories } from '../models/github';

dotenv.config();

let stars: any[] = [];
const { GH_TOKEN } = process.env;

/**
 * Get the lastest GitHub starred repositories.
 * Docs: https://docs.github.com/en/graphql/reference/objects#starredrepositoryconnection
 * @function
 * @async
 *
 * @param {[string]} pagination offset pagination token
 * @return {StarredRepositories} request response with list of starred repos
 */
const latestStars = (pagination?: string): Promise<StarredRepositories> => {
  const filterParams: string = pagination
    ? `first: 100, after: "${pagination}"`
    : `first: 100`;
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          user(login: "fourjuaneight") {
            starredRepositories(${filterParams}) {
              edges {
                node {
                  name
                  owner {
                    login
                  }
                  description
                  url
                  primaryLanguage {
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
    }),
  };

  try {
    return fetch('https://api.github.com/graphql', options)
      .then((response: Response) => response.json())
      .then(
        (results: { data: LatestStars }) =>
          results.data.user.starredRepositories
      )
      .then((githubResponse: StarredRepositories) => {
        if (githubResponse.edges) {
          const data: CleanStars[] = githubResponse.edges.map(({ node }) => ({
            repository: node.name,
            owner: node.owner.login,
            description: node.description,
            url: node.url,
            language: node.primaryLanguage ? node.primaryLanguage.name : '',
          }));

          stars = [...stars, ...data];
        }

        if (githubResponse.pageInfo.hasNextPage) {
          return latestStars(githubResponse.pageInfo.endCursor);
        }

        return githubResponse;
      });
  } catch (error) {
    throw new Error(`GitHub API: \n ${error}`);
  }
};

/**
 * Get latest starred repos from GitHub API, formatted.
 * @function
 * @async
 *
 * @return {CleanStars[] | null} formatted stars array
 */
const latest = async (): Promise<CleanStars[] | null> => {
  try {
    await latestStars();

    console.info(chalk.green('[SUCCESS]'), 'Latest stars retrieved.');

    if (stars.length > 0) {
      return stars as CleanStars[];
    }

    return null;
  } catch (error) {
    throw new Error(`Getting latest GitHub stars: \n ${error}`);
  }
};

export default latest;
