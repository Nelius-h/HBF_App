const fs = require('fs');
const path = require('path');

function parseGps(dmsStr) {
  if (!dmsStr || dmsStr.includes('NOT IN SOURCE DATA') || dmsStr.trim() === '') {
    return null;
  }
  const latMatch = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"?\s*([SN])/i);
  const lngMatch = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"?\s*([EW])/i);
  if (!latMatch || !lngMatch) return null;
  
  let lat = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10)/60 + parseFloat(latMatch[3])/3600;
  if (latMatch[4].toUpperCase() === 'S') lat = -lat;
  
  let lng = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10)/60 + parseFloat(lngMatch[3])/3600;
  if (lngMatch[4].toUpperCase() === 'W') lng = -lng;
  
  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6))
  };
}

// All 176 cases from the official HBF Stock Theft VIS Consolidated Register
const RAW_RECORDS = [
  // [num, date, area, stolen, contact, rec, miss, slaugh, stolenGps, foundGps, slaughGps, loadGps, fenceGps, source]
  [1, "2025-10-31", "Renosterhoek", "20 Cows", "Cobus de Jager", 2, 17, 1, "26°50'55.9\"S 26°25'33.3\"E", "26°53'58.4\"S 26°35'06.6\"E", "26°53'58.4\"S 26°35'06.6\"E", "", "26°51'03.4\"S 26°26'18.0\"E", "Nov"],
  [2, "2025-10-28", "Nooitgedacht KLD", "17 Cows", "Steven Lang", 2, 0, 0, "", "", "", "", "", "Nov"],
  [3, "2025-10-28", "Meliodora", "Unknown Amt. Calves", "M. Nel", 0, 0, 0, "26°48'41.1\"S 26°06'19.9\"E", "", "", "", "", "Nov"],
  [4, "2025-10-28", "Harrisburg", "3 Cows", "Stephan - Jopie Grobler", 0, 3, 0, "", "", "", "", "", "Nov"],
  [5, "2025-10-25", "Schoemansfontein", "14 Cows 11 Calves", "Gert Wessels", 13, 8, 3, "26°46'54.6\"S 26°29'00.7\"E", "26°54'25.2\"S 26°37'08.6\"E", "26°54'24.9\"S 26°37'11.1\"E", "", "26°51'03.4\"S 26°26'18.0\"E", "Nov"],
  [6, "2025-10-18", "Kafferskraal", "60 Sheep", "Karin Basson", 0, 60, 0, "26°50'08.5\"S 26°35'09.1\"E", "", "", "", "", "Nov"],
  [7, "2025-10-17", "Harrisburg", "1 Cows", "Cobus van Zyl", 1, 0, 0, "27°04'54.2\"S 26°22'29.9\"E", "27°05'14.9\"S 26°22'58.8\"E", "", "", "", "Nov"],
  [8, "2025-10-14", "Klippan", "8 Cows", "Johan Pollard", 1, 7, 0, "26°59'26.3\"S 26°20'59.3\"E", "26°54'17.2\"S 26°28'34.5\"E", "", "", "26°58'36.2\"S 26°21'51.5\"E", "Nov"],
  [9, "2025-10-08", "Bamboesspruit", "19 Cows", "M Nel", 0, 19, 0, "", "", "", "", "", "Nov"],
  [10, "2025-10-06", "Meliodora", "12 Cows", "M Nel", 8, 0, 0, "26°48'41.1\"S 26°06'19.9\"E", "26°44'39.1\"S 26°24'38.1\"E", "", "", "", "Nov"],
  [11, "2025-10-06", "Oorbietjiesfontein", "5 Cows", "M Nel", 5, 0, 0, "26°49'27.3\"S 26°17'55.5\"E", "26°49'20.1\"S 26°20'04.6\"E", "", "", "", "Nov"],
  [12, "2025-10-03", "Oorbietjiesfontein", "5 Cows", "John Lemmer", 0, 5, 0, "26°48'08.7\"S 26°23'22.5\"E", "", "", "", "26°48'01.6\"S 26°25'33.1\"E", "Nov"],
  [13, "2025-10-03", "Oorbietjiesfontein", "12 Cows", "Hendrik Badenhorst", 6, 0, 6, "26°48'38.7\"S 26°19'52.7\"E", "26°50'44.8\"S 26°33'23.9\"E", "26°47'58.8\"S 26°22'25.3\"E", "", "26°48'11.7\"S 26°22'09.4\"E", "Nov"],
  [14, "2025-09-27", "Renosterspruit", "27 Cows", "Johan Pollard", 27, 0, 0, "26°53'07.9\"S 26°22'56.2\"E", "26°48'17.1\"S 26°34'34.5\"E", "", "", "26°50'18.6\"S 26°31'56.6\"E", "Nov"],
  [15, "2025-09-25", "Lemoenfontein", "8 Cows", "Rudi Loots", 8, 0, 0, "26°36'21.2\"S 26°25'02.9\"E", "26°35'54.5\"S 26°25'27.1\"E", "", "", "", "Nov"],
  [16, "2025-09-23", "Brakspruit", "7 Cows", "A Greef", 7, 0, 0, "26°40'21.4\"S 26°34'47.9\"E", "26°40'35.8\"S 26°34'27.2\"E", "", "", "", "Nov"],
  [17, "2025-09-19", "Wolwerand", "14 Sheep", "W Engelbrecht", 14, 0, 0, "26°51'53.9\"S 26°29'38.7\"E", "26°51'23.2\"S 26°29'42.6\"E", "", "", "", "Nov"],
  [18, "2025-09-17", "Oorbietjiesfontein", "6 Cows", "Jaco van der Werwe", 0, 6, 0, "26°51'47.6\"S 26°23'49.4\"E", "", "", "", "26°51'53.9\"S 26°23'19.2\"E", "Nov"],
  [19, "2025-09-17", "Syferfontein", "29 Cows", "Herman Pretorius jnr", 29, 0, 0, "26°51'50.5\"S 26°19'57.9\"E", "26°53'40.6\"S 26°27'28.5\"E", "", "", "26°52'29.4\"S 26°24'50.7\"E", "Nov"],
  [20, "2025-09-16", "Renosterspruit", "21 Cows", "Johan Pollard", 21, 0, 0, "26°53'07.9\"S 26°22'56.2\"E", "26°52'38.5\"S 26°23'42.9\"E", "", "", "", "Nov"],
  [21, "2025-09-16", "Syferfontein", "13 Cows", "Werner Groenewald", 0, 13, 0, "27°01'40.3\"S 26°19'57.6\"E", "", "", "", "", "Nov"],
  [22, "2025-09-14", "Jakkalsfontein", "4 Bulls", "Dr Johan Fourie", 0, 0, 4, "26°56'31.5\"S 26°19'13.7\"E", "", "26°56'58.9\"S 26°19'26.3\"E", "", "", "Nov"],
  [23, "2025-09-13", "Geduld", "1 Nyala 1 Emu", "Gert Goosen", 0, 2, 0, "26°39'07.9\"S 26°26'17.8\"E", "", "", "", "", "Nov"],
  [24, "2025-09-11", "Swartlaagte", "30 Cows", "Stephan Cloete", 30, 0, 0, "27°01'33.6\"S 26°19'38.4\"E", "27°01'41.0\"S 26°17'08.9\"E", "", "", "", "Nov"],
  [25, "2025-09-04", "Oorbietjiesfontein", "10 Cows", "Hendrik Badenhorst", 0, 10, 0, "26°48'38.7\"S 26°19'52.7\"E", "", "", "", "26°48'11.7\"S 26°22'09.4\"E", "Nov"],
  [26, "2025-09-03", "Wolwerand", "3 Cows", "Leon van Heerden", 0, 3, 0, "26°51'26.6\"S 26°26'51.1\"E", "", "", "", "", "Nov"],
  [27, "2025-09-02", "Syferfontein", "14 Cows", "MJ Ernst", 0, 14, 0, "27°05'10.7\"S 26°16'33.0\"E", "", "", "", "", "Nov"],
  [28, "2025-08-26", "Oorbietjiesfontein", "5 Cows", "Josef", 0, 5, 0, "26°51'37.5\"S 26°23'50.5\"E", "", "", "", "", "Nov"],
  [29, "2025-08-25", "Wolwerand", "7 Sheep", "W Engelbrecht", 7, 0, 0, "26°51'53.9\"S 26°29'38.7\"E", "26°51'23.2\"S 26°29'42.6\"E", "", "", "", "Nov"],
  [30, "2025-08-21", "Sendelingsfontein", "6 Cows", "Japie Grobbelaar", 4, 2, 0, "26°54'51.9\"S 26°14'23.5\"E", "26°55'36.8\"S 26°15'52.5\"E", "", "", "", "Nov"],
  [31, "2025-08-09", "Renosterspruit", "14 Cows", "W Venter", 0, 14, 0, "26°55'26.1\"S 26°24'12.6\"E", "", "", "", "", "Nov"],
  [32, "2025-08-04", "Wolwerand", "22 Sheep", "Moketsi", 3, 0, 0, "26°52'49.0\"S 26°27'22.0\"E", "", "", "", "", "Nov"],
  [33, "2025-07-31", "Jakkalsfontein", "19 Cows", "Jan Erasmus", 16, 3, 0, "26°56'09.2\"S 26°18'16.2\"E", "", "", "", "", "Nov"],
  [34, "2025-07-26", "Klippan", "3 Pigs", "Danie Botha", 0, 3, 0, "26°44'39.5\"S 26°11'33.9\"E", "", "", "", "", "Nov"],
  [35, "2025-07-22", "Dupperspos", "5 Sheep", "Felicia Prinsloo", 0, 5, 0, "26°31'25.1\"S 26°24'47.1\"E", "", "", "", "", "Nov"],
  [36, "2025-07-17", "Harrisburg", "4 Cows", "Lou de Wet", 0, 0, 4, "", "", "27°00'52.7\"S 26°19'30.3\"E", "", "", "Nov"],
  [37, "2025-07-16", "Wolwerand", "20 Cows", "Andre Nel jnr", 20, 0, 0, "26°52'55.2\"S 26°30'19.9\"E", "", "", "", "", "Nov"],
  [38, "2025-07-15", "Sendelingsfontein", "5 Cows", "Schalk Nezer", 5, 0, 0, "26°56'27.3\"S 26°06'47.2\"E", "", "", "", "", "Nov"],
  [39, "2025-07-13", "Tiganie", "10 Cows", "Swart boer van Tiganie", 10, 0, 0, "26°44'42.2\"S 26°24'40.9\"E", "", "", "", "", "Nov"],
  [40, "2025-07-12", "Rietfontein", "10 Cows", "Stoffel", 10, 0, 0, "26°39'11.8\"S 26°21'10.1\"E", "", "", "", "", "Nov"],
  [41, "2025-07-10", "Renosterhoek", "10 Cows", "Freddie Hugo", 10, 0, 0, "26°51'28.0\"S 26°25'53.0\"E", "", "", "", "", "Nov"],
  [42, "2025-07-08", "Beenjeskraal", "11 Sheep", "Danie Niewoudt", 0, 11, 0, "", "", "", "", "", "Nov"],
  [43, "2025-07-07", "Schoemansfontein", "10 Cows", "J Styger", 10, 0, 0, "26°44'29.2\"S 26°32'27.0\"E", "26°50'43.2\"S 26°35'31.7\"E", "", "", "", "Nov"],
  [44, "2025-07-06", "Rietfontein", "4 Sheep", "Corneels Swanepoel", 0, 4, 0, "26°50'50.9\"S 26°14'10.0\"E", "", "", "", "", "Nov"],
  [45, "2025-07-03", "Witpoort", "15 Cows", "Ins Shalala", 13, 2, 0, "26°43'56.0\"S 26°36'05.6\"E", "26°48'17.0\"S 26°34'34.5\"E", "", "", "", "Nov"],
  [46, "2025-06-30", "Rietkuil", "8 Cows", "Dolf Barnard", 8, 0, 0, "26°50'12.3\"S 26°31'37.1\"E", "", "", "", "", "Nov"],
  [47, "2025-06-27", "Harrisburg", "4 Cows", "Janus janse van Vuuren", 0, 0, 4, "", "", "27°00'54.0\"S 26°19'31.3\"E", "", "", "Nov"],
  [48, "2025-06-24", "Wolwerand", "14 Sheep", "Pieter Dimenia", 0, 14, 0, "", "", "", "", "", "Nov"],
  [49, "2025-06-21", "Doornfontein", "117 Sheep", "C van der Westhuisen", 87, 30, 0, "", "", "", "26°37'39.0\"S 26°36'49.6\"E", "", "Nov"],
  [50, "2025-06-19", "Regina", "9 Cows", "B Bosch", 8, 1, 0, "", "", "", "", "", "Nov"],
  [51, "2025-06-16", "Rooikuil", "30 Cows", "Frans Roos", 0, 30, 4, "26°39'35.4\"S 26°34'05.4\"E", "", "", "", "", "Nov"],
  [52, "2025-06-14", "Harrisburg", "4 Cows", "Lou de Wet", 0, 0, 4, "", "", "27°00'54.0\"S 26°19'31.3\"E", "", "", "Nov"],
  [53, "2025-06-12", "Palmietfontein", "52 Sheep", "Pieter Greyling", 32, 20, 0, "26°34'46.8\"S 26°38'55.1\"E", "", "", "26°38'06.0\"S 26°36'12.2\"E", "", "Nov"],
  [54, "2025-06-12", "Sendelingsfontein", "46 Sheep", "Philip Masilo", 0, 46, 0, "26°57'46.0\"S 26°17'07.8\"E", "", "", "26°56'41.2\"S 26°20'15.5\"E", "", "Nov"],
  [55, "2025-06-10", "Fortbuis", "68 Sheep", "Theuns Venter", 68, 0, 0, "26°43'18.4\"S 26°29'38.2\"E", "", "", "", "", "Nov"],
  [56, "2025-06-09", "Buisfontein", "32 Sheep", "Dean Lowrey", 32, 0, 0, "26°41'33.0\"S 26°31'18.8\"E", "", "", "", "", "Nov"],
  [57, "2025-06-05", "Witpoort", "1 Cows", "V Swart", 1, 0, 0, "", "", "", "", "", "Nov"],
  [58, "2025-06-04", "Oorbietjiesfontein", "4 Cows", "M Nel", 0, 4, 0, "26°49'36.2\"S 26°17'36.3\"E", "", "", "", "", "Nov"],
  [59, "2025-06-04", "Brakspruit", "2 Cows", "Braam Hammilton Hall", 0, 2, 0, "26°39'35.0\"S 26°34'33.5\"E", "", "", "", "", "Nov"],
  [60, "2025-06-04", "Maheimsvlei", "6 Cows", "Gerrit van der Walt", 0, 6, 0, "26°37'55.8\"S 26°34'57.6\"E", "", "", "", "", "Nov"],
  [61, "2025-06-03", "Unknown", "6 Cows", "J Swart", 0, 6, 0, "", "", "", "", "", "Nov"],
  [62, "2025-06-01", "Bultfontein", "13 Cows", "Andries Nel Hendrik Jooste", 13, 0, 0, "26°47'51.0\"S 26°18'05.8\"E", "26°48'33.4\"S 26°25'35.9\"E", "", "", "", "Nov"],
  [63, "2025-05-29", "Opraap Wes", "11 Cows", "J Mare", 11, 0, 0, "26°56'59.2\"S 26°19'27.1\"E", "", "", "", "", "Nov"],
  [64, "2025-05-28", "Syferfontein", "19 Cows", "C. van Zyl", 10, 9, 0, "27°04'25.5\"S 26°21'33.9\"E", "", "", "", "", "Nov"],
  [65, "2025-05-22", "Morea", "1 Cow", "W Geldenhuis", 0, 0, 1, "", "", "", "", "", "Nov"],
  [66, "2025-05-20", "Klerksdorp", "31 Sheep", "Romke de Jong", 0, 31, 0, "", "", "", "", "", "Nov"],
  [67, "2025-05-17", "Syferfontein", "2 Cows", "C. van Zyl", 0, 0, 2, "27°04'25.5\"S 26°21'33.9\"E", "", "27°02'42.2\"S 26°20'55.0\"E", "", "", "Nov"],
  [68, "2025-05-13", "Schoemansfontein", "9 Cows", "Johan Styger", 2, 0, 7, "26°44'54.7\"S 26°32'18.5\"E", "", "26°51'51.4\"S 26°34'36.7\"E", "", "", "Nov"],
  [69, "2025-05-01", "Wolwerand", "7 Sheep", "W. Engelbrecht", 7, 0, 0, "26°51'53.7\"S 26°29'38.8\"E", "26°51'52.7\"S 26°29'46.2\"E", "", "", "", "Nov"],
  [70, "2025-05-01", "Schoemansfontein", "3 Cows 2 Calves", "Johan Styger", 0, 0, 1, "26°44'54.7\"S 26°32'18.5\"E", "", "", "", "", "Nov"],
  [71, "2025-04-29", "Witfontein", "1 Cow 1 Calve", "M. Leshinsky", 0, 2, 0, "26°52'29.1\"S 26°08'53.0\"E", "", "", "", "", "Nov"],
  [72, "2025-04-24", "Wolwerand", "1 Cow", "Sipho", 0, 0, 1, "26°51'12.3\"S 26°26'50.4\"E", "", "", "", "", "April"],
  [73, "2025-04-23", "Witfontein", "2 Sheep", "M. Leshinsky", 0, 2, 0, "26°52'29.1\"S 26°08'53.0\"E", "", "", "", "", "April"],
  [74, "2025-04-19", "Witfontein", "8 Sheep", "M. Leshinsky", 5, 3, 0, "26°52'29.1\"S 26°08'53.0\"E", "26°52'09.7\"S 26°08'52.6\"E", "", "", "", "April"],
  [75, "2025-04-18", "Schoemansfontein", "4 Cows 1 Bull", "Johan Styger", 0, 5, 0, "26°44'54.7\"S 26°32'18.5\"E", "", "", "", "", "April"],
  [76, "2025-04-12", "Paardeplaas", "115 Sheep", "F. Anderson", 7, 108, 0, "26°37'26.1\"S 26°18'23.5\"E", "26°38'07.5\"S 26°20'13.0\"E", "", "26°38'07.5\"S 26°20'13.0\"E", "", "April"],
  [77, "2025-04-09", "Boschpoort", "3 Cows", "L. Botha D le Roux", 3, 0, 0, "", "26°51'35.0\"S 26°33'58.2\"E", "", "", "", "April"],
  [78, "2025-04-06", "Alabama", "18 Sheep", "Onbekend", 0, 18, 0, "26°52'28.7\"S 26°34'33.8\"E", "", "", "", "", "April"],
  [79, "2025-04-03", "Dupperspos", "72 Sheep", "K. Labouschangne", 55, 17, 0, "26°31'23.9\"S 26°25'08.2\"E", "", "", "26°31'04.6\"S 26°24'50.2\"E", "", "April"],
  [80, "2025-04-02", "Ottosdal", "5 Cows", "D. Pretorius", 2, 3, 0, "", "", "", "", "", "April"],
  [81, "2025-03-28", "Brakspruit", "6 Cows", "P. Hamilton-hall", 6, 0, 0, "26°39'48.0\"S 26°34'35.4\"E", "", "", "", "", "April"],
  [82, "2025-03-26", "Renosterhoek", "6 Bulls", "J. Mare", 6, 0, 0, "26°51'06.3\"S 26°23'40.7\"E", "26°50'22.0\"S 26°24'15.0\"E", "", "", "", "April"],
  [83, "2025-03-26", "Schoemansfontein", "4 Cows 1 Calve", "Johan Styger", 0, 5, 0, "26°44'54.7\"S 26°32'18.5\"E", "", "", "", "", "April"],
  [84, "2025-03-26", "Houwater", "16 Cows 1 Calve", "Hansie Viljoen", 12, 3, 2, "27°12'57.1\"S 26°15'15.6\"E", "27°12'57.1\"S 26°15'15.6\"E", "27°12'57.1\"S 26°15'15.6\"E", "", "", "April"],
  [85, "2025-03-25", "Oorbietjiesfontein", "6 Cows", "F. Martin", 6, 0, 0, "26°49'42.5\"S 26°22'31.7\"E", "26°53'16.4\"S 26°32'48.7\"E", "", "", "", "April"],
  [86, "2025-03-20", "Makokskraal", "12 Cows", "A. Corneels", 6, 6, 0, "", "", "", "", "", "April"],
  [87, "2025-03-14", "Boschpoort", "32 Sheep", "E. van Wyk", 1, 31, 0, "26°37'29.2\"S 26°11'15.5\"E", "", "", "26°36'27.9\"S 26°13'09.4\"E", "", "April"],
  [88, "2025-03-12", "Doornfontein", "14 Cows", "D. Viljoen", 0, 14, 0, "", "", "", "", "", "April"],
  [89, "2025-03-07", "Boschpoort", "12 Sheep", "T. de Koker", 0, 12, 0, "26°33'27.1\"S 26°11'37.6\"E", "", "", "26°36'27.9\"S 26°13'09.4\"E", "", "April"],
  [90, "2025-03-05", "Vaalbos", "2 Cows", "S. Cloete", 0, 2, 0, "", "", "", "", "", "April"],
  [91, "2025-02-28", "Rietfontein", "1 Rhino", "M. Nel", 0, 0, 0, "26°50'47.5\"S 26°15'35.6\"E", "", "", "", "", "April"],
  [92, "2025-02-25", "Platberg", "1 Cow", "G. Coetzer", 0, 0, 1, "", "", "", "", "", "April"],
  [93, "2025-02-25", "Schweizer", "70 Goats", "R. Victor", 0, 70, 0, "", "", "", "", "", "April"],
  [94, "2025-02-13", "Droekraal", "1 Cow", "J. Viljoen", 0, 1, 0, "26°45'38.8\"S 26°07'37.3\"E", "", "", "", "", "April"],
  [95, "2025-02-12", "Renosterhoek", "2 Cows", "J. Pollard", 2, 0, 0, "26°52'08.6\"S 26°26'12.1\"E", "", "", "", "", "April"],
  [96, "2025-02-11", "Wolwerand", "7 Cows", "P. Makintinie", 6, 1, 0, "26°53'26.3\"S 26°29'44.6\"E", "", "", "", "", "April"],
  [97, "2025-02-11", "Syferfontein", "13 Cows", "C. Daffue", 13, 0, 0, "27°04'25.5\"S 26°21'33.9\"E", "", "", "", "", "April"],
  [98, "2025-02-10", "Wolwerand", "5 Cows", "L. Camfer", 0, 5, 0, "26°51'12.3\"S 26°26'50.4\"E", "", "", "", "", "April"],
  [99, "2025-02-06", "Meliodora", "2 Bulls", "M. Nel", 2, 0, 0, "26°48'30.5\"S 26°06'30.5\"E", "", "", "", "", "April"],
  [100, "2025-01-31", "Makokskraal", "1 Cow 3 Calves", "C. Boshoff", 0, 4, 0, "", "", "", "", "", "April"],
  [101, "2025-01-29", "Klerksdorp", "44 Sheep", "D. Kritzinger", 0, 44, 0, "26°49'02.5\"S 26°38'37.2\"E", "", "", "", "", "April"],
  [102, "2025-01-26", "Leeudoringstad", "1 Cow", "Onbekend", 6, 1, 0, "", "", "", "", "", "April"],
  [103, "2025-01-21", "Wolwerand", "18 Sheep", "W. Engelbrecht", 16, 2, 0, "26°51'52.6\"S 26°29'41.6\"E", "", "", "", "", "April"],
  [104, "2025-01-17", "Sendelingsfontein", "27 Sheep", "R. Swart", 0, 27, 0, "26°54'59.6\"S 26°14'15.6\"E", "", "", "26°57'26.3\"S 26°18'24.3\"E", "", "April"],
  [105, "2025-01-09", "Makokskraal", "1 Cow", "A. Cornelius", 0, 0, 1, "", "", "", "", "", "April"],
  [106, "2025-01-08", "Rietfontein", "1 Rhino", "M. Nel", 0, 0, 0, "26°50'47.5\"S 26°15'35.6\"E", "", "", "", "", "April"],
  [107, "2024-12-31", "Paardeplaas", "24 Sheep", "F. Anderson", 0, 24, 0, "26°37'26.1\"S 26°18'23.5\"E", "", "", "26°38'07.5\"S 26°20'13.0\"E", "", "April"],
  [108, "2024-12-31", "Wolwerand", "3 Cows 3 Calves", "N. Meyer", 6, 0, 0, "26°51'22.0\"S 26°27'41.5\"E", "", "", "26°55'38.5\"S 26°33'26.9\"E", "", "April"],
  [109, "2024-08-30", "Wolwerand", "1 Cow", "Wolwerand Eienaar", 0, 0, 1, "26°52'03.9\"S 26°29'21.6\"E", "", "26°53'15.7\"S 26°30'48.7\"E", "", "", "Aug2023"],
  [110, "2024-06-14", "Hartbeesfontein", "1 Bull", "Hartbeesfontein Eienaar", 0, 0, 1, "26°45'16.6\"S 26°26'52.6\"E", "", "26°45'29.3\"S 26°26'56.7\"E", "", "", "Aug2023"],
  [111, "2024-06-14", "Witpoort", "1 Bull 2 Cows 8 Calves", "Witpoort Eienaar", 8, 3, 0, "26°49'26.3\"S 26°35'36.4\"E", "", "", "", "", "Aug2023"],
  [112, "2024-06-07", "Hartbeesfontein", "44 Sheep", "Hartbeesfontein Eienaar", 6, 38, 0, "26°46'10.6\"S 26°24'24.6\"E", "26°48'15.9\"S 26°25'34.4\"E", "", "26°48'15.9\"S 26°25'34.4\"E", "", "Aug2023"],
  [113, "2024-06-05", "Sendelingsfontein", "3 Cows", "Sendelingsfontein Eienaar", 0, 3, 0, "26°55'22.8\"S 26°13'39.3\"E", "", "", "", "", "Aug2023"],
  [114, "2024-05-29", "Ysterspruit", "3 Cows", "Ysterspruit Eienaar", 0, 0, 0, "27°07'17.3\"S 26°22'13.0\"E", "", "", "", "", "Aug2023"],
  [115, "2024-05-24", "Jakkalsfontein", "3 Cows", "Dr Johan Fourie", 0, 0, 3, "26°56'26.5\"S 26°19'15.2\"E", "", "26°56'59.2\"S 26°19'27.1\"E", "", "", "Nov"],
  [116, "2024-05-19", "Wolwerand", "5 Cows", "Wolwerand Eienaar", 3, 0, 0, "26°51'17.9\"S 26°26'36.9\"E", "26°53'03.5\"S 26°30'20.0\"E", "", "", "", "Aug2023"],
  [117, "2024-05-19", "Sendelingsfontein", "3 Cows", "Stephan Cloete", 0, 0, 3, "", "", "27°01'07.5\"S 26°19'59.2\"E", "", "", "Nov"],
  [118, "2024-05-12", "Witpoort", "11 Cows", "Witpoort Eienaar", 0, 6, 5, "26°43'58.8\"S 26°36'21.3\"E", "", "26°51'50.8\"S 26°34'37.2\"E", "", "", "Aug2023"],
  [119, "2024-05-08", "Wolwerand", "1 Cow", "Wolwerand Eienaar", 1, 0, 0, "26°52'50.2\"S 26°28'15.2\"E", "26°53'23.2\"S 26°34'14.3\"E", "", "", "", "Aug2023"],
  [120, "2024-05-01", "Oorbietjiesfontein", "30 Chickens", "Oorbietjiesfontein Eienaar", 0, 30, 0, "26°49'00.8\"S 26°21'57.7\"E", "", "", "", "Aug2023"],
  [121, "2024-04-26", "Vredehof", "1 Calve", "Vredehof Eienaar", 0, 1, 0, "26°49'05.1\"S 26°08'06.2\"E", "", "", "", "", "Aug2023"],
  [122, "2024-04-25", "Witpoort", "8 Cows 18 Calves", "Witpoort Eienaar", 8, 18, 0, "26°43'14.3\"S 26°35'36.2\"E", "26°45'28.7\"S 26°59'27.1\"E", "", "", "", "Aug2023"],
  [123, "2024-04-25", "Doornpoort", "11 Cows 4 Calves", "Doornpoort Eienaar", 15, 0, 0, "26°40'48.3\"S 26°38'45.8\"E", "26°40'06.5\"S 26°36'19.2\"E", "", "", "", "Aug2023"],
  [124, "2024-04-24", "Ysterspruit", "1 Cow", "Ysterspruit Eienaar", 0, 1, 0, "26°59'05.0\"S 26°31'23.6\"E", "", "", "", "", "Aug2023"],
  [125, "2024-04-23", "Schoemansfontein", "1 Bull 4 Cows 1 Calve", "Schoemansfontein Eienaar", 6, 0, 0, "26°46'18.9\"S 26°27'36.2\"E", "26°51'13.0\"S 26°32'02.3\"E", "", "", "", "Aug2023"],
  [126, "2024-04-22", "Paardeplaas", "40 Sheep", "Paardeplaas Eienaar", 0, 40, 0, "26°37'25.8\"S 26°18'28.4\"E", "", "", "", "", "Aug2023"],
  [127, "2024-04-17", "Rhenosterhoek", "2 Bulls 2 Cows 3 Calves", "1 Bull 2 Cows Eienaar", 4, 0, 3, "26°50'43.5\"S 26°24'00.0\"E", "26°54'30.8\"S 26°24'08.9\"E", "26°54'40.1\"S 26°23'40.8\"E", "", "", "Aug2023"],
  [128, "2024-04-16", "Witpoort", "3 Cows", "Onbekend", 3, 0, 0, "", "26°43'42.2\"S 26°35'52.9\"E", "", "", "", "April"],
  [129, "2024-04-16", "Palmietfontein", "2 Cows", "A. Bester", 0, 0, 2, "", "", "26°45'02.1\"S 26°41'52.9\"E", "26°45'02.1\"S 26°41'52.9\"E", "", "April"],
  [130, "2024-04-15", "Rietvallei", "16 Cows 7 Calves", "Rietvallei Eienaar", 22, 1, 0, "26°49'56.5\"S 26°08'25.7\"E", "26°42'54.2\"S 26°23'54.8\"E", "", "", "", "Aug2023"],
  [131, "2024-04-15", "Lemoenfontein", "30 Sheep", "Lemoenfontein Eienaar", 0, 30, 0, "26°37'32.5\"S 26°29'41.0\"E", "", "", "26°42'20.1\"S 26°24'06.9\"E", "", "Aug2023"],
  [132, "2024-04-15", "Witpoort", "20 Cows", "Witpoort Eienaar", 20, 0, 0, "26°44'52.0\"S 26°34'12.8\"E", "26°46'20.8\"S 26°35'12.1\"E", "", "", "", "Aug2023"],
  [133, "2024-04-15", "Brakspruit", "12 Cows", "Brakspruit Eienaar", 12, 0, 0, "26°39'59.7\"S 26°34'59.1\"E", "26°40'02.9\"S 26°35'49.3\"E", "", "", "", "Aug2023"],
  [134, "2024-04-14", "Klippan", "20 Pigs", "Klippan Eienaar", 0, 20, 0, "26°44'37.8\"S 26°11'41.2\"E", "", "", "", "", "Aug2023"],
  [135, "2024-04-12", "Unknown", "2 Cows", "Onbekend", 0, 0, 2, "", "", "26°51'35.7\"S 26°33'32.1\"E", "", "", "Aug2023"],
  [136, "2024-04-09", "Arizona", "3 Cows", "Arizona Eienaar", 2, 0, 1, "26°40'47.0\"S 26°31'30.0\"E", "26°41'11.6\"S 26°32'19.5\"E", "26°41'08.7\"S 26°32'33.7\"E", "", "", "Aug2023"],
  [137, "2024-04-03", "Lemmerville", "10 Cows", "Lemmerville Eienaar", 2, 8, 0, "26°44'52.7\"S 26°22'35.2\"E", "26°43'19.0\"S 26°22'35.8\"E", "", "", "", "Aug2023"],
  [138, "2024-03-26", "Opraap Wes", "48 Goats", "Opraap Eienaar", 0, 48, 0, "26°58'50.8\"S 26°21'51.2\"E", "", "", "", "", "Aug2023"],
  [139, "2024-03-24", "Syferlaagte", "7 Cows", "Syferlaagte Eienaar", 7, 0, 0, "26°41'54.3\"S 26°22'22.6\"E", "26°42'19.6\"S 26°22'51.8\"E", "", "", "", "Aug2023"],
  [140, "2024-03-24", "Platberg", "19 Sheep", "Platberg Eienaar", 0, 19, 0, "26°34'54.6\"S 26°38'52.9\"E", "", "", "26°37'40.6\"S 26°36'25.2\"E", "", "Aug2023"],
  [141, "2024-03-19", "Wolwerand", "2 Cows", "Wolwerand Eienaar", 0, 0, 2, "26°52'03.9\"S 26°29'21.6\"E", "", "26°51'35.7\"S 26°33'31.9\"E", "", "", "Aug2023"],
  [142, "2024-03-18", "Oorbietjiesfontein", "97 Chickens", "Oorbietjiesfontein Eienaar", 97, 0, 0, "26°49'00.8\"S 26°21'57.7\"E", "26°50'23.6\"S 26°22'31.2\"E", "", "26°49'50.6\"S 26°22'32.0\"E", "", "Aug2023"],
  [143, "2024-03-16", "Syferlaagte", "1 Sheep", "Syferlaagte Eienaar", 0, 0, 0, "26°41'50.4\"S 26°20'49.4\"E", "", "", "", "", "Aug2023"],
  [144, "2024-03-14", "Rhenosterspruit", "7 Cows 2 Calves", "Rhenosterspruit Eienaar", 0, 0, 0, "26°56'55.6\"S 26°22'03.6\"E", "", "", "", "", "Aug2023"],
  [145, "2024-03-06", "Vlaklaagte", "8 Cows", "Vlaklaagte Eienaar", 0, 8, 0, "26°40'47.0\"S 26°31'30.0\"E", "", "", "", "", "Aug2023"],
  [146, "2024-02-28", "Doornpoort", "7 Pigs", "Doornpoort Eienaar", 0, 7, 0, "26°37'40.5\"S 26°37'48.8\"E", "", "", "", "", "Aug2023"],
  [147, "2024-02-24", "Graceland", "7 Cows", "Graceland Eienaar", 0, 7, 0, "", "", "", "", "", "Aug2023"],
  [148, "2024-02-22", "Wolwerand", "3 Cows", "Wolwerand Eienaar", 1, 0, 2, "26°52'03.9\"S 26°29'21.6\"E", "26°51'32.2\"S 26°33'25.1\"E", "26°51'35.7\"S 26°33'31.9\"E", "", "", "Aug2023"],
  [149, "2024-02-21", "Hartbeesfontein", "4 Cows", "Hartbeesfontein Eienaar", 0, 0, 4, "26°45'42.7\"S 26°24'26.3\"E", "", "26°43'09.2\"S 26°23'08.2\"E", "", "", "Aug2023"],
  [150, "2024-02-19", "Hartbeesfontein", "17 Sheep", "Hartbeesfontein Eienaar", 17, 0, 0, "26°46'02.3\"S 26°24'50.9\"E", "26°45'43.2\"S 26°24'24.0\"E", "", "", "", "Aug2023"],
  [151, "2024-02-17", "Unknown", "1 Cow", "Onbekend", 0, 0, 1, "", "", "26°43'09.5\"S 26°23'05.9\"E", "", "", "Aug2023"],
  [152, "2024-02-13", "Wolwerand", "1 Cow", "Wolwerand Eienaar", 0, 0, 1, "", "", "26°52'08.5\"S 26°31'56.7\"E", "", "", "Aug2023"],
  [153, "2024-01-30", "Platberg", "40 Sheep", "Platberg Eienaar", 0, 40, 0, "26°40'42.3\"S 26°39'13.2\"E", "", "", "", "", "Aug2023"],
  [154, "2024-01-27", "Wolwerand", "6 Cows", "Wolwerand Eienaar", 3, 0, 3, "26°52'06.3\"S 26°28'03.0\"E", "26°52'48.5\"S 26°33'04.0\"E", "26°52'48.5\"S 26°33'04.0\"E", "", "", "Aug2023"],
  [155, "2024-01-25", "KLD Plotte", "6 Cows", "KLD Plotte Eienaar", 0, 6, 0, "26°49'51.7\"S 26°35'01.3\"E", "", "", "26°51'28.8\"S 26°35'34.7\"E", "", "Aug2023"],
  [156, "2024-01-22", "Rhenosterspruit", "7 Cows 10 Calves", "Rhenosterspruit Eienaar", 0, 17, 0, "26°56'55.6\"S 26°22'03.6\"E", "", "", "", "", "Aug2023"],
  [157, "2024-01-22", "Opraap Wes", "1 Cow", "Opraap Eienaar", 1, 0, 0, "26°57'32.9\"S 26°25'28.5\"E", "26°58'27.9\"S 26°24'20.0\"E", "", "", "", "Aug2023"],
  [158, "2024-01-19", "Vlaklaagte", "17 Cows", "Vlaklaagte Eienaar", 12, 5, 0, "26°42'03.2\"S 26°33'13.3\"E", "26°48'51.4\"S 26°30'31.9\"E", "", "", "", "Aug2023"],
  [159, "2024-01-19", "Rietkuil", "27 Calves", "Rietkuil Eienaar", 15, 12, 0, "26°48'27.2\"S 26°32'31.0\"E", "26°48'27.0\"S 26°31'44.2\"E", "", "", "", "Aug2023"],
  [160, "2023-12-28", "Wolwerand", "5 Cows", "Wolwerand Eienaar", 1, 0, 4, "26°52'03.9\"S 26°29'21.6\"E", "", "26°50'56.9\"S 26°33'57.0\"E", "", "", "Aug2023"],
  [161, "2023-12-28", "KLD Plotte", "53 Sheep", "KLD Plotte Eienaar", 0, 53, 0, "26°50'04.5\"S 26°34'37.9\"E", "", "", "26°51'46.7\"S 26°33'46.0\"E", "", "Aug2023"],
  [162, "2023-12-26", "KLD Plotte", "17 Sheep", "KLD Plotte Eienaar", 0, 17, 0, "26°50'04.5\"S 26°35'08.2\"E", "", "", "26°51'46.7\"S 26°33'46.0\"E", "", "Aug2023"],
  [163, "2023-12-22", "Wolwerand", "4 Sheep", "Wolwerand Eienaar", 4, 0, 0, "26°51'43.2\"S 26°28'40.1\"E", "", "", "", "", "Aug2023"],
  [164, "2023-12-20", "Schoemansfontein", "7 Cows", "Schoemansfontein Eienaar", 1, 1, 5, "26°45'07.2\"S 26°30'43.1\"E", "26°50'46.4\"S 26°32'31.5\"E", "26°49'17.1\"S 26°32'13.9\"E", "", "", "Aug2023"],
  [165, "2023-12-14", "Rhenosterhoek", "6 Cows", "Rhenosterhoek Eienaar", 2, 0, 4, "26°51'44.7\"S 26°28'11.3\"E", "26°51'43.7\"S 26°33'48.0\"E", "26°51'43.0\"S 26°33'48.9\"E", "", "", "Aug2023"],
  [166, "2023-11-24", "Schoemansfontein", "12 Cows", "Schoemansfontein Eienaar", 7, 0, 5, "26°45'07.2\"S 26°30'43.1\"E", "26°48'42.7\"S 26°31'59.0\"E", "26°49'17.1\"S 26°32'13.9\"E", "", "", "Aug2023"],
  [167, "2023-11-22", "KLD Plotte", "7 Cows", "KLD Plotte Eienaar", 5, 0, 2, "26°50'21.9\"S 26°35'10.9\"E", "26°51'51.4\"S 26°34'34.1\"E", "26°51'51.0\"S 26°34'34.8\"E", "", "", "Aug2023"],
  [168, "2023-11-17", "Schoemansfontein", "1 Cow", "Schoemansfontein Eienaar", 0, 0, 1, "26°44'42.3\"S 26°32'01.7\"E", "", "26°49'19.0\"S 26°32'12.0\"E", "", "", "Aug2023"],
  [169, "2023-10-31", "Schoemansfontein", "7 Cows", "Schoemansfontein Eienaar", 3, 0, 4, "26°45'46.8\"S 26°31'24.8\"E", "26°53'09.0\"S 26°33'18.8\"E", "26°53'09.0\"S 26°33'18.8\"E", "", "", "Aug2023"],
  [170, "2023-10-31", "Schoemansfontein", "4 Cows", "Schoemansfontein Eienaar", 0, 4, 0, "26°46'26.8\"S 26°29'48.2\"E", "", "", "", "", "Aug2023"],
  [171, "2023-10-17", "Rhenosterhoek", "14 Cows", "Rhenosterhoek Eienaar", 14, 0, 0, "26°51'18.6\"S 26°25'07.7\"E", "", "", "26°54'57.0\"S 26°23'15.0\"E", "", "Aug2023"],
  [172, "2023-10-17", "Wolwerand", "3 Cows", "Wolwerand Eienaar", 0, 3, 0, "26°52'00.6\"S 26°29'28.8\"E", "", "", "", "", "Aug2023"],
  [173, "2023-09-28", "Doornplaat", "13 Sheep", "Doornplaat Eienaar", 0, 13, 0, "27°01'40.6\"S 26°26'53.4\"E", "", "", "27°04'51.1\"S 26°22'10.7\"E", "", "Aug2023"],
  [174, "2023-09-22", "Hartbeesfontein", "6 Cows", "Hartbeesfontein Eienaar", 6, 0, 0, "26°44'45.0\"S 26°24'42.4\"E", "26°11'24.1\"S 26°11'10.3\"E", "", "26°43'09.3\"S 26°23'08.4\"E", "", "Aug2023"],
  [175, "2023-09-16", "Driekuil", "3 Cows 3 Kalves", "Driekuil Eienaar", 0, 6, 0, "26°48'26.3\"S 26°03'43.4\"E", "", "", "", "", "Aug2023"],
  [176, "2023-09-12", "Rhenosterhoek", "2 Cows", "Rhenosterhoek Eienaar", 0, 2, 0, "26°53'17.0\"S 26°25'40.7\"E", "", "", "26°54'59.0\"S 26°23'15.7\"E", "", "Aug2023"]
];

