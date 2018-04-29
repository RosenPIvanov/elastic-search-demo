const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:9200';

const reindex = (analysisSettings={}, mappingSettings={}, movieDict={}) => {

  const settings = {
    "settings": {
      "number_of_shards": 1,
      "index": {"analysis" : analysisSettings}
    }
}

if (mappingSettings)
  settings['mappings'] = mappingSettings
axios.delete('/tmdb', {})
  .then(response => console.log('index deleted'))
  .catch(error => console.log(error))
  .then(() => {
    console.log('lets create new index')
    axios.put('/tmdb', settings)
     .then(response => console.log('index created', response))
     .catch(error => console.log(error))
     .then(()=> {

       let bulkMovies = ""
       for id, movie in movieDict.iteritems():
           addCmd = {"index": {"_index": "tmdb",
                               "_type": "movie",
                               "_id": movie["id"]}
                             }
           bulkMovies += json.dumps(addCmd) + "\n" + json.dumps(movie) + "\n"


       axios.post('/_bulk"', settings)
        .then(response => console.log('index created', response))
        .catch(error => console.log(error))


     });
  })
}





reindex();
//resp = http.put("/tmdb",


// var data=json.dumps(settings))
// var bulkMovies = ""
// movieDict.forEach(item=>{
// for id, movie in .iteritems():
// addCmd = {"index": {"_index": "tmdb",
// "_type": "movie",
// "_id": item.movie["id"]}}
// bulkMovies += json.dumps(addCmd) + "\n" + json.dumps(movie) + "\n"
//
// })
// resp = requests.post("http://localhost:9200/_bulk", data=bulkMovies)
// }
//
//
// https.get('http://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
//   let data = '';
//
//   // A chunk of data has been recieved.
//   resp.on('data', (chunk) => {
//     data += chunk;
//   });
//
//   // The whole response has been received. Print out the result.
//   resp.on('end', () => {
//     console.log(JSON.parse(data).explanation);
//   });
//
// }).on("error", (err) => {
//   console.log("Error: " + err.message);
// });
