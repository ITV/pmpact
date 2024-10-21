# pmpact

A command line tool to convert [*Pact*](https://docs.pact.io/) files to [*Postman*](https://www.getpostman.com/) collections.

## Contents

* [Requirements](#requirements)
* [Installation](#installation)
    * [Installation from the repo](#installation-from-the-repo)
* [Command line usage](#command-line-usage)
    * [From a url](#from-a-url)
    * [From a file](#from-a-file)
    * [Save to a file](#save-to-a-file)
    * [From a url that requires headers](#from-a-url-that-requires-headers)
* [Postman usage](#postman-usage)
    * [Import the collection in *Postman*](#import-the-collection-in-postman)
    * [Create a *Postman* environment](#create-a-postman-environment)
* [Run tests](#run-tests)
    * [Run all tests](#run-all-tests)
    * [Run unit tests only](#run-unit-tests-only)
    * [Run integration tests only](#run-integration-tests-only)
* [License](#license)

## Requirements

Requires [*NodeJS*](https://nodejs.org/en/) version `v20.11` or higher.

## Installation

```
npm install -g pmpact
```

### Installation from the repo

Clone the repo and from the root execute:

```
npm install
npm link
```

**Note**: Don't forget to run `npm unlink` if needed!

## Command line usage

### From a url

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest
```

### From a file

```
pmpact pact-file.json
```

### Save to a file

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest -o postman-collection.json
```

### From a url that requires headers

```
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest -H '{"Authorization":"Basic ZFhmbHR5Rk1n..."}'
```

## *Postman* usage

### Import the collection in *Postman*

Once you have a generated [*Postman* collection](https://www.getpostman.com/docs/v6/postman/collections/intro_to_collections), select "import" in *Postman*. The generated collection format is `2.1`.

A collection should appear, starting with the name "Pact".

### Create a *Postman* environment

A url variable is used for all the requests. The next step is to create an [*Postman* environment](https://www.getpostman.com/docs/v6/postman/environments_and_globals/intro_to_environments_and_globals) with a url variable, for example: `url: http://my-service.com`.

1. ![Image](labs/assets/postman-environment/step1.png?raw=true)  
2. ![Image](labs/assets/postman-environment/step2.png?raw=true)  
3. ![Image](labs/assets/postman-environment/step3.png?raw=true)  
4. ![Image](labs/assets/postman-environment/step4.png?raw=true)  

You're good to go - so make the requests!

## Run tests

### Run all tests

```
npm test
```

### Run unit tests only

```
npm run test-unit
```

### Run integration tests only

```
npm run test-integration
```

### Watch tests

```
npm install -g nodemon
nodemon tests/unit -x "npm run test-unit"
nodemon tests/integration -x "npm run test-integration"
```

## Release process

When contributing, the process we adhere to for releases is found in [RELEASE.md](./RELEASE.md).

## License

[See License file](https://github.com/ITV/pmpact/blob/master/LICENSE.md)
