import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { https, pubsub } from 'firebase-functions';
import { getBlogsByLinks } from './parser.js';
import './util.js';

// Init
initializeApp()
const db = getFirestore()
const rssCollectionRef = db.collection('rss');
const feedCollectionRef = db.collection('feed');

export const registerRss = https.onCall(async (data, context) => {
	const blog_title = data['blogTitle'];
	const link = data['link'];
	if (blog_title == undefined || link == undefined) {
		throw new https.HttpsError('invalid-argument', '입력값이 올바르지 않습니다');
	}
	rssCollectionRef.doc(blog_title)
		.set({
			'link': link
		});
});

export const feed = https.onCall(async (data, context) => {
	// Feed
});

export const scheduledUpdateFeed = pubsub.schedule('every 10 minutes').onRun(async (context) => {
	const rssSnapshot = await rssCollectionRef.get();
	const links = rssSnapshot.docs.map(doc => doc.data()['link']);
	const blogs = await getBlogsByLinks(links);
	blogs.forEach(blog => updateBlogDatabase(blog));
})

async function updateBlogDatabase(blog) {
	await blog.items.forEach(async item => {
		// 블로그 글에서 변하지 않는 값은 게시글의 link밖에 없다고 판단해서,
		// link 주소를 hash값으로 변환해서 해당 값을 key로 설정했다.
		const docRef = feedCollectionRef.doc(item.link.hashCode());
		await docRef.get()
			.then(doc => {
				if (doc.exists) { return }
				createFeedDataIfNeeded(docRef, blog.title, item);
				console.log(item.link, 'is created');
			})
	})
}

async function createFeedDataIfNeeded(docRef, blog_title, feed) {
	docRef.set({
		blog_title: blog_title,
		title: feed.title,
		content: feed.content,
		pub_date: Timestamp.fromDate(new Date(feed.pubDate)),
		link: feed.link
	});
}