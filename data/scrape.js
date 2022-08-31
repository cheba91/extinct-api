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
  const data = await page.$$eval(
    'table.jquery-tablesorter tbody > tr',
    (rows) => {
      const colSkipping = {};
      const rowsArr = Array.from(rows, (row) => {
        const cols = row.querySelectorAll('td');

        const animalObj = {};

        Array.from(cols, (col, i) => {
          let ignoreCurrent = false;
          // THERE CAN BE 2-6 COLUMNS PER ROW

          // skipping column in next animal
          let rowSpan = Number(col?.getAttribute('rowspan'));
          if (rowSpan && rowSpan > 0) {
            animalObj['next-' + i] = `NEED TO SKIP COL NR ${i} IN NEXT ANIMAL`;
            colSkipping[i] = rowSpan - 1;
            ignoreCurrent = true;
          }

          // column skipping
          if (colSkipping[i] > 0 && !ignoreCurrent) {
            // next columns also?
            let skipNr = 1;

            animalObj['curr-' + i] = `SKIPPING NEXT ${1} COLS`;
            i += 1;
            colSkipping[i] -= 1;
          }

          // LAST SEEN
          if (i === 0) {
            let seenText = col.textContent;
            if (seenText) {
              seenText = seenText.replace(/\[.*?\]|["]+/g, '');
              seenText = seenText.replace(/(\r\n|\n|\r)/g, '');
              if (seenText.startsWith('c. ')) seenText = seenText.slice(3); // Remove circa // 'c. '
              if (seenText === '') seenText = 'unknown';
            }

            animalObj.lastRecord = seenText;
            return;
          }

          // COMMON NAME & LINK
          if (i === 1) {
            // wikiLink
            let link = col.querySelector('a');
            let wikiLink = link?.getAttribute('href');
            if (!wikiLink?.startsWith('/')) wikiLink = false;
            //commonName
            let commonName = col.textContent;
            if (commonName) {
              commonName = commonName.replace(/\[.*?\]|["]+/g, '');
              commonName = commonName.replace(/(\r\n|\n|\r)/g, '');
              if (commonName.startsWith('†')) commonName = commonName.slice(1);
            }
            animalObj.commonName = commonName;
            animalObj.wikiLink = wikiLink;
            return;
          }

          // BINOMIAL NAME
          if (i === 2) {
            let binomialLink = col.querySelector('a')?.getAttribute('href');
            if (!binomialLink?.startsWith('/')) binomialLink = false;
            let binomialName = col.textContent;
            if (binomialName) {
              binomialName = binomialName.replace(/\[.*?\]|["]+/g, '');
              binomialName = binomialName.replace(/(\r\n|\n|\r)/g, '');
            }
            animalObj.binomialName = binomialName;
            //Only few have link in binomial name / but need for single page scrape
            animalObj.binomialLink = binomialLink;
            return;
          }

          // LOCATION
          if (i === 3) {
            let location = col.textContent;
            if (location) {
              location = location.replace(/\[.*?\]|["]+/g, '');
              location = location.replace(/(\r\n|\n|\r)/g, '');
            }
            animalObj.location = location;
            return;
          }
          //   if (i === ) {
          //     let causes = col.textContent;
          //     if (causes) {
          //       causes = causes.replace(/\[.*?\]|["]+/g, '');
          //       causes = causes.replace(/(\r\n|\n|\r)/g, '');
          //     }
          //     animalObj.causes = causes;
          //     return;
          //   }
        });
        return animalObj;
      });

      return rowsArr;
    }
  );
  //------ Get single pages --------//
  //   for (let i = 0; i < data.length; i++) {
  //     const animal = data[i];
  //     if (!animal.wikiLink && !animal.binomialLink) continue;
  //     if (!animal.wikiLink && animal.binomialLink?.length > 0) {
  //       animal.wikiLink = animal.binomialLink;
  //     }
  //     await page.goto(baseUrl + animal.wikiLink, { waitUntil: 'networkidle2' });
  //     const newData = await page.evaluate(() => {
  //       const returnData = {};

  //       //   Image source
  //       const imageSrc = document
  //         .querySelectorAll('table.infobox a.image')[0]
  //         ?.getAttribute('href');
  //       if (imageSrc) returnData.imageSrc = imageSrc;

  //       // Short description
  //       let allP = document.querySelectorAll('.mw-parser-output > p');
  //       let shortDesc = allP[1]?.textContent;
  //       //some <p> have only /n...
  //       if (shortDesc.length < 10) shortDesc = allP[2]?.textContent;
  //       if (shortDesc.length < 10) shortDesc = allP[3]?.textContent;

  //       if (shortDesc) {
  //         shortDesc = shortDesc.replace(/\[.*?\]|["]+/g, '');
  //         shortDesc = shortDesc.replace(/(\r\n|\n|\r)/g, '');
  //         returnData.shortDesc = shortDesc;
  //       }
  //       if (!shortDesc) returnData.shortDesc = false;
  //       return returnData;
  //     });

  //     data[i] = { ...data[i], ...newData };
  //     const pause = (ms) => new Promise((res) => setTimeout(res, ms));
  //     await pause(500); // Don't spam
  //   }

  await browser.close();

  return data;
};

(async function () {
  let data = await getData();
  data = data.filter((el) => el.length !== 0);
  console.log('DATA: ', data);
  let lastRecordPrev;
  let locationPrev;
  //   let causesPrev;
  const finalData = data.map((animal) => {
    // Columns that can span over multiple rows: lastRecord, location, cause
    if (animal.location?.length > 0) locationPrev = animal.location;
    // if (animal.causes?.length > 0) causesPrev = animal.causes;
    if (animal.lastRecord?.length > 0) lastRecordPrev = animal.location;
    animal.wikiLink && baseUrl + animal.wikiLink;
    return {
      commonName: animal.commonName || false,
      wikiLink: animal.wikiLink || false,
      binomialName: animal.binomialName,
      shortDesc: animal.shortDesc || false,
      imageSrc: animal.imageSrc || false,
      lastRecord: animal.lastRecord || lastRecordPrev,
      location: animal.location || locationPrev,
      //   causes: animal.causes || causesPrev,
    };
  });
  //   console.log('final data: ', finalData);
  // Write to file
  fs.writeFileSync(`${__dirname}/animalData.json`, JSON.stringify(finalData));
})();
