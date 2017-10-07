export default {
  "attributes": {
    "id": "8119640e-e954-435c-9a95-ff14bf73634b",
    "timestamp": 1482501056000,
    "title": "Muskulaturní rozšíření DIC",
    "slug": "muskulaturni-rozsireni-dic"
  },
  "body": "K čemu je DI rozšíření v Nette a jak se takové rozšíření píše [už víme](http://zlml.cz/rozsireni-pro-dic). Teď se podíváme na způsob, jak pracovat s takovým rozšířením na úplně nové úrovni. Tento článek velké spoustě lidí změní způsob práce a aplikace budou najednou o level výš. Jak řekl jeden z účastníků školení: tak to je geniální... :)\n\n# Jak strukturovat aplikaci?\n\nO tom už jsem se párkrát rozepsal a ještě se také minimálně jednou rozepíšu. Proteď jen rychlý úvod. Za tu dobu co dělám s frameworky jsem došel k tomu, že nemám žádnou složku s názvem `app`. Například struktura [tohoto projektu](https://github.com/adeira/connector) vypadá (zjednodušeně) takto:\n\n```\n.\n├── bin\n│   └── console\n├── config\n│   ├── config.local.neon\n│   ├── config.local.neon.travis\n│   ├── config.neon\n│   ├── extensions.neon\n│   └── services.neon\n├── log\n├── src\n│   ├── Authentication\n│   ├── Common\n│   ├── Devices\n│   ├── Endpoints\n│   └── Routing\n├── temp\n├── tests (obsahuje 'src' se stejnou strukturou)\n├── vendor\n└── www\n```\n\nNa tom není vůbec nic převratného. Důležitý je však způsob jakým se pracuje se službami (services). Pokud se totiž podíváme na obsah souboru `services.neon`, tak zjistíme, že je téměř prázdný:\n\n```neon\nservices:\n\tmigrations.codeStyle: Adeira\\Connector\\Migrations\\CodeStyle\n\trouter: Adeira\\Connector\\Routing\\RouterFactory::createRouter\n\n\tdoctrineSession: Adeira\\Connector\\Common\\Infrastructure\\Application\\Service\\DoctrineSession\n\tdummySession:\n\t\tclass: Adeira\\Connector\\Common\\Infrastructure\\Application\\Service\\DummySession\n\t\tautowired: no\n```\n\nPřitom celý projekt má v tuto dobu zhruba 80 služeb, které je potřeba zaregistrovat. Kde je tedy ta magie? Asi je zřejmé kam mířím. O vše se starají rozšíření dependency injection kontejneru. Ty jsou zaregistrovány v `extensions.neon`:\n\n```neon\nextensions:\n\t- Arachne\\ContainerAdapter\\DI\\ContainerAdapterExtension # because of migrations\n\t- Arachne\\EventDispatcher\\DI\\EventDispatcherExtension # because of migrations\n\tauthentication: Adeira\\Connector\\Authentication\\Infrastructure\\DI\\Nette\\Extension\n\tdevices: Adeira\\Connector\\Devices\\Infrastructure\\DI\\Nette\\Extension\n\tdoctrine.orm: Adeira\\Connector\\Doctrine\\ORM\\DI\\Extension(%debugMode%)\n\tfakeSession: Kdyby\\FakeSession\\DI\\FakeSessionExtension\n\tgraphql: Adeira\\Connector\\GraphQL\\Bridge\\Nette\\DI\\Extension\n\tmigrations: Zenify\\DoctrineMigrations\\DI\\MigrationsExtension\n\tsymfony.console: Adeira\\Connector\\Symfony\\Console\\DI\\Extension\n```\n\nJak je vidět, tak každý balíček ve složce `src` má vlastní rozšíření (můž mít klidně víc rozšíření, ale není to potřeba). Na následujících řádcích ukážu jak takové rozšíření napsat super jednoduše.\n\n# Rozšíření bez znalosti Nette\\DI\n\nPsaní rozšíření pro DIC v Nette může být (a je) poměrně složité. Trošku to chce vědět, jak Nette funguje uvnitř. To samozřejmě dává do rukou obrovský nástroj, ale současně to také klade obrovskou překážku. Přesně z tohoto důvodu vznikl balíček [adeira/compiler-extension](https://github.com/adeira/compiler-extension), který jsem napsal pro lidi ve firmách, kteří se Nette teprve učí, chtějí psát aplikace tak jako já a na prozkoumávání Nette\\DI není čas. Záběr tohoto balíčku není jen zde. Sám jsem si ho moc oblíbil a dnes tak píšu rozšíření také (ne vždy, ale dost často).\n\nMyšlenka je taková, že NEON formát umí každý. Pokud ne, tak si stačí prohlédnout [tuto stránku](https://ne-on.org/) a je to všem jasné (používám velmi úspěšně na školeních a přednáškách). Zároveň je snadné naučit o čem je DI, proč se musí v Nette registrovat služby v konfiguračním souboru a jak funguje autowiring. To v zásadě stačí k tomu, aby člověk začal psát aplikace mnohem lépe než dříve. Jenže pokud chce někdo strukturovat aplikaci tak jak to dělám já, tak musí registrovat všechny služby do souboru `services.neon` a těch je desítky až stovky (ne-li tisíce). Navíc je to nesmysl - proč by si takový balíček nemohl nést všechno s sebou (včetně konfigurací)?\n\nAle on může! Podívejte se, jak vypadá takové rozšíření `Authentication` balíčku:\n\n```php\n<?php declare(strict_types = 1);\n\nnamespace Adeira\\Connector\\Authentication\\Infrastructure\\DI\\Nette;\n\nuse Adeira\\Connector\\Doctrine\\ORM;\n\nclass Extension extends \\Adeira\\CompilerExtension implements ORM\\DI\\IMappingFilesPathsProvider\n{\n\n\tpublic function provideConfig(): string\n\t{\n\t\treturn __DIR__ . '/config.neon';\n\t}\n\n\tpublic function getMappingFilesPaths(): array\n\t{\n\t\treturn [__DIR__ . '/../../Persistence/Doctrine/Mapping'];\n\t}\n\n}\n```\n\nDůležitá je metoda `provideConfig`, která slouží pouze k tomu, aby rozšíření prozradilo, kde je jeho konfigurační soubor. A tato konfigurace může být [pěkně bohatá](https://raw.githubusercontent.com/adeira/connector/03be1b949a0eb0c2f75c90ba3da5fca2ef8b2979/src/Authentication/Infrastructure/DI/Nette/config.neon). Takovou nutnou prerekvizitou k tomu aby vše fungovalo je nahrazení výchozího `ExtensionsExtension` za novou implementaci, který toto chování umoňuje:\n\n```php\n$configurator = new Nette\\Configurator;\n$configurator->defaultExtensions['extensions'] = \\Adeira\\ConfigurableExtensionsExtension::class;\n```\n\nTuto jednu řádku je nutné umístit třeba do souboru `bootstrap.php` kde se vytváří DI kontejner. Od teď bude toto chování fungovat \"by default\" a vlastní DI rozšíření dokonce může dědit od `Nette\\DI\\CompilerExtension`. **Není tedy potřeba dělat žádné úpravy ve stávajících rozšířeních.** A to je vždy super! Pokud bude rozšíření dědit od `Adeira\\CompilerExtension`, budete mít k dispozici ještě pomocnou metodu `setMapping`, která se hodí pro mapování presenterů. Není to však nutná podmínka.\n\nTo ale není všechno!\n\n# Jak se chovají konfigurace balíčků\n\nAsi nejzajímavější na návrhu dependency injection je to, že je možné jednoduše vyměňovat implementace bez zásahu do kódu. Jak se tímto pracuje balíček [adeira/compiler-extension](https://github.com/adeira/compiler-extension)? Představte si, že máte hlavní konfigurační soubor s tímto obsahem:\n\n```neon\nparameters:\n    key1: value1\n    key2: value2\n\nservices:\n    - DefaultService\n    named: Tests\\Service\n\nextensions:\n    ext2: CustomExtension2\n\next2:\n    ext_key1: ext_value1\n    ext_key2: ext_value2\n\napplication:\n    mapping:\n        *: *\n```\n\nA teď přidáte nový balíček, který si nese vlastní konfigurační soubor a pomocí metody `provideConfig` jej dává k dispozici. Jeho obsah je takovýto:\n\n```neon\nparameters:\n    key2: overridden\n    key3: value3\n\nservices:\n    - Tests\\TestService\n    named: Service2\n\next2:\n    ext_key2: overridden\n    ext_key3: ext_value3\n\nlatte:\n    macros:\n        - App\\Grid\\Latte\\Macros\n```\n\nJaký je výsledek? V aplikaci budou k dispozici najednou tři parametry (obdobně pro `ext2` parametry):\n\n```neon\nparameters:\n    key1: value1\n    key2: overridden\n    key3: value3\n```\n\nPodobně se to chová i u služeb:\n\n```neon\nservices:\n    - DefaultService\n    named: Service2 # přepsat lze pouze pojmenovanou službu\n    - Tests\\TestService\n```\n\nNavíc se zaregistruje Latte makro. Ačkoliv toto chování funguje dobře, doporučuji jej spíše nevyužívat k přepisování globální konfigurace. Mnohem vhodnější je využívat tyto konfigurace k **přidávání** funkčností z balíčků. Tedy registrace nových služeb, přidávání commandů do konzole, registrace nových typů v Doctrine a podobně. V takovém případě se bude rozšíření chovat naprosto očekávaně. Vyhnete se tak tomu, že dva balíčky nastavují jeden parametr a záleží tam na pořadí. Je to nástroj - užijte jej s rozumem.\n\nTo ale pořád není všechno!\n\n# Malé pozlátko na závěr\n\nTento balíček přidává ještě jednu funkci, kterou považuji také za velmi užitečnou. Jak jistě víte, tak rozšíření se dá zaregistrovat pomocí sekce `extensions` a pokud rozšíření zaregistrujete pod nějakým jménem, je možné jej konfigurovat. To ostatně bylo vidět před malou chvílí:\n\n```neon\nextensions:\n    ext2: CustomExtension2\n\next2:\n    ext_key1: ext_value1\n    ext_key2: ext_value2\n```\n\nV tomto případě budou klíče `ext_key1` a `ext_key2` k dispozici v samotném rozšíření. To se potom používá k různým úpravám chování samotného balíčku. Co když však nepíšete vlastní PHP kód, ale chcete jen předat tyto parametry do nějaké služby, kterou ono rozšíření registruje? K tomu slouží zvláštní zápis pomocí `%%`. V tomto konkrétním případě řekněme, že `CustomExtension2` má vlastní konfigurační soubor s tímto obsahem:\n\n```\nservices:\n    - Tests\\TestService(%%ext_key2%%)\n```\n\nJak je vidět, tak si může vzít hodnotu `ext_key2` rovnou z konfigurace. Důležité je si uvědomit, že zatímco `%aaa%` bere parametr `aaa` ze sekce `parameters`, tak `%%aaa%%` bere konfiguraci **pouze** ze sekce, pod kterou je rozšíření zaregistrované. Chová se to tedy úplně stejně jako `$this->getConfig()` uvnitř rozšíření... :)\n\nDejte [tomuto rozšíření](https://github.com/adeira/compiler-extension) šanci (nebo hvězdičku). Z praxe mohu říci, že se s ním pracuje skutečně dobře a pokud narazíte na to, že potřebujete udělat něco složitého - není problém pokračovat v psaní DI rozšíření v PHP zároveň s tímto. Uvítám také nápady na zlepšení a různé postřehy. Přecijen chvíli mi trvalo, než jsem přišel na ten správný způsob jak to uchopit.\n\n```\ncomposer require adeira/compiler-extension\n```\n\nInstalace je jednoduchá... :)"
}