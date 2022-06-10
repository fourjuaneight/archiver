import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';
import { isAfter, parseISO, subHours } from 'date-fns';

import { CleanRepo, LatestStars, StarredRepositories } from '../models/github';

dotenv.config();

let stars: any[] = [];
const { GH_TOKEN } = process.env;

/**
 * Get the lastest GitHub starred repositories.
 * Docs: https://docs.github.com/en/graphql/reference/objects#starredrepositoryconnection
 * Explorer: https://docs.github.com/en/graphql/overview/explorer
 * @function
 * @async
 *
 * @param {[string]} pagination offset pagination token
 * @return {StarredRepositories} request response with list of starred repos
 */
const latestStarredRepos = (
  pagination?: string
): Promise<StarredRepositories> => {
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
                starredAt
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
          const data: CleanRepo[] = githubResponse.edges
            .filter(({ starredAt }) => {
              const sixHoursAgo: Date = subHours(new Date(), 6);
              const starredDate = parseISO(starredAt);

              return isAfter(starredDate, sixHoursAgo);
            })
            .map(({ node }) => ({
              repository: node.name,
              owner: node.owner.login,
              description: node.description,
              url: node.url,
              language: node.primaryLanguage
                ? node.primaryLanguage.name
                : 'Markdown',
            }));

          stars = [...stars, ...data];
        }

        if (githubResponse.pageInfo.hasNextPage) {
          return latestStarredRepos(githubResponse.pageInfo.endCursor);
        }

        return githubResponse;
      });
  } catch (error) {
    throw new Error(`(latestStarredRepos):\n${error}`);
  }
};

/**
 * Get latest starred repos from GitHub API, formatted.
 * @function
 * @async
 *
 * @return {CleanRepo[] | null} formatted stars array
 */
export const latest = async (): Promise<CleanRepo[] | null> => {
  try {
    await latestStarredRepos();

    console.info(chalk.green('[SUCCESS]'), 'Latest stars retrieved.');

    if (stars.length > 0) {
      return stars as CleanRepo[];
    }

    return null;
  } catch (error) {
    throw new Error(`(latest):\n${error}`);
  }
};
