import axios from 'axios';
import rssParser from 'rss-parser';

export async function getBlogsByLinks(links) {
	return await Promise.all(links.map(async link => await getFeed(link)));
}

async function getFeed(url) {
	const parser = new rssParser();

	const response = await axios.get(url);
	const xml = await response.data;
	const feed = await parser.parseString(xml);

	return feed
}