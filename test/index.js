'use struct';

const path = require('path');
const IdCardPro = require('../lib');

const idcard = new IdCardPro();

(async function () {
  process.env.PATH = `${process.env.PATH}${path.delimiter}${path.join(__dirname, './dll')}`;
  try {
    // const onlineActivationRes = idcard.onlineActivation('libarcsoft_idcardveri', {
    //   appId: "BQxjZiDZuxi5Yyyx74GpddjyDw4EefRYjdsxmnD8aARa",
    //   sdkKey: "6QD8ib78kHtWhnREBvtC1ArWmsa6xhdAibzQwKL5qEdx",
    //   activeKey: 'A621-114C-3133-JNGR'
    // });
    // console.log(onlineActivationRes);

    // const offlineActivationRes = idcard.offlineActivation('libarcsoft_idcardveri', path.join(__dirname, '../A621114C3133JNGR.dat'));
    // console.log(offlineActivationRes);

    // const getActiveFileInfoRes = idcard.getActiveFileInfo('libarcsoft_idcardveri');
    // console.log(getActiveFileInfoRes);

    const initOpts = {
      libFile: 'libarcsoft_idcardveri',
      // 检测属性配置：1：开启RGB活体检测，2：开启IR活体检测，3：开启图像质量检测，4：开启RGB+IR活体检测，5：开启RGB活体检测和图像质量检测，6：开启IR活体检测和图像质量检测，7：开启RGB+IR活体检测和图像质量检测
      combinedMask: 1,
      imgQualityThreshold: 0.4, // 照片图像质量阈值
      modelThreshold_RGB: 0.5, // RGB活体检测阈值
      modelThreshold_IR: 0.7 // IR活体检测
    };
    const initRes = idcard.initialEngine(initOpts);
    if (initRes !== 0) {
      throw new Error('Initial Engine Failed!');
    }

    const compareOpts = {
      type: 0, // 人脸数据类型 1-视频 0-静态图片
      compareThreshold: 0.5, // 人证照比对阈值
      idcardFile: await idcard.parseImage(path.join(__dirname, './img/f1.jpg')),
      faceFile: await idcard.parseImage(path.join(__dirname, './img/faceA.jpg'))
    };
    const compareRes = idcard.faceIdcardCompare(compareOpts);

    console.log(compareRes);
  } catch (err) {
    console.error(err);
  }
})();
