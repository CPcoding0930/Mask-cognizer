class SpeechRecongnitionAPI {
    constructor(resultElement) {
        const SpeechToText = window.speechRecognition || window.webkitSpeechRecognition;
        this.speechAPI = new SpeechToText();
        this.speechAPI.continous = true;
        this.speechAPI.interimResult = false;
        this.result = resultElement.textOutput;
        this.speechAPI.onresult = (event) => {
            let resultIndex = event.resultIndex;
            let translationScript = event.results[resultIndex][0].transcript;
            this.result.textContent = translationScript;
        }
    }

    start = () => {
        this.speechAPI.start();
    }

    stop = () => {
        this.speechAPI.stop();
    }
}

window.onload = () => {

    let speechToText = new SpeechRecongnitionAPI({
        textOutput: document.querySelector(".message")
    });

    document.querySelector(".btn-speech-to-text-start").addEventListener("click", () => {
        speechToText.start();
    });

    document.querySelector(".btn-speech-to-text-stop").addEventListener("click", () => {
        speechToText.stop()
    });
}