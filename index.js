const express = require('express')
const app = express()
const port = 3000

const prodId = "e5b24fd4-97f8-43d5-93c0-67407e15ffab";
const stageId = "9c29c282-092c-467e-9323-09c5d3c068f6";

const bearerToken = "Bearer 83747d06-7cce-4c08-b22a-ee1dfaabfd36";

var http = require("http");
var https = require("https");

var options = {
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


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON (options, onResult)
{
    console.log("rest::getJSON");

//    var port = options.port == 9443 ? https : http;
    var req = https.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    if (options.method == "POST") {
    	// write data to request body
		req.write(postData);
    }

    req.end();
};



var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getAPIs() {

  var xhr = new XMLHttpRequest();
  var url = 'https://portal-ssg.dev.ca.com:9443/tenant/2.0/Apis';
  xhr.open('GET', url);
  xhr.setRequestHeader('Authorization', 'Bearer e0a120f7-1950-4f08-95e9-3fbd04be9f8b');

  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
//      console.log('Status: '+this.status+'\nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'\nBody: '+this.responseText);
//	  console.log(this.responseText);
      obj = JSON.parse(JSON.stringify(this.responseText));
      console.log("COUNT = ",this.responseText.count);
//      console.log("COUNT = ",obj.count);
      for (var i=0; i < obj.count; i++) {
      	console.log("API = ", obj[i].Description);
      }
    }
  };
  xhr.send('');
}


function deployAPI(api_Uuid) {

    deployOptions.path = '/tenant/deployments/1.0/apis/{apiUuid}/proxies'.replace(/{apiUuid}/g, encodeURIComponent(api_Uuid));

    getJSON(deployOptions, function(statusCode, result) {
        // I could work with the result html/json here.  I could also just return it
      var count =  Object.keys(result).length
      for (var i=0; i < count; i++) {
        console.log("Deployment Status (" + statusCode + ")" );
      }
    });


  var xhr = new XMLHttpRequest();
  var url = 'https://portal-ssg.dev.ca.com:9443/tenant/deployments/1.0/apis/{apiUuid}/proxies'.replace(/{apiUuid}/g, encodeURIComponent('e43df8f6-0448-4e91-8bcb-f9e35e8b0acf'));
  xhr.open('POST', url);
  xhr.setRequestHeader('Authorization', 'Bearer 1714b840-f6ff-4af0-b62e-970ff479bc50');
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      alert('Status: '+this.status+'\nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'\nBody: '+this.responseText);
    }
  };
  xhr.send('{ "proxyUuid": "e5b24fd4-97f8-43d5-93c0-67407e15ffab"}');

}


app.get('/', (request, response) => {
    getJSON(options, function(statusCode, result) {
        // I could work with the result html/json here.  I could also just return it
      var count =  Object.keys(result).length
      for (var i=0; i < count; i++) {
        console.log("API Catalogue(" + i + ") = " + JSON.stringify(result[i].Name) + "<" + result[i].Version + "> = " + result[i].Uuid );
      }
//        console.log("SIZE = ",result.count);
    });

  response.send('Hello from Express!');
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})



