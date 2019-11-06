# dixit
For innovation day

## Install
```bash
npm install yarn -g
yarn install
```

## Start server
First build the distribution for client:
```bash
npm run build
```
Or, for development, use watch-and-build:
```bash
npm run dev
```

Then start the servers (client distribution and game server together):
```bash
npm start
```

## Start/stop server with pm2
Install tools
```bash
npm install pm2 -g
```

Start server. Both the client content distribution server and the backend server will be hosted by pm2.
```bash
npm run pm2-start
```

Stop server
```bash
npm run pm2-stop
```