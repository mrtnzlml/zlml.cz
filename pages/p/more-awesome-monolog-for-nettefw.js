// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1470502440000,
    "title": "More awesome Monolog for",
    "slug": "more-awesome-monolog-for-nettefw"
  },
  "body": "<p>Nedávno mi přišel požadavek na vytvoření takového jednoduchého způsobu, jak logovat uživatelské akce - konkrétně zatím jen přihlášení uživatele (do databáze). Mohl jsem to udělat jednoduše a prostě to někam do kódu nahákovat. A nebo jsem to mohl udělat tak, jak jsem to také nakonec udělal - složitě. Samozřejmě je třeba dopředu dostatečně promyslet, jestli to za tu práci stojí, ale měl jsem dostatek argumentů proto, že ano.</p>\n<p>Jedna z nejdůležitějších myšlenek byla, že časem bude pravděpodobně potřeba logovat do databáze i další akce, než je jen přihlašování. Druhým velmi silným faktorem (který ovlivnil celé řešení) bylo, že používáme <a href=\"https://github.com/Seldaek/monolog\">Monolog</a>. Konkrétně Kdyby\\Monolog rozšíření.</p>\n<h2 id=\"kdyby-monolog\">Kdyby Monolog <a href=\"#kdyby-monolog\">#</a></h2><p>Znáte tuto knihovnu (<a href=\"https://github.com/Kdyby/Monolog\">GitHub</a>)? Věřím, že ano. Kolem Kdyby knihoven byl velký hype. Velká síla této knihovny je v tom, že se dokáže velmi jednoduše napojit na Tracy a to takovým způsobem, že můžete používat Monolog bez BC breaku (tedy pomocí <code>Tracy\\Debugger::log()</code>). Větším přiblížením k Monologu jako takovému, je pak používání služby <code>Kdyby\\Monolog\\Logger</code> resp. <code>Monolog\\Logger</code> jako závislosti v konstruktoru.</p>\n<p>Kdyby logger pak obsahuje tato nastavení (ne všechny jsou v dokumentaci):</p>\n<pre><code class=\"hljs lang-neon\">monolog:\n    handlers: []\n    processors: []\n    name: app\n    hookToTracy: yes\n    tracyBaseUrl: NULL\n    usePriorityProcessor: yes\n    registerFallback: yes\n</code></pre>\n<p>Pro programátora je asi nejzajímavější možnost nastavit si vlastní <a href=\"https://github.com/Seldaek/monolog/blob/master/doc/02-handlers-formatters-processors.md#handlers\">handlery</a> a <a href=\"https://github.com/Seldaek/monolog/blob/master/doc/02-handlers-formatters-processors.md#processors\">procesory</a>. Pozornějšímu oku však neunikne, že toto nastavení funguje globálně pro celou aplikaci. Jenže občas se hodí mít více loggerů a každý mít nastavený jinak. Nevím, jestli jsem náhodou Kdyby\\Monolog nepochopil špatně, ale jedinou šancí jak toho dosáhnout, je nenastavoval logger v configu, vytvořit si vlastní <code>Logger</code> objekty a ty si nastavit (<code>pushHandler</code>, <code>pushProcessor</code> a <code>setFormatter</code> u handlerů). A to je naprd.</p>\n<h2 id=\"adeira-monolog\">Adeira Monolog <a href=\"#adeira-monolog\">#</a></h2><p>Mít více vlastních loggerů už se mi párkrát hodilo. A právě i zde by bylo super mít objekt, který mi umožní jednoduše něco zalogovat do databáze. Zároveň je však super propojení s Tracy, které má tak skvělě vyřešené Kdyby\\Monolog. Jak z toho vybruslit? Vlastním Composer balíčkem. Než se dostanu k samotné instalaci a nastavení, ukážu zde, jak jsem využil vlastní logger. Pořád však mějte na paměti, že si kdykoliv musím být schopen sáhnout na původní <code>Kdyby\\Monolog\\Logger</code> a vesele logovat podle globálního nastavení!</p>\n<p>Prvně jsem si vytvořil vlastní logger:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-meta\">&lt;?php</span>\n\n<span class=\"hljs-keyword\">namespace</span> <span class=\"hljs-title\">App</span>\\<span class=\"hljs-title\">Audit</span>\\<span class=\"hljs-title\">Monolog</span>\\<span class=\"hljs-title\">Loggers</span>;\n\n<span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">UsersAuditLogger</span> <span class=\"hljs-keyword\">extends</span> \\<span class=\"hljs-title\">Monolog</span>\\<span class=\"hljs-title\">Logger</span>\n</span>{\n\n}\n</code></pre>\n<p>Přesně, víc toho není potřeba. Tento objekt vlastně slouží jen k tomu, abych měl co předávat v konstruktoru jako závislost. A zároveň je to ta nejdivnější část - teď už to bude jen lepší. Teď by bylo fajn mít vlastní handler, který mu později přiřadíme a který se bude starat o to ukládání do databáze. Šlo by udělat to, že by handler skutečně ukládal rovnou do databáze, ale použiju zde malý fígl:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-meta\">&lt;?php</span>\n\n<span class=\"hljs-keyword\">namespace</span> <span class=\"hljs-title\">App</span>\\<span class=\"hljs-title\">Audit</span>\\<span class=\"hljs-title\">Monolog</span>\\<span class=\"hljs-title\">Handler</span>;\n\n<span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">UsersAuditDatabaseHandler</span> <span class=\"hljs-keyword\">extends</span> \\<span class=\"hljs-title\">Monolog</span>\\<span class=\"hljs-title\">Handler</span>\\<span class=\"hljs-title\">AbstractProcessingHandler</span>\n</span>{\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> \\App\\Audit\\EntitiesQueue */</span>\n    <span class=\"hljs-keyword\">private</span> $entitiesQueue;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">__construct</span><span class=\"hljs-params\">(\\App\\Audit\\EntitiesQueue $entitiesQueue)</span>\n    </span>{\n        <span class=\"hljs-keyword\">$this</span>-&gt;entitiesQueue = $entitiesQueue;\n        <span class=\"hljs-keyword\">parent</span>::__construct(\\Monolog\\Logger::DEBUG, <span class=\"hljs-keyword\">TRUE</span>); <span class=\"hljs-comment\">//TRUE - bubble</span>\n    }\n\n    <span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">write</span><span class=\"hljs-params\">(array $record)</span>\n    </span>{\n        $auditRecord = <span class=\"hljs-keyword\">new</span> \\App\\Audit\\AuditRecord($record[<span class=\"hljs-string\">'level'</span>], $record[<span class=\"hljs-string\">'message'</span>], $record[<span class=\"hljs-string\">'datetime'</span>]);\n        <span class=\"hljs-keyword\">$this</span>-&gt;entitiesQueue-&gt;add($auditRecord);\n    }\n\n}\n</code></pre>\n<p>Je to jen zjednodušený příklad. Důležité ale je, že jsem zde zatím nic neuložil, ale pouze to zařadil do jakési fronty na entity. To proto, že logů může být více a chci si je napřed všechny posbírat a následně je v jedné transakci poslat do databáze. Objekt <code>AuditRecord</code> je obyčejná Doctrine entita. <code>EntitiesQueue</code> je jednoduchý objekt, který tyto entity sbírá a zároveň naslouchá na <code>Application::onShutdown</code>:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-meta\">&lt;?php</span>\n\n<span class=\"hljs-keyword\">namespace</span> <span class=\"hljs-title\">App</span>\\<span class=\"hljs-title\">Audit</span>;\n\n<span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">EntitiesQueue</span> <span class=\"hljs-keyword\">implements</span> \\<span class=\"hljs-title\">Kdyby</span>\\<span class=\"hljs-title\">Events</span>\\<span class=\"hljs-title\">Subscriber</span>\n</span>{\n    <span class=\"hljs-comment\">//závislosti, prázdné pole, metoda 'add' atd. ...</span>\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">getSubscribedEvents</span><span class=\"hljs-params\">()</span>\n    </span>{\n        <span class=\"hljs-keyword\">return</span> [<span class=\"hljs-string\">'Nette\\Application\\Application::onShutdown'</span> =&gt; <span class=\"hljs-string\">'onShutdown'</span>];\n    }\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">onShutdown</span><span class=\"hljs-params\">()</span>\n    </span>{\n        <span class=\"hljs-keyword\">foreach</span> (<span class=\"hljs-keyword\">$this</span>-&gt;entities <span class=\"hljs-keyword\">as</span> $entity) {\n            <span class=\"hljs-keyword\">$this</span>-&gt;em-&gt;persist($entity);\n        }\n        <span class=\"hljs-keyword\">$this</span>-&gt;em-&gt;flush();\n        <span class=\"hljs-keyword\">$this</span>-&gt;entities = [];\n    }\n\n}\n</code></pre>\n<p>Veškeré logy se tedy uloží až v okamžiku, kdy aplikace ukončuje svůj životní běh (podobný princip se používá i při práci s RabbitMQ). Použití je pak triviální. V jiném listeneru naslouchám na událost <code>Nette\\Security\\User::onLoggedIn</code> a v tomto okamžiku zaloguji zprávu. Ten vlastní <code>UsersAuditLogger</code> je zde jako závislost.</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">$this</span>-&gt;usersAuditLogger-&gt;addInfo(<span class=\"hljs-string\">\"User with login '$login' logged into administration.\"</span>);\n</code></pre>\n<h2 id=\"instalace-a-nastaven-bal-ku\">Instalace a nastavení balíčku <a href=\"#instalace-a-nastaven-bal-ku\">#</a></h2><p>Ok, cool - jak to použiju? Úplně jednoduše:</p>\n<pre><code class=\"hljs\">composer require adeira/monolog\n</code></pre><p>Následně zaregistrujeme rozšíření do DIC:</p>\n<pre><code class=\"hljs lang-neon\">extensions:\n    monolog: Adeira\\Monolog\\DI\\MonologExtension\n</code></pre>\n<p>A dále už to znáte. Následuje krátká ukázka toho, co se s tím dá dělat za švíky. Tento balíček sám od sebe registruje spoustu formátovačů, procesorů a jeden handler z Monologu (<a href=\"https://github.com/adeira/monolog/blob/master/readme.md\">viz readme</a>). Ty je pak možné jednoduše používat pouze podle jejich názvu. Zároveň je zachována téměř veškerá funkcionalita Kdyby\\Monologu (ano, můj balíček toto rozšíření rozšiřuje, protože napojení na Tracy je fakt super). Mohu si pak nastavit loggery třeba takto:</p>\n<pre><code class=\"hljs lang-neon\">monolog:\n    hookToTracy: yes\n    registerFallback: yes\n    usePriorityProcessor: yes\n\n    processors:\n        web: Monolog\\Processor\\WebProcessor(NULL, [\n                ip: REMOTE_ADDR,\n                userAgent: HTTP_USER_AGENT,\n            ])\n\n    handlers:\n        database:\n            class: App\\Audit\\Monolog\\Handler\\UsersAuditDatabaseHandler\n            processors: [web]\n        slack:\n            class: Adeira\\Monolog\\Handler\\SlackHandler(\n                productionMode: %productionMode%,\n                token: &#39;.....&#39;,\n                channel: exceptions,\n                username: &#39;Monolog&#39;,\n                useAttachment: no,\n                iconEmoji: poop,\n                level: Monolog\\Logger::CRITICAL,\n                bubble: yes,\n                useShortAttachment: no,\n                includeContextAndExtra: yes,\n            )\n\n    loggers:\n        global: #global logger from Kdyby (\\Kdyby\\Monolog\\Logger)\n            handlers: [slack]\n            processors: [git, web]\n        - class: App\\Audit\\Monolog\\Loggers\\UsersAuditLogger\n          handlers: [database]\n</code></pre>\n<p>A teď slovně. V sekci <code>processors</code> měním chování <code>web</code> procesoru. Ten je sice již zaregistrovaný, ale nelíbí se mi jeho chování. Vlastní konfigurace má přednost. Dále přidávám dva nové handlery (<code>database</code> a <code>slack</code>). Databázový handler používá procesor <code>web</code> na které jsem se odkázal jen pomocí názvu. O propojení se již postará knihovna sama. V balíčku je připravený handler <code>SlackHandler</code>, který navíc oproti původnímu z Monologu chová tak, že zprávičky posílá jen jednou za 15 minut. To může být užitečné... :-)</p>\n<p>No a konečně samotné loggery. Logger z Tracy lze nastavit pomocí speciální sekce <code>global</code>. Zde si nastavuji slack handler a 2 procesory. Zároveň přidávám ještě vlastní logger (registruje se stejně jako v sekci <code>services</code>) a nastavuji mu databázové handler. A o to vlastně celou dobu šlo.</p>\n<p>Pretty cool, hm? <a href=\"https://github.com/adeira/monolog\">PR a hvězdičky prosím sem</a>... :)</p>\n<p>Dodatečné odkazy na čtení:</p>\n<ul>\n<li><a href=\"http://symfony.com/doc/current/logging.html\">Logging with Monolog</a></li>\n<li><a href=\"http://symfony.com/doc/current/logging/channels_handlers.html\">How to Log Messages to different Files</a></li>\n<li><a href=\"https://github.com/theorchard/monolog-cascade\">Configure multiple loggers and handlers</a></li>\n</ul>\n<p><a href=\"https://twitter.com/mrtnzlml\">Follow me on Twitter and stay tuned</a>...</p>\n"
});
