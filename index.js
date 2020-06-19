// Import the modules we need
const rp = require("request-promise");
const otcsv = require("objects-to-csv");

// Define the URLS we will be scraping
const firstURL = "https://proff.no/laglister?ef=1&et=300&i=p10158&l=Stavanger&l=Oslo&samplerFilter=true";
const firstURLViewJson = `${firstURL}&view=json`;
const baseURL = "https://proff.no/laglister/"

const getPageResult = async (URL) => {
  const rawJSON = await rp(URL);
  const parsedResult = JSON.parse(rawJSON);
  return [parsedResult.createListSearchResult.resultList, parsedResult.createListSearchResult.pagination];
};

const sortData = (data) => {
  const cleanedData = data.map(e => {
    return {
      organisationNumber: e.organisationNumber,
      companyName: e.displayName,
      postNumber: e.postalAddress.postNumber,
      postPlace: e.postalAddress.postPlace,
      revenue: e.revenue || 'not found',
      numberOfEmployees: e.numberOfEmployees || 'not found',
      companyAccountsLastUpdatedDate: e.companyAccountsLastUpdatedDate || 'not found',
      contactPersonRole: typeof e.personRoles[0]  === 'undefined' ? 'not found' : e.personRoles[0].roleName,
      contactPersonName: typeof e.personRoles[0]  === 'undefined' ? 'not found' : e.personRoles[0].person.name,
      uri: e.uri
    };
  });
  return cleanedData;
}

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
  const cleanFinalResult = sortData(finalResult);
  const csv = new otcsv(cleanFinalResult);
  await csv.toDisk('./outputCSV/searchData.csv');
}

getDataFromAllPages();
