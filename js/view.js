import { formatVAddr } from './utils.js';
import { RegId } from './disassembler.js';

export const UIState = {
  CLOSED_SES: 0,
  OPEN_SESS: 1,
  APP_RUNNING: 2,
  FILE_SELECTED: 3,
  APP_STOPED: 4,
}

export class DebugView {
  constructor() {
    this.Elem = {};
    this.CurrentInstrElem = null;
    this.getElements();
  }

	/**
	 * Gets all HTML element references
	 */
  getElements() {
    this.Elem.dbgConsole = document.getElementsByClassName('console-output')[0];
    this.Elem.regTableBody = document.getElementsByClassName('reg-table-body')[0];
    this.Elem.nextBtn = document.getElementsByClassName('next-btn')[0];
    this.Elem.contBtn = document.getElementsByClassName('cont-btn')[0];
    this.Elem.startBtn = document.getElementsByClassName('start-btn')[0];
    this.Elem.stopBtn = document.getElementsByClassName('stop-btn')[0];
    this.Elem.closeDbgSessBtn = document.getElementsByClassName('close-btn')[0];
    this.Elem.fileUploadBtn = document.getElementsByClassName('upload-btn')[0];
    this.Elem.disasmOutput = document.getElementsByClassName('disasm-output')[0];
    this.Elem.asmLineTemp = document.getElementsByClassName('asm-line-template')[0];
  }

	/**
	 * Outputs a message to the debug console
	 * @param {String} msg
	 */
  debugConsole(msg) {
    this.Elem.dbgConsole.value += `[Debug] ${msg}\n`;
  }

	/**
	 * Sets the toolbar UI state
	 * @param {ToolbarState} state
	 */
  setUIState(state) {
    switch (state) {
      case UIState.CLOSED_SES:
        this.Elem.closeDbgSessBtn.disabled = true;
        this.Elem.fileUploadBtn.disabled = true;
        this.Elem.startBtn.disabled = true;
        this.Elem.stopBtn.disabled = true;
        this.Elem.nextBtn.disabled = true;
        this.Elem.contBtn.disabled = true;
        break;
      case UIState.OPEN_SESS:
        this.Elem.closeDbgSessBtn.disabled = false;
        this.Elem.fileUploadBtn.disabled = false;
        this.Elem.startBtn.disabled = true;
        this.Elem.stopBtn.disabled = true;
        this.Elem.nextBtn.disabled = true;
        this.Elem.contBtn.disabled = true;

        if (this.CurrentInstrElem) {
          this.CurrentInstrElem.classList.toggle('asm-line--active', false);
        }
        break;
      case UIState.FILE_SELECTED:
        this.Elem.closeDbgSessBtn.disabled = false;
        this.Elem.fileUploadBtn.disabled = false;
        this.Elem.startBtn.disabled = false;
        this.Elem.stopBtn.disabled = true;
        this.Elem.nextBtn.disabled = true;
        this.Elem.contBtn.disabled = true;

        if (this.CurrentInstrElem) {
          this.CurrentInstrElem.classList.toggle('asm-line--active', false);
        }
        break;
      case UIState.APP_RUNNING:
        this.Elem.closeDbgSessBtn.disabled = false;
        this.Elem.fileUploadBtn.disabled = false;
        this.Elem.startBtn.disabled = true;
        this.Elem.stopBtn.disabled = false;
        this.Elem.nextBtn.disabled = false;
        this.Elem.contBtn.disabled = false;
        break;
    }
  }

	/**
	 * Displays information about a parsed source file
	 * @param {SourceFile} src
	 */
  displayFileInfo(src) {
    // Header information
    const info = document.getElementsByClassName('ux-header-body')[0];
    const sections = document.getElementsByClassName('ux-sec-table-body')[0];
    const secNames = document.getElementsByClassName('ux-sec-name-table-body')[0];

    info.innerHTML = '';
    sections.innerHTML = '';
    secNames.innerHTML = '';

    info.innerHTML += `
    <tr>
        <td>Magic</td>
        <td>0x${src.Magic.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Version</td>
        <td>0x${src.Version.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Mode</td>
        <td>0x${src.Mode.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Start Address</td>
        <td>${formatVAddr(src.StartAddr)}</td>
    </tr>
    `;

    // Section table
    src.Sections.forEach((sec) => {
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
    src.SectionNames.forEach((name) => {
      secNames.innerHTML += `
        <tr>
            <td>${formatVAddr(name.Addr)}</td>
            <td>0x${name.Size.toString(16).toUpperCase()}</td>
            <td>${name.Str}</td>
        </tr>
        `;
    });
  }

	/**
	 * Displays disassembled instructions
	 * @param {DisasmInstr[]} disasm
	 */
  displayDisasm(disasm) {
    const template = this.Elem.asmLineTemp.content;
    const frag = document.createDocumentFragment();
    const maxLineNumberWidth = disasm.length.toString(10).length * 20;
    const maxAddrLineWidth = disasm[disasm.length - 1].Addr.toString(16).length;

    this.Elem.disasmOutput.innerHTML = '';
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

    this.Elem.disasmOutput.appendChild(frag);
  }

	/**
    * Updates the flags display
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
	 * Updates the UI to indicate the current instruction
	 * @param {BigInt} ip Instruction pointer
	 */
  setCurrentInstruction(ip) {
    if (this.CurrentInstrElem) {
      this.CurrentInstrElem.classList.toggle('asm-line--active', false);
    }
    this.CurrentInstrElem = document.getElementById(`asm-${Number(ip)}`);
    this.CurrentInstrElem.scrollIntoView(true);
    this.CurrentInstrElem.classList.toggle('asm-line--active', true);
  }

	/**
	 * Updates the register display
	 * @param {Registers[]} regs
	 */
  updateRegisters(regs) {
    const temp = document.getElementsByClassName('register-template')[0].content;
    const frag = document.createDocumentFragment();

    this.Elem.regTableBody.innerHTML = '';
    Object.values(regs).forEach((reg) => {
      const node = temp.cloneNode(true);

      node.querySelector('.register__id').textContent = reg.Name;
      node.querySelector('.register__value').textContent = formatVAddr(reg.Value);

      if (reg.HasChanged) {
        node.querySelector('.register').classList.add('register--changed');
      }

      if (reg.Id === RegId.FL) {
        this.setFlags(reg.Value);
      }

      node.querySelector('.register__typed-value').textContent = reg.Value;

      frag.appendChild(node);
    })
    this.Elem.regTableBody.appendChild(frag);
    this.setCurrentInstruction(regs[RegId.IP].Value);
  }

	/**
	 * Output array buffer received from UVM
	 * @param {ArrayBuffer} buff
	 */
  consoleOut(buff) {
    const consoleElem = document.getElementsByClassName('console-output')[0];
    const decoder = new TextDecoder('utf8');
    consoleElem.value += decoder.decode(buff);
  }
}
