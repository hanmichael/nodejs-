'use strict';

var fs = require('fs');

var tool = require('./lib/tool');
var xServer = require('./lib/xServer');




/**
 * 定义快捷函数, 减少代码字节
 */
var pts = tool.toPath,
    trace = console.log;


        
var server1 = new xServer();



server1.get('/', function(req, res, next){


    res.write( fs.readFileSync(    pts( process.cwd()    + '\\Static\\index.html') ) );
    res.end();



});

server1.post('/', function(req, res, next){




    res.write('post请求返回的数据....');

    res.end();



});




server1.all(function(req, res, next){


    res.writeHead(200, {
     'Content-Type': 'text/html',
     'Connection': 'keep-alive'
     });

    res.write('Not Find');
    res.end();
});




























