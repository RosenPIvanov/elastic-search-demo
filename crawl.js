const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js').api_key;
const fs = require('fs');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const sleep = async fn => {
  await timeout(6000);

  return fn();
};

const getCastAndCrew = (movieId, movie) => {
  console.log(`getCastAndCrew for ${movieId}`);
  axios.get(`/movie/${movieId}/credits` , { params: { api_key } })
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
  await movieIds.map(movieId => {
    axios.get(`/movie/${movieId}` , { params: { api_key } })
      .then(response => {
        //console.log('movie:', JSON.stringify(response.data));
        const movie = response.data;
        console.log(`movieId: ${movieId}-${response.headers['x-ratelimit-remaining']}`);
        if (response.headers['x-ratelimit-remaining'] < 20) {
          console.log(`will throttle 2 ${response.headers['x-ratelimit-remaining']}`);
          sleep(() => getCastAndCrew(movieId, movie));
        } else
          getCastAndCrew(movieId, movie);
      //  return movie;
      })
    //  .then(() => {
    //console.log(`data is: ${JSON.stringify(data, null,4)}`);
    //fs.appendFileSync('data.json', `${JSON.stringify(data)}\n`);
    //  })
      .catch(error => console.log(error));

  //if int(httpResp.headers['x-ratelimit-remaining']) < 10:

  });
};

const movieList = (maxMovies=10000) => {

  const numPages = maxMovies / 20;

  const nextRequest = page => {

    if (page>numPages) {
      console.log('finished');
    } else {
      axios.get('/movie/top_rated', { params: { page, api_key } })
        .then(response => {
          const movieIds = [];
          console.log(`movies page ${page}`);
          //console.log(JSON.stringify(response.data.results));
          response.data.results.forEach(element => {
            movieIds.push(element.id);
          });

          console.log('movieIds', movieIds);
          console.log('movieIds.length', movieIds.length);
          if (response.headers['x-ratelimit-remaining'] < 20) {
            sleep(() => extract(movieIds));
          } else {
            extract(movieIds);
          }

          // if (response.headers['x-ratelimit-remaining'] < 5) {
          //   setTimeout(nextRequest(page+1), 3000);
          // } else {
          //   nextRequest(page+1);
          // }
          return response;
        })
        .then(response => {
          if (response.headers['x-ratelimit-remaining'] < 20) {
            console.log(`will throttle 1 ${response.headers['x-ratelimit-remaining']}`);
            sleep(() => nextRequest(page+1));
          } else {
            nextRequest(page+1);
          }
        })
        .catch(error => console.log(error));
    }
  };

  nextRequest(1);
};

movieList(20);
