// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1375087004000,
    "title": "Třída pro připojení k FIO API",
    "slug": "trida-pro-pripojeni-k-fio-api"
  },
  "body": "<p>Další užitečný úryvek, který je škoda nechat ležet v Git repozitářích.\nA opět uzpůsobený pro používání s Nette FW.</p>\n<p>Nedávno jsem psal o tom, jak používat CLI router v Nette (<a href=\"http://zlml.cz/nette-2-1-dev-clirouter\">http://zlml.cz/nette-2-1-dev-clirouter</a>).\nPrávě pomocí tohoto routeru je vhodné kontrolovat bankovní výpisy - například pomocí cronu:</p>\n<pre><code class=\"lang-php\">&lt;?php\n\nnamespace App\\CliModule;\n\nuse Nette;\nuse Nette\\Diagnostics\\Debugger;\n\n/**\n * Class CliPresenter\n * @package App\\CliModule\n */\nclass CliPresenter extends BasePresenter {\n\n        /** @var \\Fio @inject */\n        public $fio;\n        ...\n\n        public function actionCron() {\n                $this-&gt;checkFio(); // FIO vs. nezaplacené objednávky\n                ...\n                $this-&gt;terminate();\n        }\n\n        /**\n         * Zkontroluje bankovní účet, porovná s databází a zaplacené objednávky změní na status PAID.\n         */\n        private function checkFio() {\n                try {\n                        $transactions = $this-&gt;fio-&gt;transactions();\n                        $unpaid = $this-&gt;orders-&gt;selectUnpaidOrders(); //získání nezaplacených objednávek\n                        //array_intersect() - zde samotné zpracování\n                        ...\n                } catch (\\Exception $exc) {\n                        Debugger::log($exc-&gt;getMessage() . &#39; FILE: &#39; . $exc-&gt;getFile() . &#39; on line: &#39; . $exc-&gt;getLine(), Debugger::WARNING);\n                        echo $exc-&gt;getMessage() . EOL;\n                }\n        }\n}\n</code></pre>\n<p>K tomu se hodí právě následující třída:</p>\n<pre><code class=\"lang-php\">&lt;?php\n\n/**\n * Class Fio\n */\nclass Fio extends \\Nette\\Object {\n\n        private $token;\n        private $rest_url = &#39;https://www.fio.cz/ib_api/rest/&#39;;\n\n        /**\n         * @param string $token SECURE\n         */\n        public function __construct($token) {\n                $this-&gt;token = $token;\n        }\n\n        /**\n         * Pohyby na účtu za určené období.\n         * JSON only!\n         * @param string $from\n         * @param string $to\n         * @return array|mixed\n         */\n        public function transactions($from = &#39;-1 month&#39;, $to = &#39;now&#39;) {\n                $from = \\Nette\\DateTime::from($from)-&gt;format(&#39;Y-m-d&#39;);\n                $to = \\Nette\\DateTime::from($to)-&gt;format(&#39;Y-m-d&#39;);\n                $url = $this-&gt;rest_url . &#39;periods/&#39; . $this-&gt;token . &#39;/&#39; . $from . &#39;/&#39; . $to . &#39;/transactions.json&#39;;\n                return $this-&gt;parseJSON($this-&gt;download($url));\n        }\n\n        /**\n         * Oficiální výpisy pohybů z účtu.\n         * JSON only!\n         * @param $id\n         * @param null $year\n         * @return array|mixed\n         */\n        public function transactionsByID($id, $year = NULL) {\n                if ($year === NULL) {\n                        $year = date(&#39;Y&#39;);\n                }\n                $url = $this-&gt;rest_url . &#39;by-id/&#39; . $this-&gt;token . &#39;/&#39; . $year . &#39;/&#39; . $id . &#39;/transactions.json&#39;;\n                return $this-&gt;parseJSON($this-&gt;download($url));\n        }\n\n        /**\n         * Pohyby na účtu od posledního stažení.\n         * JSON only!\n         * @return array|mixed\n         */\n        public function transactionsLast() {\n                $url = $this-&gt;rest_url . &#39;last/&#39; . $this-&gt;token . &#39;/transactions.json&#39;;\n                return $this-&gt;parseJSON($this-&gt;download($url));\n        }\n\n        /**\n         * @param $url\n         * @return mixed\n         * @throws \\Exception\n         */\n        private function download($url) {\n                if (!extension_loaded(&#39;curl&#39;)) {\n                        throw new \\Exception(&#39;Curl extension, does\\&#39;t loaded.&#39;);\n                }\n                $curl = curl_init();\n                curl_setopt($curl, CURLOPT_URL, $url);\n                curl_setopt($curl, CURLOPT_HEADER, FALSE);\n                curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);\n                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);\n                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);\n                $result = curl_exec($curl);\n                return $result;\n                //return file_get_contents($url); //ALTERNATIVE\n        }\n\n        /**\n         * @param $data\n         * @return array|mixed\n         */\n        private function parseJSON($data) {\n                $json = json_decode($data);\n                if($json === NULL) {\n                        //Moc ryhlé požadavky na Fio API\n                        throw new \\Exception(&#39;Fio API overheated. Please wait...&#39;);\n                        //Když se posílá stále moc požadavků, tak se to z Exception nikdy nevyhrabe. Musí se opravdu počkat.\n                }\n                if(!$json-&gt;accountStatement-&gt;transactionList) {\n                        return $json; // There are no transactions (header only)\n                }\n                $payments = array();\n                foreach ($json-&gt;accountStatement-&gt;transactionList-&gt;transaction as $row) {\n                        $out = array();\n                        foreach ($row as $column) {\n                                if ($column) {\n                                        $out[$column-&gt;id] = $column-&gt;value; //v $column-&gt;name je název položky\n                                        /*\n                                         * 0  - Datum\n                                         * 1  - Částka (!)\n                                         * 5  - Variabilní symbol (!)\n                                         * 14 - Měna (!)\n                                         * Hodnoty (!) se musí použít ke kontrole správnosti...\n                                         */\n                                }\n                        }\n                        array_push($payments, $out);\n                }\n                return $payments;\n        }\n\n}\n</code></pre>\n<p>S tím, že je zapotřebí předat FIO klíč z neonu. FIO třída se automaticky injectuje, tzn. že i konstruktor\ntéto třídy bude doplněn automaticky. Je jen zapotřebí přidat do neonu onu konfiguraci:</p>\n<pre><code class=\"lang-neon\">parameters:\n    fio_token: &#39;&#39; #token pro přístup do FIO banky\n\n...\n\nservices:\n    - Fresh\\Fio(token: %fio_token%)\n\n...\n</code></pre>\n<p>Bylo by vhodné upozornit na fakt, že se jedná pouze o read-only přístup, tzn. že neexistují žádné funkce\npro zápis (ačkoliv existuje něco jako datumová zarážka). Díky tomu je možné použít takovéto nízkoúrovňové\nzabezpečení pomocí jednoho tokenu.</p>\n"
});