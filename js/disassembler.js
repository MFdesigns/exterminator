import { encoding } from "./encoding.js";
import * as Utils from "./utils.js";

export const RegId = {
    IP: 1,
    SP: 2,
    BP: 3,
    FL: 4,
}

export const InstrParamType = {
    I8: 0,
    I16: 1,
    I32: 2,
    I64: 3,
    F32: 4,
    F64: 5,
    ADDRESS: 6,
    INT_TYPE: 7,
    FLOAT_TYPE: 8,
    REG_OFFSET: 9,
    GENERIC_INT: 10,
    GENERIC_FLOAT: 11,
    INT_REG: 12,
    FLOAT_REG: 13,
}

class DisasmInstr {
    /**
     * Constructs a new DisasmInstr
     * @param {BigInt} addr Address of instruction
     * @param {String} asm Assembly code line
     */
    constructor(addr, asm) {
        this.Addr = addr;
        this.Asm = asm;
    }
}

export class Instruction {
    /**
     * Constructs a new Instruction
     * @param {Number} op opcode
     * @param {String} name instruction name
     * @param {String[]} params string array of paramters
     * @param {String} typeEncoded encoded type
     */
    constructor(op, name, params, typeEncoded) {
        this.Opcode = op;
        this.Params = params;
        this.Name = name;
        this.EncodedType = typeEncoded;
    }
}

export class Disassembler {
    static Instructions = {};

    constructor() {
        this.Disasm = [];
        this.SourceFile = null;

        if (Object.keys(Disassembler.Instructions).length === 0) {
            this.getInstructions();
        }
    }

    /**
     * Set source file
     * @param {SourceFile} src
     */
    setSource(src) {
        this.SourceFile = src;
    }

    /**
     * Initializes instruction database
     */
    getInstructions() {
        encoding.instructions.forEach((instr) => {
            instr.paramList.forEach((paramList) => {
                const op = paramList.opcode;
                const params = [];

                paramList.params.forEach((param) => {
                    let paramType = 0;
                    switch (param) {
                        case "iT":
                            paramType = InstrParamType.INT_TYPE;
                            break;
                        case "fT":
                            paramType = InstrParamType.FLOAT_TYPE;
                            break;
                        case "int":
                            paramType = InstrParamType.GENERIC_INT;
                            break;
                        case "float":
                            paramType = InstrParamType.GENERIC_FLOAT;
                            break;
                        case "iReg":
                            paramType = InstrParamType.INT_REG;
                            break;
                        case "fReg":
                            paramType = InstrParamType.FLOAT_REG;
                            break;
                        case "label":
                            paramType = InstrParamType.ADDRESS;
                            break;
                        case "RO":
                            paramType = InstrParamType.REG_OFFSET;
                            break;
                    }

                    if (paramType === InstrParamType.INT_TYPE || paramType === InstrParamType.FLOAT_TYPE) {
                        if (paramList.encodeType === false) {
                            return;
                        }
                    }
                    params.push(paramType);
                });

                if (paramList.typeVariants.length > 0) {
                    paramList.typeVariants.forEach((variant) => {
                        const varParams = [...params];
                        let replacement;
                        switch (variant.type) {
                            case "i8":
                                replacement = InstrParamType.I8;
                                break;
                            case "i16":
                                replacement = InstrParamType.I16;
                                break;
                            case "i32":
                                replacement = InstrParamType.I32;
                                break;
                            case "i64":
                                replacement = InstrParamType.I64;
                                break;
                            case "f32":
                                replacement = InstrParamType.F32;
                                break;
                            case "f64":
                                replacement = InstrParamType.F64;
                                break;
                        }

                        varParams.forEach((param, i) => {
                            switch (param) {
                                case InstrParamType.GENERIC_INT:
                                    varParams[i] = replacement;
                                    break;
                                case InstrParamType.GENERIC_FLOAT:
                                    varParams[i] = replacement;
                                    break;
                            }
                        })
                        Disassembler.Instructions[parseInt(variant.opcode, 16)] = new Instruction(parseInt(variant.opcode, 16), instr.name, varParams, variant.type);
                    });
                } else {
                    Disassembler.Instructions[parseInt(op, 16)] = new Instruction(parseInt(op, 16), instr.name, params, null);
                }
            })
        });
    }

    /**
     * Disassembles current source file
     */
    disassemble() {
        // Find code section
        let codeSec = 0;
        for (let i = 0; i < this.SourceFile.Sections.length; i++) {
            const sec = this.SourceFile.Sections[i];
            if (sec.Type === 0x6) {
                codeSec = sec;
                break;
            }
        }

        if (codeSec === 0) {
            console.error('Error could not disassemble file. No code section found.');
            return;
        }

        let cursor = Number(codeSec.StartAddr);
        const codeSecEnd = Number(codeSec.StartAddr) + Number(codeSec.Size);
        const view = new DataView(this.SourceFile.FileBuffer.buffer);
        while (cursor < codeSecEnd) {
            let instrWidth = 1;
            const op = view.getUint8(cursor);
            const instr = Disassembler.Instructions[op];
            let asm = `${instr.Name} `;

            if (instr.EncodedType) {
                asm += `${instr.EncodedType} `;
            }

            instr.Params.forEach((param) => {
                switch (param) {
                    case InstrParamType.I8: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += val;
                        instrWidth += 1;
                    }
                        break;
                    case InstrParamType.I16: {
                        const val = view.getUint16(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 2;
                    }
                        break;
                    case InstrParamType.I32: {
                        const val = view.getUint32(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 4;
                    }
                        break;
                    case InstrParamType.I64: {
                        const val = view.getBigUint64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParamType.F32: {
                        const val = view.getFloat32(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 4;
                    }
                        break;
                    case InstrParamType.F64: {
                        const val = view.getFloat64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParamType.ADDRESS: {
                        const val = view.getBigUint64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParamType.FLOAT_TYPE:
                    case InstrParamType.INT_TYPE: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += Utils.typeToStr(val);
                        instrWidth += 1;
                    }
                        break;
                    case InstrParamType.REG_OFFSET:
                        asm += Utils.regOffsetToStr(view, cursor + instrWidth);
                        instrWidth += 6;
                        break;
                    case InstrParamType.INT_REG:
                    case InstrParamType.FLOAT_REG: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += Utils.regToStr(val);
                        instrWidth += 1;
                    }
                        break;
                }
                asm += ' ';
            });

            this.Disasm.push(new DisasmInstr(cursor, asm));
            cursor += instrWidth;
        }
    }
}
