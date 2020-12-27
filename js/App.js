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

import { SourceFile } from "./SourceFile.js";
import { Disassembler } from "./Disassembler.js"

const DebugOperation = {
    OPEN_DBG_SESS: 0xD0,
    CLOSE_DBG_SESS: 0xDC,
    NEXT_INSTR: 0xA0,
    GET_REGISTERS: 0xD2,
}

const RegId = {
    IP: 1,
    SP: 2,
    BP: 3,
    FL: 4,
}

class Application {
    Source = null;
    Disasm = null;

    static ResponseMagic = 0x4772c3bc657a6921n;
    static RequestMagic = 0x4772c3bc657a693fn;

    Registers = {};
    CurrentInstrElem = null;

    constructor() { }

    /**
     *
     * @param {File} file
     */
    async handleFileUpload(file) {
        const fileBuffer = await file.arrayBuffer();
        App.Source = new SourceFile(new Uint8Array(fileBuffer));

        App.Source.parse();
        displayFileInfo();

        App.Disasm = new Disassembler(App.Source);
        App.Disasm.disassemble();
        displayDisasm(App.Disasm.Disasm);
        App.openSession();
    }

    updateCurrentInstruction() {
        if (this.CurrentInstrElem) {
            this.CurrentInstrElem.classList.toggle('asm-line--active', false);
        }
        const ip = Number(this.Registers[RegId.IP]);
        this.CurrentInstrElem = document.getElementById(`asm-${ip}`);
        this.CurrentInstrElem.scrollIntoView(true);
        this.CurrentInstrElem.classList.toggle('asm-line--active', true);
    }

    consoleOut(buff) {
        const consoleElem = document.getElementsByClassName('console-output')[0];
        const decoder = new TextDecoder('utf8');
        consoleElem.value += decoder.decode(buff);
    }

    /**
     *
     * @param {ArrayBuffer} regBuffer
     */
    updateRegisters(regBuffer) {
        const resView = new DataView(regBuffer);
        const regEntrySize = 9;
        let cursor = 9;

        regTableBody.innerHTML = '';
        const frag = document.createDocumentFragment();
        while (cursor < regBuffer.byteLength) {
            const regId = resView.getUint8(cursor);
            const regVal = resView.getBigUint64(cursor + 1, true);

            const tr = document.createElement('tr');
            const tdId = document.createElement('td');
            const tdVal = document.createElement('td');
            tr.appendChild(tdId);
            tr.appendChild(tdVal);

            tdId.textContent = regId;
            tdVal.textContent = `0x${regVal.toString(16).padStart(16, '0').toUpperCase()}`;

            if (this.Registers[regId] !== regVal) {
                this.Registers[regId] = regVal;
                tr.classList.add('register--changed');
            }

            if (regId === RegId.FL) {
                this.setFlags(regVal);
            }

            frag.appendChild(tr);
            cursor += regEntrySize;
        }
        regTableBody.appendChild(frag);
    }

    async sendOperation(op) {
        return new Promise((resolve, reject) => {
            const magic = 0x4772c3bc657a693fn; // Grüezi?

            const buffSize = 9;
            const buff = new Uint8Array(buffSize);
            const view = new DataView(buff.buffer);

            view.setBigUint64(0, magic);
            view.setUint8(8, op);

            fetch('http://127.0.0.1:2001', {
                method: 'POST',
                body: buff
            }).then((res) => {
                res.arrayBuffer().then((buff) => {
                    resolve(buff);
                })
            }).catch((err) => {
                reject(err);
            })
        })
    }

    /**
     * Handles a HTTP response from the server
     * @param {ArrayBuffer} res
     */
    handleResponse(res) {
        const resView = new DataView(res);

        // Check if minimal response size is met
        if (res.byteLength < 9) {
            console.error("Response does not meet minimal response size to be valid");
            return;
        }

        const magic = resView.getBigUint64(0, true);

        if (magic !== Application.ResponseMagic) {
            console.error("Response is missing magic");
            return;
        }

        const resOp = resView.getUint8(8);
        switch (resOp) {
            case DebugOperation.GET_REGISTERS:
            case DebugOperation.NEXT_INSTR: {
                // 0x25 regs * 9 bytes (1 byte reg id + 8 byte reg value) * 8 bytes magic + 1 byte op
                const regBuffSize = 36 * 9 + 9;
                const regBuffer = res.slice(0, regBuffSize);
                const consoleBuffer = res.slice(regBuffSize, res.byteLength);
                this.updateRegisters(regBuffer);
                this.consoleOut(consoleBuffer);
                this.updateCurrentInstruction();
            }
                break;
            case DebugOperation.OPEN_DBG_SESS:
                setToolbarMode(true);
                break;
            case DebugOperation.CLOSE_DBG_SESS:
                setToolbarMode(false);
                break;
            default:
                console.error("Reponse contains unknown operation code");
                return;
                break;
        }
    }

