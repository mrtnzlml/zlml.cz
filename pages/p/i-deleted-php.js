// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1507943214291,
    "title": "I deleted PHP",
    "slug": "i-deleted-php"
  },
  "body": "<p>The most expensive server is the one doing nothing. And that was basically happening with this blog. I always had some kind of shared hosting or VPS but it doesn&#39;t really make sense. It&#39;s just a blog and - let&#39;s be honest - not that popular. How expensive is to take care of such a website? Well, currently I pay about $7 USD (basically only AWS Lightsail + VAT + S3 backups) per month.</p>\n<p>But not anymore! I rewrited this blog from old and not very flexible PHP code to new and modern JS code with great focus on serverless technologies. This is how I reduced the expenses to zero USD. And also - I deleted my last project written in PHP running in production. Now I am completely JS guy... :D</p>\n<h2 id=\"technologies-behind\">Technologies behind <a href=\"#technologies-behind\">#</a></h2><p>This blog runs on <a href=\"https://zeit.co/blog/next4\">Next.js 4</a> with React 16. I could write it in pure JS - sure. But first of all I don&#39;t want to invest to much money and my time into this website and second of all. Next.js is just awesome. Really. Probably the best thing about this framework is server side rendering (SSR) by default. And this is huge for me. It basically means that this blog <strong>works even with JS disabled in browser</strong> because it&#39;s prerendered on server.</p>\n<p>Another quite cool thing is link prefetch. This is one of the things I always missed in PHP. You have great website, you already know where will user most probably click but it&#39;s super hard to prefetch this page. But not with Next.js. With this framework it&#39;s just one word in the link - <code>prefetch</code>:</p>\n<pre><code class=\"hljs lang-js\">&lt;Link prefetch href=<span class=\"hljs-string\">\"/archive\"</span>&gt;blog&lt;<span class=\"hljs-regexp\">/Link&gt;</span>\n</code></pre>\n<p>Just try it. Delete all the cache, go to the homepage and click on the word &quot;blog&quot; in the text. Immediate response. Not even blink. Wow. Now in the archive click on the fist highlighted article. Bam - immediate response. This is because it&#39;s already downloaded and browser just replaces the DOM with new page. Amazing.</p>\n<p>And that&#39;s it. No database, no servers, just JS.</p>\n<h2 id=\"why-did-i-delete-the-database\">Why did I delete the database <a href=\"#why-did-i-delete-the-database\">#</a></h2><p>This was part of the plan. I wanted to simplify this blog. It was to complicated - with administration and everything. And I don&#39;t really have time to maintain it (or finish it to be honest). Therefore I had to face the reality a simplify it as much as possible.</p>\n<p>I originally wanted to use DynamoDB but that&#39;s not really applicable in this scenario because I need more advanced functions like sorting by date and so on. So instead of finding better engine, I decided to use just <a href=\"https://github.com/mrtnzlml/zlml.cz/tree/master/.articles/sources\">pure MD files</a>. Everytime (after I write new article) I just have to recompile it (yeah that&#39;s not really friendly). Why MD files? It reflects how I write articles. I always open IDE and next to the code I write the ideas. Even this article is from IDE. It&#39;s crazy, but who cares - really.</p>\n<p>So during the compilation it generates all the necessary files. It actually generates one new React component per article <strong>with tests</strong> and everything. After this I just have to push it and it&#39;s deployed automatically thanks to Serverless framework.</p>\n<p>Oh and yes - it&#39;s ugly. I know. But I don&#39;t have time to care. Maybe later - it&#39;s MVP... :)</p>\n"
});
