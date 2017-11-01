// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1436618301000,
    "title": "Hierarchický router",
    "slug": "hierarchicky-router"
  },
  "body": "<p>Tento článek volně navazuje na <a href=\"dynamicke-routovani-url-adres\">předchozí</a>. Zde jsem ukázal, jak vytvořit routy tak, aby bylo možné mít zcela libovolnou adresu a routovat ji na jakoukoliv akci v aplikaci. Dnes to trošku vylepšíme. Přidáme totiž další dva požadavky s tím, že první je ten důležitější:</p>\n<ol>\n<li>Když se změní adresa (například článku), musí se stará přesměrovat na novou. To se může dít opakovaně a nechceme mít mnohonásobný redirect. Redirect může být maximálně jeden a to pro jakoukoliv starou (i původní) adresu.</li>\n<li>Bude možné vytvořit jakoukoliv adresu, která bude přesměrovávat na jakoukoliv jinou.</li>\n</ol>\n<p>Druhý požadavek je vlastně jen speciální (zjednodušený) případ toho prvního. Co to znamená? Podívejte se na následující ASCII art. Obsahuje pět obrázků znázorňujících postupné změny přesměrování při přidávání dalších přesměrování. Nebudeme již řešit routování na akce v presenterech, ale práci se samotným URL a jak se bude chovat, když se přesměruje aktuální cílové URL jinam.</p>\n<pre><code>URL-1\n\n\nURL-1 ----&gt; URL-2\n\n\nURL-1 -------.\n             v\nURL-2 ----&gt; URL-3\n\n\nURL-1 -------.\n             v\nURL-2 ----&gt; URL-4 &lt;---- URL-3\n\n\nURL-1 -------.\n             v\nURL-2 ----&gt; URL-5 &lt;---- URL-3\n             ^\n             &#39;----------URL-4\n</code></pre><p>Slovy řečeno, nesmí se <strong>nikdy</strong> stát, aby byla cesta od staré adresy k nové delší, než je jeden skok. Je zřejmé, že původně byla pouze URL-1. Ta byla přesměrována na URL-2. V okamžik, kdy se přesměruje URL-2 na URL-3, původní propojení mezi URL-1 a URL-2 se musí úplně zrušit a naměrovat URL-1 až na URL-3. A tak to pokračuje dále. Z toho je zřejmé, že nazývat tento router hierarchickým je poněkud zavádějící, protože ve skutečnosti se udržuje takový obrácený les. S troškou režie na začátku je to však vhodnější, protože se tím hezky mění průběžně struktura redirectů a je to lepší, než například takto, to je asi všem jasné:</p>\n<pre><code>URL-1\n &#39;--&gt; URL-2\n       &#39;--&gt; URL-3\n             &#39;--&gt; URL-4\n                   &#39;--&gt; URL-5\n</code></pre><h2 id=\"p-epo-et-odkaz-\">Přepočet odkazů <a href=\"#p-epo-et-odkaz-\">#</a></h2><p>V tom to vlastně celé vězí. Je nutné při vytváření redirectu najít všechny staré odkazy a změnit je na nové. Vrátíme se však k předchozímu článku a trošku vylepšíme cache. Tedy cache zůstane stejná, ale vylepšíme její invalidaci následovně:</p>\n<pre><code class=\"lang-php\">$destination = $this-&gt;cache-&gt;load($path, function (&amp; $dependencies) use ($path) {\n    $destination = $this-&gt;em-&gt;getRepository(Url::class)-&gt;findOneBy([&#39;fakePath&#39; =&gt; $path]);\n    if ($destination === NULL) {\n        $this-&gt;monolog-&gt;addError(sprintf(&#39;Cannot find route for path %s&#39;, $path));\n        return NULL;\n    }\n    $dependencies = [Nette\\Caching\\Cache::TAGS =&gt; [&#39;route/&#39; . $destination-&gt;getId()]];\n    return $destination;\n});\n</code></pre>\n<p>Přidáme ke každému uložení cache tzv. tag, díky čemuž bude možné později tuto cache snadno najít a zrušit její platnost. V closure je nutné dělat to takto přes dependencies proměnnou. Jsou samozřejmě i jiné možnosti <a href=\"http://doc.nette.org/cs/2.3/caching#toc-expirace-a-invalidace\">jak cache zneplatnit</a>, ale tento způsob považuji za dostatečný. Hodí se to proto, že až budeme upravovat staré odkazy, tak je (a pouze je) smažeme z cache, čímž zapříčiníme jejich opětovné vytvoření, tentokrát však s jiným přesměrováním.</p>\n<p>Do entity URL adresy je třeba přidat další vlastnost - odkaz na sebe.</p>\n<pre><code class=\"lang-php\">/**\n * @ORM\\ManyToOne(targetEntity=&quot;Url&quot;, cascade={&quot;persist&quot;})\n * @ORM\\JoinColumn(referencedColumnName=&quot;id&quot;, onDelete=&quot;SET NULL&quot;)\n * @var Url\n */\nprotected $redirectTo = NULL;\n</code></pre>\n<p>Tento odkaz využijeme v routeru, který v případě existence tohoto odkazu bude pracovat právě s ním. V opačném případě router pracuje normálně viz předchozí článek. To už tu nebudu řešit. Spíše se podíváme na samotnou tvorbu redirectů. Tu mám umístěnou v <code>@RedirectFacade::createRedirect</code>. Tato metoda přijímá dvě čísla (ID) a to odkud se přesměrovává a kam se přesměrovává. Bohužel není možné předat si parciální entitu, protože není možné ji naplnit a odeslat do databáze (vlastnost Doctrine). No a předávat celé entity je zbytečné. Proto jen ID. Zjednodušeně vypadá tato metoda takto:</p>\n<pre><code class=\"lang-php\">public function createRedirect($from, $to)\n{\n    $this-&gt;em-&gt;transactional(function () use ($from, $to) {\n        /** @var Url $oldLink */\n        foreach ($this-&gt;em-&gt;getRepository(Url::class)-&gt;findBy([\n            &#39;redirectTo&#39; =&gt; $from\n        ]) as $oldLink) {\n            $oldLink-&gt;setRedirectTo($this-&gt;em-&gt;getPartialReference(Url::class, $to));\n            $this-&gt;cache-&gt;clean([Nette\\Caching\\Cache::TAGS =&gt; [&#39;route/&#39; . $oldLink-&gt;getId()]]);\n        }\n\n        /** @var Url $from */\n        $from = $this-&gt;em-&gt;find(Url::class, $from);\n        $from-&gt;setRedirectTo($this-&gt;em-&gt;getPartialReference(Url::class, $to));\n        $this-&gt;em-&gt;flush();\n        $this-&gt;cache-&gt;clean([Nette\\Caching\\Cache::TAGS =&gt; [&#39;route/&#39; . $from-&gt;getId()]]);\n    });\n}\n</code></pre>\n<p>Dalo by se to optimalizovat z hlediska databázových dotazů lépe, ale jednak to není (zatím nebylo) potřeba a pak se hodí tahat si jednotlivé záznamy postupně právě kvůli invalidace cache. Jak to funguje? V první části si vytáhnu všechny odkazy, které ukazují na odkaz ze kterého budu přesměrovávat. To jsou ty staré, které je třeba zrušit. Ty jsou nahrazeny odkazy na nové stránky a jejich cache je samozřejmě smazána. To je ta důležitější část. V druhé polovině dojde jen k uložení nového přesměrování a opět smazání cache pro tento odkaz. Za povšimnutí stojí funkce <code>getPartialReference</code> o které jsem psal už minule. Je to funkce, která nevrací celou entitu, ale pouze nenaplněnou entitu s ID (parciální). Nic víc totiž dost často není potřeba...</p>\n<h2 id=\"druh-st-e-en-\">Druhá část řešení <a href=\"#druh-st-e-en-\">#</a></h2><p>Druhá část řešení je již jednoduchá.</p>\n<blockquote>\n<p>Bude možné vytvořit jakoukoliv adresu, která bude přesměrovávat na jakoukoliv jinou.</p>\n</blockquote>\n<p>Stačí entitě povolit, aby mohlo být NULL <code>destination</code> (tedy interní odkaz na presenter a akci) a <code>internalId</code>. To jsou totiž informace, které nejsou známé a pro tetno účel jsou i zbytečné. Důležitá je totiž jen cesta a odkaz na cílovou URL. A to je vlastně vše, protože vše ostatní už přirozeně umí dříve napsaný router.</p>\n<p>Ještě jsem nedávno narazil na zajímavý router, který umožňoval smazat jakoukoliv část cesty a on si jí domyslel a přesměroval. Nekoukal jsem úplně do střev, ale asi tak, že vyhledá přesně znění cesty a když ji nemůže najít, tak položí nějaký LIKE% dotaz ve snaze alespoň ji odhadnout. To už ale považuji za zbytečné a nevyužitelné. Osobně se mi ještě více líbí routy, které jsou na ČSFD. Obsahují totiž přirozený zkracovač adres viz tyto dvě adresy, které jsou stejné:</p>\n<pre><code>http://www.csfd.cz/film/5911\nhttp://www.csfd.cz/film/5911-tenkrat-na-zapade/\n</code></pre><p>Vyzkoušejte <a href=\"http://www.csfd.cz/film/5911\">si</a> <a href=\"http://www.csfd.cz/film/5911-tenkrat-na-zapade/\">to</a>. První přesměruje na druhou. Bohužel ne všem se čísla v adresách líbí (i když podle mého názoru bezdpůvodně).</p>\n<p>Ačkoliv budu na routeru dále pracovat, tak k němu zatím nemám v plánu další komentáře. Pokud tedy něco není jasné, teď je ta správná chvíle zeptat se. Jo mimochodem. Předchozí router už není obyčejnou implementací <code>\\Nette\\Application\\IRouter</code>, ale dědí od <code>\\Nette\\Application\\Routers\\RouteList</code>. Je to z toho důvodu, že se bez toho Kdyby\\Console <a href=\"https://github.com/Kdyby/Console/blob/master/src/Kdyby/Console/CliRouter.php#L124\">nerozjede</a>. Pokud bych tedy nepoužíval tuto knihovnu, tak by to nebyl problém. Samotná quick&#39;n&#39;dirty úprava spočívá v přidání tohoto kódu na začátek match metody:</p>\n<pre><code class=\"lang-php\">/** @var Application\\IRouter $route */\nforeach ($this as $route) {\n    /** @var Application\\Request $applicationRequest */\n    $applicationRequest = $route-&gt;match($httpRequest);\n    if ($applicationRequest !== NULL) {\n        return $applicationRequest;\n    }\n}\n</code></pre>\n<p>A to je vše...</p>\n"
});