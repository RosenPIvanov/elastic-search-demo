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
          const instream1 = fs.createReadStream('data.1.json');
          const outstream1 = new (require('stream'))();
          const rl1 = readline.createInterface(instream1, outstream1);

          let bulkMovies = '';
          rl1.on('line', line => {
            //console.log(line);
            const addCmd = { index: { _index: 'tmdb', _type: 'movie', _id: JSON.parse(line).id } };
            bulkMovies += `${JSON.stringify(addCmd)}\n${line}\n`;
          });

          rl1.on('close', () => {
            //console.log(`bulkMovies: ${bulkMovies}`);
            console.log('done reading file.');
            axios.post('/_bulk', bulkMovies, headers)
              .then(() => console.log('bulk done'))
              .catch(error => console.log(error));
          });

          const instream2 = fs.createReadStream('data.2.json');
          const outstream2 = new (require('stream'))();
          const rl2 = readline.createInterface(instream2, outstream2);

          let bulkMovies2 = '';
          rl2.on('line', line => {
            //console.log(line);
            const addCmd = { index: { _index: 'tmdb', _type: 'movie', _id: JSON.parse(line).id } };
            bulkMovies2 += `${JSON.stringify(addCmd)}\n${line}\n`;
          });

          rl2.on('close', () => {
            //console.log(`bulkMovies: ${bulkMovies}`);
            console.log('done reading second file.');
            axios.post('/_bulk', bulkMovies2, headers)
              .then(() => console.log('bulk2 done'))
              .catch(error => console.log(error));
          });
        });
    });
};

reindex();
