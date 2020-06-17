// Import the modules we need
const rp = require("request-promise");
const otcsv = require("objects-to-csv");

// Define the URLS we will be scraping
const firstURL = "https://proff.no/laglister?i=p22&samplerFilter=true";
const firstURLViewJson = `${firstURL}&view=json`; 
const baseURL = "https://proff.no/laglister/" 

const getPageResult = async (URL) => {
  const rawJSON = await rp(URL);
  const parsedResult = JSON.parse(rawJSON);
  // index[0] = searchResult, index[1] = next page link;
  return [parsedResult.createListSearchResult.resultList, parsedResult.createListSearchResult.pagination];
};

const getDataFromAllPages = async () => {
  const parsedJSON = await getPageResult(firstURLViewJson);
  let firstPageResult = parsedJSON[0];
  let nextResultURI = parsedJSON[1].next.href;

  let finalResult = firstPageResult;
  while(true) {
    let pageResult = await getPageResult(`${baseURL}${nextResultURI}/?view=json`)
    let pageResultCompanies = pageResult[0];
    finalResult = [...finalResult, ...pageResultCompanies];

    if (pageResult[1].hasOwnProperty('next')) {
      nextResultURI = pageResult[1].next.href;
    } else {
      break;
    }
  }
  const csv = new otcsv(finalResult);
  await csv.toDisk('./outputCSV/searchData.csv');
}

getDataFromAllPages();
