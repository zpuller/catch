Catch is a basic VR game with throwing and catching objects. It has multiplayer support and is basically just a playground for VR experimentation using three-js.

To test locally, make sure the HOST is set to `location.origin.replace(/^http/, 'ws').replace(/8080/, '3000')` in `Client.js` (`TODO` don't hardcode this but use an env variable instead).

Then, run

```
npm start
```

to run the backend, and then

```
npm run dev
```

to run the webpack dev server on port 8080.