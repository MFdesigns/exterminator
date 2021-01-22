// ======================================================================== //
// Copyright 2020 Michel Fäh
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ======================================================================== //

import { encoding } from "./encoding.js";

const InstrParam = {
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
    constructor(addr, asm) {
        this.Addr = addr;
        this.Asm = asm;
    }
}

class Instruction {
    constructor(op, name, params, typeEncoded) {
        this.Opcode = op;
        this.Params = params;
        this.Name = name;
        this.EncodedType = typeEncoded;
    }
}

export class Disassembler {
    static Instructions = {};
    static TypeLookup = {
        0x1: 'i8',
        0x2: 'i16',
        0x3: 'i32',
        0x4: 'i64',
        0xF0: 'f32',
        0xF1: 'f64',
    }

    constructor(src) {
        this.Disasm = [];
        this.SourceFile = src;

        if (Object.keys(Disassembler.Instructions).length === 0) {
            this.getInstructions();
        }
    }

    static typeToStr(type) {
        const typeStr = Disassembler.TypeLookup[type];
        if (!typeStr) {
            console.error(`Unknown type: ${type}`);
        }
        return typeStr;
    }

    static regToStr(reg) {
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

    static regOffsetToStr(view, index) {
        let roStr = '';

        const layout = view.getUint8(index);
        const iRegA = view.getUint8(index + 1);
        const iRegB = view.getUint8(index + 2);
        const imm32 = view.getUint32(index + 2, true);
        const imm16 = view.getUint16(index + 3, true);

        switch (layout) {
            case 0x4F:
                roStr = `[${Disassembler.regToStr(iRegA)}]`;
                break;
            case 0x2F:
                roStr = `[${Disassembler.regToStr(iRegA)} + ${imm32}]`;
                break;
            case 0xAF:
                roStr = `[${Disassembler.regToStr(iRegA)} - ${imm32}]`;
                break;
            case 0x1F:
                roStr = `[${Disassembler.regToStr(iRegA)} + ${Disassembler.regToStr(iRegB)} * ${imm16}]`;
                break;
            case 0x8F:
                roStr = `[${Disassembler.regToStr(iRegA)} - ${Disassembler.regToStr(iRegB)} * ${imm16}]`;
                break;
            default:
                console.error(`Unknown register offset layout ${layout} at address 0x${index.toString(16)}`);
                break;
        }

        return roStr;
    }

    getInstructions() {
        encoding.instructions.forEach((instr) => {
            instr.paramList.forEach((paramList) => {
                const op = paramList.opcode;
                const params = [];

                paramList.params.forEach((param) => {
                    let paramType = 0;
                    switch (param) {
                        case "iT":
                            paramType = InstrParam.INT_TYPE;
                            break;
                        case "fT":
                            paramType = InstrParam.FLOAT_TYPE;
                            break;
                        case "int":
                            paramType = InstrParam.GENERIC_INT;
                            break;
                        case "float":
                            paramType = InstrParam.GENERIC_FLOAT;
                            break;
                        case "iReg":
                            paramType = InstrParam.INT_REG;
                            break;
                        case "fReg":
                            paramType = InstrParam.FLOAT_REG;
                            break;
                        case "label":
                            paramType = InstrParam.ADDRESS;
                            break;
                        case "RO":
                            paramType = InstrParam.REG_OFFSET;
                            break;
                    }

                    if (paramType === InstrParam.INT_TYPE || paramType === InstrParam.FLOAT_TYPE) {
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
                                replacement = InstrParam.I8;
                                break;
                            case "i16":
                                replacement = InstrParam.I16;
                                break;
                            case "i32":
                                replacement = InstrParam.I32;
                                break;
                            case "i64":
                                replacement = InstrParam.I64;
                                break;
                            case "f32":
                                replacement = InstrParam.F32;
                                break;
                            case "f64":
                                replacement = InstrParam.F64;
                                break;
                        }

                        varParams.forEach((param, i) => {
                            switch (param) {
                                case InstrParam.GENERIC_INT:
                                    varParams[i] = replacement;
                                    break;
                                case InstrParam.GENERIC_FLOAT:
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

    disassemble() {
        // Find code section
        let codeSec = 0;
        for (let i = 0; i < this.SourceFile.Sections.length; i++) {
            const sec = this.SourceFile.Sections[i];
            if (sec.Type === 0x5) {
                codeSec = sec;
                break;
            }
        }

        if (codeSec === 0) {
            console.error('Error could not disassemle file. No code section found.');
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
                    case InstrParam.I8: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += val;
                        instrWidth += 1;
                    }
                        break;
                    case InstrParam.I16: {
                        const val = view.getUint16(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 2;
                    }
                        break;
                    case InstrParam.I32: {
                        const val = view.getUint32(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 4;
                    }
                        break;
                    case InstrParam.I64: {
                        const val = view.getBigUint64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParam.F32: {
                        const val = view.getFloat32(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 4;
                    }
                        break;
                    case InstrParam.F64: {
                        const val = view.getFloat64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParam.ADDRESS: {
                        const val = view.getBigUint64(cursor + instrWidth, true);
                        asm += val;
                        instrWidth += 8;
                    }
                        break;
                    case InstrParam.FLOAT_TYPE:
                    case InstrParam.INT_TYPE: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += Disassembler.typeToStr(val);
                        instrWidth += 1;
                    }
                        break;
                    case InstrParam.REG_OFFSET:
                        asm += Disassembler.regOffsetToStr(view, cursor + instrWidth);
                        instrWidth += 6;
                        break;
                    case InstrParam.INT_REG:
                    case InstrParam.FLOAT_REG: {
                        const val = view.getUint8(cursor + instrWidth);
                        asm += Disassembler.regToStr(val);
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
