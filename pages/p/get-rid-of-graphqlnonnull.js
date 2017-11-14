// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1497708814000,
    "title": "Get rid of GraphQLNonNull",
    "slug": "get-rid-of-graphqlnonnull"
  },
  "body": "<p>I mean not all of the occurrences but at least in GraphQL fields. This is exactly what we did in <a href=\"https://www.kiwi.com/us/\">Kiwi.com</a> while working on GraphQL API.</p>\n<p>This idea didn&#39;t come out of nowhere. Actually, I&#39;ve been thinking about it for a while but after <a href=\"https://graphql-europe.org/\">GraphQL-Europe</a> I have been convinced (unfortunately I haven&#39;t been there personally). But you may ask why? Why would I do that?</p>\n<p>There are several reasons for it. Firstly it&#39;s prepared for the future (in terms of backward compatibility). This means that if you want to make field non-nullable you can do it anytime you want. But you cannot do the same thing vice versa because it&#39;s huge BC break for consumers of your API.</p>\n<p>But more importantly, it has a more practical reason. As you probably know the graph in GraphQL consists of a lot of complicated paths and leaves. And every leaf can have different resolver function. In extreme situation, each resolver may be some kind of microservice and this microservice may fail unexpectedly. It&#39;s very wrong to let the whole node of the graph fail. And that&#39;s exactly what happens if you don&#39;t satisfy the non-null rule.</p>\n<p>For example, let&#39;s run this query:</p>\n<pre><code class=\"hljs lang-graphql\">{\n  allLocations(term: &quot;PRG&quot;) {\n    edges {\n      node {\n        locationId\n        name\n      }\n      cursor\n    }\n  }\n}\n</code></pre>\n<p>This query returns an array of all locations related to the search term sorted starting with the best result:</p>\n<pre><code class=\"hljs lang-javascript\">{\n  <span class=\"hljs-string\">\"data\"</span>: {\n    <span class=\"hljs-string\">\"allLocations\"</span>: {\n      <span class=\"hljs-string\">\"edges\"</span>: [\n        {\n          <span class=\"hljs-string\">\"node\"</span>: {\n            <span class=\"hljs-string\">\"type\"</span>: <span class=\"hljs-string\">\"airport\"</span>,\n            <span class=\"hljs-string\">\"name\"</span>: <span class=\"hljs-string\">\"Václav Havel Airport Prague\"</span>\n          },\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjA=\"</span>\n        },\n        {\n          <span class=\"hljs-string\">\"node\"</span>: {\n            <span class=\"hljs-string\">\"type\"</span>: <span class=\"hljs-string\">\"city\"</span>,\n            <span class=\"hljs-string\">\"name\"</span>: <span class=\"hljs-string\">\"Prague\"</span>\n          },\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjE=\"</span>\n        },\n        ...\n      ]\n    }\n  }\n}\n</code></pre>\n<p>Now let&#39;s say that the field <code>name</code> is required (means non-nullable). Therefore server MUST return this field. But what happens if resolver for this field for some reason fails?</p>\n<pre><code class=\"hljs lang-javascript\">{\n  <span class=\"hljs-string\">\"data\"</span>: {\n    <span class=\"hljs-string\">\"allLocations\"</span>: {\n      <span class=\"hljs-string\">\"edges\"</span>: [\n        {\n          <span class=\"hljs-string\">\"node\"</span>: <span class=\"hljs-literal\">null</span>,\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjA=\"</span>\n        },\n        {\n          <span class=\"hljs-string\">\"node\"</span>: <span class=\"hljs-literal\">null</span>,\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjE=\"</span>\n        }\n      ]\n    }\n  },\n  <span class=\"hljs-string\">\"errors\"</span>: [\n    {\n      <span class=\"hljs-string\">\"message\"</span>: <span class=\"hljs-string\">\"Cannot return null for non-nullable field Location.name.\"</span>,\n      <span class=\"hljs-string\">\"locations\"</span>: ...,\n      <span class=\"hljs-string\">\"path\"</span>: ...\n    },\n    ...\n  ]\n}\n</code></pre>\n<p>This is not very nice. Especially if we know that the <code>type</code> field did not fail. This is why we prefer to write all fields as nullable. The result is much better in this case:</p>\n<pre><code class=\"hljs lang-javascript\">{\n  <span class=\"hljs-string\">\"data\"</span>: {\n    <span class=\"hljs-string\">\"allLocations\"</span>: {\n      <span class=\"hljs-string\">\"edges\"</span>: [\n        {\n          <span class=\"hljs-string\">\"node\"</span>: {\n            <span class=\"hljs-string\">\"type\"</span>: <span class=\"hljs-string\">\"airport\"</span>,\n            <span class=\"hljs-string\">\"name\"</span>: <span class=\"hljs-literal\">null</span>\n          },\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjA=\"</span>\n        },\n        {\n          <span class=\"hljs-string\">\"node\"</span>: {\n            <span class=\"hljs-string\">\"type\"</span>: <span class=\"hljs-string\">\"city\"</span>,\n            <span class=\"hljs-string\">\"name\"</span>: <span class=\"hljs-literal\">null</span>\n          },\n          <span class=\"hljs-string\">\"cursor\"</span>: <span class=\"hljs-string\">\"YXJyYXljb25uZWN0aW9uOjE=\"</span>\n        }\n      ]\n    }\n  }\n}\n</code></pre>\n<p>Even though it failed we still got as much as possible in the response. And that&#39;s way better. It&#39;s a responsibility of the customer (means implementer) to take into account that every field is nullable while implementing GraphQL API.</p>\n<p>It worth to mention that there are very good use cases of <code>GraphQLNonNull</code>. For example, you want to make fields required (non-nullable) for input arguments and for <code>GraphQLInputObjectType</code>. So from this point of view, the title of this article should be &quot;Get rid of GraphQLNonNull in output types&quot;... :)</p>\n<p>If you want to know more about this topic, I recommend you to read this thread on GitHub: <a href=\"https://github.com/facebook/graphql/issues/63\">https://github.com/facebook/graphql/issues/63</a>. There is a lot of good arguments directly from creators of GraphQL and Facebook engineers.</p>\n<p>After converting your mind to this new approach it should be quite easy to write eslint rule for this (or whatever lint are you using). So far it really worth it.</p>\n"
});
