import fetch from 'isomorphic-fetch';

interface Attributes {
  name: string;
  altNames: {
    en: string;
  }[];
  locked: boolean;
  website: string;
  ircServer: null;
  ircChannel: null;
  discord: null;
  contactEmail: null;
  description: string;
  twitter: null;
  mangaUpdates: null;
  focusedLanguages: string[];
  official: boolean;
  verified: boolean;
  inactive: boolean;
  publishDelay: null;
  createdAt: string;
  updatedAt: string;
  version: number;
  username: string;
  roles: string[];
}

interface RelationshipsEntity {
  id: string;
  type: string;
  attributes?: Attributes;
}

interface MangaData {
  id: string;
  type: string;
  attributes: {
    volume: null;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
  relationships: RelationshipsEntity[];
}

type MangaResults = 'ok' | 'error';

interface MangaFeed {
  result: MangaResults;
  response: string;
  data: MangaData[];
  limit: number;
  offset: number;
  total: number;
}

interface MangaError {
  result: MangaResults;
  errors: {
    id: string;
    status: number;
    title: string;
    detail: string;
  }[];
}

interface MangaChapter {
  title: string;
  author: string;
  chapter: string;
  url: string;
  date: string;
}

const endpoint = (mangaID: string) =>
  `https://api.mangadex.org/manga/${mangaID}/feed?limit=100&includes[]=scanlation_group&includes[]=user&order[volume]=desc&order[chapter]=desc&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&translatedLanguage[]=en`;

// Get chapter details from Mangadex ID.
export const getManga = async (
  mangaID: string,
  author: string
): Promise<MangaChapter[]> => {
  try {
    const request = await fetch(endpoint(mangaID), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response: MangaFeed | MangaError = await request.json();

    if (response.result === 'error') {
      const { errors } = response as MangaError;
      const err = errors
        .map(({ title, detail }) => `${title} - ${detail}`)
        .join('\n');

      throw new Error(`[getManga]:\n${err}`);
    }

    const { data } = response as MangaFeed;
    const chapters = data.filter(
      dt => dt.type === 'chapter' && dt.attributes.translatedLanguage === 'en'
    );
    const cleanChapters: MangaChapter[] = chapters
      .map(({ attributes }) => ({
        title: attributes.title,
        author,
        chapter: attributes.chapter,
        url: attributes.externalUrl,
        date: attributes.readableAt,
      }))
      .filter(({ url }) => url);

    return cleanChapters;
  } catch (error) {
    throw new Error(`[getManga]: ${error}`);
  }
};
