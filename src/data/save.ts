import {NewsItem} from './common';

/**
 * 保存资讯到clickhouse
 * @param newsItem
 */
export const save2ClickHouse = async (newsItem: NewsItem) => {
    console.log(newsItem);
}