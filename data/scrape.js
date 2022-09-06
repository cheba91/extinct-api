const fs = require('fs');
const pup = require('puppeteer');
const baseUrl = 'https://en.wikipedia.org';
// interesting data: https://en.wikipedia.org/wiki/Wikipedia:Unusual_articles/Lists

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
      const colSkipping = {};

      const rowsArr = Array.from(rows, (row, iRow) => {
        const cols = row.querySelectorAll('td');
        const animalObj = {};
        let moveRowBy = 0;

        Array.from(cols, (col, i) => {
          let correctCol = i;
          if (i === 0) moveRowBy = 0;
          // THERE CAN BE 2-6 COLUMNS PER ROW!

          //Was any col in this row already skipped?
          if (moveRowBy > 0) correctCol += moveRowBy;

          // current column skipping
          if (colSkipping[correctCol] > 0) {
            colSkipping[correctCol] -= 1;
            moveRowBy++;
            correctCol++;
            // animalObj[i + 6] = `Current skip: ${JSON.stringify(colSkipping)}`;
          }

          // skipping column in next animal
          let rowSpan = Number(col?.getAttribute('rowspan'));
          if (rowSpan && rowSpan > 0 && correctCol < cols.length) {
            colSkipping[correctCol] = rowSpan - 1;
            // animalObj[i + 8] = `Next skip: ${JSON.stringify(colSkipping)}`;
          }

          // Should have correct column by now
          let colText = col.textContent;
          if (colText?.length) {
            colText = colText.replace(/\[.*?\]|["']+/g, ''); // remove [], ' "
            colText = colText.replace(/(\r\n|\n|\r)/g, ''); // remove all new lines
          }

          // LAST RECORD
          if (correctCol === 0) {
            if (colText) {
              if (colText.startsWith('c. ')) colText = colText.slice(3); // Remove circa // 'c. '
            }

            animalObj.lastRecord = colText;
            return;
          }

          // COMMON NAME & LINK
          if (correctCol === 1) {
            // wikiLink
            let wikiLink = col.querySelector('a')?.getAttribute('href');
            if (!wikiLink?.startsWith('/')) wikiLink = false;
            //commonName
            if (colText) {
              if (colText.startsWith('†')) colText = colText.slice(1);
            }

            animalObj.commonName = colText;
            animalObj.wikiLink = wikiLink;
            return;
          }

          // BINOMIAL NAME
          if (correctCol === 2) {
            let binomialLink = col.querySelector('a')?.getAttribute('href');
            if (!binomialLink?.startsWith('/')) binomialLink = false;
            //Only few have link in binomial name but need for single page scrape
            if (!animalObj.wikiLink && binomialLink?.length > 0) {
              animalObj.wikiLink = binomialLink;
            }

            animalObj.binomialName = colText;
            return;
          }

          // LOCATION
          if (correctCol === 3) return (animalObj.location = colText);
        });

        return animalObj;
      });

      return rowsArr;
    }
  );
  //------ Get single pages --------//
  for (let i = 0; i < data.length; i++) {
    const animal = data[i];
    if (!animal.wikiLink?.length) continue;

    await page.goto(baseUrl + animal.wikiLink, { waitUntil: 'networkidle2' });
    const newData = await page.evaluate(() => {
      const returnData = {};

      //   Image source
      const imageSrc = document.querySelectorAll('table.infobox a.image img')[0]
        ?.src;
      if (imageSrc) returnData.imageSrc = imageSrc;

      // Short description
      let allP = document.querySelectorAll('.mw-parser-output > p');
      let shortDesc = allP[1]?.textContent;
      //some <p> have only /n...
      if (shortDesc.length < 10) shortDesc = allP[2]?.textContent;
      if (shortDesc.length < 10) shortDesc = allP[3]?.textContent;

      if (shortDesc) {
        shortDesc = shortDesc.replace(/\[.*?\]|["]+/g, '');
        shortDesc = shortDesc.replace(/(\r\n|\n|\r)/g, '');
        returnData.shortDesc = shortDesc;
      }
      if (!shortDesc) returnData.shortDesc = false;
      return returnData;
    });

    data[i] = { ...data[i], ...newData };
    await (() => new Promise((res) => setTimeout(res, 500)))(); // Don't spam
    // const pause = (ms) => new Promise((res) => setTimeout(res, ms));
    // await pause(500); // Don't spam
    // if (i === 3) break;
  }

  await browser.close();

  return data;
};

(async function () {
  let data = await getData();
  data = data.filter((el) => el.length !== 0);
  console.log('DATA: ', data);
  let latestLastRecord;
  let latestLocation;
  const finalData = data.map((animal) => {
    // Columns that can span over multiple rows: lastRecord, location
    if (animal.location?.length > 0) latestLocation = animal.location;
    if (animal.lastRecord?.length > 0) latestLastRecord = animal.lastRecord;

    return {
      commonName: animal.commonName || false,
      wikiLink: animal.wikiLink?.length ? baseUrl + animal.wikiLink : false,
      binomialName: animal.binomialName,
      shortDesc: animal.shortDesc || false,
      imageSrc: animal.imageSrc || false,
      lastRecord: latestLastRecord,
      location: latestLocation,
      //   causes: latestCauses,
    };
  });
  //   console.log('final data: ', finalData);
  // Write to file
  fs.writeFileSync(
    `${__dirname}/animalData.json`,
    JSON.stringify(finalData),
    null,
    4
  );
})();
