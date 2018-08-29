# pmpact

A command line tool to convert [Pact](https://docs.pact.io/) files to [Postman](https://www.getpostman.com/) collections.

### Requirements

Require [NodeJS](https://nodejs.org/en/) version `v7.10.1` or higher.

### Setup the private artifactory npm registry (or install from the repo, see below)

Add the registry:

	$ npm config set registry http://itvrepos.jfrog.io/itvrepos/api/npm/npm-itv

Set up credentials for the artifactory npm proxy:

	$ curl -u [USERNAME]:[PASSWORD] "http://itvrepos.jfrog.io/itvrepos/api/npm/auth"

Add the 3 lines to the ```.npmrc``` config local in your home folder (updated with your email), ```.npmrc``` should look like:

```
registry=http://itvrepos.jfrog.io/itvrepos/api/npm/npm-itv
_auth=[generated authorisation token]
always-auth = true
email=[generated email address]
```

### Installation

```
npm install -g pmpact
```

### Installation from the repo

Clone the repo and from the root execute:

```
npm link
```

Don't forget to run `npm unlink` if needed!

### Usage

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
pmpact http://pact-broker/provider/a-provider/consumer/a-consumer/latest > postman-collection.json
```

### License

[See License file](https://github.com/ITV/pmpact/blob/master/LICENSE.md)
