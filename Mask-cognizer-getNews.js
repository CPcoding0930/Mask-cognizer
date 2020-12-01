const axios = require("axios");

exports.handler = async (event) => {
  const today = new Date();
  today.setTime(today.getTime() + today.getTimezoneOffset() * 60 * 1000  +  8 * 60 * 60 * 1000);
  const url = 'https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Flatest_situation_of_reported_cases_covid_19_eng.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%2C%22filters%22%3A%5B%5B1%2C%22eq%22%2C%5B%22' + ("0" + today.getDate()).slice(-2)  +'%2F' + ("0" +  (today.getMonth() + 1)).slice(-2) + '%2F' + today.getFullYear() +'%22%5D%5D%5D%7D';
  try {
    const response = await axios.get(url);
    let data = response.data;
    let nextGetNextDateData = false;
    if(data.length == 0){
        nextGetNextDateData = true;
        let currentDay = today;
        while(true){
          let beforeDate = new Date(currentDay.getTime()-24*60*60*1000);
          const beforeDateURL = 'https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Flatest_situation_of_reported_cases_covid_19_eng.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%2C%22filters%22%3A%5B%5B1%2C%22eq%22%2C%5B%22' + ("0" + beforeDate.getDate()).slice(-2) +'%2F' +("0" +(beforeDate.getMonth() + 1)).slice(-2)  + '%2F' + beforeDate.getFullYear()+'%22%5D%5D%5D%7D';
          const beforeDateResponse = await axios.get(beforeDateURL);
          data = beforeDateResponse.data;
          currentDay = beforeDate;
          if(data.length != 0){
            break;
          }
        }
    }

    const date = data[0]["As of date"];
    const confirmCase = data[0]["Number of confirmed cases"];
    const deathCase = data[0]["Number of death cases"];
    const discharCase = data[0]["Number of discharge cases"];
    const probCase = data[0]["Number of probable cases"];

    let result = "Date: " + date + ", Confirmed Case: " + confirmCase + ", death cases: " + deathCase + ", discharge case: " + discharCase + ", probable case: " + probCase;
    if(nextGetNextDateData){
      result += "<br>[Today not yet update]"
    }

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
