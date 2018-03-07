const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
//const { deployAPI, listAPIs } = require('logic');



const prodId = "e5b24fd4-97f8-43d5-93c0-67407e15ffab";
const stageId = "9c29c282-092c-467e-9323-09c5d3c068f6";

const bearerToken = "Bearer 3f12c656-c06a-42d9-a78e-80b0868b2967";

var http = require("http");
var https = require("https");

var listOptions = {
    host: 'portal-ssg.dev.ca.com',
    port: 9443,
    path: '/tenant/2.0/Apis',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
      'Authorization': bearerToken
    }
};


const postData = '{ "proxyUuid": "e5b24fd4-97f8-43d5-93c0-67407e15ffab"}';

var deployOptions = {
    host: 'portal-ssg.dev.ca.com',
    port: 9443,
    path: '/tenant/deployments/1.0/apis/{apiUuid}/proxies',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      'Authorization': bearerToken,
      'Content-Length': Buffer.byteLength(postData)
    }
};

var removeOptions = {
    host: 'portal-ssg.dev.ca.com',
    port: 9443,
    path: '/tenant/deployments/1.0/apis/{apiUuid}/proxies/' + prodId,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': bearerToken,
    }
};


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON (options, onResult)
{
//    console.log("rest::getJSON");

//    var port = options.port == 9443 ? https : http;
    var req = https.request(options, function(res)
    {
        var output = '';
//        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = null;
            if (res.statusCode != 204 ) {
              obj = JSON.parse(output);
            };
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
      console.log("ERROR");
        //res.send('error: ' + err.message);
    });

    if (options.method == "POST") {
      // write data to request body
      req.write(postData);
    }

    req.end();
};




function listAPIs() {

    getJSON(listOptions, function(statusCode, result) {
        // I could work with the result html/json here.  I could also just return it
      console.log("Available APIs to deploy to production");
      var count =  Object.keys(result).length
      for (var i=0; i < count; i++) {
        console.log("\t" + JSON.stringify(result[i].Name) + "<" + result[i].Version + "> =\t " + result[i].Uuid );
      }
//        console.log("SIZE = ",result.count);
    });

}

function deployAPI(api_Uuid) {

//    console.log("API ID =", api_Uuid);
    deployOptions.path = '/tenant/deployments/1.0/apis/{apiUuid}/proxies'.replace(/{apiUuid}/g, encodeURIComponent(api_Uuid));

    getJSON(deployOptions, function(statusCode, result) {
        // I could work with the result html/json here.  I could also just return it
        if (statusCode >= 300) {
          console.log("RESULT = ",result);
        } else {
          console.log("Deployment Status (" + statusCode + ")" );
        }
    });
}


function removeAPI(api_Uuid) {

    removeOptions.path = '/tenant/deployments/1.0/apis/{apiUuid}/proxies/e5b24fd4-97f8-43d5-93c0-67407e15ffab'.replace(/{apiUuid}/g, encodeURIComponent(api_Uuid));

    getJSON(removeOptions, function(statusCode, result) {
        // I could work with the result html/json here.  I could also just return it
        if (statusCode != 204) {
          console.log("RESULT = ",result);
        } else {
          console.log("Removal Status (" + statusCode + ")" );
        }
    });
}


program
  .version('0.0.1')
  .description('Deploy to Production CLI');

program
  .command('deploy <api-ID>')
  .alias('d')
  .description('Deploys an API to production')
  .action((apiId) => {
    deployAPI(apiId);
  });

program
  .command('remove <api-ID>')
  .alias('r')
  .description('Removes an API from production')
  .action((apiId) => {
    removeAPI(apiId);
  });


program
  .command('list')
  .alias('l')
  .description('Gets a list of APIs from staging')
  .action(name => listAPIs());

program.parse(process.argv);