import { RegId } from './disassembler.js'

const TypeLookup = {
  0x1: 'i8',
  0x2: 'i16',
  0x3: 'i32',
  0x4: 'i64',
  0xF0: 'f32',
  0xF1: 'f64',
}

const RuntimeError = {
  INVALID_HEADER: 20,
  INVALID_SEC_TABLE: 21,
  VADDR_NOT_FOUND: 22,
  MISSING_PERM: 23,
  DEALLOC_INVALID_ADDR: 24,
  INVALID_TARGET_REG: 25,
  INVALID_TYPE: 26,
  INVALID_REG_OFFSET: 27,
  INVALID_READ: 28,
  INVALID_SOURCE_REG: 29,
  INVALID_WRITE: 30,
  INVALID_SOURCE_REG_OFFSET: 31,
  INVALID_DEST_REG_OFFSET: 32,
  INVALID_STACK_OPERATION: 33,
  INVALID_JUMP_DEST: 34,
  SYSCALL_UNKNOWN: 35,
  SYSCALL_FAILURE: 36,
  DIVISON_ZERO: 37,
  UNKNOWN_OP_CODE: 38,
}

/**
 * Formats an integer to a 64-bit address string
 * @param {BigInt|Number} int
 * @return {String}
 */
export function formatVAddr(int) {
  return `0x${int.toString(16).toUpperCase().padStart(16, '0')}`;
}

/**
 * Formats a decimal register id to the corresponding register name
 * @param {Number} id
 * @return {String}
 */
export function formatRegId(id) {
  let regName = '';
  if (id === RegId.IP) {
    regName = 'ip';
  } else if (id === RegId.SP) {
    regName = 'sp';
  } else if (id === RegId.BP) {
    regName = 'bp';
  } else if (id === RegId.FL) {
    regName = 'fl';
  } else if (id >= 0x5 && id <= 0x14) {
    regName = `r${(id - 0x5).toString(10)}`;
  } else if (id >= 0x15 && id <= 0x24) {
    regName = `f${(id - 0x15).toString(10)}`;
  }
  return regName;
}

/**
 * Translates a type to string
 * @param {Number} type
 */
export function typeToStr(type) {
  const typeStr = TypeLookup[type];
  if (!typeStr) {
    console.error(`Unknown type: ${type}`);
  }
  return typeStr;
}

/**
 * Translates register id to string
 * @param {Number} reg
 */
export function regToStr(reg) {
  let regStr = '';

  switch (reg) {
    case 0x1:
      regStr = 'ip';
      break;
    case 0x2:
      regStr = 'sp';
      break;
    case 0x3:
      regStr = 'bp';
      break;
  }

  if (reg >= 0x5 && reg <= 0x15) {
    regStr = `r${reg - 0x5}`;
  } else if (reg >= 0x16 && reg <= 0x25) {
    regStr = `f${reg - 0x16}`;
  }

  return regStr;
}

/**
 * Translates a register offset to string
 * @param {DataView} view Source buffer view
 * @param {Number} index Register offset index into buffer view
 */
export function regOffsetToStr(view, index) {
  let roStr = '';

  const layout = view.getUint8(index);
  const iRegA = view.getUint8(index + 1);
  const iRegB = view.getUint8(index + 2);
  const imm32 = view.getUint32(index + 2, true);
  const imm16 = view.getUint16(index + 3, true);

  switch (layout) {
    case 0x4F:
      roStr = `[${regToStr(iRegA)}]`;
      break;
    case 0x2F:
      roStr = `[${regToStr(iRegA)} + 0x${imm32.toString(16).toUpperCase()}]`;
      break;
    case 0xAF:
      roStr = `[${regToStr(iRegA)} - 0x${imm32.toString(16).toUpperCase()}]`;
      break;
    case 0x1F:
      roStr = `[${regToStr(iRegA)} + ${regToStr(iRegB)} * 0x${imm16.toString(16).toUpperCase()}]`;
      break;
    case 0x8F:
      roStr = `[${regToStr(iRegA)} - ${regToStr(iRegB)} * 0x${imm16.toString(16).toUpperCase()}]`;
      break;
    default:
      console.error(`Unknown register offset layout ${layout} at address 0x${index.toString(16)}`);
      break;
  }

  return roStr;
}

/**
 * Translates a runtimer error to string
 * @param {Number} err Runtime error code
 * @return {String} error message
 */
export function translateRuntimeError(err) {
  let errMsg = '';
  switch (err) {
    case RuntimeError.INVALID_HEADER:
      errMsg = 'invalid header';
      break;
    case RuntimeError.INVALID_SEC_TABLE:
      errMsg = 'invalid section table';
      break;
    case RuntimeError.VADDR_NOT_FOUND:
      errMsg = 'virtual address not found';
      break;
    case RuntimeError.MISSING_PERM:
      errMsg = 'target memory missing required permission';
      break;
    case RuntimeError.DEALLOC_INVALID_ADDR:
      errMsg = 'provided invalid address to deallocation';
      break;
    case RuntimeError.INVALID_TARGET_REG:
      errMsg = 'invalid target register';
      break;
    case RuntimeError.INVALID_REG_OFFSET:
      errMsg = 'invalid register offset';
      break;
    case RuntimeError.INVALID_READ:
      errMsg = 'invalid read from given address';
      break;
    case RuntimeError.INVALID_SOURCE_REG:
      errMsg = 'invalid source register';
      break;
    case RuntimeError.INVALID_WRITE:
      errMsg = 'invalid write to given address';
      break;
    case RuntimeError.INVALID_SOURCE_REG_OFFSET:
      errMsg = 'invalid source register offset';
      break;
    case RuntimeError.INVALID_DEST_REG_OFFSET:
      errMsg = 'invalid destination register offset';
      break;
    case RuntimeError.INVALID_STACK_OPERATION:
      errMsg = 'invalid stack operation';
      break;
    case RuntimeError.INVALID_JUMP_DEST:
      errMsg = 'invalid jump destination address';
      break;
    case RuntimeError.SYSCALL_UNKNOWN:
      errMsg = 'unknown system call';
      break;
    case RuntimeError.SYSCALL_FAILURE:
      errMsg = 'could not perform system call';
      break;
    case RuntimeError.DIVISON_ZERO:
      errMsg = 'divison by zero';
      break;
    case RuntimeError.UNKNOWN_OP_CODE:
      errMsg = 'unknown opcode';
      break;
  }
  return errMsg;
}
