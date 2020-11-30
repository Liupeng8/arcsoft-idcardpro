'use strict';

const FIC = require('./fic');
const TypeDef = require('./typedef');
const libc = require('./libc');
const Jimp = require('jimp')

const ref = TypeDef.Ref;

class IdCardPro {
  constructor() {
    this.parseImage = IdCardPro.parseImage;
  }

  /**
   * API
   * online active 3.3.1
   * @param {String} libFile
   * @param {Object} opts
   * @param {String} opts.appId
   * @param {String} opts.sdkKey
   * @param {String} opts.activeKey
   * @returns {Number}
   */
  onlineActivation(libFile, opts) {
    this.FIC = FIC(libFile);

    const res = this.FIC.ArcSoft_FIC_OnlineActivation(
      opts.appId,
      opts.sdkKey,
      opts.activeKey
    );

    if (res !== 0) {
      throw new Error(`Online Activation Faild, Code: ${res}`);
    }

    return { code: res };

  }

  /**
   * API
   * offline active 3.3.2
   * @param {String} libFile
   * @param {String} filePath
   */
  offlineActivation(libFile, filePath) {
    this.FIC = FIC(libFile);
    const res = this.FIC.ArcSoft_FIC_OfflineActivation(filePath);

    if (res !== 0) {
      throw new Error(`Offline Activation Faild, Code: ${res}`);
    }

    return { code: res };

  }

  /**
   * API
   * get device active info 3.3.3
   * @returns {String}
   */
  getActiveDeviceInfo(libFile) {
    const pInfo = ref.alloc(TypeDef.MPChar);
    this.FIC = FIC(libFile);

    const res = this.FIC.ArcSoft_FIC_GetActiveDeviceInfo(pInfo);

    if (res !== 0) {
      throw new Error(`Get Active DeviceInfo Failed, Code: ${res}`);
    }

    return { code: res, data: pInfo.deref() };

  }

  /**
   * API
   * get device active file info 3.3.4
   * @returns {Object}
   */
  getActiveFileInfo(libFile) {
    this.FIC = FIC(libFile);

    const fInfo = new TypeDef.AFIC_FSDK_ActiveFileInfo();

    const res = this.FIC.ArcSoft_FIC_GetActiveFileInfo(fInfo.ref());

    if (res !== 0) {
      throw new Error(`Get Active FileInfo Failed, Code: ${res}`);
    }

    return { code: res, data: fInfo };

  }

  /**
   * API
   * initial engine 3.3.5
   */
  initialEngine(opts) {
    // libFile, combinedMask, imgQualityThreshold, modelThreshold_RGB, modelThreshold_IR
    this.FIC = FIC(opts.libFile);

    this.phFICEngine = ref.alloc(TypeDef.MHandle);

    this.combinedMask = 0; // 1:128, 2:1024, 3:512, 4:1152, 5:640, 6:1536, 7:1664
    switch (opts.combinedMask) {
      case 1:
        this.combinedMask = TypeDef.AFIC_LIVENESS;
        break;
      case 2:
        this.combinedMask = TypeDef.ASF_IR_LIVENESS;
        break;
      case 3:
        this.combinedMask = TypeDef.ASF_IMAGEQUALITY;
        break;
      case 4:
        this.combinedMask = TypeDef.AFIC_LIVENESS | TypeDef.ASF_IR_LIVENESS;
        break;
      case 5:
        this.combinedMask = TypeDef.AFIC_LIVENESS | TypeDef.ASF_IMAGEQUALITY;
        break;
      case 6:
        this.combinedMask = TypeDef.ASF_IR_LIVENESS | TypeDef.ASF_IMAGEQUALITY;
        break;
      case 7:
        this.combinedMask = TypeDef.AFIC_LIVENESS | TypeDef.ASF_IR_LIVENESS | TypeDef.ASF_IMAGEQUALITY;
        break;
    }

    const res = this.FIC.ArcSoft_FIC_InitialEngine(
      this.phFICEngine,
      this.combinedMask
    );

    if (res !== 0) {
      this.uninitialEngine();
      throw new Error(`Initial Idcard Engine Failed, Code: ${res}`)
    }

    this.hFICEngine = this.phFICEngine.deref();

    if (opts.combinedMask === 3 || opts.combinedMask === 5 || opts.combinedMask === 6 || opts.combinedMask === 7) {
      this.setFaceQualityThreshold(opts.imgQualityThreshold);
    }

    if (opts.combinedMask === 1 || opts.combinedMask === 5) {
      this.setLivenessParam(opts.modelThreshold_RGB, null);
    } else if (opts.combinedMask === 2 || opts.combinedMask === 6) {
      this.setLivenessParam(null, opts.modelThreshold_IR);
    } else if (opts.combinedMask === 4 || opts.combinedMask === 7) {
      this.setLivenessParam(opts.modelThreshold_RGB, opts.modelThreshold_IR);
    }

    return res;

  }

