const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


//计算组件高度
function calcuComponentHeight(context,idnameArr,callback){
  //获取高度
  const query = context.createSelectorQuery();
  for(var i=0; i<idnameArr.length; i++){
    query.select(idnameArr[i]).boundingClientRect();
  }
  query.selectViewport().scrollOffset();
  query.exec((res)=>{
    callback(res);
  })
}

function sortBy(props) {
  return function(a,b) {
      return b[props] - a[props];
  }
}

function getBytesLength(str) {
  // 在GBK编码里，除了ASCII字符，其它都占两个字符宽
  return str.replace(/[^\x00-\xff]/g, 'xx').length;
}

module.exports = {
  formatTime: formatTime,
  calcuComponentHeight: calcuComponentHeight,
  getBytesLength:getBytesLength,
  sortBy:sortBy
}
