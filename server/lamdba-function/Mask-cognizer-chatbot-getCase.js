const axios = require("axios");

exports.handler = async (event) => {
  const userInputDate = event.currentIntent.slots["Date"];
  const today = new Date();
  
  const year = userInputDate.substring(0, 4);
  const month = userInputDate.substring(5, 7);
  const day = userInputDate.substring(8, 10);
  const formtedDate = day + "/" + month + "/" + year;
  
  if(!isValidDate(day,month,year)){
    return {
      "sessionAttributes": {},
      "dialogAction": {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText",
          "content": "Please input vaild date"
        }
      }
    }
  }
  
  const url = 'https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fenhanced_sur_covid_19_eng.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%2C%22filters%22%3A%5B%5B2%2C%22eq%22%2C%5B%22' + day + '%2F' + month +'%2F' + year + '%22%5D%5D%5D%7D';
  try {
    console.log(url);
    const response = await axios.get(url);
    const data = response.data;
    console.log("Test");
    console.log(data);
    let confirmed = 0;
    let probable = 0;
    data.forEach(objCase => {
      (objCase["Confirmed/probable"] === "Confirmed")? confirmed++: probable++;
    });
   
    let result = userInputDate + ", Confiremd: " + confirmed + ", Probable: " + probable;
    const checkDateTime = new Date(year, month, day, 8, 00, 00); //Coordinated Universal Time
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

let daysInMonth = (m, y) => {
    switch (m) {
        case 1 :
            return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
        case 8 : case 3 : case 5 : case 10 :
            return 30;
        default :
            return 31
    }
};

let isValidDate = (d, m, y) => {
    m = parseInt(m, 10) - 1;
    return m >= 0 && m < 12 && d > 0 && d <= daysInMonth(m, y);
};
