// todo
// implement :)
import https from 'https';

interface IEndpointParams {
  [key: string]: string | number;
}

export function requestAPI(endpoint: string, params?: IEndpointParams):{
  const options = {
    hostname: 'example.com',
    path: endpoint,
    method: 'GET'
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      return JSON.parse(data);
    });
  });

  req.on('error', error => {
    console.log("Wrong request, or API unavaliable: \n" +error);
  });

  req.end();
}

// usage example.
//requestAPI('/api/users', { limit: 10 });
//requestAPI('/api/posts', { author: 'John Doe', category: 'Technology' });