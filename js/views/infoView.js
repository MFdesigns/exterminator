import { formatVAddr } from '../utils.js';

export class InfoView {
  constructor() {
    this.Elem = {};
    this.getElements();
  }

  /**
   * Gets all HTML element references
   */
  getElements() {
    this.Elem.info = document.getElementsByClassName('ux-header-body')[0];
    this.Elem.sections = document.getElementsByClassName('ux-sec-table-body')[0];
    this.Elem.secNames = document.getElementsByClassName('ux-sec-name-table-body')[0];
  }

  /**
   * Displays information about a parsed source file
   * @param {SourceFile} src
   */
  displayFileInfo(src) {
    // Header information

    this.Elem.info.innerHTML = '';
    this.Elem.sections.innerHTML = '';
    this.Elem.secNames.innerHTML = '';

    this.Elem.info.innerHTML += `
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
      this.Elem.sections.innerHTML += `
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
      this.Elem.secNames.innerHTML += `
        <tr>
            <td>${formatVAddr(name.Addr)}</td>
            <td>0x${name.Size.toString(16).toUpperCase()}</td>
            <td>${name.Str}</td>
        </tr>
        `;
    });
  }
}
