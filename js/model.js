import { Disassembler, RegId } from './disassembler.js'
import { UIState } from './view.js'
import { SourceFile } from './sourceFile.js'
import * as Utils from './utils.js'

export const DebugOperation = {
  DBG_OPEN_DBG_SESS: 0x01,
  DBG_CLOSE_DBG_SESS: 0x02,
  DBG_SET_BREAKPNT: 0xB0,
  DBG_REMOVE_BREAKPNT: 0xB1,
  DBG_RUN_APP: 0xE0,
  DBG_NEXT_INSTR: 0xE1,
  DBG_CONTINUE_: 0xE2,
  DBG_STOP_EXE: 0xE3,
  DBG_GET_REGS: 0x10,
  DBG_ERROR: 0xEE,
  DBG_EXE_FIN: 0xFF,
}

const ErrorCodes = {
  0x1: 'ALREADY_IN_DEBUG_SESSION',
  0x2: 'NOT_IN_DEBUG_SESSION',
  0x3: 'RUNTIME_ERROR',
  0x4: 'FILE_FORMAT_ERROR',
  0x5: 'BREAKPOINT_ALREADY_SET',
  0x6: 'BREAKPOINT_NOT_EXISTING',
}

class Register {
	/**
	 * Constructs a new register
	 * @param {String} name Registers name
	 * @param {Number} name Registers id
	 */
  constructor(name, id) {
    this.Name = name;
    this.Id = id;
    this.Value = 0;
    this.HasChanged = false;
  }

	/**
	 * Sets the registers value
	 * @param {Nubmer} val
	 */
  setValue(val) {
    // Weak comparison because we need to compare float to int
    if (val == this.Value) {
      this.HasChanged = false;
    } else {
      this.HasChanged = true;
    }
    this.Value = val;
  }
}

export class DebugModel {
  /** Magics */
  static ResponseMagic = 0x4772c3bc657a6921n;
  static RequestMagic = 0x4772c3bc657a693fn;

  constructor() {
    this.Disasmbler = new Disassembler();
    /** Source file */
    this.SourceFile = null;
    this.SessOpen = false;
    this.Registers = {};
    this.Breakpoints = [];

    this.initRegisters();

    /** Checks if instruction database has already been initialized if not do so */
    if (Object.keys(Disassembler.Instructions).length === 0) {
      this.getInstructions();
    }
  }

	/**
	 * Sets the view
	 * @param {DebugView} view
	 */
  setView(view) {
    this.View = view;
  }

	/**
	 * Sets the source file
	 * @param {File} file
	 */
  async setSource(file) {
    const fileBuffer = await file.arrayBuffer();
    this.SourceFile = new SourceFile(new Uint8Array(fileBuffer));

    this.SourceFile.parse();
    this.View.displayFileInfo(this.SourceFile);

    this.Disasmbler.setSource(this.SourceFile);
    this.Disasmbler.disassemble();

    this.View.displayDisasm(this.Disasmbler.Disasm);
    this.View.setUIState(UIState.FILE_SELECTED);
  }

	/**
	 * Initializes registers
	 */
  initRegisters() {
    this.Registers[RegId.IP] = new Register('ip', RegId.IP);
    this.Registers[RegId.SP] = new Register('sp', RegId.SP);
    this.Registers[RegId.BP] = new Register('bp', RegId.BP);
    this.Registers[RegId.FL] = new Register('fl', RegId.FL);

    // General purpose registers
    for (let i = 0; i < 16; i++) {
      const id = 0x5 + i;
      this.Registers[id] = new Register(`r${i}`, id);
    }

    // Floating point registers
    for (let i = 0; i < 16; i++) {
      const id = 0x15 + i;
      this.Registers[id] = new Register(`f${i}`, id);
    }
  }

  /**
   * Reports a runtime error
   * @param {Number} err runtime error code
   */
  reportRuntimeError(err) {
    const errMsg = Utils.translateRuntimeError(err);
    this.View.debugConsole(`RUNTIME ERROR: ${errMsg}`);
    this.View.setUIState(UIState.FILE_SELECTED);
  }

	/**
     * Tries to open a debug session until successful
     */
  async openSession() {
    if (!this.SessOpen) {
      this.View.debugConsole('Trying to open debug session...');
      try {
        const op = await this.sendOperation(DebugOperation.DBG_OPEN_DBG_SESS, null);
        this.handleResponse(op);
      } catch (err) {
        console.log(err);
      }

      setTimeout(() => {
        this.openSession();
      }, 2000);
    }
  }

