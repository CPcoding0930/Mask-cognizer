let textToSpeech = (textValue, resultElement) => {
    var http = new XMLHttpRequest();
    var url = "https://j9ns635igc.execute-api.us-east-1.amazonaws.com/v1/speech";
    var params = {
        text: textValue
    };
    
    http.open("POST", url, true);
    http.setRequestHeader('Content-type', 'application/json');
    //http.setRequestHeader('x-api-key', 'q6ylhtfXAK1vNqAxGNW5B6wovT0uOQqE15SwCfTQ');
    http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
            json = JSON.parse(http.responseText);
            console.log(json);
            resultElement.src = "data:audio/mp3;base64," + json.speech;
        }
    }
    http.send(JSON.stringify(params));
}

