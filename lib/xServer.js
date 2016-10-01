'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var https = require('http');
var url = require('url');
var fs = require('fs');



var tool = require('./tool');
var rout = require('./rout');



/**
 * 定义快捷函数, 减少代码字节
 */
var pts = tool.toPath,
    trace = console.log;

var xServer = function(){




    /**
     * 服务器配置
     */
    //APP跟路径
    var appPath = pts( process.cwd() );
    //服务器配置信息
    var serverConfig = JSON.parse(fs.readFileSync(appPath + '\\Config\\config.json') );
    //SSH选项
    var SSHoptions = {
        'key': fs.readFileSync(appPath + serverConfig['SSH']['key']),
        'cert': fs.readFileSync(appPath + serverConfig['SSH']['cert'])
    };
    //MIME
    var MIME = JSON.parse(fs.readFileSync(appPath + '\\Config\\MIME.json') );

    //实例化一个路由管理类
    var routApp = new rout();



    trace(serverConfig['port'], serverConfig['host']);
    //建立服务器
    var server = https.createServer( function(req, res){


        // 路径信息
        var URLinfo = url.parse(req.url);
        routApp.mount(req.method, URLinfo.path, req, res);

    });
    server.listen(serverConfig['port'], serverConfig['host']);


    //默认处理头部MIME
    routApp.use('.*', function(req, res, next){



        var suffix = tool.getSuffix(req.url);
        if(suffix){

            res.writeHead(200, {
                'Content-Type': MIME[suffix],
                'Connection': 'keep-alive'
            });

        }

        next();

    });

    //默认处理图标请求
    routApp.get('^/favicon.ico', function(req, res, next){


        res.write( fs.readFileSync( appPath + serverConfig['favicon'] ) );

        res.end();


    });

    //处理静态文件
    routApp.all(function(req, res, next){

        //URL路径转换静态路径
        fs.readFile(appPath +  serverConfig['staticDir'] + req.url, function(err, data){

            if(err){
                next(); //没有找到则交给下一个函数处理

            }else{
                res.write(data);
                res.end();

            }

        });



    });





    this.get = routApp.get;
    this.post = routApp.post;
    this.all = routApp.all;
    this.use = routApp.use;




};


module.exports = xServer;










































