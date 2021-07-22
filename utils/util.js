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

module.exports = {
  formatTime: formatTime,
  calcuComponentHeight: calcuComponentHeight
}
