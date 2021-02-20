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

    let modeStr = 'Unkown';
    switch (src.Mode) {
      case 0x1:
        modeStr = 'Release';
        break;
      case 0x2:
        modeStr = 'Debug';
        break;
    }

    this.Elem.info.innerHTML += `
    <tr>
        <td>Magic</td>
        <td class="mono">0x${src.Magic.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Version</td>
        <td class="mono">0x${src.Version.toString(16).toUpperCase()}</td>
    </tr>
    <tr>
        <td>Mode</td>
        <td><span class="mono">0x${src.Mode.toString(16).toUpperCase()}</span> (${modeStr})</td>
    </tr>
    <tr>
        <td>Start Address</td>
        <td class="mono">${formatVAddr(src.StartAddr)}</td>
    </tr>
    `;

    // Section table
    src.Sections.forEach((sec) => {
      let typeStr = 'Unknown';
      switch (sec.Type) {
        case 0x1:
          typeStr = 'SEC_NAME_STRINGS';
          break;
        case 0x2:
          typeStr = 'SEC_META_DATA';
          break;
        case 0x3:
          typeStr = 'SEC_DEBUG';
          break;
        case 0x4:
          typeStr = 'SEC_STATIC';
          break;
        case 0x5:
          typeStr = 'SEC_GLOBAL';
          break;
        case 0x6:
          typeStr = 'SEC_CODE';
          break;
      }

      let permStr = '';
      if ((sec.Perms & 0b10000000) > 0) {
        permStr += 'r';
      } else {
        permStr += '-';
      }

      if ((sec.Perms & 0b01000000) > 0) {
        permStr += 'w';
      } else {
        permStr += '-';
      }

      if ((sec.Perms & 0b00100000) > 0) {
        permStr += 'x';
      } else {
        permStr += '-';
      }

      this.Elem.sections.innerHTML += `
        <tr>
            <td><span class="mono">0x${sec.Type.toString(16).toUpperCase()}</span> (${typeStr})</td>
            <td class="mono">0x${sec.Perms.toString(16).toUpperCase()} [${permStr}]</td>
            <td class="mono">${formatVAddr(sec.StartAddr)}</td>
            <td class="mono">0x${sec.Size.toString(16).toUpperCase()}</td>
            <td class="mono">${formatVAddr(sec.NameAddr)}</td>
        </tr>
        `;
    });

    // Section name table
    src.SectionNames.forEach((name) => {
      this.Elem.secNames.innerHTML += `
        <tr>
            <td class="mono">${formatVAddr(name.Addr)}</td>
            <td class="mono">0x${name.Size.toString(16).toUpperCase()}</td>
            <td>${name.Str}</td>
        </tr>
        `;
    });
  }
}
