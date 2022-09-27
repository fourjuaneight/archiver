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
  chapter: string;
  url: string;
  date: string;
}

export const mangas: { [name: string]: string } = {
  '19 Days': 'dc90853b-a3e6-4d5b-8b47-1fa15aa15923',
  'Asumi-chan is Interested in Lesbian Brothels!':
    'af66b380-623e-4dfc-9fbb-8ca093b9d5a9',
  'Chainsaw Man': 'a77742b1-befd-49a4-bff5-1ad4e6b0ef7b',
  Dandadan: '68112dc1-2b80-4f20-beb8-2f2a8716a430',
  'Do you like big girls?': 'e3c6b051-340a-45fb-9801-057e70253946',
  'Ganbare, Douki-chan': '190616bc-7da6-45fd-abd4-dd2ca656c183',
  'Jujutsu Kaisen': 'c52b2ce3-7f95-469c-96b0-479524fb7a1a',
  'Kaiju No. 8': '237d527f-adb5-420e-8e6e-b7dd006fbe47',
  'Nan Hao & Shang Feng': '829fc3a7-d4f4-42e9-9032-0917083f9e0d',
  'Sousou no Frieren': 'b0b721ff-c388-4486-aa0f-c2b0bb321512',
  'Tamen de Gushi': '3f1453fb-9dac-4aca-a2ea-69613856c952',
  'Tokyo Revengers': '59b36734-f2d6-46d7-97c0-06cfd2380852',
};

const endpoint = (mangaID: string) =>
  `https://api.mangadex.org/manga/${mangaID}/feed?limit=100&includes[]=scanlation_group&includes[]=user&order[volume]=desc&order[chapter]=desc&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&translatedLanguage[]=en`;

export const getManga = async (id: string): Promise<MangaChapter[]> => {
  try {
    const request = await fetch(endpoint(id), {
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
