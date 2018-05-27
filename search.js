const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:9200';
const headers = { headers: { 'Content-Type': 'application/json' } };

const search = query => {
  axios.post('/tmdb/movie/_search', JSON.stringify(query), headers)
    .then(response => {
      //console.log(response.data.hits.hits);
      //console.log(Array.from(JSON.stringify(response.data.hits), x => {
      //console.log(x);

      //return 1;
      //})[0]);

      response.data.hits.hits.forEach(hit =>
        console.log(`${hit._score}-${hit._source.title}`)
      );
    }
    )
    .catch(error => console.log(error));
};

const usersSearch = 'basketball with cartoon aliens';

const query1 = {
  query: {
    multi_match: {
      query: usersSearch,
      fields: ['title^10', 'overview']
    }
  }
};
search(query1);
