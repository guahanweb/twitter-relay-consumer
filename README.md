# Twitter Relay Consumer

> :no_entry: **Workshop specific project!** if you are not attending
> the [All Things Open](https://www.allthingsopen.org) workshop titled
> *Telling Stories with Big Data*, you are likely in the wrong place!

## Overview

This project contains all the necessary code and configuration to
run the workshop and follow along locally during the ATO session.
By running this application stack, you will be able to register as
a consumer of an established Twitter Stream. Since Twitter restricts
the active connections to a single stream, this project will connect
to a relay service via web socket and allow all participants to
monitor the stream in real time.

> :warning: **Prerequisite:** this push-button solution requires use
> of `docker-compose`, so having [Docker Desktop](https://www.docker.com/products/docker-desktop/)
> installed is required.

Once you have Docker running, follow the setup steps below.

## Push-button setup

If you have Docker installed and running, configuration and execution
are very straightforward.

### Clone the repo

Clone the repository to a local directory where you will be able to
edit the files during the workshop.

```bash
$ git clone git@github.com:guahanweb/twitter-relay-consumer.git
$ cd twitter-relay-consumer
```

### Create a `.docker.env` file

Once you have successfully cloned the repo, you will need to create a
local environment file with the relevant variables for the workshop.

```bash
$ touch ./.docker.env && open ./.docker.env
```

Within the environment file, you will provide the following variables.

> :white_check_mark: **NOTE:** redacted values will be provided by the
> facilitator during the workshop.

```bash
LOG_LEVEL=debug
LOAD_ENV_FILE=0

REDIS_HOST=redis
REDIS_PORT=5379

RELAY_AUTH_TOKEN=<redacted>
RELAY_AUTH_URL=<redacted>
RELAY_WEBSOCKET_URL=<redacted>
```

### Spin up the stack

When the `.docker.env` file is populated, you will be ready to connect
to the relay service and start tracking data. Using `docker-compose`,
you will be able to spin up a local redis instance as well as an image
for the consumer itself.

```bash
$ docker-compose up
```

**NOTE:** this `docker-compose.yml` definition file will mount the
application code into the container and run it with a watcher already
in place, so you will be able to make code changes and see them take
effect immediately.

### Monitor reports over time

Once your application is up and running, open a second terminal window
or tab, and run the following script to examine the actual counts in
a summary report:

```bash
$ npm run report

> twitter-relay-consumer@1.0.0 report
> ts-node scripts/report.ts

{
  rules: { '1542478303877124097': 69 },
  hashtags: {
    xbox: 3,
    teamricochet: 2,
    xboxseriesx: 1,
    xboxseries: 1,
    ...
  }
}
```