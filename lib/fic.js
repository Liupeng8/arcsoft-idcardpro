'use strict';

const ffi = require('ffi-napi');
const TypeDef = require('./typedef');
const ref = TypeDef.Ref;

// Initialize IdcardPro module
module.exports = function init(libFile) {
  // export functions from lib file
  return ffi.Library(libFile, {
    // online activation
    ArcSoft_FIC_OnlineActivation: [TypeDef.MRESULT, [
      TypeDef.MPCChar,
      TypeDef.MPCChar,
      TypeDef.MPCChar
    ]],

    // offline activation
    ArcSoft_FIC_OfflineActivation: [TypeDef.MRESULT, [
      TypeDef.MPCChar
    ]],

    // get device active info
    ArcSoft_FIC_GetActiveDeviceInfo: [TypeDef.MRESULT, [ref.refType(TypeDef.MPChar)]],

    // get active file info
    ArcSoft_FIC_GetActiveFileInfo: [TypeDef.MRESULT, [TypeDef.LPAFIC_FSDK_ActiveFileInfo]],

    // initial engine
    ArcSoft_FIC_InitialEngine: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.MInt32
    ]],

    // set face quality threshold
    Arcsoft_FIC_SetFaceQualityThreshold: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPAFIC_FSDK_FaceQualityThreshold
    ]],

    // face data feature extraction
    ArcSoft_FIC_FaceDataFeatureExtraction: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.MBool,
      TypeDef.LPASVLOFFSCREEN,
      TypeDef.LPAFIC_FSDK_FACERES
    ]],

    // IdCard Data Feature Extraction
    ArcSoft_FIC_IdCardDataFeatureExtraction: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPASVLOFFSCREEN
    ]],

    // Face IdCard Compare
    ArcSoft_FIC_FaceIdCardCompare: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.MFloat,
      ref.refType(TypeDef.MFloat),
      ref.refType(TypeDef.MInt32)
    ]],

    // Set Liveness Param
    ArcSoft_FIC_SetLivenessParam: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPAFIC_FSDK_LivenessThreshold
    ]],

    // FIC Process
    ArcSoft_FIC_Process: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPASVLOFFSCREEN,
      TypeDef.LPAFIC_FSDK_FACERES,
      TypeDef.MInt32
    ]],

    // FIC GetLiveness Info
    ArcSoft_FIC_GetLivenessInfo: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPAFIC_FSDK_LivenessInfo
    ]],

    // Fic process ir
    ArcSoft_FIC_Process_IR: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPASVLOFFSCREEN,
      TypeDef.LPAFIC_FSDK_FACERES,
      TypeDef.MInt32
    ]],

    // fic getliveness info ir
    ArcSoft_FIC_GetLivenessInfo_IR: [TypeDef.MRESULT, [
      TypeDef.MHandle,
      TypeDef.LPAFIC_FSDK_LivenessInfo
    ]],

    // fic get version
    ArcSoft_FIC_GetVersion: [TypeDef.MRESULT, [
      TypeDef.MHandle
    ]],

    // fic uninitia engine
    ArcSoft_FIC_UninitialEngine: [TypeDef.MRESULT, [
      TypeDef.MHandle
    ]]
  });
}