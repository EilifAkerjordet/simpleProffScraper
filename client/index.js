
async function getUserAsync(scrapeUrl) 
{
  let response = await fetch('/api/searchresults', {
    headers: {
     'Accept': 'application/json',
     'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      url: scrapeUrl
    })
  });
  let data = await response.json()
  return data;
}

const renderData = async () => {
const inputEl = document.querySelector('#inputUrl');

  if(/^https:\/\/proff.no\/laglister.*$/.test(inputEl.value)){
     getUserAsync(inputEl.value)
      .then(data => console.log(data));
  } else {
    console.log('illegal operation');
  }
} 

