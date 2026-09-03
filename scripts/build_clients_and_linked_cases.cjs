const fs = require('fs');
const path = require('path');

// Complete list of HBF Boerevereniging Clients parsed from PDF Pages 1-6
const CLIENT_RAW_DATA = [
  // [name, surname, farm, town, phone, email, category, agriNW, altPhone]
  // Page 1
  ["Hendrik", "Badenhorst", "Witfontein", "Hartbeesfontein", "082 669 7805", "h.a.geld@gmail.com", "HOOFLID", "J", ""],
  ["John", "Benade", "Dupperspos", "Coligny", "084 811 0807", "0848110807@vodamail.co.za", "ERELID", "J", "081 811 0807"],
  ["Hennie", "Bester", "Leeuwfontein", "Hartbeesfontein", "082 773 2086", "hbkbester@yahoo.com", "HOOFLID", "J", ""],
  ["Jan", "Bester", "Flamwood Walk", "Flamwood", "084 205 4610", "jan.b@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Louis", "Bester", "Leeufontein", "Hartbeesfontein", "071 355 5876", "lpjbester@yahoo.com", "VOLLE_LID", "J", ""],
  ["Hennie", "Beyers", "Goedvooruitzicht", "Hartbeesfontein", "083 629 6537", "beyersboerdery@lantic.net", "HOOFLID", "J", ""],
  ["Piet", "Bloem", "Welgevonden", "Hartbeesfontein", "082 777 9087", "pieterbloem7@gmail.com", "VOLLE_LID", "J", ""],
  ["Boet", "Benade", "Leeuwfontein", "Lichtenburg", "082 577 6097", "boetbenade@vodamail.co.za", "ERELID", "J", ""],
  ["Ben", "Botha", "Brakspruit", "Flamwood", "082 805 3295", "joanieb@mweb.co.za", "VOLLE_LID", "J", ""],
  ["Danie", "Botha", "Klippan", "Ottosdal", "072 231 4867", "danie@danietrust.com", "VOLLE_LID", "J", ""],
  ["Marius", "Brink", "Opraap Wes", "Dominionville", "082 779 3590", "janbosman.brink@sangenta.com", "ASSOSIAAT", "J", ""],
  ["Naas", "Brits", "Rietfontein", "Klerksdorp", "083 271 1412", "naasbrits@webmail.com", "HOOFLID", "J", ""],
  ["Werner", "Burger", "Carlsheim", "Stellenbosch", "083 251 1301", "burger@emboss.co.za", "VOLLE_LID", "J", ""],
  ["Stephan", "Buys", "Paardeplaas", "Hartbeesfontein", "082 788 3352", "ChairmaineBuys75@gmail.com", "HOOFLID", "J", ""],
  ["Jacques", "Calitz", "Cyferkuil", "Hartbeesfontein", "082 044 1702", "calitz@lantic.net", "VOLLE_LID", "J", ""],
  ["Cobus de Jager", "Trust", "Rhenosterhoek", "Hartbeesfontein", "083 650 7383", "dejagerelsje@yahoo.com", "HOOFLID", "J", ""],
  ["Francois", "Coetzee", "Paardeplaas", "Hartbeesfontein", "082 413 8837", "elcor@lantic.net", "JONGBOER", "J", ""],
  ["Wim", "Conradie", "Rhenosterhoek", "Panoramapark", "082 316 7768", "franconradie@outlook.com", "VOLLE_LID", "J", ""],
  ["Jorrie", "Cronje", "Goedgevonden", "Flamwood", "083 409 5112", "jdcronje@koshcom.co.za", "VOLLE_LID", "J", ""],
  ["Tinus", "Crous", "Strydfontein", "Freemanville", "082 475 1747", "crous@vodamail.co.za", "VOLLE_LID", "J", ""],
  ["Johan", "de Klerk", "Mauritz", "Hartbeesfontein", "083 289 3668", "johandeklerk@vodamail.co.za", "ERELID", "J", ""],
  ["Marius", "de Klerk", "Rietfontein", "Hartbeesfontein", "082 684 1566", "mariusdeklerk@gmail.com", "JONGBOER", "J", ""],
  ["Paul", "de Klerk", "Lapfontein", "Klerksdorp", "083 302 4887", "hrf1@telkomsa.net", "VOLLE_LID", "J", ""],
  ["Henk", "Dreyer", "Sendelingsfontein", "Klerksdorp", "082 552 0196", "hjdreyer@vodamail.co.za", "HOOFLID", "J", ""],
  ["Bruwer", "du Toit", "Lapfontein", "Klerksdorp", "072 231 4867", "hjdreyer@vodamail.co.za", "VOLLE_LID", "J", ""],
  ["Andre", "Ellis", "Doornplaat", "Klerksdorp", "083 284 9209", "andreegs@absamail.co.za", "VOLLE_LID", "J", ""],
  ["Wansen", "Engelbrecht", "Wolwerand", "Freemanville", "083 304 9388", "wanengel@gmail.com", "VOLLE_LID", "J", ""],
  ["Christiaan", "Erasmus", "Welgelegen", "Hartbeesfontein", "084 549 0695", "chrisplaas5@gmail.com", "VOLLE_LID", "J", ""],
  ["Cobus", "Erasmus", "Skietfontein", "Hartbeesfontein", "083 461 0950", "rasmori@lantic.net", "HOOFLID", "J", ""],
  ["Jan", "Erasmus", "Jakkalsfontein", "Flamwood Walk", "079 526 3919", "info@erasmusboerdry.com", "VOLLE_LID", "J", ""],
  ["Jozua", "Erasmus", "Syferfontein", "Hartbeesfontein", "083 310 5131", "jperasmus@lantic.net", "JONGBOER", "J", ""],
  ["Pieter", "Ferreira", "Hartbeesfontein", "Hartbeesfontein", "082 308 5871", "pieterferreira@vodamail.co.za", "ERELID", "J", "082 465 8565"],
  ["Johann (Dr.)", "Fourie", "Jakkalsfontein", "Flamwood Walk", "082 772 7716", "johannfourie@telkomsa.net", "VOLLE_LID", "J", ""],
  ["SP", "Fourie", "Brakspruit", "Doornkruin", "082 745 4906", "0760350684@vodamail.co.za", "HOOFLID", "J", ""],
  ["Hendrik", "Geldenhuys", "Rietfontein", "Hartbeesfontein", "083 564 9482", "h.a.geld@gmail.com", "HOOFLID", "J", ""],
  ["Koos", "Geldenhuys", "Jakkalsfontein", "Klerksdorp", "083 265 3654", "koos@jjg.co.za", "VOLLE_LID", "J", ""],
  ["Riana", "Geldenhuys", "Rietfontein", "Hartbeesfontein", "082 573 2664", "rianageldenhuys@vodamail.co.za", "HOOFLID", "J", ""],
  ["Wicus", "Geldenhuys", "Witfontein", "Hartbeesfontein", "083 279 2031", "wicusgeldenhuys@vodamail.co.za", "HOOFLID", "J", ""],
  ["Johann", "Gutsche", "Geduld", "Baillie Park", "083 776 8640", "mwgutsche@gmail.com", "VOLLE_LID", "J", ""],
  ["Hannes", "Hamman", "Otterfontein", "Hartbeesfontein", "082 936 1247", "hanneshamman@vodamail.co.za", "ERELID", "N", ""],
  ["Nelius", "Hattingh", "Vlaklaagte", "Hartbeesfontein", "082 306 5808", "neliushattingh@senwes.co.za", "VOLLE_LID", "J", ""],

  // Page 2
  ["Bob", "Hoffman", "Bultfontein", "Hartbeesfontein", "072 255 1466", "meyercarla@yahoo.com", "JONGBOER", "J", ""],
  ["John", "Hume", "Doornplaat", "Flamwood Walk", "082 517 0959", "John@mgame.co.za", "VOLLE_LID", "J", ""],
  ["Boeta", "Jacobs", "Klippan", "Hartbeesfontein", "082 405 1845", "boetajac@gmail.com", "JONGBOER", "J", ""],
  ["Piet", "Jansen van Vuren", "Schoemansfontein", "Hartbeesfontein", "082 944 7194", "fura@lantic.net", "HOOFLID", "J", ""],
  ["Stefan", "Jansen van Vuuren", "Rhenosterspruit", "Hartbeesfontein", "083 561 6183", "shjansenvanvuuren@gmail.com", "JONGBOER", "J", ""],
  ["Juanita", "Jansen van Vuuren", "Leeufontein", "Hartbeesfontein", "072 244 3308", "cornel3@absamail.co.za", "VOLLE_LID", "J", ""],
  ["Hendrik", "Jooste", "Bultfontein", "Hartbeesfontein", "083 399 0792", "hendrikjooste@lantic.net", "HOOFLID", "J", ""],
  ["Willem", "Jooste", "Hartbeesfontein", "Hartbeesfontein", "083 447 9833", "wjj@lantic.net", "HOOFLID", "J", ""],
  ["Renier", "Karsten", "Oorbietjiesfontein", "Hartbeesfontein", "082 417 4185", "renier.Karsten@gmail.com", "JONGBOER", "J", ""],
  ["Andrè", "Kilian", "Syferlaagte", "Hartbeesfontein", "083 287 6594", "apkilian@lantic.net", "HOOFLID", "J", ""],
  ["Wittes", "Kotzè", "Lapfontein", "Klerksdorp", "083 441 0224", "witsan@webmail.co.za", "HOOFLID", "J", ""],
  ["Annerie", "Kruger", "Rietvallei", "Hartbeesfontein", "072 248 3298", "pcpmeyer@koshcom.co.za", "VOLLE_LID", "J", ""],
  ["Riaan", "Kruger", "Rietvallei", "Hartbeesfontein", "072 449 9600", "riaan@discoverymail.co.za", "VOLLE_LID", "J", ""],
  ["JC", "Labuschagne", "Klerksdorp", "Klerksdorp", "084 580 9175", "lappies@omnia.co.za", "ASSOSIAAT", "J", ""],
  ["Wybrand", "Lambrecht", "Geduld", "Hartbeesfontein", "083 450 0378", "wydene@lantic.net", "HOOFLID", "J", ""],
  ["James", "Lang", "Rhenosterhoek", "Klerksdorp", "082 545 6893", "goldenwest@lantic.net", "HOOFLID", "J", ""],
  ["Marinus", "Lechinsky", "Witfontein", "Hartbeesfontein", "082 697 6801", "marinus@lantic.net", "HOOFLID", "J", ""],
  ["Willie", "Lemmer Trust", "Lemmersville", "Hartbeesfontein", "071 687 0543", "lemmerboerdery@lantic.net", "VOLLE_LID", "J", ""],
  ["Frikkie", "Lemmer", "Oorbietjiesfontein", "Hartbeesfontein", "082 944 0633", "atjdfarmlodge@lantic.net", "HOOFLID", "J", ""],
  ["John", "Lemmer", "Oorbietjiesfontein", "Hartbeesfontein", "082 944 4512", "johnviv.lemmer@gmail.com", "HOOFLID", "J", ""],
  ["Jan (Swart)", "Lombaard", "Bultfontein", "Hartbeesfontein", "072 753 5850", "lombaard@lantic.net", "HOOFLID", "J", "082 728 9905"],
  ["Rudi", "Loots", "Lemoenfontein", "Hartbeesfontein", "083 652 2136", "dcloots@koshcom.vo.za", "JONGBOER", "J", ""],
  ["Adunda", "Louw", "Buisfontein", "Hartbeesfontein", "072 218 8524", "adundalouw@gmail.com", "VOLLE_LID", "J", ""],
  ["Abraham", "Maree", "Bonne Esperance", "Klerksdorp", "083 713 8996", "acjmaree@truenw.co.za", "VOLLE_LID", "J", ""],
  ["Frikkie (Snr)", "Martin", "Oorbietjiesfontein", "Hartbeesfontein", "082 944 7177", "frikkiemartin@gmail.com", "HOOFLID", "J", ""],
  ["Fanie", "Marè", "Ysterspruit", "Klerksdorp", "082 801 7314", "faniemar@gmail.com", "HOOFLID", "J", ""],
  ["Jaco", "Marè", "Rhenosterhoek", "Hartbeesfontein", "082 388 4294", "jacomare@lantic.net", "HOOFLID", "J", ""],
  ["Orgie", "Marè", "Rhenosterspruit", "Dominionville", "083 627 3140", "orgie.kari@vodamail.co.za", "HOOFLID", "J", ""],
  ["Jannie", "Meiring", "Bultfontein", "Hartbeesfontein", "082 448 1392", "marelein@gmail.com", "ASSOSIAAT", "J", ""],
  ["Philip", "Meiring", "Skietfontein", "Hartbeesfontein", "082 457 3497", "pjameiring@mweb.co.za", "HOOFLID", "J", ""],
  ["Johan", "Meyer", "Leeuwfontein", "Hartbeesfontein", "083 258 5895", "vatvoor@lantic.net", "HOOFLID", "J", ""],
  ["Johan (Jr.)", "Meyer", "Leeuwfontein", "Hartbeesfontein", "084 510 0844", "vatvoor@lantic.net", "VOLLE_LID", "J", ""],
  ["Daniel", "Moller", "Skietfontein", "Hartbeesfontein", "073 175 9080", "danielmoller@vodamail.co.za", "JONGBOER", "J", ""],
  ["Andries (Vee-arts)", "Nel", "Bultfontein", "Hartbeesfontein", "082 775 0948", "Nelmarietjie@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Marius", "Nel", "Rietfontein", "Hartbeesfontein", "083 407 2313", "ifo@mnelboerdery.co.za", "HOOFLID", "J", ""],
  ["Neels", "Nieuwenhuis", "Geduld", "Hartbeesfontein", "082 573 2664", "henbet@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Gert", "Oosthuizen", "Lapfontein", "Hartbeesfontein", "083 235 3733", "goosthuizen@koshcom.co.za", "HOOFLID", "J", ""],
  ["Petrie", "Oosthuizen", "Rooikuil", "Klerksdorp", "083 273 6181", "petrieoosthuizen@vodamail.co.za", "ERELID", "J", "083 723 6181"],
  ["Jaco", "Pienaar", "Rietfontein", "Ottosdal", "082 456 9285", "pjp@truenw.co.za", "VOLLE_LID", "J", ""],
  ["Johan", "Pollard", "Rhenosterhoek", "Dominionville", "082 635 9797", "johanpollard@gmail.com", "VOLLE_LID", "J", ""],
  ["Herman", "Pretorius", "Rietvlei", "Hartbeesfontein", "083 450 0323", "heralt@lantic.net", "HOOFLID", "J", ""],
  ["Johan", "Pretorius", "Bultfontein", "Hartbeesfontein", "082 822 2611", "johanpretorius@xsinet.co.za", "HOOFLID", "J", ""],
  ["Ruan", "Roets", "Flamwood", "Klerksdorp", "083 670 3104", "roetsr@telkomsa.net", "ASSOSIAAT", "J", ""],
  ["Nick", "Rosseau", "Palmietfontein", "Ottosdal", "083 288 6712", "adeller@lanticnet", "VOLLE_LID", "J", ""],
  ["André", "Rossouw", "Geduld", "Hartbeesfontein", "082 854 8402", "retha.rossouw@yahoo.com", "HOOFLID", "J", ""],
  ["Pieter", "Rossouw", "Otterfontein", "Hartbeesfontein", "082 669 7766", "piet.rossouw@gmail.com", "HOOFLID", "J", ""],
  ["Jaco", "Smit", "Jakkalsfontein", "Doringkruin", "082 714 1348", "jacosmit41@gmail.com", "VOLLE_LID", "J", ""],
  ["Zach", "Smit", "Skietfontein", "Hartbeesfontein", "072 180 5019", "zzachsmit@gmail.com", "JONGBOER", "J", ""],
  ["Koos", "Snyman", "Goedevooruitzicht", "Faerie Glen", "082 776 3619", "koos.snymand@jacusta.co.za", "HOOFLID", "J", ""],
  ["Leon", "Spies", "Rietfontein", "Klerksdorp", "083 441 7326", "spiesboerdery@gmail.com", "HOOFLID", "J", ""],
  ["Wynand", "Spies", "Lapfontein", "Klerksdorp", "082 561 3180", "wmstrans@tiscal.co.za", "VOLLE_LID", "J", ""],
  ["Johan", "Steyn", "Lapfontein", "Witkoppen", "083 272 1079", "Johan.steyn0606@gmail.com", "VOLLE_LID", "J", ""],
  ["Willie", "Strydom", "Wolwerand", "Klerksdorp", "072 113 1179", "williestrydom@vodamail.co.za", "HOOFLID", "J", ""],
  ["Johan", "Styger", "Schoemansfontein", "Klerksdorp", "082 460 8443", "styger@mdcon.co.za", "HOOFLID", "J", "083 460 8443"],
  ["Corneels", "Swanepoel", "Rietfontein", "Hartbeesfontein", "082 937 0787", "corneels.tanya@gmail.com", "JONGBOER", "J", "082 785 2938"],
  ["Willem", "Swanepoel", "Gemsbok", "Hartbeesfontein", "082 827 9044", "willemswanepoel@vodamail.co.za", "HOOFLID", "N", ""],
  ["Victor", "Swart", "Witpoort", "Klerksdorp", "083 407 2275", "vic@kdwisp.com", "VOLLE_LID", "J", ""],
  ["Marius", "Thaba Tswene", "Buisfontein", "Hartbeesfontein", "082 553 9213", "thabatswene@vodamail.co.za", "VOLLE_LID", "J", ""],
  ["Basie", "Van Aarde", "Paardeplaas", "Hartbeesfontein", "083 730 8999", "basievanaarde@vodamail.co.za", "ERELID", "J", ""],
  ["Gert", "Van Aarde", "Goedevooruitzicht", "Hartbeesfontein", "083 447 9844", "vanaarde@lantic.net", "HOOFLID", "J", ""],
  ["Wickus", "Van Aarde", "Paardeplaas", "Hartbeesfontein", "083 400 3304", "hvaarde@webmail.co.za", "HOOFLID", "J", ""],
  ["Willem", "van den Berg", "Leeufontein", "Hartbeesfontein", "083 412 1535", "willem.vdb@mtnloaded.co.za", "HOOFLID", "J", ""],
  ["Johan", "Van der Linde", "Strydfontein", "Vanderbijlpark", "078 458 1466", "vanderlindejj@gmail.com", "VOLLE_LID", "J", ""],

  // Page 3
  ["Gerrit", "Van der Walt", "Mahemsvlei", "Klerksdorp", "083 441 7328", "gvdwalt@koshcom.co.za", "VOLLE_LID", "J", ""],
  ["Cobus", "van Jaarsveld", "Rietkuil", "Hartbeesfontein", "082 573 6609", "cobusvj@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Frikkie", "Van Sittert", "Paardeplaas", "Hartbeesfontein", "083 400 3314", "ifrik@mtnloaded.co.za", "HOOFLID", "J", ""],
  ["Jan", "van Staden", "Bultfontein", "Klerksdorp", "072 359 6279", "avstaden@lantic.net", "HOOFLID", "J", ""],
  ["Paul", "Van Vuuren", "Brakpan", "Hartbeesfontein", "072 223 1308", "paulvanvuuren@vodamail.co.za", "HOOFLID", "J", ""],
  ["Nico", "van Wyk", "Rietkuil", "Klerksdorp", "083 276 7118", "nameubelvervoer@workmail.co.za", "ASSOSIAAT", "J", ""],
  ["Cobus", "Van Zyl", "Opraap", "Flamwood", "083 283 7076", "cobusvz@gmail.com", "JONGBOER", "J", ""],
  ["Johan", "Van Zyl", "Syferlaagte", "Hartbeesfontein", "083 378 8815", "econohbf1@outlook.com", "HOOFLID", "J", ""],
  ["Vicus", "Van Zyl", "Vredehof", "Ottosdal", "084 602 3408", "vvzyl1443@gmail.com", "HOOFLID", "J", ""],
  ["Wimpie", "Venter", "Rhenosterspruit", "Hartbeesfontein", "082 653 8466", "starboer@vodamil.co.za", "HOOFLID", "J", "083 653 8466"],
  ["Frans", "Vermaas", "Geduld", "Hartbeesfontein", "083 259 9281", "renate@gds.co.za", "JONGBOER", "J", "083 390 2038"],
  ["Jurgens", "Viljoen", "Droeëkraal", "Ottosdal", "079 490 8231", "viljoen2@yahoo.com", "VOLLE_LID", "J", ""],
  ["Janus", "Vos", "Schoemansfontein", "Hartbeesfontein", "082 675 3415", "janus.vos4@gmail.com", "HOOFLID", "J", ""],
  ["Johan", "Vosloo", "Palmietfontein", "Hartbeesfontein", "082 370 7089", "johan.vosloo@senwes.co.za", "JONGBOER", "J", ""],
  ["Naude", "Vrey", "Leeuwfontein", "Hartbeesfontein", "083 658 7446", "colleenvey30@gmail.com", "VOLLE_LID", "J", ""],
  ["Theo", "Wallis", "Jakkalsfontein", "Freemanville", "083 560 8558", "twallis@lantic.net", "VOLLE_LID", "J", ""],
  ["Gert", "Wessels", "Doornhoutrivier", "Bothaville", "082 575 3457", "gmwessels@vodamail.co.za", "VOLLE_LID", "J", ""],

  // Specific Hooflede / Jongboere / Assosiate / Erelede (Pages 4, 5, 6)
  ["Hans", "Badenhorst", "Witfontein", "Hartbeesfontein", "072 200 3674", "hansbadenhorst@vodamail.co.za", "HOOFLID", "N", ""],
  ["Johan", "Botha", "Klippan", "Hartbeesfontein", "083 272 6332", "johanbotha@vodamail.co.za", "HOOFLID", "N", ""],
  ["Johan (Duimpie)", "De Klerk", "Mauritz", "Hartbeesfontein", "082 969 7237", "duimpiedeklerk@vodamail.co.za", "ERELID", "J", ""],
  ["Johan", "de Vries", "Leeuwfontein", "Hartbeesfontein", "083 267 7893", "johandevries@vodamail.co.za", "HOOFLID", "J", ""],
  ["Matthys", "de Vries", "Leeuwfontein", "Hartbeesfontein", "083 267 4810", "matthysdevries@vodamail.co.za", "HOOFLID", "J", ""],
  ["Lukas (Sr.)", "Dreyer", "Sendelingsfontein", "Klerksdorp", "076 755 8670", "lukasdreyer.sr@vodamail.co.za", "HOOFLID", "J", ""],
  ["Lukas (Jr.)", "Dreyer", "Sendelingsfontein", "Klerksdorp", "083 660 6704", "lukasdreyer.jr@vodamail.co.za", "JONGBOER", "J", ""],
  ["Doep (Vee-arts)", "Du Plessis", "Klerksdorp", "Klerksdorp", "082 783 8025", "doepduplessis@vodamail.co.za", "HOOFLID", "J", ""],
  ["Pietman", "Fourie", "Jakkalsfontein", "Flamwood", "082 777 1726", "pietmanfourie@vodamail.co.za", "HOOFLID", "J", ""],
  ["Ansoria", "Geldenhuys", "Rietfontein", "Hartbeesfontein", "083 250 4679", "ansoriageldenhuys@vodamail.co.za", "HOOFLID", "J", ""],
  ["Pieter", "Hamman", "Otterfontein", "Hartbeesfontein", "082 507 9386", "pieterhamman@vodamail.co.za", "HOOFLID", "J", ""],
  ["Pieter", "Meyer", "Leeuwfontein", "Hartbeesfontein", "082 388 1380", "pietermeyer@vodamail.co.za", "HOOFLID", "J", ""],
  ["Louis", "Olivier", "Hartbeesfontein", "Hartbeesfontein", "082 944 0420", "louisolivier@vodamail.co.za", "HOOFLID", "N", ""],
  ["Carel", "Pollard", "Rhenosterhoek", "Dominionville", "084 451 1156", "carelpollard@vodamail.co.za", "HOOFLID", "J", ""],
  ["Abri", "Rousseau", "Palmietfontein", "Ottosdal", "083 461 0956", "abrirousseau@vodamail.co.za", "HOOFLID", "J", ""],
  ["Neels (Jr.)", "Roux", "Klerksdorp", "Klerksdorp", "084 261 2459", "neelsroux.jr@vodamail.co.za", "HOOFLID", "J", ""],
  ["Coenie", "Strydom", "Wolwerand", "Klerksdorp", "083 399 0486", "coeniestrydom@vodamail.co.za", "HOOFLID", "J", ""],
  ["Dirk", "van Sittert", "Paardeplaas", "Hartbeesfontein", "083 267 8847", "dirkvansittert@vodamail.co.za", "HOOFLID", "J", ""],
  ["Sakkie", "Hugo", "Renosterhoek", "Hartbeesfontein", "072 173 2342", "sakkiehugo@vodamail.co.za", "JONGBOER", "J", ""],
  ["Jan", "Loots", "Lemoenfontein", "Hartbeesfontein", "082 218 3029", "janloots@vodamail.co.za", "JONGBOER", "J", ""],
  ["Jaco", "Swanepoel", "Rietfontein", "Hartbeesfontein", "072 658 2960", "jacoswanepoel@vodamail.co.za", "JONGBOER", "J", ""],
  ["Gerhard", "de Beer", "Hartbeesfontein", "Hartbeesfontein", "082 900 6017", "gerharddebeer@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Jimmy", "Hills", "Hartbeesfontein", "Hartbeesfontein", "083 304 9363", "jimmyhills@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Kosie", "Kotzé", "Lapfontein", "Klerksdorp", "082 547 2300", "kosiekotze@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Theo", "Mans", "Hartbeesfontein", "Hartbeesfontein", "083 357 5521", "theomans@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Cois", "Meiring", "Bultfontein", "Hartbeesfontein", "082 772 7135", "coismeiring@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Janice", "Möller", "Skietfontein", "Hartbeesfontein", "083 297 7109", "janicemoller@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Hennie", "Smalberger", "Hartbeesfontein", "Hartbeesfontein", "083 305 3393", "henniesmalberger@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Corné", "v.d. Westhuizen", "Doornfontein", "Hartbeesfontein", "082 570 8240", "cornewesthui@vodamail.co.za", "ASSOSIAAT", "J", ""],
  ["Jacob", "Coetzee", "Paardeplaas", "Hartbeesfontein", "018 431 0759", "jacobcoetzee@vodamail.co.za", "ERELID", "J", ""],
  ["Theo", "Crous", "Strydfontein", "Freemanville", "083 562 7542", "theocrous@vodamail.co.za", "ERELID", "J", ""],
  ["Carlos", "da Silva", "Hartbeesfontein", "Hartbeesfontein", "082 723 6151", "carlosdasilva@vodamail.co.za", "ERELID", "J", ""],
  ["Hugo", "Gutsche", "Geduld", "Baillie Park", "083 977 8377", "hugogutsche@vodamail.co.za", "ERELID", "J", ""],
  ["Hennie", "Jansen van Vuren", "Schoemansfontein", "Hartbeesfontein", "079 353 0941", "henniejansen@vodamail.co.za", "ERELID", "J", ""],
  ["Wessel", "Jooste", "Hartbeesfontein", "Hartbeesfontein", "083 306 0093", "wesseljooste@vodamail.co.za", "ERELID", "J", ""],
  ["Koos", "Kotzé", "Lapfontein", "Klerksdorp", "083 441 0223", "kooskotze@vodamail.co.za", "ERELID", "J", ""],
  ["Nick (NAC)", "Kruger", "Hartbeesfontein", "Hartbeesfontein", "083 438 8157", "nickkruger@vodamail.co.za", "ERELID", "J", ""],
  ["Lampies", "Lambrecht", "Geduld", "Hartbeesfontein", "018 431 0625", "lampieslambrecht@vodamail.co.za", "ERELID", "J", ""],
  ["Reghardt", "Lemmer", "Oorbietjiesfontein", "Hartbeesfontein", "076 528 4927", "reghardtlemmer@vodamail.co.za", "ERELID", "J", ""],
  ["Louis", "Meiring", "Bultfontein", "Hartbeesfontein", "073 343 0405", "louismeiring@vodamail.co.za", "ERELID", "J", ""],
  ["Saartjie", "Pistorius", "Hartbeesfontein", "Hartbeesfontein", "083 444 9040", "saartjiepistorius@vodamail.co.za", "ERELID", "J", ""],
  ["Jan", "Pretorius", "Bultfontein", "Hartbeesfontein", "083 467 4362", "janpretorius@vodamail.co.za", "ERELID", "J", ""],
  ["Neels", "Roux", "Klerksdorp", "Klerksdorp", "083 269 4725", "neelsroux@vodamail.co.za", "ERELID", "J", ""],
  ["Paul (Whitey)", "Roux", "Klerksdorp", "Klerksdorp", "083 274 6427", "whiteyroux@vodamail.co.za", "ERELID", "J", ""],
  ["Basie", "Terre-Blanche", "Goedevooruitzicht", "Hartbeesfontein", "082 776 3619", "basietb@vodamail.co.za", "ERELID", "J", ""],
  ["Hannes", "Theunissen", "Hartbeesfontein", "Hartbeesfontein", "082 683 4856", "hannestheunissen@vodamail.co.za", "ERELID", "J", ""],
  ["Emile", "van den Berg", "Leeufontein", "Hartbeesfontein", "072 698 4506", "emilevdb@vodamail.co.za", "ERELID", "J", ""],
  ["Japie", "van Vuuren", "Brakpan", "Hartbeesfontein", "018 431 2103", "japievanvuuren@vodamail.co.za", "ERELID", "J", ""],
  ["Doedie", "Vermaas", "Geduld", "Hartbeesfontein", "072 180 5430", "doedievermaas@vodamail.co.za", "ERELID", "J", ""]
];

