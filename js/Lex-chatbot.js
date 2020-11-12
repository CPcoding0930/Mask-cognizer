AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:1f39715b-bdb0-4da3-adc4-0ff4c5de156f',
});

const lexRuntime = new AWS.LexRuntime();
let sessionAttributes = {};

const botAlias = '$LATEST';
const botName = 'MaskCognizerBot';
const userId = 'id-' + Date.now();

let sendMessage = () => {

    //let message = document.getElementById("message").value.trim();
    let message = "10/10/2020";

    const params = {
        botAlias: botAlias,
        botName: botName,
        inputText: message,
        userId: userId,
        sessionAttributes: sessionAttributes
    };

    lexRuntime.postText(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
            console.log(err.message);
        }
        if (data) {
            sessionAttributes = data.sessionAttributes;
            console.log(data.message);
        }

    });
}