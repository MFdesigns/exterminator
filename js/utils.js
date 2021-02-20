import { RegId } from './disassembler.js'

const TypeLookup = {
    0x1: 'i8',
    0x2: 'i16',
    0x3: 'i32',
    0x4: 'i64',
    0xF0: 'f32',
    0xF1: 'f64',
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
    const typeStr = Disassembler.TypeLookup[type];
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
            roStr = `[${regToStr(iRegA)} + ${imm32}]`;
            break;
        case 0xAF:
            roStr = `[${regToStr(iRegA)} - ${imm32}]`;
            break;
        case 0x1F:
            roStr = `[${regToStr(iRegA)} + ${regToStr(iRegB)} * ${imm16}]`;
            break;
        case 0x8F:
            roStr = `[${regToStr(iRegA)} - ${regToStr(iRegB)} * ${imm16}]`;
            break;
        default:
            console.error(`Unknown register offset layout ${layout} at address 0x${index.toString(16)}`);
            break;
    }

    return roStr;
}
