'use strict';
var http = require('http');

let times = 1000;

for(var i = 0; i < times; i++)
{
    getAllLogs();
}

function getAllLogs(callback) {
  return http.get({
          host: '18.136.205.13',
          port: '3000',
          path: '/api/v1/logs'
      }, function(response) {
          
      });
  }