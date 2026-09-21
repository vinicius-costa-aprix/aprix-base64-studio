const state = {
  sourceMode: "file",
  selectedFile: null,
  lastOutput: "",
};

const els = {
  fileModeButton: document.getElementById("fileModeButton"),
  textModeButton: document.getElementById("textModeButton"),
  fileSource: document.getElementById("fileSource"),
  textSource: document.getElementById("textSource"),
  fileInput: document.getElementById("fileInput"),
  textInput: document.getElementById("textInput"),
  dropzone: document.getElementById("dropzone"),
  fileHint: document.getElementById("fileHint"),
  convertButton: document.getElementById("convertButton"),
  resetButton: document.getElementById("resetButton"),
  copyButton: document.getElementById("copyButton"),
  downloadButton: document.getElementById("downloadButton"),
  outputText: document.getElementById("outputText"),
  inputSize: document.getElementById("inputSize"),
  outputSize: document.getElementById("outputSize"),
  modeLabel: document.getElementById("modeLabel"),
  statusText: document.getElementById("statusText"),
};

const textEncoder = new TextEncoder();

function setSourceMode(mode) {
  state.sourceMode = mode;
  els.fileModeButton.classList.toggle("active", mode === "file");
  els.textModeButton.classList.toggle("active", mode === "text");
  els.fileSource.classList.toggle("hidden", mode !== "file");
  els.textSource.classList.toggle("hidden", mode !== "text");
  clearOutput();
}

async function readInputBytes() {
  if (state.sourceMode === "file") {
    if (!state.selectedFile) {
      throw new Error("Selecione um arquivo CSV, ZIP ou TXT.");
    }
    const buffer = await state.selectedFile.arrayBuffer();
    return new Uint8Array(buffer);
  }

  const text = els.textInput.value;
  if (!text.trim()) {
    throw new Error("Informe o texto que deve ser convertido.");
  }
  return textEncoder.encode(text);
}

async function convert() {
  try {
    const inputBytes = await readInputBytes();
    const output = bytesToBase64(inputBytes);

    state.lastOutput = output;
    els.outputText.value = output;
    els.inputSize.textContent = formatBytes(inputBytes.byteLength);
    els.outputSize.textContent = formatBytes(inputBytes.byteLength);
    els.modeLabel.textContent = "Direto";
    els.statusText.textContent = "Convertido";
    els.statusText.style.color = "var(--accent-strong)";
  } catch (error) {
    els.statusText.textContent = error.message;
    els.statusText.style.color = "var(--danger)";
  }
}

function clearOutput() {
  state.lastOutput = "";
  els.outputText.value = "";
  els.inputSize.textContent = "0 B";
  els.outputSize.textContent = "0 B";
  els.modeLabel.textContent = "Direto";
  els.statusText.textContent = "Aguardando entrada";
  els.statusText.style.color = "var(--muted)";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function formatBytes(size) {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function setSelectedFile(file) {
  state.selectedFile = file;
  clearOutput();
  if (!file) {
    els.fileHint.textContent = "CSV, ZIP ou TXT";
    return;
  }

  els.fileHint.textContent = `${file.name} · ${formatBytes(file.size)}`;
}

function downloadOutput() {
  if (!state.lastOutput) return;
  const blob = new Blob([state.lastOutput], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "base64.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyOutput() {
  if (!state.lastOutput) return;
  await navigator.clipboard.writeText(state.lastOutput);
  els.statusText.textContent = "Copiado";
  els.statusText.style.color = "var(--accent-strong)";
}

function reset() {
  state.selectedFile = null;
  state.lastOutput = "";
  els.fileInput.value = "";
  els.textInput.value = "";
  els.fileHint.textContent = "CSV, ZIP ou TXT";
  setSourceMode("file");
  clearOutput();
}

els.fileModeButton.addEventListener("click", () => setSourceMode("file"));
els.textModeButton.addEventListener("click", () => setSourceMode("text"));
els.convertButton.addEventListener("click", convert);
els.resetButton.addEventListener("click", reset);
els.copyButton.addEventListener("click", copyOutput);
els.downloadButton.addEventListener("click", downloadOutput);
els.fileInput.addEventListener("change", (event) => {
  setSelectedFile(event.target.files?.[0] || null);
});
els.textInput.addEventListener("input", () => {
  clearOutput();
});

for (const eventName of ["dragenter", "dragover"]) {
  els.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropzone.classList.add("dragover");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  els.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropzone.classList.remove("dragover");
  });
}

els.dropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files?.[0];
  if (file) {
    setSelectedFile(file);
  }
});
