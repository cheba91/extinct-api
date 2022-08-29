const fs = require('fs');
const pup = require('puppeteer');
const { map } = require('../app');
const baseUrl = 'https://en.wikipedia.org';

//------ Get fata from table --------//
const getData = async () => {
  const browser = await pup.launch({
    dumpio: true,
    // headless: false,
    // args: ['--use-gl=egl'],
  });

  const page = await browser.newPage();

  await page.goto(baseUrl + '/wiki/Timeline_of_extinctions_in_the_Holocene', {
    waitUntil: 'networkidle2',
  });
  const data = await page.$$eval(
    'table.jquery-tablesorter tbody > tr',
    (rows) => {
      const rowsArr = Array.from(rows, (row) => {
        const cols = row.querySelectorAll('td');
        const animalObj = {};
        Array.from(cols, (col, i) => {
          // COL 1 Last seen
          if (col.querySelector('b')) {
            let seenText = col.textContent;
            if (seenText) {
              seenText = seenText.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              seenText = seenText.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
              if (seenText.startsWith('c. ')) seenText = seenText.slice(3); // Remove circa // 'c. '
              if (seenText === '') seenText = 'unknown';
            }
            animalObj.lastRecord = seenText;
          }

          // COL 3 bionomialName
          if (col.querySelector('i') && (i === 1 || i === 2)) {
            let bionomialName = col.textContent;
            if (bionomialName) {
              bionomialName = bionomialName.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              bionomialName = bionomialName.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
            }

            animalObj.bionomialName = bionomialName;
            return;
          }

          // COL 2 commonName & link
          if (
            // !col.textContent.startsWith('c. ') &&
            // !Number(col.textContent.match(/^\d+/)[0]) &&
            !col.querySelector('b') &&
            (i === 0 || i === 1)
          ) {
            console.log('IN COMMON NAME:', col.textContent);
            // wikiLink
            let link = col.querySelector('a');
            let wikiLink = link?.getAttribute('href');
            if (!wikiLink?.startsWith('/')) wikiLink = false;
            //commonName
            let commonName = col.textContent;
            if (commonName) {
              commonName = commonName.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              commonName = commonName.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
              if (commonName.startsWith('†')) commonName = commonName.slice(1);
            }
            animalObj.commonName = commonName;
            animalObj.wikiLink = wikiLink;
            return;
          }

          // COL 4 location
          if (i === 3 || i == 2) {
            let location = col.textContent;
            if (location) {
              location = location.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              location = location.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
            }

            animalObj.location = location;
            return;
          }

          // COL 5 cause
          //   if (i === 4) {
          //     let cause = col.textContent;
          //     if (cause) {
          //       cause = cause.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
          //     }

          //     animalObj.cause = cause;
          //     return;
          //   }
        });
        return animalObj;
      });

      return rowsArr;
    }
  );
  //------ Get single pages --------//
  for (let i = 0; i < data.length; i++) {
    const animal = data[i];
    if (!animal.wikiLink) continue;
    await page.goto(baseUrl + animal.wikiLink, { waitUntil: 'networkidle2' });
    const newData = await page.evaluate(() => {
      const returnData = {};

      //   Image source
      const imageSrc = document
        .querySelectorAll('table.infobox a.image')[0]
        ?.getAttribute('href');

      // Short description
      let shortDesc = document.querySelectorAll('.mw-parser-output > p')[1]
        .textContent;
      if (imageSrc) returnData.imageSrc = imageSrc;
      if (shortDesc == '')
        shortDesc = document.querySelectorAll('.mw-parser-output > p')[2]
          .textContent;
      if (shortDesc) {
        shortDesc = shortDesc.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
        shortDesc = shortDesc.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes

        returnData.shortDesc = shortDesc;
      }
      return returnData;
    });

    data[i] = { ...data[i], ...newData };
    const pause = (ms) => new Promise((res) => setTimeout(res, ms));
    await pause(500); // Don't spam
  }

  await browser.close();

  return data;
};

(async function () {
  let data = await getData();
  data = data.filter((el) => el.length !== 0);

  let lastRecordPrev;
  let locationPrev;
  const finalData = data.map((animal, i) => {
    // Columns that can span over multiple rows: lastRecord, location, cause
    if (animal.location) locationPrev = animal.location;
    if (animal.lastRecord) lastRecordPrev = animal.location;
    return {
      commonName: animal.commonName || false,
      wikiLink: animal.wikiLink || false,
      bionomialName: animal.bionomialName,
      shortDesc: animal.shortDesc || false,
      imageSrc: animal.imageSrc || false,
      lastRecord: animal.lastRecord || lastRecordPrev,
      location: animal.location || locationPrev,
    };
    // if (!animal.cause) animal.cause = data[i - 1].cause;
  });
  console.log('final data: ', finalData);
  // First write to file
  fs.writeFileSync(`${__dirname}/animalData.json`, JSON.stringify(finalData));

  //Log wikis
  //   let hasWiki = 0;
  //   let noWiki = 0;
  //   for (let i = 0; i < data.length; i++) {
  //     const animal = data[i];
  //     if (!animal.wikiLink) {
  //       noWiki++;
  //       continue;
  //     }
  //     // If it has wiki
  //     hasWiki++;
  //   }

  // Stats logging
  //   console.log(
  //     ' Total: ',
  //     data.length,
  //     ' hasWiki: ',
  //     hasWiki,
  //     ' noWiki: ',
  //     noWiki
  //   );
})();

//-------------------------------------------------------------------//
// Want:
const sample = [
  {
    commonName: "Page's crane",
    wikiLink: 'https://en.wikipedia.org/wiki/Grus_pagei',
    bionomialName: 'Grus pagei',
    location: 'Rancho La Brea, California, United States',
    lastRecord: '10250-9180 BCE', //some rows are longer(use previous value)
    shortDesc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', // From single page
    imageSrc: 'https://en.wikipedia.org/wiki/File:Neogyps_errans_Page.jpg', // From single page
  },
  //...
];
