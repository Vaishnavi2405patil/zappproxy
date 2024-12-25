sap.ui.define([
    
], function () {
    "use strict";
            var Formatter = {
                status:function(sStatus){
                         if(sStatus === "In Approval"){
                                 return "Success";
                         }else{
                            return "None";
                         }
                }
            }
    return Formatter;
},true);