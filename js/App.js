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
    OPEN_DBG_SESS: 0x01,
    CLOSE_DBG_SESS: 0x02,
    DBG_OPEN_DBG_SESS: 0x01,
    DBG_CLOSE_DBG_SESS: 0x02,
    DBG_SET_BREAKPNT: 0xB0,
    DBG_REMOVE_BREAKPNT: 0xB1,
    DBG_RUN_APP: 0xE0,
    DBG_NEXT_INSTR: 0xE1,
    DBG_CONTINUE_: 0xE2,
    DBG_GET_REGS: 0x10,
    DBG_ERROR: 0xEE,
    DBG_EXE_FIN: 0xFF,
}

const RegId = {
    IP: 1,
    SP: 2,
    BP: 3,
    FL: 4,
}

const ErrorCodes = {
    0x1: 'ALREADY_IN_DEBUG_SESSION',
    0x2: 'NOT_IN_DEBUG_SESSION',
    0x3: 'RUNTIME_ERROR',
    0x4: 'FILE_FORMAT_ERROR',
    0x5: 'BREAKPOINT_ALREADY_SET',
    0x6: 'BREAKPOINT_NOT_EXISTING',
}

/**
 * Outputs a message to the debug console
 * @param {String} msg
 */
function debugConsole(msg) {
    const dbgConsole = document.getElementsByClassName('console-output')[0];
    dbgConsole.value += `[Debug] ${msg}\n`;
}

class Application {

    static ResponseMagic = 0x4772c3bc657a6921n;
    static RequestMagic = 0x4772c3bc657a693fn;

    Source = null;
    Disasm = null;
    Registers = {};
    CurrentInstrElem = null;
    Breakpoints = [];
    #SessOpen = false;

    constructor() {
        this.openSession();
    }

    /**
     * Tries to open a debug session until successful
     */
    async openSession() {
        if (!this.#SessOpen) {
            debugConsole('Trying to open debug session...');
            const op = await this.sendOperation(DebugOperation.OPEN_DBG_SESS, null);
            const res = this.handleResponse(op);
            if (res) {
                debugConsole('Successfully opened debug session');
                this.#SessOpen = true;
            } else {
                debugConsole('Failed to open debug session');
            }

            setTimeout(() => {
                this.openSession();
            }, 5000);
        }
    }

    /**
     * Closes the currently open debug session
     */
    closeSession() {
        if (this.#SessOpen) {
            this.sendOperation(DebugOperation.CLOSE_DBG_SESS, null).then((res) => {
                this.handleResponse(res);
            });
            debugConsole('Closed debug session');
        }
    }

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

        const temp = document.getElementsByClassName('register-template')[0].content;
        const frag = document.createDocumentFragment();

