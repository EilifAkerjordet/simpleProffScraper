const getProffData = require('./get-proff-data').getUriData;

const { stdin } = process;
const { stdout } = process;
const PROMPT = 'Search link proff: ';

stdout.write('Welcome \n');
stdout.write(PROMPT);
stdin.resume();
stdin.setEncoding('utf8');

const urlChecker = /^https:\/\/proff.no\/laglister\?.*Filter=true$/i
stdin.on('data', async (data) => {
  const scrapeUrl = data.toString().trim();

  if(urlChecker.test(scrapeUrl)) {
    stdout.write('Getting data...');
    stdout.write('\nThis may take several minutes...');
    await getProffData(`${scrapeUrl}&view=json`);

    stdout.write('\nData succesfully collected and stored\n');
    stdout.write('\nWelcome \n');
    stdout.write(PROMPT);
  } else {
    stdout.write('Please provide a valid url from proff.no.')
    stdout.write('\n\nWelcome');
    stdout.write('\n' + PROMPT);
  }
});

process.on('SIGINT', () => {
  stdout.write('\n\nBye!\n');
  process.exit();
});

