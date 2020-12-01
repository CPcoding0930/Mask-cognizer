const AWS = require('aws-sdk');

const Polly = new AWS.Polly({
    region: 'us-east-1'
})

exports.handler = (event, context) => {
    
    const input = {
        Text: event.data.text,
        OutputFormat: "mp3", 
        SampleRate: "8000", 
        VoiceId: "Joanna",
        LanguageCode: "en-US" 
    }
    
    Polly.synthesizeSpeech(input, (err, data) => {
        if(err) {
            context.succeed({
                stateCode: 200,
                speech: null
            })
        }
        if(data.AudioStream instanceof Buffer){
            context.succeed({
                stateCode: 200,
                speech: data.AudioStream.toString('base64')
            })
        }
    });
};