        regTableBody.innerHTML = '';
        while (cursor < regBuffer.byteLength) {
            const regId = resView.getUint8(cursor);
            const regIntVal = resView.getBigUint64(cursor + 1, true);
            const regFloatVal = resView.getFloat64(cursor + 1);

            const node = temp.cloneNode(true);

            node.querySelector('.register__id').textContent = formatRegId(regId);
            node.querySelector('.register__value').textContent = formatVAddr(regIntVal);

            if (this.Registers[regId] !== regIntVal) {
                this.Registers[regId] = regIntVal;
                node.querySelector('.register').classList.add('register--changed');
            }

            if (regId === RegId.FL) {
                this.setFlags(regIntVal);
            }

            if (regId >= 0 && regId <= 0x14) {
                node.querySelector('.register__typed-value').textContent = regIntVal;
            } else if (regId >= 0x15 && regId <= 0x24) {
                node.querySelector('.register__typed-value').textContent = regFloatVal;
            }

            frag.appendChild(node);
            cursor += regEntrySize;
        }
        regTableBody.appendChild(frag);
    }

    /**
     * Sends an operation to the debug server
     * @param {DebugOperation} op
     * @param {ArrayBuffer|null} body
     * @return {Promise}
     */
    async sendOperation(op, body) {
        return new Promise((resolve, reject) => {
            let buffSize = 9;
            // If body is given add its size to the total buffer size
            if (body) {
                buffSize += body.byteLength;
            }
            // If body is given copy its content to the request body buffer
            const buff = new Uint8Array(buffSize);
            if (body) {
                const tmpBuff = new Uint8Array(body);
                buff.set(tmpBuff, 9);
            }
            const view = new DataView(buff.buffer);

            view.setBigUint64(0, Application.RequestMagic);
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
     * @return {bool}
     */
    handleResponse(res) {
        let status = true;
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
            case DebugOperation.DBG_ERROR: {
                const error = ErrorCodes[resView.getUint8(9)];
                debugConsole(`Response error: ${error}`);
                status = false;
            }
                break;
            case DebugOperation.DBG_GET_REGS:
            case DebugOperation.DBG_NEXT_INSTR: {
                // 0x25 regs * 9 bytes (1 byte reg id + 8 byte reg value) * 8 bytes magic + 1 byte op
                const regBuffSize = 36 * 9 + 9;
                const regBuffer = res.slice(0, regBuffSize);
                const consoleBuffer = res.slice(regBuffSize, res.byteLength);
                this.updateRegisters(regBuffer);
                this.consoleOut(consoleBuffer);
                this.updateCurrentInstruction();
            }
                break;
            case DebugOperation.DBG_OPEN_DBG_SESS:
                setToolbarMode(true);
                break;
            case DebugOperation.DBG_CLOSE_DBG_SESS:
                setToolbarMode(false);
                break;
            case DebugOperation.DBG_CONTINUE_:
                const regBuffSize = 36 * 9 + 9;
                const regBuffer = res.slice(0, regBuffSize);
                const consoleBuffer = res.slice(regBuffSize, res.byteLength);
                this.updateRegisters(regBuffer);
                this.consoleOut(consoleBuffer);
                this.updateCurrentInstruction();
                break;
            default:
                console.error("Reponse contains unknown operation code");
                status = false;
                break;
        }

        return status;
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

    /**
     * Adds a new breakpoint if it not already exists otherwise removes it
     * @param {String} breakpointId
     */
    toggleBreakpoint(breakpointId) {
        const bpAddr = BigInt(breakpointId.replace('asm-', ''));
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setBigUint64(0, bpAddr, true);

        if (this.Breakpoints.includes(bpAddr)) {
            const bpIndex = this.Breakpoints.indexOf(bpAddr);
            this.Breakpoints.splice(bpIndex, 1);
            this.sendOperation(DebugOperation.REMOVE_BREAKPOINT, buffer);
        } else {
            this.Breakpoints.push(bpAddr);
            this.sendOperation(DebugOperation.SET_BREAKPOINT, buffer);
        }
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
        contBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
        stopBtn.disabled = true;
        contBtn.disabled = true;
    }
}

/**
 * Formats an integer to a 64-bit address string
 * @param {BigInt|Number} int
 * @return {String}
 */
function formatVAddr(int) {
    return `0x${int.toString(16).toUpperCase().padStart(16, '0')}`;
}

/**
 * Formats a decimal register id to the corresponding register name
 * @param {Number} id
 * @return {String}
 */
function formatRegId(id) {
    let regName = '';
    if (id === 1) {
        regName = 'ip';
    } else if (id === 2) {
        regName = 'sp';
    } else if (id === 3) {
        regName = 'bp';
    } else if (id === 4) {
        regName = 'fl';
    } else if (id >= 0x5 && id <= 0x14) {
        regName = `r${(id - 0x5).toString(10)}`;
    } else if (id >= 0x15 && id <= 0x24) {
        regName = `f${(id - 0x15).toString(10)}`;
    }
    return regName;
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
        <td>${formatVAddr(App.Source.StartAddr)}</td>
    </tr>
    `;

    // Section table
    App.Source.Sections.forEach((sec) => {
        sections.innerHTML += `
        <tr>
            <td>0x${sec.Type.toString(16).toUpperCase()}</td>
            <td>0x${sec.Perms.toString(16).toUpperCase()}</td>
            <td>${formatVAddr(sec.StartAddr)}</td>
            <td>0x${sec.Size.toString(16).toUpperCase()}</td>
            <td>${formatVAddr(sec.NameAddr)}</td>
        </tr>
        `;
    });

    // Section name table
    App.Source.SectionNames.forEach((name) => {
        secNames.innerHTML += `
        <tr>
            <td>${formatVAddr(name.Addr)}</td>
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
    const template = document.getElementsByClassName('asm-line-template')[0].content;
    const frag = document.createDocumentFragment();
    const maxLineNumberWidth = disasm.length.toString(10).length * 20;
    const maxAddrLineWidth = disasm[disasm.length - 1].Addr.toString(16).length;

    disasmOutput.innerHTML = '';
    disasm.forEach((line, i) => {
        const asmLine = template.cloneNode(true);
        const addr = line.Addr.toString(16).padStart(maxAddrLineWidth, '0');

        asmLine.querySelector('.asm-line').id = `asm-${line.Addr}`;
        asmLine.querySelector('.asm-line__line-number').textContent = i + 1;
        asmLine.querySelector('.asm-line__line-number').style.width = `${maxLineNumberWidth}px`;
        asmLine.querySelector('.asm-line__address').textContent = `0x${addr}`;
        asmLine.querySelector('.asm-line__content').textContent = line.Asm;
        frag.appendChild(asmLine);
    });

    disasmOutput.appendChild(frag);
}

const fileUploadBtn = document.getElementsByClassName('upload-btn')[0];
fileUploadBtn.addEventListener('change', async () => {
    const file = fileUploadBtn.files[0];
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

contBtn.addEventListener('click', () => {
    App.sendOperation(DebugOperation.CONTINUE).then((res) => {
        App.handleResponse(res);
    });
});

disasmOutput.addEventListener('click', (event) => {
    if (event.target.classList.contains('asm-line__breakpoint')) {
        const id = event.target.parentNode.id;
        event.target.classList.toggle('asm-line__breakpoint--active');
        App.toggleBreakpoint(id);
    }
});

const nav = document.getElementsByTagName('nav')[0];
nav.addEventListener('click', (event) => {
    const closest = event.target.closest('.nav__btn');
    if (closest) {
        const navs = document.getElementsByClassName('nav__btn');
        const pages = document.getElementsByClassName('page');
        const { page } = closest.dataset;

        for (let i = 0; i < pages.length; i++) {
            const pageElem = pages[i];
            if (pageElem.dataset.page === page) {
                pageElem.classList.toggle('page--active', true);
            } else {
                pageElem.classList.toggle('page--active', false);
            }
        }

        for (let i = 0; i < navs.length; i++) {
            const navElem = navs[i];
            if (navElem.dataset.page === page) {
                navElem.classList.toggle('nav__btn--active', true);
            } else {
                navElem.classList.toggle('nav__btn--active', false);
            }
        }
    }
});

const closeDbgSessBtn = document.getElementsByClassName('close-btn')[0];
closeDbgSessBtn.addEventListener('click', () => {
    App.closeSession();
});
