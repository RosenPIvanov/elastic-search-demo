const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js').api_key;
const fs = require('fs');

const getCastAndCrew = (movieId, movie) => {
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
    .catch(error => console.log(error));
};
const extract = (movieIds=[]) => {
  movieIds.map((movieId, i) => {
    axios.get(`/movie/${movieId}` , { params: { api_key } })
      .then(response => {
        //console.log('movie:', JSON.stringify(response.data));
        const movie = response.data;
        if (response.headers['x-ratelimit-remaining'] < 10) {
          console.log(`will throttle 2 ${response.headers['x-ratelimit-remaining']}`)
          setTimeout(getCastAndCrew(movieId, movie), 3000*(i+1))
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
          setTimeout(() => extract(movieIds), 3000);


          // if (response.headers['x-ratelimit-remaining'] < 5) {
          //   setTimeout(nextRequest(page+1), 3000);
          // } else {
          //   nextRequest(page+1);
          // }
          return response;
        })
        .then(response => {
          if (response.headers['x-ratelimit-remaining'] < 10) {
            console.log(`will throttle 1 ${response.headers['x-ratelimit-remaining']}`)
            setTimeout(nextRequest(page+1), 3000);
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
