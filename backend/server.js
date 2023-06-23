import express from 'express';
import {scrapeData} from "./main.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  next();
});

app.get('/banks/non-cash', (req, res, next) => {
  scrapeData('/banks/non-cash', req.query)
    .then(jsonObject => {
      res.end(JSON.stringify(jsonObject));
    })
    .catch(error => {
      next(error)
    });
})

app.get('/banks/cash', (req, res, next) => {
  scrapeData('/banks/cash', req.query)
    .then(jsonObject => {
      res.end(JSON.stringify(jsonObject));
    })
    .catch(error => {
      next(error)
    });
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
