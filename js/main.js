const App = {
    buffer: 0,
}

const FILE_INPUT = document.getElementsByClassName('file-input')[0];

FILE_INPUT.addEventListener('change', async () => {
    const FILE_BUFFER = await FILE_INPUT.files[0].arrayBuffer();
    App.buffer = new Uint8Array(FILE_BUFFER);
});
