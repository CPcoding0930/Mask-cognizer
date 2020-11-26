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

    let message = document.getElementById("message").value.trim();
    let chatRoom = document.getElementsByClassName("chats")[0];
    let divOwnChatStruct = document.createElement('div');
    divOwnChatStruct.className = "chat-body";
    let divOwnChatContent = document.createElement('div');
    divOwnChatContent.className = "chat-content";
    let pOwnChatContent = document.createElement('p');
    pOwnChatContent.innerText = message;
    divOwnChatContent.appendChild(pOwnChatContent);
    divOwnChatStruct.appendChild(divOwnChatContent);
    chatRoom.appendChild(divOwnChatStruct);
    document.getElementById("message").value = "";
    //let message = "10/10/2020";

    console.log(message);
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
            let divBotRespStruct = document.createElement("div");
            divBotRespStruct.className = "chat chat-left";
            let divBotRespBody = document.createElement("div");
            divBotRespBody.className = "chat-body";
            let divBotRespContent = document.createElement("div");
            divBotRespContent.className = "chat-content";
            let pBotRespContent = document.createElement("p");
            pBotRespContent.innerText = data.message;
            divBotRespContent.appendChild(pBotRespContent);
            divBotRespBody.appendChild(divBotRespContent);
            divBotRespStruct.appendChild(divBotRespBody);
            chatRoom.appendChild(divBotRespStruct);
            //console.log(data.message);
        }

    });
}