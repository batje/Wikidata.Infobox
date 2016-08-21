/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license GPL 3.0
 * @module WikidataHelpers
 */
"use strict"

var instantiated = false;
var instance;

/** @class TimeClass helps rendering time datatype values
 *
 */
class TimeClass {
  constructor() {
    console.log("loading time javascript");
  }

  load(handlebars) {
    console.log("Loading Time");
    return Promise.resolve();
  }

  postProcess() {
    console.log("Postprocessing time");
  }

  registerHelpers(handlebars) {
      console.log("Registring Helper time_TimeAsText");
      handlebars.registerHelper('time_TimeAsText', this.HelperTimeAsText);
    }
    /**
     * @function that renders a Wikidata time value as a text
     * @param value Wikidata time value
     * @returns Text to display to the user
     * @todo Figure out how to find the users chosen locale
     * @see https://www.wikidata.org/wiki/Special:ListDatatypes
     */
  HelperTimeAsText(value, options) {
    // If you do not put a LOT of errorhandling here, you will be punished
    // with debugging forever to find things that go wrong.
    // And things will go wrong because the data values you will receive
    // will not be what the standard says.
    // It's a wiki!
    try {
      console.log("14 HelperTimeAsText value", value);
      console.log("15 HelperTimeAsText options", options);
      if ((typeof value.mainsnak.datavalue === 'undefined') || (typeof value.mainsnak.datavalue.value === 'undefined')) {
        console.log("Undefined Date Value, returning empty string");
        return Promise.resolve("''");
      }
      var datavalue = value.mainsnak.datavalue.value;
      // If we dont care about more granularity than milleniums, only return the year part
      // Wether that is Julian Calendar or Gregorian. (Like P571 on Q2)
      if (datavalue.precision < 6) {
        var shorttime = datavalue.time.substr(1);
        var year = datavalue.time.substr(0, shorttime.indexOf("-"));
        // Era: https: //www.wikidata.org/wiki/Q208141
        var era =
          '<a class="wikidata-fetchlabel" data-wikidata="Q208141" href="./simple.html?{{ Q208141}}" >Fetching...</a>';
        console.log("Very big year, so can not do anything with Javascript object. Returning Integer: ", year);
        try {
          return Promise.resolve(year + ' ' + era);
        } catch (e) {
          console.error("Error", e);
        }
      }

      var calendar = "";
      switch (datavalue.calendarmodel) {
        //Proleptic Julian calendar, Extension of the regular Julian calendar
        case "http://www.wikidata.org/entity/Q1985786":
          // Julian Calendar
        case "http://www.wikidata.org/entity/Q11184":
          // Sample Entity: Q2 has a date of this type

          console.log("We need to load Julian");
          calendar =
            '<a class="wikidata-fetchlabel" data-wikidata="Q208141" href="./simple.html?{{ Q208141}}" >Fetching...</a>';
          try {
            //          System.import('../node_modules/julian/index.js')
            var myPromise =
              System.import('http://localhost/temp/julian/index-es6.js')
              .then(julian => {
                var jd = '';
                console.log("Loaded Javascript for  Julian", julian);
                console.log(new Date("-4540000000-00-00T00:00:00Z"));
                console.log(new Date("4540000000-00-00T00:00:00"));
                console.log(new Date("4540000000-00-00"));
                console.log(new Date(4540000000, 1, 1));
                //                console.log(julian.convertToDate("4540000000-00-00T00:00:00Z"));
                //                console.log(julian.convertToDate("4540000000-00-00T00:00:00"));
                //                console.log(julian.convertToDate("4540000000-00-00"));
                //                console.log(julian.convertToDate(jd));
                console.log("Going to convert:", jd);
                var result = julian.convertToDate(jd);
                console.log("Ok good step, the date is " + result);
                return Promise.resolve(result);

              })
              .catch(err => {
                // If not 404, log the error
                //  if (err.message.indexOf("404 Not Found") > 0) {
                console.error("Error loading javascript Julian ", err);
                //  }

              });
          } catch (e) {
            console.error("Error loading Julian", e)
          }
          break;
          //Proleptic Gregorian calendar, Extension of the Gregorian calendar before its introduction
        case "http://www.wikidata.org/entity/Q1985727":
          // 'Standard Gregorian'
        case "http://www.wikidata.org/entity/Q12138":

          // Sample Entity: Q2 has a date of this type

          break;
        default:
          console.log("Unknown Calendar, Defaulting to Gregorian");
      }

      if (datavalue.time.indexOf("-") == 5) {
        // in Wikidata there is always a + or - before the year
        // however, in ACMEA script this is only allowed if the
        // year consists of 6 digits. We need to add 2.
        // @ref http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15.1

        datavalue.time = datavalue.time.substr(0, 1) + "00" + datavalue.time.substr(1);
      }

      return Promise.resolve("Testing a bit, remove this line");



      // Wikidata Precison:
      //    0 - billion years, 1 - hundred million years, ..., 6 - millennium, 7 - century, 8 - decade, 9 - year, 10 - month, 11 - day, 12 - hour, 13 - minute, 14 - second

      // We are going to build up the options according to the DataTimeFormat
      // @ref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat#Parameters
      var options = {};

      options.weekday = datavalue.precision == 11 ? 'long' : undefined;
      options.era = datavalue.precision == 9 ? 'short' : undefined; //Possible values are "narrow", "short", "long".
      options.year = datavalue.precision >= 9 ? 'numeric' : datavalue.precision == 8 ? '2-digit' : undefined;
      options.month = datavalue.precision == 11 ? 'long' : datavalue.precision > 10 ? 'short' : undefined; //Possible values are "numeric", "2-digit", "narrow", "short", "long"..
      options.day = datavalue.precision >= 11 ? 'numeric' : undefined; //Possible values are "narrow", "short", "long".
      options.hour = datavalue.precision >= 12 ? 'numeric' : undefined; //Possible values are "narrow", "short", "long".
      options.minute = datavalue.precision >= 12 ? 'numeric' : undefined; //Possible values are "narrow", "short", "long".
      options.second = datavalue.precision >= 12 ? 'numeric' : undefined; //Possible values are "narrow", "short", "long".
      /*    year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
            hour12: false
        };*/
      var date = new Date(datavalue.time);
      // How do we get from here to the original langugages/locales!?
      var result = Intl.DateTimeFormat('en-US', options).format(date);

      return Promise.resolve(result);
    } catch (e) {
      console.error("There was an error rendering time " + date, date);
      console.error("There was an error rendering time " + value, value);
      console.error("There was an error rendering time ", e);
      return Promise.resolve("Error Processing Time");
    }
  }

