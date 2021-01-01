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

class Section {
    constructor(type, perms, startAddr, size, nameAddr) {
        this.Type = type;
        this.Perms = perms;
        this.StartAddr = startAddr;
        this.Size = size;
        this.NameAddr = nameAddr;
    }
}

class SectionName {
    Addr = 0;
    Size = 0;
    Str = '';

    constructor(addr, size, str) {
        this.Addr = addr;
        this.Size = size;
        this.Str = str;
    }
}

class SourceFile {

    FileBuffer = 0;
    Magic = 0;
    Version = 0;
    Mode = 0;
    StartAddr = 0;
    SecTableSize = 0;
    Sections = [];
    SectionNames = [];
    Encoder = new TextEncoder('utf-8');
    Decoder = new TextDecoder('utf-8');

    constructor(file) {
        this.FileBuffer = file;
    }

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

export { SourceFile };
