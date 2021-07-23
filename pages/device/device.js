const app = getApp();
const utils = require('../../utils/util');
Page({
  data: {
    inputText: '',
    receiveText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true,
    selectServiceUUID: '',
    selectServiceUUIDIndex: 0,
    selectCharUUID: '',
    selectServiceUUIDIndex: 0,
    isOpenNotify: false,
    deviceDataList:[{
      deviceName:'设备1',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备2',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备3',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备4',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备5',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备6',
      voltage:2.4,
      vurrent:5
    },{
      deviceName:'设备7',
      voltage:2.4,
      vurrent:'5'
    },{
      deviceName:'设备8',
      voltage:2.4,
      vurrent:5
    }],
    scrollHeight:0
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)
  },
  Send: function () {
    if(!this.data.inputText){
      wx.showToast({
        icon:'none',
        title: '请输入设备名称',
        duration: 2000
      })
      return;
    }
    if(!this.data.selectCharUUID || !this.data.selectServiceUUID){
      wx.showToast({
        icon:'none',
        title: '请先选择serviceUUID、charUUID',
        duration: 2000
      })
      return;
    }
    if(!this.data.isOpenNotify){
      this.openBleNotify();
    }
    var that = this
    if (that.data.connected) {
      var buffer = new ArrayBuffer(that.data.inputText.length)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i < that.data.inputText.length; i++) {
        dataView[i] = that.data.inputText.charCodeAt(i)
      }
      console.log("数据buff: ",buffer);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.selectServiceUUID,
        characteristicId: that.data.selectCharUUID,
        value: buffer,
        success: function (res) {
          console.log('写数据成功：' + JSON.stringify(res));
          wx.showToast({
            icon:'none',
            title: '写数据成功',
            duration: 2000
          })
        },
        fail:function(res){
          wx.showToast({
            icon:'none',
            title: '写数据失败',
            duration: 2000
          })
          console.log('写数据失败：' + JSON.stringify(res));
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  onLoad: function (options) {
    var that = this
    let idArr = ['#head']
    utils.calcuComponentHeight(that,idArr,function(res) {
      that.setData({
        scrollHeight: wx.getSystemInfoSync().windowHeight - res[0].height
      })
    })
   
    console.log(options)
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.services)
        that.setData({
          services: res.services
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[0].uuid,
          success: function (res) {
            console.log(res.characteristics)
            that.setData({
              characteristics: res.characteristics
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })
    wx.onBLECharacteristicValueChange(function (res) {
      var receiveText = app.buf2string(res.value)
      console.log('接收到数据：' + receiveText)
      that.setData({
        receiveText: receiveText
      })
    })
  },
  getServiceUUID: function (e) {
    this.setData({
      selectServiceUUIDIndex: e.detail.value,
      selectServiceUUID: this.data.services[e.detail.value].uuid
    })
  },

  getCharUUID: function (e) {
    this.setData({
      selectCharUUIDIndex: e.detail.value,
      selectCharUUID: this.data.characteristics[e.detail.value].uuid
    })
  },

  openBleNotify: function () {
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: this.data.connectedDeviceId,
      serviceId: this.data.selectServiceUUID,
      characteristicId: this.data.selectCharUUID,
      success: res=> {
        console.log('启用notify成功')
        this.setData({
          isOpenNotify:true
        })
      },
      fail:function(res){
        console.log('启用notify失败: ',res);
      }
    })
  },

  onUnload: function(){
    console.log("onUnload");
    if(this.data.connected){
      wx.closeBLEConnection({
        deviceId: this.data.connectedDeviceId,
        success:res=>{
          console.log("断开设备连接成功")
        },
        fail:res=>{
          console.log("断开连接的设备失败!");
          console.log(res);
        }
      })
    }
  },

  charUUIDtap:function(){
    if(!this.data.selectServiceUUID){
      wx.showToast({
        title: '请先选择服务UUID',
        icon:'none'
      })
    }
  }
})