	/**
	 * Closes the currently open debug session
	 */
  closeSession() {
    if (this.SessOpen) {
      this.sendOperation(DebugOperation.DBG_CLOSE_DBG_SESS, null).then((res) => {
        this.handleResponse(res);
      });
      this.View.debugConsole('Closed debug session');
    }
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

      view.setBigUint64(0, DebugModel.RequestMagic);
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
      console.error('Response does not meet minimal response size to be valid');
      return;
    }

    const magic = resView.getBigUint64(0, true);

    if (magic !== DebugModel.ResponseMagic) {
      console.error('Response is missing magic');
      return;
    }

    const resOp = resView.getUint8(8);

    switch (resOp) {
      case DebugOperation.DBG_ERROR: {
        const errorCode = resView.getUint8(9);
        // Runtime error
        if (errorCode === 0x03) {
          const runtimeErr = resView.getUint8(10);
          this.reportRuntimeError(runtimeErr);
        } else {
          const errorMsg = ErrorCodes[errorCode];
          this.View.debugConsole(`Response error: ${errorMsg}`);
        }
        status = false;
      }
        break;
      case DebugOperation.DBG_EXE_FIN:
      case DebugOperation.DBG_GET_REGS:
      case DebugOperation.DBG_NEXT_INSTR: {
        const regBuffSize = 333;
        const regBuffer = res.slice(0, regBuffSize);
        const consoleBuffer = res.slice(regBuffSize, res.byteLength);
        this.setRegisters(regBuffer);
        this.View.consoleOut(consoleBuffer);

        if (resOp === DebugOperation.DBG_EXE_FIN) {
          this.View.setUIState(UIState.FILE_SELECTED);
          this.View.debugConsole('Finished execution');
        }
      }
        break;
      case DebugOperation.DBG_OPEN_DBG_SESS:
        this.View.setUIState(UIState.OPEN_SESS);
        this.View.debugConsole('Successfully opened debug session');
        this.SessOpen = true;
        break;
      case DebugOperation.DBG_CLOSE_DBG_SESS:
        this.View.setUIState(UIState.CLOSED_SES);
        break;
      case DebugOperation.DBG_RUN_APP:
      case DebugOperation.DBG_CONTINUE_:
        this.View.setUIState(UIState.APP_RUNNING);
        const regBuffSize = 36 * 9 + 9;
        const regBuffer = res.slice(0, regBuffSize);
        const consoleBuffer = res.slice(regBuffSize, res.byteLength);
        this.setRegisters(regBuffer);
        this.View.consoleOut(consoleBuffer);
        break;
      default:
        console.error(`Reponse contains unknown operation code: ${resOp}`);
        status = false;
        break;
    }

    return status;
  }

	/**
	 * Parses buffer and updates registers
	 * @param {ArrayBuffer} buffer Buffer containing registers
	 */
  setRegisters(buffer) {
    const resView = new DataView(buffer);
    const regEntrySize = 9;
    let cursor = 9;

    while (cursor < buffer.byteLength) {
      const regId = resView.getUint8(cursor);
      const regIntVal = resView.getBigUint64(cursor + 1, true);
      const regFloatVal = resView.getFloat64(cursor + 1);

      const reg = this.Registers[regId];

      if (regId >= 0 && regId <= 0x14) {
        reg.setValue(regIntVal);
      } else if (regId >= 0x15 && regId <= 0x24) {
        reg.setValue(regFloatVal);
      }

      cursor += regEntrySize;
    }
    this.View.updateRegisters(this.Registers);
  }

	/**
	 * Adds a new breakpoint if it not already exists otherwise removes it
	 * @param {Number} breakpointId
	 */
  toggleBreakpoint(breakpointId) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, breakpointId, true);

    if (this.Breakpoints.includes(breakpointId)) {
      const bpIndex = this.Breakpoints.indexOf(breakpointId);
      this.Breakpoints.splice(bpIndex, 1);
      this.sendOperation(DebugOperation.DBG_REMOVE_BREAKPNT, buffer);
    } else {
      this.Breakpoints.push(breakpointId);
      this.sendOperation(DebugOperation.DBG_SET_BREAKPNT, buffer);
    }
  }
}
