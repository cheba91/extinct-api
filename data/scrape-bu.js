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
        const repeat = {}; // {column: {i: colNr,  repeatNr : nr, prevVal: val }}
        // Add column in row if it doesnt have all
        console.log('length: ', cols.length, 'cols BEFORE: ', Array.from(cols));
        if (cols.length < 5) {
          cols = Array.from(cols);
          Object.keys(repeat);

          cols = Object.keys(repeat).forEach((column) => {
            return Array.from(cols).splice(column.i, 0, column.prevVal);
          });
        }
        console.log('length: ', cols.length, 'cols AFTER: ', Array.from(cols));
        Array.from(cols, (col, i) => {
          //Previus values, cuz some rows span longer if they have the same value
          const rowSpan = col.getAttribute('rowspan');
          //   console.log('INITIAL VALUE: ', col.textContent);
          if (rowSpan) {
            repeat.i = { i: i, repeatNr: rowSpan, prevVal: col };
            // console.log(
            //   'BE4 SAVING: ',
            //   repeat?.i?.repeatNr,
            //   repeat?.i?.prevVal?.textContent
            // );
          }

          //Get previous value if needed
          //   if (!rowSpan && repeat?.i?.repeatNr > 0) {
          //     col = repeat.column.prevVal;
          //     repeat.column.repeatNr = repeat.column.repeatNr - 1;
          //     // console.log(
          //     //   'AFTER SAVING: ',
          //     //   repeat?.i?.repeatNr,
          //     //   repeat?.i?.prevVal?.textContent
          //     // );
          //   }
          //   console.log('FINAL VALUE: ', col.textContent);

          //Process each col individually for more control

          // COL 1 Last seen
          if (i === 0) {
            let seenText = col.textContent;
            if (seenText) {
              seenText = seenText.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
              seenText = seenText.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes
              if (seenText.startsWith('c. ')) seenText = seenText.slice(3); // Remove circa // 'c. '
              if (seenText === '') seenText = 'unknown';
            }
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
              if (commonName.startsWith('???')) commonName = commonName.slice(1);
            }
            animalObj.commonName = commonName;
            animalObj.wikiLink = wikiLink;
          }

          // COL 3 bionomialName
          if (i === 2) {
            animalObj.bionomialName = col.textContent.replace(
              /(\r\n|\n|\r)/g,
              ''
            );
          }

          // COL 4 location
          if (i === 3) {
            let location = col.textContent;
            if (location) {
              location = location.replace(/\[.*?|["]+/g, ''); //remove [n], ''
            }

            animalObj.location = location;
          }

          // COL 5 cause
          // if (i === 3) {
          //   let cause = col.textContent;
          //   if (cause) {
          //     cause = cause.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
          //   }

          //   animalObj.cause = cause;
          // }
        });
        return animalObj;
      });

      return rowsArr;
    }
  );
  //------ Get single pages --------//
  // for (let i = 0; i < data.length; i++) {
  //   const animal = data[i];
  //   if (!animal.wikiLink) continue;
  //   await page.goto(baseUrl + animal.wikiLink, { waitUntil: 'networkidle2' });
  //   const newData = await page.evaluate(() => {
  //     const returnData = {};

  //     //   Image source
  //     const imageSrc = document
  //       .querySelectorAll('table.infobox a.image')[0]
  //       ?.getAttribute('href');

  //     // Short description
  //     let shortDesc = document.querySelectorAll('.mw-parser-output > p')[1]
  //       .textContent;
  //     if (imageSrc) returnData.imageSrc = imageSrc;
  //     if (shortDesc) {
  //       shortDesc = shortDesc.replace(/\[.*?\]|["]+/g, ''); //remove [n], ''
  //       shortDesc = shortDesc.replace(/(\r\n|\n|\r)/g, ''); //remove all kinds of line brakes

  //       returnData.shortDesc = shortDesc;
  //     }
  //     return returnData;
  //   });

  //   data[i] = { ...data[i], ...newData };
  //   const pause = (ms) => new Promise((res) => setTimeout(res, ms));
  //   await pause(500); // Don't spam like there is no tommorrow ;)
  //   if (i === 3) break; // TODO: remove later
  // }

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