  /** @function Returns Julian Number from Javascript Date object
   * @see http://stackoverflow.com/questions/26370688/convert-a-julian-date-to-regular-date-in-javascript
   */
  dateToJulianNumber0(d) {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var a = Math.floor((14 - month) / 12);
    var y = Math.floor(year + 4800 - a);
    var m = month + 12 * a - 3;
    var JDN = day + Math.floor((153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(
      y /
      400) - 32045;
    return JDN;
  }

  /** @function Returns Date based on Julian Number
   * @see http://stackoverflow.com/questions/26370688/convert-a-julian-date-to-regular-date-in-javascript
   */
  julianIntToDate0(JD) {

    var y = 4716;
    var v = 3;
    var j = 1401;
    var u = 5;
    var m = 2;
    var s = 153;
    var n = 12;
    var w = 2;
    var r = 4;
    var B = 274277;
    var p = 1461;
    var C = -38;
    var f = JD + j + Math.floor((Math.floor((4 * JD + B) / 146097) * 3) / 4) + C;
    var e = r * f + v;
    var g = Math.floor((e % p) / r);
    var h = u * g + w;
    var D = Math.floor((h % s) / u) + 1;
    var M = ((Math.floor(h / s) + m) % n) + 1;
    var Y = Math.floor(e / p) - y + Math.floor((n + m - M) / n);
    return new Date(Y, M - 1, D);
  }
}

function time() {
  if (typeof instance === 'undefined') {
    instance = new TimeClass();
  }
  return instance;
}

export default {
  time
};
