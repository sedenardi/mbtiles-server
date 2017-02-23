const express = require('express');
const app = express();
const MBTiles = require('mbtiles');

if (process.argv.length < 3) {
  console.log('Error! Missing TILES filename.\nUsage: node server.js TILES [PORT]');
  process.exit(1);
}

let port = 3000;
if (process.argv.length === 4) {
  port = parseInt(process.argv[3]);
}

const mbtilesLocation = process.argv[2].toString().replace(/\.mbtiles/,'') + '.mbtiles';

let mbtiles;
app.get('/:z/:x/:y.*', (req, res) => {
  const extension = req.params[0];
  if (extension === 'png') {
    mbtiles.getTile(req.params.z, req.params.x, req.params.y, (err, tile, headers) => {
      if (err) {
        return res.status(404).send(`Tile rendering error: ${err}\n`);
      }
      res.header('Content-Type', 'image/png')
      res.send(tile);
    });
  } else if (extension === 'grid.json') {
    mbtiles.getGrid(req.params.z, req.params.x, req.params.y, (err, grid, headers) => {
      if (err) {
        return res.status(404).send(`Grid rendering error: ${err}\n`);
      } else {
        res.header('Content-Type', 'text/json')
        res.send(grid);
      }
    });
  } else {
    res.status(400).send('Wrong file format requested');
  }
});

new MBTiles(mbtilesLocation, (err, res) => {
  if (err) throw err;
  mbtiles = res;
  app.listen(port, (aErr) => {
    if (aErr) { console.log(aErr); }
    console.log(`Listening on port ${port}`);
  });
});
