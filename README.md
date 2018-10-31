# pmpact

A command line tool to convert [Pact](https://docs.pact.io/) files to [Postman](https://www.getpostman.com/) collections.

### Requirements

Require [NodeJS](https://nodejs.org/en/) version `v7.10.1` or higher.

### Installation

```
npm install -g pmpact
```

### Installation from the repo

Clone the repo and from the root execute:

```
npm install
npm link
```

Don't forget to run `npm unlink` if needed!

### Command line usage

From a url:

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest
```

From a file:

```
pmpact pact-file.json
```

Save to a file:

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest -o postman-collection.json
```

From a url that required headers:

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest -H '{"Authorization":"Basic ZFhmbHR5Rk1n..."}'
```

### Postman usage

##### Import the collection in postman

Once you got a generated [postman collection](https://www.getpostman.com/docs/v6/postman/collections/intro_to_collections), select "import" in Postman, the generated collection format is `2.1`.

A collection should appear, starting with the name "Pact".

##### Create a Postman environment

A url variable is used for all the requests, the next step is to create an [Postman environment](https://www.getpostman.com/docs/v6/postman/environments_and_globals/intro_to_environments_and_globals) with a url variable, for example: `url: http://my-service.com`.

![Image](labs/assets/postman-environment/step1.png?raw=true)  
![Image](labs/assets/postman-environment/step2.png?raw=true)  
![Image](labs/assets/postman-environment/step3.png?raw=true)  
![Image](labs/assets/postman-environment/step4.png?raw=true)  

You are good to go, make the requests!

### Run tests

```
npm test
```

Run unit tests only:

```
npm run test-unit
```

Run integration tests only:

```
npm run test-integration
```

Watch tests:

```
npm install -g nodemon
nodemon tests/unit -x "npm run test-unit"
nodemon tests/integration -x "npm run test-integration"
```

### License

*Note*: pmpact will be distributed under the [Apache 2.0 license](https://apache.org/licenses/LICENSE-2.0) on the 31/01/2019.  
This change will be made under a new version.

[See License file](https://github.com/ITV/pmpact/blob/master/LICENSE.md)
