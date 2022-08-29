const { clear } = require('console');
const fs = require('fs');
const pup = require('puppeteer');
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
  //   await page.waitForTimeout(4000);
  const data = await page.$$eval(
    'table.jquery-tablesorter tbody > tr',
    (rows) => {
      const rowsArr = Array.from(rows, (row) => {
        const cols = row.querySelectorAll('td');
        const animalObj = {};
        Array.from(cols, (col, i) => {
          //Previus values, cuz some rows span longer if they have the same value
          let seenTextPrev, locationPrev;

          //Process each col individually for more control

          // COL 1 Last seen
          if (i === 0) {
            let seenText = col.textContent;
            if (seenText) {
              seenText = seenText.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              seenText = seenText.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
              if (seenText.startsWith('c. ')) seenText = seenText.slice(3); // Remove circa // 'c. '
              if (seenText === '') seenText = 'unknown';
              seenTextPrev = seenText;
            } else {
              seenText = seenTextPrev;
            }
            console.log('ANIMAL LAST RECORD: ', seenText);
            animalObj.lastRecord = seenText;
          }

          // COL 2 commonName & link
          if (i === 1) {
            // wikiLink
            let link = col.querySelector('a');
            let wikiLink = link.getAttribute('href');
            if (!wikiLink.startsWith('/')) wikiLink = false;
            //commonName
            let commonName = col.textContent;
            if (commonName) {
              commonName = commonName.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              commonName = commonName.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
              if (commonName.startsWith('†')) commonName = commonName.slice(1);
            }
            animalObj.commonName = commonName;
            animalObj.wikiLink = wikiLink;
          }

          // COL 3 bionomialName
          if (i === 2) {
            animalObj.bionomialName = col.textContent;
          }

          // COL 4 location
          if (i === 3) {
            let location = col.textContent;
            if (location) {
              location = location.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              locationPrev = location;
            } else {
              location = locationPrev;
            }

            animalObj.location = location;
          }
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
      if (shortDesc) {
        shortDesc = shortDesc.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
        shortDesc = shortDesc.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes

        returnData.shortDesc = shortDesc;
      }
      return returnData;
    });

    data[i] = { ...data[i], ...newData };
    const pause = (ms) => new Promise((res) => setTimeout(res, ms));
    await pause(500); // Don't spam like there is no tommorrow ;)
    if (i === 3) break; // TODO: remove later
  }

  await browser.close();

  return data;
};

(async function () {
  const data = await getData();
  console.log(data);
  const finalData = JSON.stringify(data.filter((el) => el.length !== 0));

  // First write to file
  fs.writeFileSync(`${__dirname}/animalData.json`, finalData);

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