    async requestHandshake() {
        return new Promise((resolve, reject) => {
            const encoder = new TextEncoder('utf-8');
            const magic = 0x4772c3bc657a693fn; // Grüezi?
            const operation = DebugOperation.OPEN_DBG_SESS;

            const filePath = "/tmp/";
            const filePathSize = filePath.length;

            const buffSize = 8 + 1 + 4 + filePathSize + 4 + App.Source.FileBuffer.length;
            const buff = new Uint8Array(buffSize);
            const view = new DataView(buff.buffer);

            view.setBigUint64(0, magic);
            view.setUint8(8, operation);
            view.setUint32(9, filePathSize, true);
            buff.set(encoder.encode(filePath), 13);
            view.setUint32(13 + filePathSize, App.Source.FileBuffer.length, true);
            buff.set(App.Source.FileBuffer, 13 + filePathSize + 4);

            fetch('http://127.0.0.1:2001', {
                method: 'POST',
                body: buff
            }).then((res) => {
                res.arrayBuffer().then((buff) => {
                    resolve(buff);
                })
            }).catch((err) => {
                reject(err);
            })
        });
    }

    openSession() {
        this.requestHandshake().then((res) => {
            // Errors ???
            this.handleResponse(res);
            this.sendOperation(DebugOperation.GET_REGISTERS).then((regsRes) => {
                this.handleResponse(regsRes);
            });
        });
    }

    /**
     *
     * @param {BigInteger} flagReg
     */
    setFlags(flagReg) {
        const flagsTableBody = document.getElementsByClassName('flags-table-body')[0];
        const clearMask = 1;
        // Extract flag bits
        const carry = Number(flagReg >> 63n) & clearMask;
        const zero = Number(flagReg >> 62n) & clearMask;
        const sign = Number(flagReg >> 61n) & clearMask;

        flagsTableBody.innerHTML = `
        <tr>
            <td>${carry}</td>
            <td>${zero}</td>
            <td>${sign}</td>
        </tr>
        `;
    }
}

const App = new Application();

const regTableBody = document.getElementsByClassName('reg-table-body')[0];
const nextBtn = document.getElementsByClassName('next-btn')[0];
const contBtn = document.getElementsByClassName('cont-btn')[0];
const stopBtn = document.getElementsByClassName('stop-btn')[0];

function setToolbarMode(state) {
    if (state) {
        nextBtn.disabled = false;
        stopBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
        stopBtn.disabled = true;
    }
}

function intToVAddr(int) {
    return int.toString(16).toUpperCase().padStart(8, '0');
}

function displayFileInfo() {
    // Header information
    const info = document.getElementsByClassName('ux-header-body')[0];
    const sections = document.getElementsByClassName('ux-sec-table-body')[0];
    const secNames = document.getElementsByClassName('ux-sec-name-table-body')[0];

    info.innerHTML += `
    <tr>
        <td>Magic</td>
        <td>0x${App.Source.Magic.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Version</td>
        <td>0x${App.Source.Version.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Mode</td>
        <td>0x${App.Source.Mode.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Start Address</td>
        <td>0x${intToVAddr(App.Source.StartAddr)}</td>
    </tr>
    `;

    // Section table
    App.Source.Sections.forEach((sec) => {
        sections.innerHTML += `
        <tr>
            <td>0x${sec.Type.toString(16).toUpperCase()}</td>
            <td>0x${sec.Perms.toString(16).toUpperCase()}</td>
            <td>0x${intToVAddr(sec.StartAddr)}</td>
            <td>0x${sec.Size.toString(16).toUpperCase()}</td>
            <td>0x${intToVAddr(sec.NameAddr)}</td>
        </tr>
        `;
    });

    // Section name table
    App.Source.SectionNames.forEach((name) => {
        secNames.innerHTML += `
        <tr>
            <td>0x${intToVAddr(name.Addr)}</td>
            <td>0x${name.Size.toString(16).toUpperCase()}</td>
            <td>${name.Str}</td>
        </tr>
        `;
    });
}
// =================== //
//   EVENT LISTENERS
// =================== //

const disasmOutput = document.getElementsByClassName('disasm-output')[0];
function displayDisasm(disasm) {
    disasm.forEach((line) => {
        disasmOutput.innerHTML += `<span id="asm-${line.Addr}" class="asm-line">${line.Asm}</span>`;
    });
}

const fileInputElem = document.getElementsByClassName('file-input')[0];
fileInputElem.addEventListener('change', async () => {
    const file = fileInputElem.files[0];
    if (file) {
        App.handleFileUpload(file);
    }
});

nextBtn.addEventListener('click', async () => {
    const regArray = await App.sendOperation(DebugOperation.NEXT_INSTR);
    App.handleResponse(regArray);
});

stopBtn.addEventListener('click', () => {
    App.sendOperation(DebugOperation.CLOSE_DBG_SESS);
    setToolbarMode(false);
});
