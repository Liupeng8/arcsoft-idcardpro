'use strict';

const ffi = require('ffi-napi');
const ref = require('ref-napi');

const void_t = ref.types.void;
const void_ptr = ref.refType(void_t);
const size_t = ref.types.size_t;
const ptr_t = process.arch === 'x64' ? ref.types.uint64 : ref.types.uint32;

/**
 * common c functions
 */
module.exports = new ffi.Library(
  process.platform === 'win32' ? 'msvcrt' : 'libc', {
  malloc: [void_ptr, [size_t]],
  free: [void_t, [void_ptr]],
  memcpy: [void_ptr, [ptr_t, ptr_t, size_t]]
}
);