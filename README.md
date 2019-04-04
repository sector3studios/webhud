![R3E](https://cloud.githubusercontent.com/assets/12783101/8024034/cd3c7c84-0d24-11e5-9e5f-3bf6fbab713f.png)

# Web Hud

This is a sample showing how to create a web hud using the shared memory API for
[RaceRoom Racing Experience][r3e] (R3E).

## Quick start

-   Extract [public/dash.zip](public/dash.zip)
-   Run dash.exe
-   Add `-webdev -webHudUrl=https://sector3studios.github.io/webhud/dist/` to the game launch arguments
-   Start the game

## Development

-   Development requires node/npm
-   For this to work you need to be running `public/dash.zip/dash.exe`. It is the source of all the data being used.
-   Start development by running `npm start` and opening http://localhost:4000/
-   Add `-webdev -webHudUrl=http://localhost:4000/` to the game launch arguments
-   When you are happy with your changes run `npm run build` and the final files will be put in the `dist/` folder.

## Tips

-   Look at `src/types/r3eTypes.ts` to see what data is exposed
-   Press `Shift+i` to view the current game state (search takes regex)
-   Press `Shift+Space` to freeze the current game state
-   Press `Shift+d` to dump current game state as JSON into clipboard
-   Press `Ctrl+v` to insert dumped JSON game state into current session

## License

See [LICENSE](LICENSE).

[r3e]: http://game.raceroom.com/
