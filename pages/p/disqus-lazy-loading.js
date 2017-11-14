// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1402601786000,
    "title": "Disqus lazy loading",
    "slug": "disqus-lazy-loading"
  },
  "body": "<p>Tento článek ve skutečnosti odstartovalo zdánlivě nesouvisející vlákno na <a href=\"http://forum.nette.org/cs/19397-ako-sa-zbavit-fid-v-url-ak-sa-nemylim\">Nette fóru .{target:_blank}</a>. V tomto vláknu se řeší parametr <em>_fid</em> v URL adrese, který tam Nette framework přikládá kvůli flash messages. Tato vlastnost někoho skutečně hodně štve, mě zase až tak moc ne. Jenže když jsem nad tím vláknem chvíli seděl, tak jsem si uvědomil, že mám komentářový systém Disqus implementovaný špatně. Čtěte dál a vyhněte se stejné chybě... (-:</p>\n<h2 id=\"univerz-ln-k-d\">Univerzální kód <a href=\"#univerz-ln-k-d\">#</a></h2><p>Disqus poskytuje &quot;by default&quot; univerzální kód, který prakticky pouze zkopírujete na svůj web na požadované místo a je hotovo. Tento kód vypadá zhruba takto:</p>\n<pre><code class=\"hljs lang-html\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">id</span>=<span class=\"hljs-string\">\"disqus_thread\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">type</span>=<span class=\"hljs-string\">\"text/javascript\"</span>&gt;</span><span class=\"javascript\">\n    <span class=\"hljs-comment\">/* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */</span>\n    <span class=\"hljs-keyword\">var</span> disqus_shortname = <span class=\"hljs-string\">''</span>; <span class=\"hljs-comment\">// required: replace it with your forum shortname</span>\n\n    <span class=\"hljs-comment\">/* * * DON'T EDIT BELOW THIS LINE * * */</span>\n    (<span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span>(<span class=\"hljs-params\"></span>) </span>{\n        <span class=\"hljs-keyword\">var</span> dsq = <span class=\"hljs-built_in\">document</span>.createElement(<span class=\"hljs-string\">'script'</span>); dsq.type = <span class=\"hljs-string\">'text/javascript'</span>; dsq.async = <span class=\"hljs-literal\">true</span>;\n        dsq.src = <span class=\"hljs-string\">'//'</span> + disqus_shortname + <span class=\"hljs-string\">'.disqus.com/embed.js'</span>;\n        (<span class=\"hljs-built_in\">document</span>.getElementsByTagName(<span class=\"hljs-string\">'head'</span>)[<span class=\"hljs-number\">0</span>] || <span class=\"hljs-built_in\">document</span>.getElementsByTagName(<span class=\"hljs-string\">'body'</span>)[<span class=\"hljs-number\">0</span>]).appendChild(dsq);\n    })();\n</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">noscript</span>&gt;</span>Please enable JavaScript to view the <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"http://disqus.com/?ref_noscript\"</span>&gt;</span>comments powered by Disqus.<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">noscript</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"http://disqus.com\"</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"dsq-brlink\"</span>&gt;</span>comments powered by <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"logo-disqus\"</span>&gt;</span>Disqus<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span>\n</code></pre>\n<p>Je to pohodlné, ale je to úplně blbě. Nejenom pro Nette aplikace, ale myslím si, že tak nějak celkově pro všechny aplikace. Fungovat to sice bude, to ano. Ale jen tak zdánlivě. Problém je totiž v tom, že toto nastavení bere jako identifikátor diskuse URL adresu a pokud se jen drobně změní, tak se založí nová diskuse. Přehled těchto diskusí je pak vidět v Disqus administraci. To s sebou nese celou řadu problémů. Diskuse nejde pořádně zamknout a už to, že k jedné stránce může být více diskusí je problém. Každá diskuse totiž musí mít unikátní identifikátor <a href=\"https://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables\">disqus_identifier .{target:_blank}</a> nezávisle na parametrech (pokud ovšem tyto parametry nejsou žádoucí).</p>\n<h2 id=\"lazy-loading\">Lazy loading <a href=\"#lazy-loading\">#</a></h2><p>Já jsem sice nepoužil defaultní konfiguraci, ale udělal jsem prakticky tu samou chybu. Teď ale konečně k lazy loadingu. Na svém blogu to již používám dlouhou dobu a myslím si, že se to již osvědčilo. Inspirací k mé implementaci je <a href=\"https://gist.github.com/omgmog/2310982\">tento gist .{target:_blank}</a>.</p>\n<p>Stačí umístit následující kód do nějakého souboru <em>main.js</em>, který se spouští po načtení stránky:</p>\n<pre><code class=\"hljs lang-javascript\"><span class=\"hljs-keyword\">var</span> disqus_div = $(<span class=\"hljs-string\">\"#disqus_thread\"</span>);\n<span class=\"hljs-keyword\">if</span> (disqus_div.size() &gt; <span class=\"hljs-number\">0</span>) {\n    <span class=\"hljs-keyword\">var</span> ds_loaded = <span class=\"hljs-literal\">false</span>,\n    top = $(<span class=\"hljs-string\">'.load_disqus'</span>).offset().top, <span class=\"hljs-comment\">//upravit podle potřeby</span>\n    disqus_data = disqus_div.data(),\n    check = <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> (<span class=\"hljs-params\"></span>) </span>{\n        <span class=\"hljs-keyword\">if</span> (!ds_loaded &amp;&amp; $(<span class=\"hljs-built_in\">window</span>).scrollTop() + $(<span class=\"hljs-built_in\">window</span>).height() &gt; top) {\n            ds_loaded = <span class=\"hljs-literal\">true</span>;\n            <span class=\"hljs-keyword\">for</span> (<span class=\"hljs-keyword\">var</span> key <span class=\"hljs-keyword\">in</span> disqus_data) {\n                <span class=\"hljs-keyword\">if</span> (key.substr(<span class=\"hljs-number\">0</span>, <span class=\"hljs-number\">6</span>) == <span class=\"hljs-string\">'disqus'</span>) {\n                    <span class=\"hljs-built_in\">window</span>[<span class=\"hljs-string\">'disqus_'</span> + key.replace(<span class=\"hljs-string\">'disqus'</span>, <span class=\"hljs-string\">''</span>).toLowerCase()] = disqus_data[key];\n                }\n            }\n            <span class=\"hljs-keyword\">var</span> dsq = <span class=\"hljs-built_in\">document</span>.createElement(<span class=\"hljs-string\">'script'</span>);\n            dsq.type = <span class=\"hljs-string\">'text/javascript'</span>;\n            dsq.async = <span class=\"hljs-literal\">true</span>;\n            dsq.src = <span class=\"hljs-string\">'http://'</span> + <span class=\"hljs-built_in\">window</span>.disqus_shortname + <span class=\"hljs-string\">'.disqus.com/embed.js'</span>;\n            (<span class=\"hljs-built_in\">document</span>.getElementsByTagName(<span class=\"hljs-string\">'head'</span>)[<span class=\"hljs-number\">0</span>] || <span class=\"hljs-built_in\">document</span>.getElementsByTagName(<span class=\"hljs-string\">'body'</span>)[<span class=\"hljs-number\">0</span>]).appendChild(dsq);\n        }\n    };\n    $(<span class=\"hljs-built_in\">window</span>).scroll(check);\n    check();\n}\n</code></pre>\n<p>Tím to však nekončí. Je samozřejmě nutné určit kde se Disqus bude zobrazovat:</p>\n<pre><code class=\"hljs lang-html\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"hidden-print\"</span>&gt;</span>\n    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">id</span>=<span class=\"hljs-string\">\"disqus_thread\"</span> <span class=\"hljs-attr\">data-disqus-shortname</span>=<span class=\"hljs-string\">\"mrtnzlml\"</span> <span class=\"hljs-attr\">data-disqus-url</span>=<span class=\"hljs-string\">\"{link //this}\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">noscript</span>&gt;</span>Please enable JavaScript to view the <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"http://disqus.com/?ref_noscript\"</span>&gt;</span>comments powered by Disqus.<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">noscript</span>&gt;</span>\n    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"http://disqus.com\"</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"dsq-brlink\"</span>&gt;</span>comments powered by <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"logo-disqus\"</span>&gt;</span>Disqus<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n</code></pre>\n<p>Klíčový je zde právě data atribut <em>disqus-url</em>. No a aby byl kod kompletní, tak je zapotřebí někam umístit CSS trídu <em>.load_disqus</em>. Tu doporučuji umístit někam nad diskusi a tím myslím třeba o celou viditelnou stránku. Disqus se tak začne načítat o něco dříve, než k němu čtenář doscrolluje, takže se stihne načíst a nebude to rušit. Ve výsledku se tedy Disqus nenačítá po otevření stránky, takže je načtení svižné, ale po např. přečtení článku je již načtený...</p>\n<p>A co vy? Máte Disqus na svém webu implementovaný správně? (-:</p>\n"
});
