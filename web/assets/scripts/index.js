//#region Initialisation.

const editor = document.getElementById('editor');
const recordIcon = document.getElementById("icon");
let recording = false;

let quill = new Quill('#editor', {
    theme: 'snow'
});

//#endregion

//#region Recognition

let recognition;

// Check browser support and create appropriate SpeechRecognition object.
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
} else {
    console.error('Speech recognition not supported in this browser.');
}

recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Handle recognition errors
recognition.onerror = event => {
    console.error('Speech recognition error:', event.error);
};

//#endregion

//#region Actions

// Toggle recording.
recordIcon.addEventListener('click', e => {
    if (!recording) {
        recording = true;
        recordIcon.src = 'assets/images/recording.svg';
        recognition.start();
    }
    else {
        recording = false;
        recordIcon.src = 'assets/images/record.svg';
        recognition.stop();
    }
});

// Append text to quill.
function appendToQuillEditor(text) {
    // Check if the editor is empty (first time)
    const isEmpty = quill.getLength() <= 1;
    if (isEmpty) {
        quill.insertText(0, text, 'user');
    } else {
        quill.insertText(quill.getLength(), text, 'user');
    }
}

// Extract text from speech.
recognition.onresult = event => {
    const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

    // Put the result in quill.
    appendToQuillEditor(normalizeArabic(transcript));
};

// Change language.
function handleLanguageChange() {
    const selectedLanguage = document.getElementById('languages').value;
    switch (selectedLanguage) {
        case 'fr':
            editor.style.direction = 'ltr';
            recognition.lang = 'fr-FR';
            break;
        case 'ar':
            editor.style.direction = 'rtl';
            recognition.lang = 'ar-MA';
            break;
        default:
            editor.style.direction = 'ltr';
            recognition.lang = 'en-US';
            break;
    }
}

function normalizeArabic(text) {
    // TODO.
    return text;
}

document.getElementById('languages').addEventListener('change', handleLanguageChange);

//#endregion

//#region Copy

const copyBtn = document.getElementById('copyBtn');
const copyMessage = document.getElementById('copyMessage');
copyBtn.addEventListener('click', copyText);


// Copy text to keyboard.
function copyText() {
    const text = quill.getText();
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Display success message
    copyMessage.style.display = 'block';
    setTimeout(() => {
        copyMessage.style.display = 'none';
    }, 2000);
}

// Event listener for copy button click
copyBtn.addEventListener('click', copyText);

//#endregion

//#region Docx

const docxBtn = document.getElementById('docxBtn');

// Export text to docx.
function exportToDocx() {
    const text = quill.getText();
    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: text,
                        style: "normal"
                    })
                ]
            }
        ]
    });

    docx.Packer.toBlob(doc).then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'document.docx';
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

// Event listener for export button click
docxBtn.addEventListener('click', exportToDocx);

//#endregion