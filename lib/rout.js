'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');


var tool = require('./tool');


/**
 * 路由管理器
 */


var rout = function(){

    var self = this;

    // 支持的路由规则
    self.routWay = [
        'GET',  //根据请求路径来处理客户端发出的GET请求
        'POST', //处理指定页面的post请求
        'USE'   //调用中间件的方法，它返回一个函数.  path默认为"/"
    ];






    /**
     * init 初始化路由管理器, 添加规则对应函数
     */
    self.routWay.forEach(function(_rout){

        self[_rout] = {};   //对象, key是路径, value是此路径处理函数组成的数组
        self[_rout + 'Count'] = {}; //对象, 路径计数器, 用来转义路由控制权
        self[_rout.toLowerCase()] = function(path,fuc){routTemplate(_rout, path, fuc);};

    });


    /**
     * 路由请求模版
     * 将路径对应的函数加入数组
     * @param metho 请求方法
     * @param path  请求路径 (可以是正则字符串)
     * @param fuc   处理函数
     */
    var routTemplate = function(metho, path, fuc){
        var routFuc = self[metho][path];
        util.isArray(routFuc) ? (self[metho][path].push(fuc)) : (self[metho][path] = [fuc]) ;
    };


    // 处理特殊的all,  捕获未知路由, 以匹配所有的HTTP动词，也就是说它可以过滤所有路径的请求
    self['ALL'] = {'count': 0, 'fucs':[]};
    self.all = function(fuc){
        if( util.isFunction(fuc) ){self['ALL']['fucs'].push(fuc);}
    };






};

util.inherits(rout, EventEmitter);  //继承事件对象










/**
 * 总路由接管
 * 挂载路由管理, 放在服务器客户连接事件中
 * @param method    使用的方法 GET / ALL 等
 * @param path      请求路径
 * @param req       ClientRequest
 * @param res       ServerResponse
 */
rout.prototype['mount'] = function(method, path, req, res){

    var self = this;
    var miss = true;    //是否捕获未知路由


    // 1.  使用中间件  use
    tool.each(self['USE'], function(use_path, use_fucArr){

        var reg = new RegExp(use_path + '$', 'i');

        if(reg.test(path)){
            self['reqProcess'](method, path, use_fucArr[0], req, res );
        }

    });




    //2. 使用post或get
    tool.each(self[method], function(use_path, use_fucArr){

        var reg = new RegExp(use_path + '$', 'i');

        if(reg.test(path)){
            self['reqProcess'](method, path, use_fucArr[0], req, res );
            miss = false;
        }

    });





    //3. 捕获未知路由
    if(miss){

        self['allProcess']( self['ALL']['fucs'][0], req, res );

        // TODO:  在静态目录中搜索

    }





};

/**
 * 管理带路径的路由规则
 * @param method    请求方法
 * @param path      请求路径
 * @param fuc       管理函数
 * @param req       ClientRequest
 * @param res       ServerResponse
 */
rout.prototype['reqProcess'] = function(method, path, fuc, req, res){


    // TODO 确认这里的this是 路由管理实例
    var self = this;

    self[method + 'Count'][path] = 0; //设置路由计数器
    fuc(req, res, next);  //调用路由处理函数



    // 设置下一个处理函数
    function next(){

        ++self[method + 'Count'][path]; //自增此路由计数器
        var nextIndex = self[method + 'Count'][path];   //获取计数器
        var methood = self[method][path];
        if(!self[method][path]){
            return;
        }

        if(nextIndex <  methood.length ){ methood[nextIndex](req, res, next); }

    }


};



/**
 * 未捕获的路由规则
 * @param fuc       管理函数
 * @param req       ClientRequest
 * @param res       ServerResponse
 */
rout.prototype['allProcess'] = function(fuc, req, res){


    if(!util.isFunction(fuc)){
        return;
    }


    // TODO 确认这里的this是 路由管理实例
    var self = this;


    self['ALL']['count'] = 0; //初始路由计数器
    fuc(req, res, next);  //调用路由处理函数


    // 设置下一个处理函数
    function next(){

        ++self['ALL']['count']; //自增计数器
        var nextIndex = self['ALL']['count'];   //获取计数器
        var methood = self['ALL']['fucs'];
        if(nextIndex <  methood.length ){ methood[nextIndex](req, res, next); }

    }


};










module.exports = rout;  //导出





























