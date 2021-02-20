import { DebugOperation } from './model.js'
import { UIState } from './views/debugView.js'
import { InfoView } from './views/infoView.js';

export class DebugController {
	/**
	 * Constructs a new DebugController
	 * @param {DebugModel} model
	 * @param {DebugView} dbgView
	 * @param {InfoView} infoView
	 */
  constructor(model, dbgView, infoView) {
    /** Model */
    this.Model = model;
    /** Views */
    this.DbgView = dbgView;
    this.InfoView = infoView;

    this.Model.setViews(this.DbgView, this.InfoView);
    this.setupEventHandlers();

    this.Model.openSession();
  }

	/**
	 * Sets up all event handlers
	 */
  setupEventHandlers() {
    this.DbgView.Elem.fileUploadBtn.addEventListener('change', (e) => { this.uploadFile(e, this) });
    this.DbgView.Elem.startBtn.addEventListener('click', (e) => { this.startExecution(e, this) });
    this.DbgView.Elem.nextBtn.addEventListener('click', (e) => { this.nextInstruction(e, this) });
    this.DbgView.Elem.stopBtn.addEventListener('click', (e) => { this.stopExecution(e, this) });
    this.DbgView.Elem.contBtn.addEventListener('click', (e) => { this.continueToBreakpoint(e, this) });
    this.DbgView.Elem.disasmOutput.addEventListener('click', (e) => { this.toggleBreakpoint(e, this) });
    this.DbgView.Elem.closeDbgSessBtn.addEventListener('click', (e) => { this.Model.closeSession() });
  }

	/**
	 * Handles file upload event
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  uploadFile(event, ctrl) {
    const file = ctrl.DbgView.Elem.fileUploadBtn.files[0];
    if (file) {
      ctrl.Model.setSource(file);
    }
  }

	/**
	 * Starts the execution of the file
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  async startExecution(event, ctrl) {
    // TODO: Only works if file has been uploaded
    const fileBuffSize = ctrl.Model.SourceFile.FileBuffer.byteLength;
    const buffSize = 4 + fileBuffSize;
    const buff = new Uint8Array(buffSize);
    const view = new DataView(buff.buffer);

    view.setUint32(0, fileBuffSize, true);
    buff.set(ctrl.Model.SourceFile.FileBuffer, 4);

    const req = await ctrl.Model.sendOperation(DebugOperation.DBG_RUN_APP, buff);
    ctrl.Model.handleResponse(req);
  };

	/**
	 * Starts the execution of the file
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  async nextInstruction(event, ctrl) {
    const regArray = await ctrl.Model.sendOperation(DebugOperation.DBG_NEXT_INSTR);
    ctrl.Model.handleResponse(regArray);
  }

	/**
	 * Stops the execution of the file
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  stopExecution(event, ctrl) {
    ctrl.Model.sendOperation(DebugOperation.DBG_STOP_EXE);
    ctrl.DbgView.setUIState(UIState.FILE_SELECTED);
  }

	/**
	 * Continues to execute the file until a breakpoint is hit, runtime error occured or application is finished
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  continueToBreakpoint(event, ctrl) {
    ctrl.Model.sendOperation(DebugOperation.DBG_CONTINUE_).then((res) => {
      ctrl.Model.handleResponse(res);
    });
  }

	/**
	 * Toggles a breakpoint
	 * @param {Event} event
	 * @param {DebugController} ctrl
	 */
  toggleBreakpoint(event, ctrl) {
    if (event.target.classList.contains('asm-line__breakpoint')) {
      const id = event.target.parentNode.id;
      event.target.classList.toggle('asm-line__breakpoint--active');

      const bpAddr = BigInt(id.replace('asm-', ''));
      ctrl.Model.toggleBreakpoint(bpAddr);
    }
  }
}
