# Shopping lists
## Installation

The app requires [Deno](https://deno.land/) v1.28.3+ to run.
run the app using
```sh
deno run --allow-net --watch --allow-env --unstable --allow-read app.js  
```  
  
## Features

- create a shopping list
- delete a shopping list
- add items to desired lists
- remove items from lists



## Tech

It all comes from [deno.land]

## Docker

Shopping lists should be very easy to install and deploy in a Docker container.

By default, the Docker will expose port 7777, so change this within the
Dockerfile if necessary. When ready, simply use the Dockerfile to
build the image.

```sh
cd shopping-lists
docker build
```

This will create the shopping lists image and pull in the necessary dependencies.

Once done, run the Docker image and map the port to whatever you wish on
your host. In this example, we simply map port 7777 of the host to
port 7777 of the Docker (or whatever port was exposed in the Dockerfile):

```sh
docker-compose up
```

Verify the deployment by navigating to your server address in
your preferred browser.

```sh
127.0.0.1:7777
```

## License

**Free Software, Hell Yeah!**