  /**
   * Set Face Quality Threshold 3.3.6 X
   */
  setFaceQualityThreshold(param) {

    if (this.hFREngine === null) {
      throw new Error('FaceIdcardPro Engine is uninitialized');
    }

    this.thresholdRGB = param || 0.35;

    this.faceQualityParam = new TypeDef.AFIC_FSDK_FaceQualityThreshold()

    this.faceQualityParam.faceQualityThreshold_RGB = this.thresholdRGB

    const res = this.FIC.Arcsoft_FIC_SetFaceQualityThreshold(
      this.hFICEngine,
      this.faceQualityParam.ref()
    );

    if (res !== 0) {
      throw new Error(`Set Face Quality Threshold Failed, Code: ${res}`)
    }
  }

  /**
   * Face Feature Extraction 3.3.7
   */
  faceFeatureExtraction(type, asvl) {

    if (this.hFREngine === null) {
      throw new Error('FaceIdcardPro Engine is uninitialized');
    }

    const isVideo = type ? type : 0;

    this.pInputFaceData = new TypeDef.ASVLOFFSCREEN();
    this.pInputFaceData.u32PixelArrayFormat = asvl.u32PixelArrayFormat;
    this.pInputFaceData.i32Width = asvl.i32Width;
    this.pInputFaceData.i32Height = asvl.i32Height;
    this.pInputFaceData.ppu8Plane = asvl.ppu8Plane;
    this.pInputFaceData.pi32Pitch = asvl.pi32Pitch;

    this.pFaceRes = new TypeDef.AFIC_FSDK_FACERES();

    const res = this.FIC.ArcSoft_FIC_FaceDataFeatureExtraction(this.hFICEngine, isVideo, this.pInputFaceData.ref(), this.pFaceRes.ref());

    if (res !== 0) {
      throw new Error(`Face Feature Extraction Failed, Code: ${res}`);
    }

    let combinedRes
    // RGB Liveness - 1:128, 4:1152, 5:640
    if (this.combinedMask === 128 || this.combinedMask === 1152 || this.combinedMask === 640) {
      combinedRes = this.getLivenessInfo();
    }

    // IR Liveness - 2:1024, 4:1152, 6:1536, 7:1664
    if (this.combinedMask === 1024 || this.combinedMask === 1152 || this.combinedMask === 1536 || this.combinedMask === 1664) {
      combinedRes = this.getLivenessInfoIR();
    }

    return combinedRes;

  }

  /**
   * IdCard Feature Extraction 3.3.8
   */
  idcardFeatureExtraction(asvl) {
    if (this.hFREngine === null) {
      throw new Error('FaceIdcardPro Engine is uninitialized');
    }

    this.pInputIdcardData = new TypeDef.ASVLOFFSCREEN();
    this.pInputIdcardData.u32PixelArrayFormat = asvl.u32PixelArrayFormat;
    this.pInputIdcardData.i32Width = asvl.i32Width;
    this.pInputIdcardData.i32Height = asvl.i32Height;
    this.pInputIdcardData.ppu8Plane = asvl.ppu8Plane;
    this.pInputIdcardData.pi32Pitch = asvl.pi32Pitch;

    const res = this.FIC.ArcSoft_FIC_IdCardDataFeatureExtraction(this.hFICEngine, this.pInputIdcardData.ref());

    if (res !== 0) {
      throw new Error(`Idcard Feature Extraction Failed, Code: ${res}`);
    }

  }

  /**
   * API
   * face idcard compare 3.3.9
   */
  faceIdcardCompare(opts) {
    if (this.hFREngine === null) {
      throw new Error('FaceIdcardPro Engine is uninitialized');
    }

    this.idcardFeatureExtraction(opts.idcardFile);

    const featrueRes = this.faceFeatureExtraction(opts.type, opts.faceFile);

    const pSimilarScore = ref.alloc(TypeDef.MFloat);

    const pResult = ref.alloc(TypeDef.MInt32);

    const res = this.FIC.ArcSoft_FIC_FaceIdCardCompare(this.hFICEngine, opts.compareThreshold, pSimilarScore, pResult);

    if (res !== 0) {
      throw new Error(`FaceIdcard Compare Failed, Code: ${res}`);
    }

    this.uninitialEngine();

    return { code: res, pSimilarScore: pSimilarScore.deref(), pResult: pResult.deref(), fResult: featrueRes };
  }

