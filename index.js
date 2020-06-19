// Import the modules we need
const rp = require("request-promise");
const otcsv = require("objects-to-csv");
const $ = require('cheerio');

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
      address: e.address,
      compPhone: e.phoneNumber,
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
  return finalResult;
}

const getUriData = async () => {
  const allData = await getDataFromAllPages();

  const updatedData = allData.map(async e => {
    const html = await rp(`https://proff.no${e.uri}`);
    const allInfo = $('#inner-frame > div:nth-child(6) > section > div.content-grid.two-columns.clear > ul:nth-child(2) > li', html)
      .text()
      .trim();
    const address = /(?<=Adresse:\n).*/gm.test(allInfo) ? allInfo.match(/(?<=Adresse:\n).*/gm)[0].trim() : 'not found';
    const phoneNumber = /(?<=Telefon:).*/gm.test(allInfo) ? allInfo.match(/(?<=Telefon:\n.*\n).*/gm)[0].trim() : 'not found';
    e.address = address;
    e.phoneNumber = phoneNumber;
    return e;
  });
  const dataAddedInfo = await Promise.all(updatedData);

  const result = sortData(dataAddedInfo);
  const csv = new otcsv(result);
  await csv.toDisk('./outputCSV/searchData.csv');
}
getUriData();
