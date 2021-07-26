//app.js
App({
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
  },
  buf2string: function (buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    var str = ''
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i])
    }
    return str
  },
  /**
   * 16进制转 ASCII
   */
  hexCharCodeToStr: function (hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
      console.log("存在非法字符!");
      return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
    }
    console.log('转换后ASCII：', resultStr);
    return resultStr.join("");
  },
  /**
 * 十六进制 转 十进制
 */
hexToDecimalism: function (hexToDecimalism){
  var trimedStr = hexToDecimalism.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
      console.log("存在非法字符!");
      return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(parseInt(curCharCode));
  }
  // console.log('转换后十进制：', resultStr);
  return resultStr;
},
  onLaunch: function () {
    this.globalData.SystemInfo = wx.getSystemInfoSync()
    //console.log(this.globalData.SystemInfo)
  },
  globalData: {
    SystemInfo: {}
  }
})