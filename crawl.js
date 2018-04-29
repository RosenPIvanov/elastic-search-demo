const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js');
//const sleep = require('sleep');

const movieList = (maxMovies=10000) => {
  const movieIds = [];
  const numPages = maxMovies / 20;
  for (let page = 1; page < numPages; page++) {
    console.log(page);
    axios.get('/movie/top_rated', { params: { page, api_key } })
      .then(response => {
        console.log(`movies page ${page}`, response);
        if (response.headers['x-ratelimit-remaining'] < 10) {
          console.log('do sleep');
          //sleep.sleep(3);
        }
      })
      .catch(error => console.log(error));
  }

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
};

movieList();
