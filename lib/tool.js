'use strict';

var util = require('util');

var tool = {

    /**
     * 包装绝对路径为文件流可使用路径
     * c:\windows\  将成为  c:\\windows\\
     * @param path
     */
    toPath: function(path){ return path.replace(/\\/g, '\\\\');},

    /**
     * 遍历对象属性
     * @param obj
     * @param fuc
     */
    each: function(obj, fuc){

        if( !util.isObject(obj) || !util.isFunction(fuc) ){return false;}

        for(var key in obj){

            if(obj.hasOwnProperty(key)){

                fuc(key, obj[key]);

            }



        }



    },

    /**
     * 获取后缀 比如.ico, .js
     * @param str
     */
    getSuffix: function(str){

       


        var reg = /\.[^\.]+$/i;
        return  str.match(reg) ?   str.match(reg)[0]  : null;

    }



};



module.exports = tool;






















