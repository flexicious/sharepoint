/**
 * Created by 19.06.2013-7pm on 09-Oct-15.
 */

var Utils = window.Utils = {};

Utils.xml2object = function(xml){
    return Utils._convertXmlTO(xml, "object");
};

Utils.xml2json = function(xml,  tab){
   return Utils._convertXmlTO(xml, "json", tab);
};

Utils._convertXmlTO = function xml2json(xml, type, tab) {
    var X = {
        esacapeColon : function(str){
            if(!str)
                return "";
            var parts = str.split(":");
            if(parts.length>1)
                return parts[1];
            else
                return parts[0];
        },
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType==1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                    for (var i=0; i<xml.attributes.length; i++)
                        o["@"+this.esacapeColon(xml.attributes[i].nodeName)] = (xml.attributes[i].nodeValue||"").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild=0, cdataChild=0, hasElementChild=false;
                    for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType==1) hasElementChild = true;
                        else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType==4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (var n=xml.firstChild; n; n=n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                    o[/*#*/"text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o[/*#*/"cdata"] = X.escape(n.nodeValue);
                                else if (o[this.esacapeColon(n.nodeName)]) {  // multiple occurence of element ..
                                    if (o[this.esacapeColon(n.nodeName)] instanceof Array)
                                        o[this.esacapeColon(n.nodeName)][o[this.esacapeColon(n.nodeName)].length] = X.toObj(n);
                                    else
                                        o[this.esacapeColon(n.nodeName)] = [o[this.esacapeColon(n.nodeName)], X.toObj(n)];
                                }
                                else  // first occurence of element..
                                    o[this.esacapeColon(n.nodeName)] = X.toObj(n);
                            }
                        }
                        else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o[/*#*/"text"] = X.escape(X.innerXml(xml));
                        }
                    }
                    else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o[/*#*/"text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n=xml.firstChild; n; n=n.nextSibling)
                                o[/*#*/"cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType==9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var json = name ? ("\""+name+"\"") : "";
            if (o instanceof Array) {
                for (var i=0,n=o.length; i<n; i++)
                    o[i] = X.toJson(o[i], "", ind+"\t");
                json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name&&":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name&&":") + "\"" + o.toString() + "\"";
            else
                json += (name&&":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i=0; i<n.attributes.length;i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c=n.firstChild; c; c=c.nextSibling)
                                s += asXml(c);
                            s += "</"+n.nodeName+">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c=node.firstChild; c; c=c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n; ) {
                if (n.nodeType == 3) {  // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else                      // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var object = X.toObj(X.removeWhite(xml));
    if(type == "object")
        return object;
    else if(type == "json"){
        var json = X.toJson(object, xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }
};

Utils.groupBy = function(dp, prop, nullValue,filterfunction,additionalProperties,  useOtherBucket, childrenPropName) {
    if(!additionalProperties)
        additionalProperties=[];
    if(!nullValue)
        nullValue = "None";
    var buckets = {};
    buckets.length = 0;
    var key = {};
    var result = [];
    //iterate through the flat list and create a hierarchy
    if(useOtherBucket){
        buckets.other = [];
        buckets.length += 1;
    }
    for(var i = 0; i < dp.length;i++){
        var item = dp[i];
        key = item ? flexiciousNmsp.UIUtils.resolveExpression(item,prop) : ""; //the parent
        if(!key)
            key="";
        if(typeof key == "string")
            key = (key.toString().trim());

        if(!buckets[key]){
            buckets[key] = [];//the children
            buckets.length += 1;
        }
        if(filterfunction==null || filterfunction(item))
            buckets[key].push(item); //add to the parents child list
        else if(useOtherBucket){
            buckets.other.push(item);
        }
    }
    //for (var i = 0; i < buckets.length; i++){
    Object.keys(buckets).forEach(function(key) {
        //var key = buckets[i];
        if(key == "length") // this way we can eliminate the "length field as data in grouped array"
            return;
        var obj = {};
        obj[prop]= !key||key.toString().trim()==""?nullValue:key;
        /** Form the object Structure */
        var splitedParts = prop.split(".");
        if(splitedParts.length > 1){
            var currentLevel = 0;
            function propMaker(currentobj){
                if(!currentobj.hasOwnProperty(splitedParts[currentLevel]))
                    currentobj[splitedParts[currentLevel]] = {};
                currentLevel++;
                if(currentLevel < splitedParts.length-1)
                    propMaker(currentobj[splitedParts[currentLevel-1]]);
                else
                    currentobj[splitedParts[currentLevel-1]][splitedParts[currentLevel]] = obj[prop];
            }
            propMaker(obj);
        }
        if(childrenPropName)
            obj[childrenPropName]=buckets[key];
        else
            obj['children']=buckets[key];
        var addProp;
        if(buckets[key].length>0){
            for(var j = 0; j < additionalProperties.length; j++){
                addProp = additionalProperties[j];
                obj[addProp] = buckets[key][0][addProp];
            }
        }else{
            for(var k = 0; k < additionalProperties.length; k++){
                addProp = additionalProperties[k];
                obj[addProp] = "";
            }
        }
        if(key == "")
            result.unshift(obj);
        else
            result.push(obj); //create the final structure
    });
    return result; //this will refresh the grid...
};

Utils.ALL_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

Utils.sortByYear = function (array, yearFiledName) {
    array.sort(function(a, b){
        var ly = parseInt(a[yearFiledName]);
        var ry = parseInt(b[yearFiledName]);
        return ly > ry ? 1 : ly < ry ? -1 : 0;
    });
};

Utils.sortByMonth = function(array, monthFieldName){
    array.sort(function (a,b) {
        var lm = a[monthFieldName];
        var rm = b[monthFieldName];
        return Utils.ALL_MONTHS.indexOf((lm+"").trim()) - Utils.ALL_MONTHS.indexOf((rm+"").trim());
    });
};