function buildCases() {
  const cases = RAW_RECORDS.map(([num, date, area, stolen, contact, rec, miss, slaugh, stolenGps, foundGps, slaughGps, loadGps, fenceGps, source]) => {
    const casePad = String(num).padStart(3, '0');
    const caseYear = date.substring(0, 4);
    const caseMonth = date.substring(5, 7);
    const caseDay = date.substring(8, 10);
    const id = `CASE-VIS-HBF-${casePad}`;
    const caseNumber = `VIS-HBF-${caseYear}-${casePad}`;
    
    const primaryGps = parseGps(stolenGps) || parseGps(foundGps) || parseGps(slaughGps) || parseGps(fenceGps) || parseGps(loadGps);
    const foundCoords = parseGps(foundGps);
    const slaughCoords = parseGps(slaughGps);
    const loadCoords = parseGps(loadGps);
    const fenceCoords = parseGps(fenceGps);
    
    let priority = 'medium';
    if (slaugh > 0 || rec + miss >= 30) {
      priority = 'critical';
    } else if (rec + miss >= 8 || slaugh > 0) {
      priority = 'high';
    }
    
    let status = 'investigating';
    if (miss === 0 && (rec > 0 || slaugh > 0)) {
      status = 'resolved';
    } else if (rec === 0 && miss > 0 && slaugh === 0 && new Date(date) < new Date('2024-01-01')) {
      status = 'closed';
    }

    const updates = [];
    if (rec > 0) {
      updates.push({
        id: `UPD-VIS-${casePad}-1`,
        caseId: id,
        authorUid: 'USR-CTRL-001',
        authorName: 'VIS Register Beheerkamer',
        authorRole: 'CONTROL_ROOM',
        message: `Herwinning op rekord: ${rec} diere herwin/teruggevind.${foundGps ? ' Gevind by koördinate: ' + foundGps : ''}`,
        updateType: 'action_taken',
        isInternalOnly: false,
        gpsLocation: foundCoords || undefined,
        timestamp: `${date}T10:00:00Z`
      });
    }
    if (slaugh > 0) {
      updates.push({
        id: `UPD-VIS-${casePad}-2`,
        caseId: id,
        authorUid: 'USR-CTRL-001',
        authorName: 'VIS Veediefstal Ondersoek',
        authorRole: 'CONTROL_ROOM',
        message: `Veldslagting bevestig: ${slaugh} diere geslag.${slaughGps ? ' Slagplek koördinate: ' + slaughGps : ''}`,
        updateType: 'progress',
        isInternalOnly: false,
        gpsLocation: slaughCoords || undefined,
        timestamp: `${date}T12:00:00Z`
      });
    }

    const modusList = ['FENCE_CUT', 'LIVESTOCK_DRIVEN_AWAY'];
    if (slaugh > 0) modusList.push('OTHER');
    if (loadGps) modusList.push('VEHICLE_USED');

    const descParts = [
      `KLAER / KONTAK: ${contact}.`,
      `AREA / PLAAS: ${area}.`,
      `GESTEEL: ${stolen}.`,
      `STATUS: ${rec} Herwin | ${miss} Vermis | ${slaugh} Geslag.`,
      stolenGps ? `Gesteel Koördinate: ${stolenGps}.` : '',
      foundGps ? `Gevind Koördinate: ${foundGps}.` : '',
      slaughGps ? `Slagplek Koördinate: ${slaughGps}.` : '',
      loadGps ? `Laaipunt Koördinate: ${loadGps}.` : '',
      fenceGps ? `Draadsnyding Koördinate: ${fenceGps}.` : '',
      `Bron: ${source} Register (VIS Konsolidasie).`
    ].filter(Boolean).join(' ');

    // Match client profile if possible
    let linkedClient = null;
    try {
      const actualClientsFile = path.join(__dirname, '../src/data/actualClientProfilesData.ts');
      if (fs.existsSync(actualClientsFile)) {
        const fileData = fs.readFileSync(actualClientsFile, 'utf8');
        const jsonMatch = fileData.match(/ACTUAL_CLIENT_PROFILES: UserProfile\[\] = (\[[\s\S]*?\]);/);
        if (jsonMatch) {
          const clients = JSON.parse(jsonMatch[1]);
          const contactLower = contact.toLowerCase().trim();
          const areaLower = area.toLowerCase().trim();

          linkedClient = clients.find(c => {
            const fullName = `${c.name} ${c.surname}`.toLowerCase();
            const surname = c.surname.toLowerCase();
            const name = c.name.toLowerCase();
            const farm = (c.farmName || '').toLowerCase();

            if (contactLower.includes(surname) && (contactLower.includes(name) || name.length <= 3)) return true;
            if (contactLower === fullName || contactLower.includes(fullName)) return true;
            if (contactLower === surname && areaLower.includes(farm)) return true;
            if (contactLower.includes('pollard') && surname === 'pollard') return true;
            if (contactLower.includes('cobus de jager') && (c.name.includes('Cobus') || c.surname.includes('Jager'))) return true;
            if (contactLower.includes('lang') && surname === 'lang') return true;
            if (contactLower.includes('wessels') && surname === 'wessels') return true;
            if (contactLower.includes('badenhorst') && surname === 'badenhorst') return true;
            if (contactLower.includes('loots') && surname === 'loots') return true;
            if (contactLower.includes('engelbrecht') && surname === 'engelbrecht') return true;
            if (contactLower.includes('pretorius') && surname === 'pretorius') return true;
            if (contactLower.includes('fourie') && surname === 'fourie') return true;
            if (contactLower.includes('erasmus') && surname === 'erasmus') return true;
            if (contactLower.includes('styger') && surname === 'styger') return true;
            if (contactLower.includes('swanepoel') && surname === 'swanepoel') return true;
            if (contactLower.includes('swart') && surname === 'swart') return true;
            if (contactLower.includes('leshinsky') && surname.includes('lechinsky')) return true;
            if (contactLower.includes('lemmer') && surname.includes('lemmer')) return true;
            if (contactLower.includes('botha') && surname === 'botha') return true;
            if (contactLower.includes('mare') && (surname.includes('marè') || surname.includes('maree'))) return true;
            if (contactLower.includes('nel') && surname === 'nel') return true;
            if (contactLower.includes('viljoen') && surname === 'viljoen') return true;
            if (contactLower.includes('venter') && surname === 'venter') return true;
            if (contactLower.includes('vermaas') && surname === 'vermaas') return true;
            if (contactLower.includes('van zyl') && surname.includes('zyl')) return true;
            if (contactLower.includes('van der walt') && surname.includes('walt')) return true;
            if (contactLower.includes('vos') && surname.includes('vos')) return true;
            return false;
          });
        }
      }
    } catch (e) {
      // Fallback
    }

    const reporterUid = linkedClient ? linkedClient.uid : `USR-VIS-REC-${casePad}`;
    const victimName = linkedClient ? `${linkedClient.name} ${linkedClient.surname}` : contact;
    const victimPhone = linkedClient ? linkedClient.primaryPhone : '';
    const victimFarm = linkedClient ? linkedClient.farmName : area;

    return {
      id,
      caseNumber,
      title: `Veediefstal: ${stolen} - ${victimName} (${area})`,
      description: descParts,
      category: 'stock_theft',
      priority,
      status,
      isPublic: true,
      sapsCaseNumber: `VIS-HBF-${casePad}`,
      sapsStation: 'Hartbeesfontein SAPS / STESU',
      incidentDate: date,
      incidentTime: '02:00',
      locationName: `${area} (${victimName})`,
      sector: linkedClient ? linkedClient.sector : `Sektor ${area}`,
      gpsLocation: primaryGps || undefined,
      reportedByUid: reporterUid,
      reportedByName: victimName,
      reportedByPhone: victimPhone,
      victimUid: linkedClient ? linkedClient.uid : undefined,
      victimName,
      victimPhone,
      victimFarmName: victimFarm,
      personDescription: {
        notes: `Gesteel: ${stolen} | Herwin: ${rec} | Vermis: ${miss} | Geslag: ${slaugh}`
      },
      modusOperandi: modusList,
      modusOperandiNotes: [
        fenceGps ? `Draad gesny by: ${fenceGps}` : '',
        loadGps ? `Laaipunt/Vervoerpunt opgemerk by: ${loadGps}` : '',
        slaughGps ? `Veldslagting toneel by: ${slaughGps}` : ''
      ].filter(Boolean).join('. ') || 'Veediefstal insident geregistreer op VIS databasis.',
      photos: [],
      evidence: [],
      updates,
      linkedPoiIds: [],
      linkedVehicleIds: [],
      createdAt: `${date}T06:00:00Z`,
      updatedAt: `${date}T14:00:00Z`
    };
  });

  const fileContent = `import { Case } from '../types';

/**
 * Official Stock Theft (VIS - Veediefstal Inligting Stelsel) Consolidated Incident Register
 * Hartbeesfontein / Klerksdorp Region
 * Total Unique Cases: ${cases.length}
 * Date Range: 2023-09-12 to 2025-10-31
 * Sources: April 2025 VIS • Aug 2023–Jun 2024 VIS • Oct 2025 VIS • Nov 2025 VIS
 */
export const ACTUAL_VIS_CASES: Case[] = ${JSON.stringify(cases, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/actualVisCasesData.ts'), fileContent, 'utf8');
  console.log(`Successfully generated ${cases.length} cases in src/data/actualVisCasesData.ts`);
}

buildCases();
