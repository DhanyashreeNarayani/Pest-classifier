const express = require('express');
const bodyParser = require('body-parser');
const request = require('request').defaults({encoding: null});

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/',(req,res,err)=>{
    res.send("Chatbot");
});

let token = "EAAC19VZB0AmwBAAkqhN2YRJDwVLttIwUQGlmCuK8Ne9RSASs9yD1DB6Ixa5YmH2RfC3ZBFBXV6ZCnDU2dxUpe0HRVNcKweQX4H4zx5o0Y6pPu3HqcXxLcHfzhnrlGcKVf9tZBPhOIotFtZCjVXNWbTAFMZBAhC4YJyZAdGE8AmbXgZDZD";

//facebook token and verify token must be ensured...
app.get('/webhook/',(req,res)=>{
    if(req.query['hub.verify_token'] === "pestdetector"){
        res.send(req.query['hub.challenge'])
    }
    res.send('Wrong Token');
});

app.post('/webhook/',(req,res)=>{
    let messaging_events = req.body.entry[0].messaging;
    for(let i = 0; i < messaging_events.length; i++){
        let event = messaging_events[i];
        let sender = event.sender.id;
        if(event.message && event.message.attachments){
            for(var j = 0; j < event.message.attachments.length; j++){

                var options = {
                    method: 'POST',
                    url: 'https://yckpnbctiy.localtunnel.me/dhanya',
                    headers: {
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
                    },
                    formData: {
                        imageURL: event.message.attachments[j].payload.url 
                    },
                    encoding: null 
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    // console.log(JSON.parse(body));
                    var result = JSON.parse(body);
                    sendText(sender, `Pest Name: ${result.pestName}`)        
                });
            }
        }
        if(event.message && event.message.text){
            let text = event.message.text;
           if(text=='hi')
            sendText(sender, `hi.`)
           else
            senText(sender,`Sorry I don't understand`)
        }
    }
    res.sendStatus(200);
})

var sendText = (sender,text)=>{
    let messageData = {text: text}
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: messageData
        }
    },(error,response,body)=>{
        if(error){
            console.log("Sending error")
        }else if(response.body.error){
            console.log(response.body.error)
        }
    })
}

app.listen(process.env.PORT || 4000,()=>{
    console.log("Server Running");
})