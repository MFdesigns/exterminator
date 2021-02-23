class Section {
  /**
   * Constructs a new Section
   * @param {Number} type
   * @param {Number} perms
   * @param {BigInt} startAddr
   * @param {Number} size
   * @param {BigInt} nameAddr
   */
  constructor(type, perms, startAddr, size, nameAddr) {
    this.Type = type;
    this.Perms = perms;
    this.StartAddr = startAddr;
    this.Size = size;
    this.NameAddr = nameAddr;
  }
}

class SectionName {
  /**
   * Constructs a new SectionName
   * @param {BigInt} addr
   * @param {Number} size
   * @param {String} str
   */
  constructor(addr, size, str) {
    this.Addr = addr;
    this.Size = size;
    this.Str = str;
  }
}

export class SourceFile {
  /**
   * Constructs a new SourceFile
   * @param {Uint8Array} file
   */
  constructor(file) {
    this.FileBuffer = file;
    this.Magic = 0;
    this.Version = 0;
    this.Mode = 0;
    this.StartAddr = 0;
    this.SecTableSize = 0;
    this.Sections = [];
    this.SectionNames = [];
    this.Encoder = new TextEncoder('utf-8');
    this.Decoder = new TextDecoder('utf-8');
  }

  /**
   * Parses source file
   */
  parse() {
    const view = new DataView(this.FileBuffer.buffer);

    // Parse header
    this.Magic = view.getUint32(0, true);
    this.Version = this.FileBuffer[4];
    this.Mode = this.FileBuffer[5];
    this.StartAddr = view.getBigUint64(8, true);

    // Parse section table
    this.SecTableSize = view.getUint32(0x60, true);
    const secTableEntrySize = 0x16
    const secTableEntryCount = this.SecTableSize / secTableEntrySize;

    let cursor = 0x64;
    let secNameTableSize = 0;
    for (let i = 0; i < secTableEntryCount; i++) {
      const type = this.FileBuffer[cursor];
      const perms = this.FileBuffer[cursor + 1];
      const startAddr = view.getBigUint64(cursor + 2, true);
      const size = view.getUint32(cursor + 0x0A, true);
      const nameIndex = view.getBigUint64(cursor + 0x0E, true);

      if (type == 1) {
        secNameTableSize = size;
      }

      this.Sections.push(new Section(type, perms, startAddr, size, nameIndex));
      cursor += secTableEntrySize;
    }

    const secNameTableEnd = cursor + Number(secNameTableSize);

    // Parse section name table
    while (cursor < secNameTableEnd) {
      const size = this.FileBuffer[cursor];
      const strBuff = new Uint8Array(this.FileBuffer.buffer, cursor + 1, size);
      const str = this.Decoder.decode(strBuff);

      this.SectionNames.push(new SectionName(cursor, size, str));

      cursor += size + 1;
    }
  }
}
