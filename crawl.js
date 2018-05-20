const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js').api_key;
const fs = require('fs');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const sleep = async fn => {
  console.log('before timeout');
  await timeout(10000);
  console.log('after timeout');

  return await fn();
};

const getCastAndCrew = async (movieId, movie) => {
  console.log(`getCastAndCrew for ${movieId}`);
  await axios.get(`/movie/${movieId}/credits` , { params: { api_key } })
    .then(response => {
      //console.log(JSON.stringify(response.data));
      const credits = response.data;
      const crew = credits.crew;
      const directors = [];
      crew.forEach(crewMember => {
        if (crewMember.job === 'Director')
          directors.push(crewMember);
      });
      movie.directors = directors;
      fs.appendFileSync('data.json', `${JSON.stringify(movie)}\n`);

      return movie;
    })
    .catch(error => console.log(`getCastAndCrew: ${error}`));
};
const extract = async (movieIds=[]) => {
  console.log(`extract for ${movieIds}`);
  for (const movieId of movieIds) {
    await axios.get(`/movie/${movieId}` , { params: { api_key } })
      .then(async response => {
        //console.log('movie:', JSON.stringify(response.data));
        const movie = response.data;
        console.log(`movieId: ${movieId}-${response.headers['x-ratelimit-remaining']}`);
        if (response.headers['x-ratelimit-remaining'] < 5) {
          console.log(`will throttle 2 ${response.headers['x-ratelimit-remaining']}`);
          await sleep(async () => await getCastAndCrew(movieId, movie));
        } else
          await getCastAndCrew(movieId, movie);
      //  return movie;
      })
    //  .then(() => {
    //console.log(`data is: ${JSON.stringify(data, null,4)}`);
    //fs.appendFileSync('data.json', `${JSON.stringify(data)}\n`);
    //  })
      .catch(error => console.log(error));

  //if int(httpResp.headers['x-ratelimit-remaining']) < 5:

  };

  return 1;
};

const movieList = async (maxMovies=10000) => {

  const numPages = maxMovies / 20;
  for (let page=1; page <= numPages; page++) {
    await axios.get('/movie/top_rated', { params: { page, api_key } })
      .then(async response => {
        const movieIds = [];
        console.log(`movies page ${page}`);
        //console.log(JSON.stringify(response.data.results));
        response.data.results.forEach(element => {
          movieIds.push(element.id);
        });

        console.log('movieIds', movieIds);
        console.log('movieIds.length', movieIds.length);
        if (response.headers['x-ratelimit-remaining'] < 5) {
          console.log('will throttle extract');
          await sleep(async () => await extract(movieIds));
        } else {
          await extract(movieIds);
        }

        // if (response.headers['x-ratelimit-remaining'] < 5) {
        //   setTimeout(nextRequest(page+1), 3000);
        // } else {
        //   nextRequest(page+1);
        // }
        return response;
      })
      .then(async response => {
        if (response.headers['x-ratelimit-remaining'] < 5) {
          console.log(`will throttle 1 ${response.headers['x-ratelimit-remaining']}`);

          return await sleep(() => {});
        }
      })
      .catch(error => console.log(error));

  }
};

movieList(10000);