// Map farm / area names to coordinates & sectors
const AREA_COORDINATES = {
  "Renosterhoek": { lat: -26.855, lng: 26.425, sector: "Sektor Renosterhoek" },
  "Rhenosterhoek": { lat: -26.855, lng: 26.425, sector: "Sektor Renosterhoek" },
  "Schoemansfontein": { lat: -26.758, lng: 26.518, sector: "Sektor Schoemansfontein" },
  "Wolwerand": { lat: -26.865, lng: 26.495, sector: "Sektor Wolwerand" },
  "Oorbietjiesfontein": { lat: -26.818, lng: 26.330, sector: "Sektor Oorbietjiesfontein" },
  "Rietfontein": { lat: -26.846, lng: 26.259, sector: "Sektor Rietfontein" },
  "Syferfontein": { lat: -26.864, lng: 26.332, sector: "Sektor Syferfontein" },
  "Sendelingsfontein": { lat: -26.914, lng: 26.239, sector: "Sektor Sendelingsfontein" },
  "Jakkalsfontein": { lat: -26.942, lng: 26.320, sector: "Sektor Jakkalsfontein" },
  "Brakspruit": { lat: -26.672, lng: 26.579, sector: "Sektor Brakspruit" },
  "Palmietfontein": { lat: -26.580, lng: 26.648, sector: "Sektor Palmietfontein" },
  "Witpoort": { lat: -26.732, lng: 26.601, sector: "Sektor Witpoort" },
  "Paardeplaas": { lat: -26.623, lng: 26.306, sector: "Sektor Paardeplaas" },
  "Dupperspos": { lat: -26.523, lng: 26.413, sector: "Sektor Dupperspos" },
  "Klippan": { lat: -26.744, lng: 26.194, sector: "Sektor Klippan" },
  "Bultfontein": { lat: -26.797, lng: 26.301, sector: "Sektor Bultfontein" },
  "Witfontein": { lat: -26.874, lng: 26.148, sector: "Sektor Witfontein" },
  "Leeuwfontein": { lat: -26.762, lng: 26.442, sector: "Sektor Leeuwfontein" },
  "Leeufontein": { lat: -26.762, lng: 26.442, sector: "Sektor Leeuwfontein" },
  "Goedvooruitzicht": { lat: -26.741, lng: 26.402, sector: "Sektor Goedvooruitzicht" },
  "Goedevooruitzicht": { lat: -26.741, lng: 26.402, sector: "Sektor Goedvooruitzicht" },
  "Geduld": { lat: -26.652, lng: 26.438, sector: "Sektor Geduld" },
  "Rhenosterspruit": { lat: -26.885, lng: 26.382, sector: "Sektor Rhenosterspruit" },
  "Renosterspruit": { lat: -26.885, lng: 26.382, sector: "Sektor Rhenosterspruit" },
  "Opraap Wes": { lat: -26.980, lng: 26.364, sector: "Sektor Opraap" },
  "Opraap": { lat: -26.980, lng: 26.364, sector: "Sektor Opraap" },
  "Syferlaagte": { lat: -26.698, lng: 26.372, sector: "Sektor Syferlaagte" },
  "Lapfontein": { lat: -26.812, lng: 26.540, sector: "Sektor Lapfontein" },
  "Lemoenfontein": { lat: -26.605, lng: 26.417, sector: "Sektor Lemoenfontein" },
  "Buisfontein": { lat: -26.692, lng: 26.521, sector: "Sektor Buisfontein" },
  "Rietkuil": { lat: -26.836, lng: 26.526, sector: "Sektor Rietkuil" },
  "Rooikuil": { lat: -26.659, lng: 26.568, sector: "Sektor Rooikuil" },
  "Rietvlei": { lat: -26.782, lng: 26.410, sector: "Sektor Rietvlei" },
  "Doornplaat": { lat: -27.028, lng: 26.448, sector: "Sektor Doornplaat" },
  "Doornfontein": { lat: -26.627, lng: 26.613, sector: "Sektor Doornfontein" },
  "Doornhoutrivier": { lat: -27.398, lng: 26.619, sector: "Sektor Bothaville / Doornhout" },
  "Skietfontein": { lat: -26.772, lng: 26.452, sector: "Sektor Skietfontein" },
  "Otterfontein": { lat: -26.820, lng: 26.412, sector: "Sektor Otterfontein" },
  "Vlaklaagte": { lat: -26.680, lng: 26.520, sector: "Sektor Vlaklaagte" },
  "Hartbeesfontein": { lat: -26.763, lng: 26.402, sector: "Hartbeesfontein Sentraal (Dorp)" },
  "Flamwood": { lat: -26.842, lng: 26.662, sector: "Klerksdorp / Flamwood" },
  "Flamwood Walk": { lat: -26.842, lng: 26.662, sector: "Klerksdorp / Flamwood" },
  "Klerksdorp": { lat: -26.865, lng: 26.667, sector: "Klerksdorp Streek" },
  "Ottosdal": { lat: -26.812, lng: 26.012, sector: "Ottosdal Streek" },
  "Coligny": { lat: -26.331, lng: 26.321, sector: "Coligny Streek" },
  "Stellenbosch": { lat: -33.932, lng: 18.864, sector: "Buitestedelik / Wes-Kaap" },
  "Vanderbijlpark": { lat: -26.711, lng: 27.838, sector: "Gauteng / Vaal" },
  "Bothaville": { lat: -27.382, lng: 26.621, sector: "Vrystaat / Bothaville" },
  "Lichtenburg": { lat: -26.154, lng: 26.159, sector: "Lichtenburg Streek" },
  "Freemanville": { lat: -26.872, lng: 26.650, sector: "Klerksdorp / Freemanville" },
  "Doringkruin": { lat: -26.828, lng: 26.690, sector: "Klerksdorp / Doringkruin" },
  "Panoramapark": { lat: -26.839, lng: 26.671, sector: "Klerksdorp / Panoramapark" },
  "Dominionville": { lat: -26.960, lng: 26.360, sector: "Sektor Dominionville" },
  "Baillie Park": { lat: -26.718, lng: 27.098, sector: "Potchefstroom / Baillie Park" },
  "Faerie Glen": { lat: -25.782, lng: 28.298, sector: "Pretoria / Faerie Glen" },
  "Witkoppen": { lat: -26.012, lng: 27.998, sector: "Johannesburg / Witkoppen" },
  "Welgelegen": { lat: -26.750, lng: 26.415, sector: "Sektor Welgelegen" },
  "Mauritz": { lat: -26.769, lng: 26.388, sector: "Sektor Mauritz" },
  "Cyferkuil": { lat: -26.790, lng: 26.350, sector: "Sektor Cyferkuil" },
  "Strydfontein": { lat: -26.730, lng: 26.480, sector: "Sektor Strydfontein" },
  "Carlsheim": { lat: -33.932, lng: 18.864, sector: "Buitestedelik" },
  "Gemsbok": { lat: -26.810, lng: 26.390, sector: "Sektor Gemsbok" },
  "Brakpan": { lat: -26.780, lng: 26.430, sector: "Sektor Brakpan" },
  "Mahemsvlei": { lat: -26.632, lng: 26.582, sector: "Sektor Mahemsvlei" },
  "Droeëkraal": { lat: -26.759, lng: 26.127, sector: "Sektor Droeëkraal" },
  "Droekraal": { lat: -26.759, lng: 26.127, sector: "Sektor Droeëkraal" },
  "Lemmersville": { lat: -26.747, lng: 26.376, sector: "Sektor Lemmersville" },
  "Bonne Esperance": { lat: -26.850, lng: 26.620, sector: "Sektor Bonne Esperance" },
  "Welgevonden": { lat: -26.770, lng: 26.390, sector: "Sektor Welgevonden" }
};