  /**
   * set liveness param 3.3.10
   */
  setLivenessParam(modelThreshold_RGB, modelThreshold_IR) {

    const pThreshold = new TypeDef.AFIC_FSDK_LivenessThreshold();
    pThreshold.modelThreshold_RGB = modelThreshold_RGB || 0.5;
    pThreshold.modelThreshold_IR = modelThreshold_IR || 0.7;

    const res = this.FIC.ArcSoft_FIC_SetLivenessParam(this.hFICEngine, pThreshold.ref());

    if (res !== 0) {
      throw new Error(`Set Liveness Param Failed, Code: ${res}`);
    }

  }

  /**
   * FIC Process 3.3.11
   */
  process() {
    const res = this.FIC.ArcSoft_FIC_Process(this.hFICEngine, this.pInputFaceData.ref(), this.pFaceRes.ref(), this.combinedMask);

    if (res !== 0) {
      throw new Error(`FIC Process Failed, Code: ${res}`)
    }

  }

  /**
   * API
   * get Liveness Info 3.3.12
   */
  getLivenessInfo() {
    this.process();
    this.livenessInfo = new TypeDef.AFIC_FSDK_LivenessInfo();

    const res = this.FIC.ArcSoft_FIC_GetLivenessInfo(this.hFICEngine, this.livenessInfo.ref());

    if (res !== 0) {
      throw new Error(`Get LivenessInfo Failed, code: ${res}`);
    }

    return this.livenessInfo.isLive;

  }

  /**
   * process IR 3.3.13
   */
  processIR() {
    const res = this.FIC.ArcSoft_FIC_Process_IR(this.hFICEngine, this.pInputFaceData.ref(), this.pFaceRes.ref(), this.combinedMask);

    if (res !== 0) {
      throw new Error(`Fic Process IR Failed, Code: ${res}`);
    }

  }

  /**
   * get liveness info-IR 3.3.14
   */
  getLivenessInfoIR() {
    this.processIR();
    this.pLivenessInfo_IR = new TypeDef.AFIC_FSDK_LivenessInfo();

    const res = this.FIC.ArcSoft_FIC_GetLivenessInfo_IR(this.hFICEngine, this.pLivenessInfo_IR.ref());

    if (res !== 0) {
      throw new Error(`Get LivenessInfoIR Failed, Code: ${res}`);
    }

    return this.pLivenessInfo_IR.isLive;

  }

  /**
   * API
   * Get FIC Version 3.3.15
   */
  getSdkVersion() {
    return this.FIC.ArcSoft_FIC_GetVersion(this.hFICEngine);
  }

  /**
   * API
   * Uninitial Engine 3.3.16
   */
  uninitialEngine() {
    const res = this.FIC.ArcSoft_FIC_UninitialEngine(this.hFICEngine);

    if (res !== 0) {
      throw new Error(`Uninitial Engine Failed, Code: ${res}`);
    }

  }

  /**
   * parse image
   * 
   * @static
   * @param {String} imgFile 
   * @returns {Promise.<ASVLOFFSCREEN>}
   * @memberof Face
   */
  static parseImage(imgFile) {
    return Jimp.read(imgFile).then(image => {
      const { width, height, data } = image.bitmap
      // console.log(width)
      const imageBuf = Buffer.alloc(width * height * 3);

      const asvl = new TypeDef.ASVLOFFSCREEN();

      image.scan(0, 0, width, height, function (i, j, idx) {
        const r = data[idx + 0];
        const g = data[idx + 1];
        const b = data[idx + 2];

        imageBuf[(j * width + i) * 3] = b;
        imageBuf[(j * width + i) * 3 + 1] = g;
        imageBuf[(j * width + i) * 3 + 2] = r;
      });
      asvl.u32PixelArrayFormat = TypeDef.ASVL_PAF_RGB24_B8G8R8;
      asvl.i32Width = width;
      asvl.i32Height = height;
      asvl.pi32Pitch[0] = asvl.i32Width * 3;
      asvl.pi32Pitch[1] = 0;
      asvl.pi32Pitch[2] = 0;
      asvl.pi32Pitch[3] = 0;

      asvl.ppu8Plane[0] = imageBuf;
      asvl.ppu8Plane[1] = ref.NULL;
      asvl.ppu8Plane[2] = ref.NULL;
      asvl.ppu8Plane[3] = ref.NULL;

      //make a strong reference, prevent garbage collection to free the memory
      asvl.gc_ppu8Plane0 = imageBuf;
      // console.log(imageBuf)
      return asvl;
    });

  }
}

IdCardPro.FIC = FIC;
IdCardPro.Lib = libc;
IdCardPro.TypeDef = TypeDef;
IdCardPro.Jimp = Jimp;

module.exports = IdCardPro;