// @flow

import WithPost from '../../components/WithPost';

export default WithPost({
  "attributes": {
    "timestamp": 1393877713000,
    "title": "AJAX upload souborů v Nette pomocí Fine Uploaderu",
    "slug": "ajax-upload-souboru-v-nette-pomoci-fine-uploaderu-2"
  },
  "body": "<p><a href=\"ajax-upload-souboru-v-nette-pomoci-fine-uploaderu\">Dříve</a> jsem psal o tom, jak použít Fine Uploader jakožto nástroj pro AJAXové nahrávání souborů na server. Původní článek však platí pouze pro verzi <code>3.*</code>, která je dnes již zastaralá. Pojďme si dnes ukázat v podstatě to samé, ale pro novější verzi <code>4.3+</code>, která se v učitých směrech poměrně zásadně liší od svého předchůdce. Tentokrát se to však pokusím vyřešit co nejjednodušeji.</p>\n<p>Začátek je vlastně úplně stejný. Musíme nalinkovat javascriptové soubory:</p>\n<pre><code class=\"hljs lang-html\"><span class=\"hljs-comment\">&lt;!-- jQuery --&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">src</span>=<span class=\"hljs-string\">\"{$basePath}/js/jquery.fineuploader-4.3.1.min.js\"</span>&gt;</span><span class=\"undefined\"></span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">src</span>=<span class=\"hljs-string\">\"{$basePath}/js/nette.ajax.js\"</span>&gt;</span><span class=\"undefined\"></span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">src</span>=<span class=\"hljs-string\">\"{$basePath}/js/main.js\"</span>&gt;</span><span class=\"undefined\"></span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n</code></pre>\n<p>Použití je úplně jednoduché, ve zjednodušené formě:</p>\n<pre><code class=\"hljs lang-html\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">id</span>=<span class=\"hljs-string\">\"image-uploader\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n</code></pre>\n<p>Snažím se ukázat opravdu jen kritické minimum, protože ty základní věci jsou stejné, případně dohledatelné v dokumentaci, takže se dají oba dva návody z velké části doplnit. Minule jsem však zatáhl do ukázek i poměrně hodně balastu, takže ten u staré verze nechám, ale bude následovat opravdu jen to nejnutnější.</p>\n<p>Stejně tedy jako v předchozí verzi následuje javascriptový spouštěcí kód. Zde již vznikají určité odlišnosti:</p>\n<pre><code class=\"hljs lang-javascript\">$(<span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> (<span class=\"hljs-params\"></span>) </span>{\n    $(<span class=\"hljs-string\">'#image-uploader'</span>).fineUploader({\n        <span class=\"hljs-attr\">debug</span>: <span class=\"hljs-literal\">true</span>, <span class=\"hljs-comment\">//hodí se pro lazení</span>\n        request: {\n            <span class=\"hljs-attr\">endpoint</span>: <span class=\"hljs-string\">'pictures?do=uploadPicture'</span>\n        },\n        <span class=\"hljs-attr\">retry</span>: {\n            <span class=\"hljs-attr\">enableAuto</span>: <span class=\"hljs-literal\">true</span>\n        }\n    });\n});\n</code></pre>\n<p>Použití je tedy téměř stejné, až na to, že jsem úplně vypustil překlad textů. V této nové verzi jsou totiž novinkou šablony (ostatně proto také nové číslo verze). Uživatel-programátor má tak více pod kontrolou výsledný vzhled uploaderu:</p>\n<pre><code class=\"hljs lang-html\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">type</span>=<span class=\"hljs-string\">\"text/template\"</span> <span class=\"hljs-attr\">id</span>=<span class=\"hljs-string\">\"qq-template\"</span>&gt;</span><span class=\"handlebars\"><span class=\"xml\">\n    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-uploader-selector qq-uploader\"</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-drop-area-selector qq-upload-drop-area\"</span> <span class=\"hljs-attr\">qq-hide-dropzone</span>&gt;</span>\n            <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span>&gt;</span>Přetáhněte soubory sem<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-button-selector qq-upload-button\"</span>&gt;</span>\n            <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span>&gt;</span>Klikněte, nebo přetáhněte obrázky<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-drop-processing-selector qq-drop-processing\"</span>&gt;</span>\n           <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span>&gt;</span>Zpracovávám přetažené soubory...<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n           <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-drop-processing-spinner-selector qq-drop-processing-spinner\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">ul</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-list-selector qq-upload-list\"</span>&gt;</span>\n            <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">li</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-progress-bar-container-selector\"</span>&gt;</span>\n                    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">div</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-progress-bar-selector qq-progress-bar\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-spinner-selector qq-upload-spinner\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">img</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-thumbnail-selector\"</span> <span class=\"hljs-attr\">qq-max-size</span>=<span class=\"hljs-string\">\"100\"</span> <span class=\"hljs-attr\">qq-server-scale</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-edit-filename-icon-selector qq-edit-filename-icon\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-file-selector qq-upload-file\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">input</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-edit-filename-selector qq-edit-filename\"</span> <span class=\"hljs-attr\">tabindex</span>=<span class=\"hljs-string\">\"0\"</span> <span class=\"hljs-attr\">type</span>=<span class=\"hljs-string\">\"text\"</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-size-selector qq-upload-size\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-cancel-selector qq-upload-cancel\"</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"#\"</span>&gt;</span>Zrušit<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-retry-selector qq-upload-retry\"</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"#\"</span>&gt;</span>Opakovat<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">a</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-delete-selector qq-upload-delete\"</span> <span class=\"hljs-attr\">href</span>=<span class=\"hljs-string\">\"#\"</span>&gt;</span>Smazat<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">a</span>&gt;</span>\n                <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">span</span> <span class=\"hljs-attr\">class</span>=<span class=\"hljs-string\">\"qq-upload-status-text-selector qq-upload-status-text\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">span</span>&gt;</span>\n            <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">li</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">ul</span>&gt;</span>\n    <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">div</span>&gt;</span>\n</span></span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n</code></pre>\n<p>A opět následuje zpracování v handleru:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">public</span> <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span> <span class=\"hljs-title\">handleUploadPicture</span><span class=\"hljs-params\">()</span> </span>{\n    $uploader = <span class=\"hljs-keyword\">new</span> \\UploadHandler();\n    $uploader-&gt;allowedExtensions = <span class=\"hljs-keyword\">array</span>(<span class=\"hljs-string\">\"jpeg\"</span>, <span class=\"hljs-string\">\"jpg\"</span>, <span class=\"hljs-string\">\"png\"</span>, <span class=\"hljs-string\">\"gif\"</span>);\n    $result = $uploader-&gt;handleUpload(<span class=\"hljs-keyword\">__DIR__</span> . <span class=\"hljs-string\">'/../../www/uploads'</span>);\n    <span class=\"hljs-keyword\">$this</span>-&gt;sendResponse(<span class=\"hljs-keyword\">new</span> Nette\\Application\\Responses\\JsonResponse($result));\n}\n</code></pre>\n<p>Zde celkem není co pokazit, ale pokud by bylo potřeba vrátit chybu, provede se to opět pomocí <code>JsonResponse</code>:</p>\n<pre><code class=\"hljs lang-php\"><span class=\"hljs-keyword\">$this</span>-&gt;sendResponse(<span class=\"hljs-keyword\">new</span> Nette\\Application\\Responses\\JsonResponse(<span class=\"hljs-keyword\">array</span>(\n        <span class=\"hljs-string\">'error'</span> =&gt; $exc-&gt;getMessage(),\n)));\n</code></pre>\n<p>Samotná třída <code>UploadHandler</code> je pak opět k nalezení na <a href=\"https://github.com/Widen/fine-uploader-server/blob/master/php/traditional/handler.php\">GitHubu</a>. Tento návod tedy mohu zakončit vlastní citací:</p>\n<blockquote>\n<p>A to je vlastně úplně celé. Stačí tedy spustit Fine Uploader na straně klienta například podle oficiálních návodů, endpoint nastavit na nějaký handle v aplikaci a ten správně použit. To konkrétně obnáší odeslání JSON odpovědi o úspěšném zpracování obrázku.</p>\n</blockquote>\n"
});
