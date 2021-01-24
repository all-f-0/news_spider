import * as puppeteer from 'puppeteer-core';
import {Spider} from '@/common';
import config from '@/config';

export class WeiboSpider implements Spider {
    async start(): Promise<Spider> {
        const browser = await puppeteer.launch({
            executablePath: config.chromePath
        });
        return this;
    }
};