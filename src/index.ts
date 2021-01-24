import {WeiboSpider} from "./spiders/weibo";

setInterval(() => void 0, 1000);

const weiboSpider = new WeiboSpider();
weiboSpider.start().then(() => void 0);

console.log(weiboSpider)