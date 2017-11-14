// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1448405176000,
    "title": "Znovupoužitelné části formuláře",
    "slug": "znovupouzitelne-casti-formulare"
  },
  "body": "<p>Před nějakým časem jsem psal o tom, jak vytvořit <a href=\"znovupouzitelny-formular\">znovupoužitený formulář</a>. Nejedná se o nic jiného, než o správné navržení a následné použití komponent, tedy potomků <code>UI\\Control</code>. Pokud bych měl být upřímný, nemyslím si, že se formuláře nějak často na webu opakují a osobně tento princip používám spíše pro oddělení části aplikace do samostatného balíčku. Tím spíš najde následující ukázka méně použití. Právě mám totiž za úkol navrhnout předělání jedné administrace. Úkolem není hledět na to, jak moc je tento přístup špatný, ale navrhnout řešení, které nahradí stávající 1:1. Tato administrace obsahuje často se opakující (a velmi rozsáhlý) formulář, který se skládá z několika karet. Navíc některé části formuláře spolu vůbec nesouvisí a na každé stránce je formulář trošku jiný (i když je podobnost zřejmá). Vzhledem k tomu, že se jedná o tak rozsáhlý kód, upustil jsem od znovupoužitelného formuláře a navrhnul jsem znovupoužitelné pouze jeho části. A na následujících řádcích nastíním jak.</p>\n<h2 id=\"na-za-tku-st-la-komponenta\">Na začátku stála komponenta <a href=\"#na-za-tku-st-la-komponenta\">#</a></h2><p>Pořád platí, že je samotný formulář komponenta. Na tom se nic nemění. V mém případě se však hodilo udělat si ještě nějaké bázové třídy. Pokusím se ukázky ořezat co nejvíce od zbytečností tak, aby to pokud možno ještě dávalo smysl:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">NewsForm</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">BaseControl</span> </span>{\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> News|NULL */</span>\n    <span class=\"hljs-keyword\">private</span> $news;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">__construct</span><span class=\"hljs-params\">($news)</span> </span>{\n        <span class=\"hljs-keyword\">parent</span>::__construct();\n        <span class=\"hljs-keyword\">$this</span>-&gt;news = $news;\n    }\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">render</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-keyword\">$this</span>-&gt;template-&gt;render(<span class=\"hljs-keyword\">__DIR__</span> . <span class=\"hljs-string\">'/NewsForm.latte'</span>);\n    }\n\n    <span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">createComponentNewsForm</span><span class=\"hljs-params\">()</span> </span>{\n        $form = <span class=\"hljs-keyword\">$this</span>-&gt;form;\n        <span class=\"hljs-comment\">// nastavení společných prvků formuláře</span>\n        <span class=\"hljs-keyword\">return</span> $form\n    }\n\n}\n</code></pre>\n<p>K tomu (třeba) nějaká ta generovaná továrnička a komponenta tak jak ji známe všichni je hotova. Bude však nutné rozklíčovat, co se děje třeba pod třídou <code>BaseControl</code>. Jedná se o jednoduchého předka, který krom dalších věcí obsahuje hlavně toto:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">abstract</span> <span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">BaseControl</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">UI</span>\\<span class=\"hljs-title\">Control</span> </span>{\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> BaseForm */</span>\n    <span class=\"hljs-keyword\">protected</span> $form;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">__construct</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-keyword\">parent</span>::__construct();\n        <span class=\"hljs-keyword\">$this</span>-&gt;form = <span class=\"hljs-keyword\">new</span> BaseForm;\n    }\n\n    <span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">attached</span><span class=\"hljs-params\">($obj)</span> </span>{\n        <span class=\"hljs-keyword\">parent</span>::attached($obj);\n        <span class=\"hljs-keyword\">if</span> ($obj <span class=\"hljs-keyword\">instanceof</span> UI\\Presenter) {\n            <span class=\"hljs-keyword\">$this</span>-&gt;form-&gt;addComponent(<span class=\"hljs-keyword\">new</span> SubmitButtonsContainer, <span class=\"hljs-string\">'submitButtons'</span>);\n            <span class=\"hljs-keyword\">$this</span>-&gt;form-&gt;addComponent(<span class=\"hljs-keyword\">new</span> AnotherContainer, <span class=\"hljs-string\">'another'</span>);\n        }\n    }\n\n}\n</code></pre>\n<p>Zde se vytvoří nějaký formulář (s kterým pak pracuji v komponentě) a po připojení formuláře k presenteru se připojí i nějaké formulářové kontejnery. Než se však k těmto kontejnerům dostanu, tak by bylo dobré prozradit i co se děje v třídě <code>BaseForm</code>. Popravdě nic moc:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-comment\">/**\n * <span class=\"hljs-doctag\">@method</span> addTinyMCE($name, $label = NULL, $cols = NULL, $rows = NULL)\n */</span>\n<span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">BaseForm</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">UI</span>\\<span class=\"hljs-title\">Form</span> </span>{\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> callable[] */</span>\n    <span class=\"hljs-keyword\">public</span> $onSaveAndStay;\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> callable[] */</span>\n    <span class=\"hljs-keyword\">public</span> $onSaveAndExit;\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> callable[] called BEFORE onClick event */</span>\n    <span class=\"hljs-keyword\">public</span> $onSuccess;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">__construct</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-keyword\">parent</span>::__construct();\n        <span class=\"hljs-keyword\">$this</span>-&gt;addProtection();\n    }\n\n}\n</code></pre>\n<p>Nastavím si zde nějaké věci, které jsou pro každý formulář v administraci obecně společné. Konkrétně tedy CSRF ochranu a pár polí pro události. Události jsem si zde musel nadefinovat sám, běžně se na formuláři volá <code>onSuccess</code> událost až po <code>onClick</code> (<a href=\"https://api.nette.org/2.3.7/source-Forms.Form.php.html#380-420\">link</a>), ale zrovna zde jsem to potřeboval obráceně. Hodí se to v okamžiku, kdy chci využívat <code>onSuccess</code>, ale v <code>onClick</code> už z formuláře třeba přesměrovávám pryč. Vzhledem k tomu, že oba eventy se volají jen při validním odeslání, tak to ničemu nevadí. V této třídě je také vhodné místo pro umístění nějakých dynamických metod do anotací, aby je IDE dobře napovídalo (viz <code>addTinyMCE</code>). Byl to dlouhý úvod, ale vše je připraveno a můžeme se vrhnout na kontejnery.</p>\n<h2 id=\"formul-ov-kontejnery\">Formulářové kontejnery <a href=\"#formul-ov-kontejnery\">#</a></h2><p>Osobně <a href=\"https://pla.nette.org/cs/dedicnost-vs-kompozice\">formulářové kontejnery</a> nemám moc rád. Jsou sice super, ale pohybují se na další úrovni formuláře. Pokud se však s tímto faktem smíříme (a nejlépe z něj uděláme výhodu), pak jsou docela super a zde se skvěle hodí. Můžu si pěkně oddělit například odesílací tlačítka a ty pak vesele používat ve všech formulářích:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">SubmitButtonsContainer</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">BaseFormContainer</span> </span>{\n\n    <span class=\"hljs-keyword\">private</span> $form;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">attached</span><span class=\"hljs-params\">($obj)</span> </span>{\n        <span class=\"hljs-keyword\">parent</span>::attached($obj);\n        <span class=\"hljs-keyword\">if</span> ($obj <span class=\"hljs-keyword\">instanceof</span> BaseForm) {\n            <span class=\"hljs-keyword\">$this</span>-&gt;form = $obj;\n            $obj-&gt;onSuccess[] = <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-params\">(BaseForm $form)</span> </span>{\n                $path = <span class=\"hljs-keyword\">$this</span>-&gt;lookupPath(BaseForm::class);\n                dump($form-&gt;getValues()-&gt;$path); <span class=\"hljs-comment\">// další zpracování hodnot</span>\n            };\n        }\n    }\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">render</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-keyword\">$this</span>-&gt;template-&gt;_form = <span class=\"hljs-keyword\">$this</span>; <span class=\"hljs-comment\">// kvůli formulářovým makrům v šabloně</span>\n        <span class=\"hljs-keyword\">$this</span>-&gt;template-&gt;render(<span class=\"hljs-keyword\">__DIR__</span> . <span class=\"hljs-string\">'/SubmitButtonsContainer.latte'</span>);\n    }\n\n    <span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">configure</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-keyword\">$this</span>-&gt;addSubmit(<span class=\"hljs-string\">'saveAndStay'</span>, <span class=\"hljs-string\">'Uložit a zůstat'</span>)-&gt;onClick[] = <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-params\">(SubmitButton $button)</span> </span>{\n            $form = $button-&gt;getForm();\n            <span class=\"hljs-keyword\">$this</span>-&gt;form-&gt;onSuccess($form, $form-&gt;getValues());\n            <span class=\"hljs-keyword\">$this</span>-&gt;form-&gt;onSaveAndStay($form, $form-&gt;getValues());\n        };\n    }\n\n}\n</code></pre>\n<p>Pokud sledujete fórum, tak vám je tento návrh jistě povědomý. Jedná se o <a href=\"https://forum.nette.org/cs/11747-skladani-komponent-a-formulare#p84652\">slavné řešení pod čarou</a>. Přesně toto se odehrává v rodičovské třídě <code>BaseFormContainer</code>. Doplnil jsem si do této třídy však jednu malou vychytávku. Chtěl jsem totiž, aby každý kontejner mohl mít vlastní šablonu. To běžně není možné. Kontejner tedy mohu vykreslovat pomocí dobře známého makra <code>{control ...}</code> (což nedělá nic jiného, než že se zavolá metoda <code>render</code>). Jenže co je <code>$this-&gt;template</code>? Bázový kontejner jsem musel rozšířit ještě o vhodnou část z <code>UI\\Control</code>, která se stará o vykreslování:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">abstract</span> <span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">BaseFormContainer</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">Forms</span>\\<span class=\"hljs-title\">Container</span> </span>{\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> UI\\ITemplateFactory */</span>\n    <span class=\"hljs-keyword\">private</span> $templateFactory;\n\n    <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> UI\\ITemplate */</span>\n    <span class=\"hljs-keyword\">private</span> $template;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">injectTemplateFactory</span><span class=\"hljs-params\">(UI\\ITemplateFactory $templateFactory)</span> </span>{\n        <span class=\"hljs-keyword\">$this</span>-&gt;templateFactory = $templateFactory;\n    }\n\n    <span class=\"hljs-keyword\">abstract</span> <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">render</span><span class=\"hljs-params\">()</span></span>;\n\n    <span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">getTemplate</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-comment\">// bla bla, mrkni na: https://api.nette.org/2.3.7/source-Application.UI.Control.php.html#45</span>\n        <span class=\"hljs-keyword\">return</span> <span class=\"hljs-keyword\">$this</span>-&gt;template;\n    }\n\n    <span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">createTemplate</span><span class=\"hljs-params\">()</span> </span>{\n        <span class=\"hljs-comment\">/** <span class=\"hljs-doctag\">@var</span> UI\\ITemplateFactory $templateFactory */</span>\n        $templateFactory = <span class=\"hljs-keyword\">$this</span>-&gt;templateFactory ?: <span class=\"hljs-keyword\">$this</span>-&gt;lookup(UI\\Presenter::class)-&gt;getTemplateFactory();\n        <span class=\"hljs-keyword\">return</span> $templateFactory-&gt;createTemplate(<span class=\"hljs-keyword\">NULL</span>);\n    }\n</code></pre>\n<p>Jednoduché vykreslitelné formulářové kontejnery. Cool. Abych to rychle zrekapituloval. Máme jednoduchou komponentu na formulář, která dědí od <code>BaseControl</code>. Tato třída připojuje ve vhodný čas formulářové kontejnery, které se umí vykreslit (což běžně nejde).</p>\n<p>V šabloně <code>SubmitButtonsContainer.latte</code> je možné používat normálně <code>{input ...}</code> makra a další, jako kdybych pokračoval dál v šabloně jednoho velkého formuláře. Samotné připojené formulářové kontejnery je možné vykreslovat pomocí klasického makra <code>{control newsForm-submitButtons}</code> v hlavním formuláři. To je možná trošku nevýhoda, protože kontejnery se připojují do formuláře a stávají se tak podkomponentou. Musím tedy control makro volat stylem <em>rodič-podkomponenta</em>.</p>\n<h2 id=\"znovupou-itelnost-vykresliteln-ch-kontejner-\">Znovupoužitelnost vykreslitelných kontejnerů <a href=\"#znovupou-itelnost-vykresliteln-ch-kontejner-\">#</a></h2><p>Kde je ta znovupoužitelnost? Jak bych udělal to, že použiju třeba odesílací tlačítka (nebo jakoukoliv jinou část formuláře) někde jinde? Jednoduše. Prostě vytvoříme formulář (to je podmínka nutná) a kontejner v něm použijeme:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">protected</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">createComponentTest</span><span class=\"hljs-params\">()</span> </span>{\n    $form = <span class=\"hljs-keyword\">new</span> UI\\Form;\n    $form-&gt;addComponent(<span class=\"hljs-keyword\">new</span> AnotherContainer, <span class=\"hljs-string\">'another'</span>);\n    $form-&gt;addSubmit(<span class=\"hljs-string\">'odeslat'</span>, <span class=\"hljs-string\">'Odeslat'</span>);\n    $form-&gt;onSuccess[] = <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-params\">($_, ArrayHash $values)</span> </span>{\n        dump($values);\n    };\n    <span class=\"hljs-keyword\">return</span> $form;\n}\n</code></pre>\n<p>K tomu třeba nějaká taková šablona:</p>\n<pre><code class=\"hljs\">{form test}\n    {control test-another}\n    {input odeslat}\n{/form}\n</code></pre><p>Formulář se samozřejmě vykreslí i při obyčejném <code>{control test}</code>, ale bez šablony kontejneru (píšu si nápad na vylepšení). Vlastně je ta myšlenka docela jednoduchá, že? Jen je třeba dát pozor na to, že kontejner takto umisťuje formulářové prvky na jinou úroveň.</p>\n<p>Malá poznámka na závěr, která je sice mimo, ale může se hodit. Občas je potřeba zajistit si někde inject závislostí, ale z nějakého důvodu je to problematické. Může se jednat třeba o závislost v abstraktní rodičovské třídě. V takovém případě je možné v configu nastavit <a href=\"https://github.com/dg/nette-di/blob/master/tests/DI/DecoratorExtension.basic.phpt\">decorator</a>:</p>\n<pre><code class=\"hljs lang-neon\">decorator:\n    BaseFormContainer:\n        inject: on\n</code></pre>\n<p><del>Příště se podíváme znovu na <a href=\"dependent-select-box\">Dependent select box</a>. Původní článek si totiž zaslouží důkladnou revizi a po krátké anketě jsem byl přesvědčen, že bude lepší napsat nový článek a podívat se na celý problém podrobněji.</del> <span style=\"color:green\">Podívejte se raději na <a href=\"https://github.com/NasExt/DependentSelectBox\">tento doplněk</a>, který závislý select box řeší jinak - možná lépe.</span></p>\n"
});
