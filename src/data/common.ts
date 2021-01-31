export enum TagType {
    AUTHOR,
    COMMON,
    READ_COUNT
}

/**
 * 资讯作者
 */
export class Author {
    name!: string;
    url?: string;
}

/**
 * 资讯标签
 */
export class NewsTag {
    content!: string;
    type?: TagType;
}

export class RelatedContent {
    content!: string;
    author?: Author;
}

/**
 * 资讯
 */
export class NewsItem {
    id!: string;
    title!: string;
    subtitle?: string;
    tags!: Array<NewsTag>;
    publishDate?: Date;
    hot?: number;
    url!: string;
    content?: string;
    author?: Author;
    relatedContent?: Array<RelatedContent>;
    relatedNews?: Array<NewsItem>;
}