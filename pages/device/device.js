const app = getApp();
const utils = require('../../utils/util');
Page({
  data: {
    selectDeviceTypeIndex: 0, //0:从设备 1:主设备
    deviceTypeList: ['从设备', '主设备'],
    selectDeviceTypeValue: '从设备',
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
    selectCharUUIDIndex: 0,
    isOpenNotify: false,
    //电压系数
    voltageCoefficient: 0,
    //电流系数
    currentCoefficient: 0,
    deviceDataList: [],
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)

  },
  Send: function () {
    if (!this.data.inputText) {
      wx.showToast({
        icon: 'none',
        title: '请输入设备名称',
        duration: 2000
      })
      return;
    }
    if (!this.data.selectCharUUID || !this.data.selectServiceUUID) {
      wx.showToast({
        icon: 'none',
        title: '请先选择serviceUUID、charUUID',
        duration: 2000
      })
      return;
    }

    var that = this
    if (that.data.connected) {
      var buffer = new ArrayBuffer(that.data.inputText.length)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i < that.data.inputText.length; i++) {
        dataView[i] = that.data.inputText.charCodeAt(i)
      }
      console.log("数据buff: ", buffer);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.selectServiceUUID,
        characteristicId: that.data.selectCharUUID,
        value: buffer,
        success: function (res) {
          console.log('写数据成功：' + JSON.stringify(res));
          wx.showToast({
            icon: 'none',
            title: '写数据成功',
            duration: 2000
          })
          that.setData({
            name: that.data.inputText
          })
        },
        fail: function (res) {
          wx.showToast({
            icon: 'none',
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
    //var testData = "1F0559616F67616E67" //--前两位为电压值  后面的为设备名称
    //that.parseData(testData);
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
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })

    //1F0559616F67616E67
    wx.onBLECharacteristicValueChange(function (res) {
      var receiveText = app.buf2hex(res.value)
      console.log('接收到的hex数据：' + receiveText);
      that.setData({
        receiveText: receiveText
      })
      //处理数据
      //1F0559616F67616E67 --前两位为电压值  后面的为设备名称
      that.parseData(receiveText);
    })
  },

  parseData: function (str) {
    var that = this;
    var sub1 = str.substring(0, 2);
    var sub2 = str.substring(2);
    console.log("截取的前两位字符串:", sub1);
    console.log("截取的剩余字符串:", sub2);
    var voltage = app.hexToDecimalism(sub1)[0];
    var deviceName = app.hexCharCodeToStr(sub2);
    console.log("hexToString: " + deviceName);
    console.log("hexToShi: " + voltage);
    var deviceData = {
      deviceName: deviceName,
      voltage: voltage
    }
    console.log("deviceData : ", deviceData);
    var temDeviceDataList = that.data.deviceDataList;
    let isHave = false;
    for (var i = 0; i < that.data.deviceDataList.length; i++) {
      if (that.data.deviceDataList[i].deviceName == deviceName) {
        isHave = true;
        //当前设备存在，更新设备数据
        that.setData({
          ['deviceDataList[' + i + '].voltage']: voltage
        })
      }
    }
    console.log("isHave: " + isHave + " ; temDeviceDataList= " + temDeviceDataList)
    if (!isHave) {
      temDeviceDataList.push(deviceData);
      that.setData({
        deviceDataList: temDeviceDataList
      })
    }
    console.log("isHave: " + isHave + " ; temDeviceDataList= " + JSON.stringify(temDeviceDataList))
  },

  getServiceUUID: function (e) {
    this.setData({
      selectServiceUUIDIndex: e.detail.value,
      selectServiceUUID: this.data.services[e.detail.value].uuid
    })
    this.getBLEDeviceCahars();
  },

  getCharUUID: function (e) {
    this.setData({
      selectCharUUIDIndex: e.detail.value,
      selectCharUUID: this.data.characteristics[e.detail.value].uuid
    })
  },

  openBleNotify: function () {
    if (this.data.isOpenNotify) {
      wx.showToast({
        title: '通知已打开!',
        icon: 'none'
      })
      return;
    }

    if (!this.data.selectServiceUUID) {
      wx.showToast({
        title: '请选择服务UUID',
        icon: 'none'
      })
      return;
    }

    if (!this.data.selectCharUUID) {
      wx.showToast({
        title: '请选择特征值UUID',
        icon: 'none'
      })
      return;
    }

    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: this.data.connectedDeviceId,
      serviceId: this.data.selectServiceUUID,
      characteristicId: this.data.selectCharUUID,
      success: res => {
        console.log('启用notify成功')
        this.setData({
          isOpenNotify: true
        })
        wx.showToast({
          title: '通知打开成功!',
          icon: 'none'
        })
      },
      fail: function (res) {
        console.log('启用notify失败: ', res);
      }
    })
  },

  onUnload: function () {
    console.log("onUnload");
    if (this.data.connected) {
      wx.closeBLEConnection({
        deviceId: this.data.connectedDeviceId,
        success: res => {
          console.log("断开设备连接成功")
        },
        fail: res => {
          console.log("断开连接的设备失败!");
          console.log(res);
        }
      })
    }
  },

  charUUIDtap: function () {
    if (!this.data.selectServiceUUID) {
      wx.showToast({
        title: '请先选择服务UUID',
        icon: 'none'
      })
    }
  },

  getBLEDeviceCahars: function () {
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data.connectedDeviceId,
      serviceId: this.data.selectServiceUUID,
      success: res => {
        console.log(res.characteristics)
        this.setData({
          characteristics: res.characteristics
        })
      }
    })
  },

  getDeviceType: function (e) {
    this.setData({
      selectDeviceTypeIndex: e.detail.value,
      selectDeviceTypeValue: this.data.deviceTypeList[e.detail.value]
    })
  },

  voltageInput: function (e) {
    console.log("电压input:", e.detail.value)
    this.setData({
      voltageCoefficient: e.detail.value
    })
  },

  currentInput: function (e) {
    console.log("电流input:", e.detail.value)
    this.setData({
      currentCoefficient: e.detail.value
    })
  },

  reconnect:function (params) {
    var that = this;
    that.setData({
      isOpenNotify : false
    })
    wx.showLoading({
      title: '连接蓝牙设备中...',
    })
    wx.createBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        that.openBleNotify();
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '连接失败',
          showCancel: false
        })
      }
    })
  }
})