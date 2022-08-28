const fs = require('fs');
const pup = require('puppeteer');
const baseUrl = 'https://en.wikipedia.org';

//Previus values, cuz some rows span longer if they have the same value
// TODO: possible previous values: extinct...

// Get data from table
const getData = async () => {
  const browser = await pup.launch({
    dumpio: true,
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(
    baseUrl + '/wiki/List_of_extinct_animals_of_the_British_Isles'
  );

  const data = await page.$$eval('table.sortable tbody > tr', (rows) => {
    const rowsArr = Array.from(rows, (row) => {
      const cols = row.querySelectorAll('td');
      const animalObj = {};
      Array.from(cols, (col, i) => {
        //Process each col individually for more control
        // TODO: Check which cols are required and which optional

        // commonName & link
        if (i === 0) {
          let link = col.querySelector('a');
          let wikiLink = link.getAttribute('href');
          if (!wikiLink.startsWith('/')) wikiLink = false;
          let commonName = col.textContent;
          if (commonName.startsWith('†')) commonName = commonName.slice(1);
          animalObj.commonName = commonName;
          animalObj.wikiLink = wikiLink;
        }

        //bionomialName
        if (i === 1) {
          animalObj.bionomialName = col.textContent;
        }

        //Last seen
        if (i === 3) {
          let colText = col.textContent.trim();
          if (colText.startsWith('c. ')) colText = colText.slice(3); // Remove circa // 'c. '
          colText.replace(/\[.*?\]|[']+/g, ''); //remove [n], ''
          if (colText === '') colText = 'unknown';
          animalObj.lastRecord = colText;
        }
      });
      return animalObj;
    });

    return rowsArr;
  });
  // Get single pages
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
      const shortDesc = document.querySelectorAll('.mw-parser-output > p')[1]
        .textContent;
      if (imageSrc) returnData.imageSrc = imageSrc;
      if (shortDesc) returnData.shortDesc = shortDesc;
      return returnData;
    });

    data[i] = { ...data[i], ...newData };
    console.log('Got data: ', data[i]);
    const pause = (ms) => new Promise((res) => setTimeout(res, ms));
    await pause(2000); // Don't spam like there is no tommorrow ;)
  }

  await browser.close();

  return data;
};

(async function () {
  const data = await getData();
  //   console.log(data);
  let hasWiki = 0;
  let noWiki = 0;
  //Getting data from single pages:
  for (let i = 0; i < data.length; i++) {
    const animal = data[i];
    if (!animal.wikiLink) {
      noWiki++;
      continue;
    }
    // If it has wiki
    hasWiki++;
  }

  // Stats logging
  console.log(
    ' Total: ',
    data.length,
    ' hasWiki: ',
    hasWiki,
    ' noWiki: ',
    noWiki
  );
})();

// Convert it to JSON

// JSON.stringify() data
// fs.writeFileSync(`${__dirname}/animalsFile.json`)

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
