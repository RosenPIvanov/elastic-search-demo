const axios = require('axios');
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
const api_key = require('./local.config.js').api_key;
//const sleep = require('sleep');
console.log(api_key);

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
          //TODO extract(movieIds) -> index

          if (response.headers['x-ratelimit-remaining'] < 5) {
            setTimeout(nextRequest(page+1), 3000);
          } else {
            nextRequest(page+1);
          }
        })
        .catch(error => console.log(error));
    }
  };

  nextRequest(1);
  console.log('movieIds', movieIds);

 cosnt extract =  (movieIds=[], numMovies=10000) => {
   movieIds.map(movieId => {
     axios.get('/movie/' + movieId  + '/' , { params: { api_key } })
     .then(response => {      
      //console.log(JSON.stringify(response.data.results));
       getCastAndCrew(movieId, movie)           

      if (response.headers['x-ratelimit-remaining'] < 5) {
        setTimeout(nextRequest(page+1), 3000);
      } else {
        nextRequest(page+1);
      }
    })
    .catch(error => console.log(error));
    
    //if int(httpResp.headers['x-ratelimit-remaining']) < 10:
    
    
    
  });
};
  

movieList();
