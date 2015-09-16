# NOE Autocomplete

Flight JS powered autocomplete UI *only* component

## Installation

```
npm i -S noe-autocomplete

// OR

bower i -S noe-autocomplete
```

## Usage (TBC)

Please see ```./public/index.html``` as a working example.

## Browser Support

* All modern browsers
* IE9+

### Why not IE8 and below

Test deps don't support that ... and yeah ... really!?

## Demo

Clone this repo. ``cd`` into the root of this project and run the following command:

```
$ make setup && npm run-script demo
```

Then you should be able to access a demo of the app @ ```http://localhost:3000```.

For a list of randomly generated terms (aka suggestions), visit ```http://localhost:3000/terms```.

## Testing

Clone this repo. ``cd`` into the root of this project and run the following command:

```
$ make setup && npm test
```

This application uses [testem][testem] as the test runner :)


[testem]: https://github.com/airportyh/testem
