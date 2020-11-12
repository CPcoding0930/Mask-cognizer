const axios = require("axios");

exports.handler = async (event) => {
  const userInputDate = event.currentIntent.slots["Date"];
  const today = new Date();
  const year = userInputDate.substring(0, 4);
  const month = userInputDate.substring(5, 7);
  const day = userInputDate.substring(8, 10);
  const formtedDate = day + "/" + month + "/" + year;
  
  const url = encodeURI('https://api.data.gov.hk/v2/filter?q={"resource":"http://www.chp.gov.hk/files/misc/enhanced_sur_covid_19_eng.csv","section":1,"format":"json","filters":[[3,"eq",["' + formtedDate + '"]]]}');
  try {
    const response = await axios.get(url);
    const data = response.data;
    let confirmed = 0;
    let probable = 0;

    data.forEach(objCase => {
      (objCase["Confirmed/probable"] === "Confirmed")? confirmed++: probable++;
    });
   
    let result = userInputDate + ", Confiremd: " + confirmed + ", Probable: " + probable;
    const checkDateTime = new Date(formtedDate + " 16:00:00");
    if(confirmed == 0 && probable == 0 && today.toString() <= checkDateTime.toString())
        result += (today.toTimeString() < checkDateTime.toTimeString())? " [Not yet accurate]" : "";
    
    
    return {
      "sessionAttributes": {},
      "dialogAction": {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText",
          "content": result
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

};