import puppeteer from 'puppeteer-core';
import {Spider} from '../../common';
import config from '../../config';
import {NewsItem, TagType} from '../../data/common';
import {v1} from 'uuid';

class Author {
    name!: string;
    url!: string;
}

class ListPageInfo {
    title!: string;
    subtitle!: string;
    url!: string;
    readCount!: string;
    author?: Author;
    type?: string;
}

const loadNewsInfo = async (pageInfo: ListPageInfo, index: number): Promise<NewsItem|undefined> => {
    const {title, subtitle, url, readCount, type, author: {name, url: authorUrl} = {name: void 0, url: void 0}} = pageInfo;
    try {
        return new Promise((resolve, reject) => {
            /*
            延时执行 防止访问微博过于频繁
             */
            setTimeout(() => {
                try {
                    const id = v1();
                    //todo 从内容页加载标签 及相关微博 评论信息
                    const newsItem: NewsItem = {
                        title: title,
                        subtitle: subtitle,
                        tags: [{
                            type: TagType.AUTHOR,
                            content: name?name:""
                        }],
                        id,
                        url: url!,
                        hot: index++,
                        ...name ? ({
                            author: {
                                name,
                                url: authorUrl ? authorUrl : void 0
                            }
                        }) : {}
                    }
                    if(readCount) {
                        newsItem.tags.push({
                            type: TagType.READ_COUNT,
                            content: readCount
                        });
                    }
                    if(type) {
                        newsItem.tags.push({
                            type: TagType.COMMON,
                            content: type
                        });
                    }
                    resolve(newsItem);
                } catch (e) {
                    reject(e);
                }
            }, 3000);
        });
    } catch (e) {
        console.error(e);
    }
}

export class WeiboSpider implements Spider {
    cbs: Array<(args: NewsItem) => void> = [];

    addListener(cb: (args: NewsItem) => void | Promise<void>): void {
        this.cbs.push(cb);
    }

    async start(): Promise<Spider> {
        const browser = await puppeteer.launch({
            executablePath: config.chromePath,
            headless: false,
            devtools: true
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.goto("https://weibo.com");
        await page.waitForSelector(".UG_box_foot");
        const hotNewsUrl = (await page.evaluate(() => {
            const hotNewBtn = document.querySelector(".UG_box_foot a")!;
            return hotNewBtn.getAttribute("href");
        }))!;
        await page.goto(hotNewsUrl);
        await page.waitForSelector(".pt_ul");
        try {
            const newsList: Array<ListPageInfo> = (await page.evaluate(() => {
                const ul = document.querySelector(".pt_ul")!;
                const li = ul.querySelectorAll("li")!;
                const newsList = Array.from(li).map(item => {
                    const infoBox = item.querySelector(".info_box")!;
                    const subtitle = infoBox.querySelector(".subtitle")!.innerHTML;
                    const titleBox = infoBox.querySelector(".title a")!;
                    const typeBox = infoBox.querySelector(".title > .W_btn_tag");
                    const title = titleBox.innerHTML;
                    const subInfoBox = infoBox.querySelector(".subinfo")!;
                    const subBoxList = subInfoBox.querySelectorAll(".sub_box")!;
                    const newsItem = {
                        title,
                        subtitle,
                        url: titleBox.getAttribute("href")!,
                        readCount: "0",
                        author: {
                            name: "",
                            url: ""
                        },
                        // @ts-ignore
                        type: typeBox?typeBox.innerText:""
                    }
                    if (subBoxList.length > 0) {
                        newsItem.readCount = subBoxList[0]!.querySelector(".number")!.innerHTML;
                    }
                    if (subBoxList.length > 1) {
                        newsItem.author = {
                            name: subBoxList[1]!.querySelector("a")!.innerHTML,
                            url: subBoxList[1]!.querySelector("a")!.getAttribute("href")!,
                        }
                    }
                    return newsItem;
                });
                return newsList;
            }))!;
            let index = 0;
            for (const item of newsList) {
                const newsItem = await loadNewsInfo(item, index++);
                if(newsItem) {
                    this.cbs.forEach(cb => cb(newsItem));
                }
            }
        } catch (e) {
            console.error(e);
        }
        return this;
    }
};