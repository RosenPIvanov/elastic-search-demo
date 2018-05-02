const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js').api_key;
//const sleep = require('sleep');
console.log(api_key);

const movieList = (maxMovies=10000) => {
  const movieIds = [];
  const numPages = maxMovies / 20;

  const nextRequest = page => {
    if (page>numPages) {
      console.log('finished');
    } else {
      axios.get('/movie/top_rated', { params: { page, api_key } })
        .then(response => {
          console.log(`movies page ${page}`, response);
          console.log(`movies page ${page}`, response.results);

          if (response.headers['x-ratelimit-remaining'] < 5) {
            console.log('do sleep');
            setTimeout(nextRequest(page+1), 3000);
          } else {
            nextRequest(page+1);
          }
        })
        .catch(error => console.log(error));
    }
  };

  nextRequest(1);

//  for (let page = 1; page < numPages; page++) {
  //  console.log(page);
//    listRequests.push(axios.get('/movie/top_rated', { params: { page, api_key } }));
  // .then(response => {
  //   console.log(`movies page ${page}`, response);
  //   console.log(`movies page ${page}`, response.results);
  //   throw "gg";
  //   if (response.headers['x-ratelimit-remaining'] < 10) {
  //     console.log('do sleep');
  //     //sleep.sleep(3);
  //   }
  // })
  // .catch(error => {console.log(error); throw "gg";});
};

  //    for page in range(1, numPages + 1):
  //        httpResp = tmdb_api.get(url, params={'page': page})
  //        try:
  // if int(httpResp.headers['x-ratelimit-remaining']) < 10:
  //                time.sleep(3)
  //        except Exception as e:
  //            print e
  //        jsonResponse = json.loads(httpResp.text)
  //        movies = jsonResponse['results']
  //        for movie in movies:
  //            movieIds.append(movie['id'])
  //    return movieIds
//};

movieList();
