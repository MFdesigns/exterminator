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

const App = {
    Source: 0,
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

const FILE_INPUT = document.getElementsByClassName('file-input')[0];

FILE_INPUT.addEventListener('change', async () => {
    const FILE_BUFFER = await FILE_INPUT.files[0].arrayBuffer();
    App.Source = new SourceFile(new Uint8Array(FILE_BUFFER));

    App.Source.parse();
    displayFileInfo();
});
