const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:9200';
const headers = { headers: { 'Content-Type': 'application/json' } };

const fs = require('fs');
const readline = require('readline');

const fillData = fileName => {

  const instream = fs.createReadStream(fileName);
  const outstream = new (require('stream'))();
  const rl = readline.createInterface(instream, outstream);

  let bulkMovies = '';
  rl.on('line', line => {
    //console.log(line);
    const addCmd = { index: { _index: 'tmdb-facet', _type: 'movie', _id: JSON.parse(line).id } };
    bulkMovies += `${JSON.stringify(addCmd)}\n${line}\n`;
  });

  rl.on('close', () => {
    //console.log(`bulkMovies: ${bulkMovies}`);
    console.log('done reading file.');
    axios.post('/_bulk', bulkMovies, headers)
      .then(() => console.log('bulk done'))
      .catch(error => console.log(error));
  });
};

const reindex = (analysisSettings={}, mappingSettings={}) => {

  const settings = {
    settings: {
      number_of_shards: 1,
      index: { analysis: analysisSettings }
    }
  };

  if (mappingSettings)
    settings.mappings = mappingSettings;
  axios.delete('/tmdb-facet', {})
    .then(response => console.log(`index deleted${response}`))
    .catch(error => console.log(error))
    .then(() => {
      console.log('lets create new index');
      axios.put('/tmdb-facet', settings)
        .then(response => console.log('index created', response))
        .catch(error => console.log(error))
        .then(() => {
          fillData('data.1.json');
          fillData('data.2.json');
        });
    });
};

//reindex(); //initial example

/**  english analyzer  **/
const analysis = {
  analyzer: {
    default: {
      type: 'english'
    } } };

//reindex(analysis , {});
fillData('data.1.json');
fillData('data.2.json');
const mappingSettings = {
  movie: {
    properties: {
      title: {
        type: 'string',
        analyzer: 'english'
      },
      overview: {
        type: 'string',
        analyzer: 'english'
      }
    }
  }
};

//reindex({}, mappingSettings); //extended analysis
//
