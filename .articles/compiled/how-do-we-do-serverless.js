export default {
  "attributes": {
    "id": "2151f134-7f0e-43c0-8382-eab9d336b7ee",
    "timestamp": 1500731161000,
    "title": "How do we do serverless?",
    "slug": "how-do-we-do-serverless"
  },
  "body": "In past few months, I moved completely from PHP backend to the JavaScript semi-frontend (not really backend but definitely not frontend - somewhere between). And I am glad I did it because finally, I can try every cool technology I always wanted but haven't had the opportunity. And one of these technologies is a serverless approach. It basically means that you still have servers but you are not taking care of the bare metal but you'll rather get computational power with all the fancy stuff like auto-scaling, high availability, related services orchestration and so on.\n\nHere at Kiwi.com (Prague), we are working on a lot of projects but one of them is more often pronounced - [the chatbot](http://www.czechcrunch.cz/2017/05/brnenske-kiwi-com-otevira-v-praze-novou-pobocku-se-zamerenim-na-umelou-inteligenci/). This chatbot should help our customer support to manage tasks more easily. But the interesting part is that this application is **completely serverless**. This is how it works.\n\n# It's just a function\n\nThe whole chatbot is just a function. Quite long and complicated one though. It's written in Node.js (ECMAScript 2017 - ES8 with a shit-ton of transpilers) and it runs on AWS Lambda. One of the best parts of the serverless is its deployment. We are using [Serverless Framework](https://serverless.com/) and that means that deployment to the serverless infrastructure is as easy as writing `serverless deploy`:\n\n```\n$ serverless deploy --stage staging\nServerless: Packaging service...\nServerless: Uploading CloudFormation file to S3...\nServerless: Uploading artifacts...\nServerless: Uploading service .zip file to S3...\nServerless: Validating template...\nServerless: Updating Stack...\nServerless: Checking Stack update progress...\n..........\nServerless: Stack update finished...\nService Information\nservice: chatbot\nstage: staging\nregion: eu-west-1\napi keys:\n  None\nendpoints:\n  POST - https://secret.eu-west-1.amazonaws.com/staging/\nfunctions:\n  chatbot: chatbot-staging-chatbot\nServerless: Removing old service versions...\n```\n\nWhat does this framework do? Firstly it creates a ZIP file with the already transpiled and tested code. It also creates [AWS CloudFormation](https://aws.amazon.com/cloudformation/) template and uploads it to the AWS S3 storage. Now the magic happens. The new environment is created/updated thanks to the CloudFormation template. In our case, it means that it creates API Gateways, Lambda functions, and DynamoDB tables. This way you can invoke Lambda function just by calling URL address.\n\nThe interesting part is that you can extend CloudFormation template however you want. In your case, we are just creating DynamoDB tables but I think you can do whatever you want (means whatever CloudFormation is able to do).\n\n# Dazzle me\n\nI'll show you just a simplified serverless definition (without the DynamoDB because it's too long), but the overall picture should be clear. The whole serverless infrastructure is defined in `serverless.yml`:\n\n```neon\nservice: chatbot\n\nprovider:\n  name: aws\n  runtime: nodejs6.10\n  region: eu-west-1 # Ireland\n\nfunctions:\n  chatbot:\n    handler: dist/basicLambda.handler\n    events:\n      - http:\n          path: /\n          method: POST\n          cors: true\n          integration: lambda-proxy\n```\n\nIt's quite self-explanatory. It's like a scenario: just create AWS Lambda function from `dist/basicLambda.js` file and on `POST` invoke a function in that file called `handler` (and yeah, also support CORS please). Since we are executing only transpiled and tested code it's a good idea to upload just that file:\n\n```neon\npackage:\n  exclude:\n    - ./**\n  include:\n    - dist/*\n```\n\nDynamoDB and other services can be defined in the `resources` section. You just have to make sure that you'll setup IAM role permissions as well.\n\nAnd that's it. This is your \"ready for production\" environment. The last thing you have to do is just write the Lambda function for the chatbot. Easy...\n\n# Chatbot AWS Lambda function\n\nSince we are using so called `lambda-proxy` integration you have to take care of the inputs and outputs in your code on your own. But it's recommended and you should definitely do that.\n\n```javascript\nexport async function handler(\n  event: Object,\n  context: ?Object,\n  callback: (error: null, success: Object) => void,\n) {\n  // error handling and so on...\n\n  callback(null, {\n    statusCode: 200,\n    headers: {\n      'Access-Control-Allow-Origin': '*', // manual CORS (because of lambda-proxy)\n    },\n    body: JSON.stringify({\n      response: \"Sorry, I didn't understand your question. Say that again?\",\n    }),\n  });\n}\n```\n\nNow, for me, this was always so confusing. It's because you hear - just run the function on AWS Lambda. But what does it mean? You have your shiny program full of classes and files and not only one function to run. Well, this is why you have Webpack right? You just inline everything into one file with all the mangling and uglifying and you are almost ready. The last thing is to expose your program via one handler and for AWS Lambda it should be in form of CommonJS (Webpack fragment):\n\n```javascript\noutput: {\n  path: path.resolve(appDirectory, 'dist'),\n  filename: '[name].js',\n  libraryTarget: \"commonjs2\",\n},\n```\n\nAnd that's it. This is how we do serverless (not only for chatbot). You should definitely try it if you are courageous enough."
}