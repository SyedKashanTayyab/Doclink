// Class Prototype Extension
String.prototype.toArray = function () {
    var array = this.split(',')
    var strArray = []
    for (var i = 0; i < array.length; i++) {
        strArray.push(`'${array[i]}'`)
    }
    return strArray
};

String.prototype.toDate = function () {
    return new Date(this)
}

String.prototype.isNull = function () {
    return (this == "" || this == null || this == "null") ? true :false
}

Date.prototype.stringValue = function (format) {
    return dateFormat(this, format)
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}