function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) {
    return `+27 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith('27')) {
    return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

function buildClientProfiles() {
  const seenPhones = new Set();
  const seenNames = new Set();
  const profiles = [];

  // Master Admin Cornelius Hattingh is included first
  profiles.push({
    uid: 'USR-MGMT-ADMIN',
    email: 'Hattinghcornelius@gmail.com',
    name: 'Cornelius',
    surname: 'Hattingh',
    primaryPhone: '+27 82 770 4419',
    secondaryPhone: '',
    farmName: 'Tierfontein Hoewe 8',
    portionNumber: 'Ged 8',
    sector: 'Bestuur / Komitee',
    locationArea: 'Hartbeesfontein Sentraal (Dorp)',
    areaGroupIds: ['GRP-ALL', 'GRP-MANAGEMENT', 'GRP-SEC2'],
    preferredLanguage: 'af',
    role: 'MANAGEMENT',
    isActive: true,
    farmGpsLocation: {
      latitude: -26.7810,
      longitude: 26.4180,
      accuracy: 5,
      source: 'GPS',
      verifiedTimestamp: '2026-08-20T00:00:00Z',
    },
    communityResponseSettings: {
      participateNearbyEmergencies: true,
      receiveSecurityAlerts: true,
      receiveFireAlerts: true,
      receiveTrafficAlerts: true,
      receiveBoloAlerts: true,
      receiveCommunityNotices: true,
      receiveAssistanceRequests: true,
      availableToAssistNow: true,
      preferredGroupIds: ['GRP-MANAGEMENT', 'GRP-SEC2'],
      maxResponseDistanceKm: 50,
      responseNotes: 'System Administrator & Incident Commander (HBF Boerevereniging)',
    },
    familyMembers: [],
    vehicles: [
      {
        id: 'VEH-MGMT-01',
        year: 2023,
        make: 'Toyota',
        model: 'Prado 3.0 D-4D',
        color: 'Silwer / Silver',
        licensePlate: 'HBF 777 NW',
      },
    ],
    medicalAid: {
      schemeName: 'Momentum Health',
      membershipNumber: '88200192',
      principalMember: 'C. Hattingh',
      emergencyContactNumber: '+27 82 911',
    },
    emergencyPropertyInfo: {
      mainGateCode: '*8821#',
      dangerousAnimals: '1x Duitse Herdershond',
      firefightingEquipment: 'Brandspuitpomp by dam',
    },
    cattleIdentificationMarks: [
      {
        id: 'CBM-001',
        brandCode: 'CH 8',
        registeredOwner: 'Cornelius Hattingh Boerdery BK',
        certificateNumber: 'DALRRD-BM-2023-7419',
        certificateDate: '2023-04-12',
        brandLocation: 'Regter Dy (Right Thigh)',
        brandMethod: 'HOT_IRON',
        animalType: 'CATTLE',
        earMarkDescription: 'Halfmaan voor regteroor, stomp linkeroor',
        isPrimary: true,
      },
    ],
    cattleBrandCode: 'CH 8',
    cattleBrandLocation: 'Regter Dy (Right Thigh)',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-08-24T00:00:00Z',
  });

  CLIENT_RAW_DATA.forEach(([name, surname, farm, town, phone, email, category, agriNW, altPhone], idx) => {
    const cleanPhone = phone.trim();
    const fullName = `${name} ${surname}`.trim().toLowerCase();
    
    // De-duplicate if identical
    if (seenNames.has(fullName) && seenPhones.has(cleanPhone)) {
      return;
    }
    seenNames.add(fullName);
    if (cleanPhone) seenPhones.add(cleanPhone);

    const pad = String(idx + 1).padStart(3, '0');
    const uid = `USR-CLIENT-${pad}`;

    const areaMeta = AREA_COORDINATES[farm] || AREA_COORDINATES[town] || {
      lat: -26.763 + (Math.random() - 0.5) * 0.15,
      lng: 26.402 + (Math.random() - 0.5) * 0.15,
      sector: `Sektor ${farm || town || 'Hartbeesfontein'}`
    };

    let role = 'CLIENT';
    let operationalRole = undefined;
    let callsign = undefined;
    if (category === 'JONGBOER') {
      operationalRole = 'REACTION_FORCE';
    }

    const membershipNotes = [
      `HBF Lidkategorie: ${category}`,
      agriNW === 'J' ? 'Geaffilieer by Agri Noordwes (NW)' : (agriNW === 'N' ? 'Nie Agri NW geaffilieer' : ''),
      town ? `Dorp/Woonplek: ${town}` : '',
      altPhone ? `Alt Sel: ${altPhone}` : ''
    ].filter(Boolean).join(' • ');

    const profile = {
      uid,
      email: email && !email.startsWith('0') && email.includes('@') ? email.trim() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${surname.toLowerCase().replace(/[^a-z0-9]/g, '')}@hbfboere.co.za`,
      name: name.trim(),
      surname: surname.trim(),
      primaryPhone: formatPhone(cleanPhone) || cleanPhone,
      secondaryPhone: altPhone ? formatPhone(altPhone) : undefined,
      farmName: farm.trim() || 'Hartbeesfontein Gebied',
      portionNumber: '',
      sector: areaMeta.sector,
      locationArea: farm.trim() || town.trim() || 'Hartbeesfontein',
      areaGroupIds: ['GRP-ALL', `GRP-${(farm || town).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}`],
      preferredLanguage: 'af',
      role,
      operationalRole,
      callsign,
      roleTitle: category === 'HOOFLID' ? 'Hooflid (HBF)' : (category === 'JONGBOER' ? 'Jongboer Lid' : (category === 'ERELID' ? 'Erelid' : (category === 'ASSOSIAAT' ? 'Assosiaat Lid' : 'Volle Lid'))),
      isActive: true,
      farmGpsLocation: {
        latitude: parseFloat(areaMeta.lat.toFixed(6)),
        longitude: parseFloat(areaMeta.lng.toFixed(6)),
        accuracy: 10,
        source: 'MANUAL_PIN',
        verifiedTimestamp: '2026-08-24T00:00:00Z',
      },
      communityResponseSettings: {
        participateNearbyEmergencies: category === 'JONGBOER',
        receiveSecurityAlerts: true,
        receiveFireAlerts: true,
        receiveTrafficAlerts: true,
        receiveBoloAlerts: true,
        receiveCommunityNotices: true,
        receiveAssistanceRequests: true,
        availableToAssistNow: true,
        maxResponseDistanceKm: category === 'JONGBOER' ? 30 : 15,
        responseNotes: membershipNotes,
      },
      familyMembers: [],
      vehicles: [],
      emergencyNotes: membershipNotes,
      cattleIdentificationMarks: [],
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: '2026-08-24T00:00:00Z',
    };

    profiles.push(profile);
  });

  return profiles;
}

const clientProfiles = buildClientProfiles();

const content = `import { UserProfile } from '../types';

/**
 * Official Hartbeesfontein Boerevereniging Client / Member Profiles Directory
 * Generated directly from official HBF Ledelys (Volle Lede, Hooflede, Jongboere, Assosiate, Erelede)
 * Total Members: ${clientProfiles.length}
 * Date: 2026-08-24
 */
export const ACTUAL_CLIENT_PROFILES: UserProfile[] = ${JSON.stringify(clientProfiles, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/actualClientProfilesData.ts'), content, 'utf8');
console.log(`Generated ${clientProfiles.length} client profiles in src/data/actualClientProfilesData.ts`);

// Link VIS Cases to these client profiles
const visScript = require('./build_full_database.cjs');
