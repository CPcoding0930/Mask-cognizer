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
            (sessionStorage.getItem("mode") == "Elder")?
                sendElderMessage(translationScript):
                this.result.value = translationScript;
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
        textOutput: document.querySelector(".input-message")
    });

    document.querySelector(".btn-speech-to-text").addEventListener("click", () => {

        let voiceElement = document.querySelector(".btn-speech-to-text");
        if (voiceElement.id === "btn-speech-to-text-start") {
            speechToText.start();
            voiceElement.id = "btn-speech-to-text-end";
        } else {
            speechToText.stop();
            voiceElement.id = "btn-speech-to-text-start";
        }
    });

    console.log(sessionStorage.getItem("mode"));
    if(sessionStorage.getItem("mode") == "Elder"){
        document.querySelector(".btn-elder-speech-to-text").addEventListener("click", () => {
            console.log("click");
            let voiceElement = document.querySelector(".btn-elder-speech-to-text");
            if (voiceElement.id === "btn-elder-speech-to-text-start") {
                speechToText.start();
                voiceElement.id = "btn-elder-speech-to-text-end";
            } else {
                speechToText.stop();
                voiceElement.id = "btn-elder-speech-to-text-start";
            }
        });
    }

}
