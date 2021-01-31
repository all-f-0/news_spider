import {NewsItem} from '../data/common';

export interface Spider {
    /**
     * 添加获取到资讯的监听
     * @param args
     */
    addListener(args: (args: NewsItem) => Promise<void> | void): void

    /**
     * 开始获取资讯
     */
    start(): Promise<Spider>,
}