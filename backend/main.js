import axios from "axios";
import * as cheerio from "cheerio";

async function fetchData(url, options) {
  return await axios.get(url, {
    headers: {
      cookie: "Cookie.CurrencyList=" + options.currencyList
    }
  }).catch((error) => {
    console.log(error);
    throw new Error(error);
  });
}

export async function scrapeData(endpoint, options) {
  const url = "https://rate.am/am/armenian-dram-exchange-rates" + endpoint;
  let res = await fetchData(url, options);

  const html = res.data;
  let dataObj = [];

  const $ = cheerio.load(html);

  let statsTable = $('#rb > tbody > tr');

  statsTable.each((index, element) => {
    if (index >= 2 && index <= 19) {
      let organizationRate = {};
      $(element).children('td').each((j, cell) => {
        const value = $(cell).text();
        if (j === 1) {
          organizationRate["name"] = value.trim();
        }
        if (j === 3) {
          organizationRate["branches"] = value.trim();
        }
        if (j === 4) {
          organizationRate["date"] = value.trim();
        }
        if (j > 4) {
          if(!organizationRate["flatRates"]) {
            organizationRate["flatRates"] = [];
          }
          const cur = organizationRate["flatRates"];
          cur.push(value);
        }
      });
      dataObj.push(organizationRate);
    }
  });
  return dataObj;
}
