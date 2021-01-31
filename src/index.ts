import {WeiboSpider} from "./spiders/weibo";
import {save2ClickHouse} from './data/save';

setInterval(() => void 0, 1000);

const weiboSpider = new WeiboSpider();
weiboSpider.addListener(save2ClickHouse);
weiboSpider.start().then(() => void 0);

console.log(weiboSpider)