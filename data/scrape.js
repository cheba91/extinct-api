const fs = require('fs');
const pup = require('puppeteer');

//Previus values, cuz some rows span longer if they have the same value
let location, wikiLink, lastRecord;
const data = [];
const keys = ['commonName', 'bionomialName', 'lastRecord'];

// Get data
(async () => {
  const browser = await pup.launch({
    dumpio: true,
  });
  const page = await browser.newPage();

  await page.goto(
    'https://en.wikipedia.org/wiki/List_of_extinct_animals_of_the_British_Isles'
  );
  const content = await page.$$eval('table.sortable tbody > tr', (rows) => {
    const animalObj = {};
    const rowsArr = Array.from(rows, (row) => {
      const cols = row.querySelectorAll('td');
      const colArr = Array.from(cols, (col, i) => {
        //Process each col individually for more control
        if (i === 0) {
          // TODO: get hover info: image, desc
          const link = col.querySelector('a');
          let wikiLink = link.getAttribute('href');
          if (!wikiLink.startsWith('/')) wikiLink = false;
          // TODO: remove cross
          const commonName = col.textContent;
          return { commonName, wikiLink };
        }
        if (i === 1) {
          //Species
          return { bionomialName: col.textContent };
        }
        if (i === 3) {
          //Last seen
          let colText = col.textContent.trim();
          if (colText.startsWith('c. ')) colText = colText.slice(3); // Remove circa // 'c. '
          colText.replace(/\[.*?\]|[']+/g, ''); //remove [n], ''
          if (colText === '') colText = 'unknown';
          return { lastRecord: colText };
        }
        return false;
      });
      return { ...colArr.flat().filter(Boolean) };
    });
    return rowsArr;
  });
  //   const content = await page.$$eval('table.sortable tbody > tr', (rows) => {
  //     return Array.from(rows, (row) => {
  //       const columns = row.querySelectorAll('td');
  //       const rowObj = {};
  //       if (columns.length >= 5) {
  //         return columns.map((column) => {
  //           let colString = column.textContent.trim();
  //           if (colString !== '') {
  //             if (colString.startsWith('c. ')) colString = colString.slice(3);
  //             // /\[.*?\]/g remove square brackets
  //             colString.replace(/\[.*?\]|[']+/g);
  //             return colString;
  //           }
  //         });
  //       }
  //     });
  //   });
  //   const content = await page.$$eval('table.sortable tbody > tr', (rows) => {
  //     return Array.from(rows, (row) => {
  //       const col = row.querySelectorAll('td');
  //       return Array.from(col, (c) => c.textContent.trim().replace(/['"]+/g));
  //     });
  //   });
  console.log(content, 'length: ' + content.length);
  await browser.close();
})();
// Convert it to JSON

// JSON.stringify() data
// fs.writeFileSync(`${__dirname}/animalsFile.json`)

//-------------------------------------------------------------------//
// Want:
const sample = [
  {
    commonName: "Page's crane",
    bionomialName: 'Grus pagei',
    location: 'Rancho La Brea, California, United States',
    lastRecord: '10250-9180 BCE', //some rows are longer(use previous value)
    shortDesc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', // From hovering
    imgLink: 'https://en.wikipedia.org/wiki/File:Neogyps_errans_Page.jpg', // From hovering
    wikiLink: 'https://en.wikipedia.org/wiki/Grus_pagei',
  },
  //...
];
