/**
 * Created by 19.06.2013-7pm on 09-Oct-15.
 */

var Service =  window.Service = {};
Service.get = function(url, urlParam, param, onSuccess, onError){
    $.ajax({
        url : urlParam ? url+"?"+urlParam : url,
        data : param,
        headers: {
            "accept": "application/json;odata=verbose"
        },
        type : "GET",
        success : onSuccess,
        error : onError,
        beforeSend : function(){$("#loader").show();},
        complete : function(){$("#loader").hide();}
    });
};

Service.post = function(url, param, onSuccess, onError){
    $.ajax({
        url : url,
        data : JSON.stringify(param),
        headers: {
            "accept": "application/json;odata=verbose"
        },
        type : "POST",
        success : onSuccess,
        error : onError,
        beforeSend : function(){$("#loader").show();},
        complete : function(){$("#loader").hide();}
    });
};

Service.addItem = function(url, item , successCallback, errorCallback){
    var headers =  {
        "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "content-Type": "application/json;odata=verbose"
    };

    $.ajax({
        url : url,
        type : "POST",
        data : JSON.stringify(item),
        headers : headers,
        success : successCallback,
        error : errorCallback,
        beforeSend : function(){$("#loader").show();},
        complete : function(){$("#loader").hide();}
    });
};


Service.updateItem = function(url, item , etag, id, successCallback, errorCallback){
    var headers =  {
        "Accept": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "content-Type": "application/json;odata=verbose",
        "X-HTTP-Method": "MERGE",
        "If-Match" : etag
    };

    $.ajax({
        url : url+"('"+id+"')",
        type: "POST",
        data : JSON.stringify(item),
        headers : headers,
        success : successCallback,
        error : errorCallback,
        beforeSend : function(){$("#loader").show();},
        complete : function(){$("#loader").hide();}
    });
};

Service.deleteItem = function(url, item, successCallback, errorCallback){
    var  headers  =  {
        "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": item.__metadata.etag
    };
    $.ajax({
        url : url+"('"+item.Id+"')",
        type: "DELETE",
        headers : headers,
        success : successCallback,
        error : errorCallback,
        beforeSend : function(){$("#loader").show();},
        complete : function(){$("#loader").hide();}
    });
};
