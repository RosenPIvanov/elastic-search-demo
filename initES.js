const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:9200';
const headers = { headers: { 'Content-Type': 'application/json' } };

const fs = require('fs');
const readline = require('readline');

const reindex = (analysisSettings={}, mappingSettings={}, movieDict={}) => {

  const settings = {
    settings: {
      number_of_shards: 1,
      index: { analysis: analysisSettings }
    }
  };

  if (mappingSettings)
    settings.mappings = mappingSettings;
  axios.delete('/tmdb', {})
    .then(response => console.log(`index deleted${response}`))
    .catch(error => console.log(error))
    .then(() => {
      console.log('lets create new index');
      axios.put('/tmdb', settings)
        .then(response => console.log('index created', response))
        .catch(error => console.log(error))
        .then(() => {
          const instream = fs.createReadStream('example_data.json');
          const outstream = new (require('stream'))();
          const rl = readline.createInterface(instream, outstream);

          let bulkMovies = '';
          rl.on('line', line => {
            //console.log(line);
            const addCmd = { index: { _index: 'tmdb', _type: 'movie', _id: JSON.parse(line).id } };
            bulkMovies += `${JSON.stringify(addCmd)}\n${line}\n`;
          });

          rl.on('close', () => {
            //console.log(`bulkMovies: ${bulkMovies}`);
            console.log('done reading file.');
            axios.post('/_bulk', bulkMovies, headers)
              .then(() => console.log('index created'))
              .catch(error => console.log(error));
          });
        });
    });
};

reindex();
