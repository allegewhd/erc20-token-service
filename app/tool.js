'use strict';

const config = require('config');
const common = require('./common');
const model  = require('./model');

var   moment = require("moment");

// --------------------functions------------------------------------------
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function addUsers(count) {
  let userNames = ["wang", "lin", "qian", "sunjapan", "caica", "sunjapan", "sji"];
  let password = "43cfe35b0aef97ebed190843ded79bc3";
  let addresses = ["0x9d949d98f2234fd1d81098afe3dac563c91138e2", "0xc545e0bc7e600d16f9a7addbf917bf0e4b582307", "0xc7ccee62b74ca271bc5a7b4587facdd30ca4f410", "0x7abb435ad610c09b3ef1ae0037b622cc17b3c20d", "0xab94a5527385b81f6a1bfee094590404d1e6e163", "0xd2d74e558a14fc2768823663a4cc4a62d45cd44a", "0x6ff22ff05d987672759952a28c74b56f8302994f", "0x624552e951910f1b3894d86ecba96b3001e29c53", "0x2697f10c86d4c66831b911b19d191255ce771fae", "0xc90680f450137a3777533318ce64d85c2eb36e7e", "0x2e5165d9e0532abb9f80986edc52bb6d1d30ce8a", "0x0b34edf7519bac2408131f6d00fd25a25de4f72b", "0x19c33503c14735a9bcb7b3fdaae745f2a9e0d984", "0x64d287ef880fbc10940e169d060bb20140f8fe2a", "0xc45218dcfd5803c7c2fbc024ad21a086662fc2d5", "0x30e0455a4723ffef731c00f8c5dfe7f7c3124088", "0xfffd84870eaa2ba0b84b9b1752b2f690031ecb5a"];
  let role = "normal";

  // add admin user
  try {
    var existCount = await model.User.count();
    console.log("exist user count : ", existCount);

    if (existCount < 1) {
      result = await model.User.create({
        name     : "admin",
        password : password,
        address  : '0xd7a1f2dec979dbb4e09f99db22fe06b7f813e600',
        role     : "admin"
      });
      console.log("admin user added: ", result.id);

      existCount++;
    }

    if (existCount < 2) {
      var result = await model.User.create({
        name     : "root",
        password : password,
        address  : '0x491d73f257016fa8546e398be0d3bb2a72288c09',
        role     : "root"
      });
      console.log("root user added: ", result.id);

      existCount++;
    }

    var userName = '';
    var userAddress = '';
    var userIds = [];
    for (var i = existCount; i < count + existCount; i++) {
      userName = userNames[Math.floor(Math.random() * userNames.length)] + i;
      userAddress = addresses[Math.floor(Math.random() * addresses.length)];
      result = await model.User.create({
        name     : userName,
        password : password,
        address  : userAddress,
        role     : role
      });
      console.log("user {name: '" + userName + "', id: " + result.id + ", address: '" + userAddress + "'} added.");

      userIds.push(result.id);
    }

    return userIds;
  } catch(e) {
    console.error('add test users failed', e);
    throw e;
  }
}

async function addLocations(count, userIds) {
  let locations = [
    { // id:1
      name: "tokyo",
      longitude: "139.7617044",
      latitude: "35.6789965",
      radius: 25,
      location: "東京都千代田区丸の内１丁目９−１"
    },
    { // id:2
      name: "beijing",
      longitude: "39.9072283",
      latitude: "116.3973665",
      radius: 30,
      location: "北京市东城区长安街16E"
    },
    { // id:3
      name: "Stanford University",
      longitude: "-122.1703695",
      latitude: "37.4256448",
      radius: 45,
      location: "450 Serra Mall, Stanford, CA 94305"
    },
    { // id:4
      name: "london",
      longitude: "-0.1281324",
      latitude: "51.5079596",
      radius: 20,
      location: "Trafalgar Square, London WC2N 5DN"
    },
    { // id:5
      name: "Cape Town",
      longitude: "18.4609007",
      latitude: "-33.9573105",
      radius: 35,
      location: "ケープタウン ロンデボッシュ"
    },
    { // id:6
      name: "Maracanã",
      longitude: "-43.2147905",
      latitude: "-22.9078305",
      radius: 35,
      location: "Av. Pres. Castelo Branco, Portão 3, Rio de Janeiro - RJ, 20271-130 ブラジル"
    },
    { // id:7
      name: "NRI木場N棟",
      longitude: "139.8053135",
      latitude: "35.6670927",
      radius: 45,
      location: "〒135-0042 東京都江東区木場１丁目５−１５ 135 0042 丁目"
    },
    { // id:8
      name: "サピックス小学部 東京校",
      longitude: "139.7810606",
      latitude: "35.6791483",
      radius: 30,
      location: "〒103-0006 東京都中央区日本橋富沢町８−５"
    },
    { // id:9
      name: "椿屋珈琲店 日比谷離",
      longitude: "139.7643033",
      latitude: "35.6741118",
      radius: 20,
      location: "〒100-0006 東京都千代田区有楽町１丁目１−２−５"
    },
  ];

  try {
    var existCount = await model.WorkLocation.count();
    console.log("exist WorkLocation count : ", existCount);

    var result = null;
    var location = null;
    var currentUserId = null;
    var userLocationIds = {};

    for (var i = existCount; i < count + existCount; i++) {
      location = locations[Math.floor(Math.random() * locations.length)];
      currentUserId = userIds[Math.floor(Math.random() * userIds.length)];

      result = await model.WorkLocation.create({
        name: location.name + " " + i,
        userId: currentUserId,
        longitude: location.longitude,
        latitude: location.latitude,
        radius: location.radius,
        location: "address[" + i + "]: " + location.location
      });
      console.log("location {name: '" + result.name + "', id: " + result.id + ", userId: '" + + result.userId + "'} added.");

      if (userLocationIds[currentUserId]) {
        userLocationIds[currentUserId].push(result.id);
      } else {
        userLocationIds[currentUserId] = [];
        userLocationIds[currentUserId].push(result.id);
      }
    }

    return userLocationIds;
  } catch(e) {
    console.error('add test locations failed', e);
    throw e;
  }
}

async function addTimeEvents(count, userIds, userLocationIds) {
  let eventTypes = [1, 2];
  let clockInTimes = ["07:00", "07:10", "07:50", "08:00", "08:15", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:30", "11:00", "11:10", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
  let clockOutTimes = ["15:40", "15:45", "16:00", "16:30", "17:00", "17:15", "17:30", "17:45", "18:00", "18:30", "19:00", "19:30", "19:50", "20:00", "20:10", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "23:59"];
  let startDay = "20160101";
  let dayRange = 400;

  try {
    var existCount = await model.WorkTimeEvent.count();
    console.log("exist WorkTimeEvent count : ", existCount);

    var result = null;
    var event = null;
    var events = [];
    var locationIds = null;
    var userId = null;
    var locationId = null;
    var eventTime = 0;
    var eventDay = null;
    var eventMonth = null;
    var eventType = null;
    var clockTime = null;

    for (var i = existCount; i < count + existCount; i++) {
      userId = userIds[Math.floor(Math.random() * userIds.length)];
      locationIds = userLocationIds[userId];
      if (!locationIds) {
        // try once
        userId = userIds[Math.floor(Math.random() * userIds.length)];
        locationIds = userLocationIds[userId];
      }
      locationId = locationIds[Math.floor(Math.random() * locationIds.length)];
      eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      if (eventType == 1) {
        clockTime = clockInTimes[Math.floor(Math.random() * clockInTimes.length)];
      } else {
        clockTime = clockOutTimes[Math.floor(Math.random() * clockOutTimes.length)];
      }

      eventDay = moment(startDay, "YYYYMMDD").add(getRandomInt(0, dayRange), 'days').format('YYYYMMDD');
      eventMonth = moment(eventDay, "YYYYMMDD").format('YYYYMM');
      eventTime = moment(eventDay + " " + clockTime, "YYYYMMDD HH:mm").valueOf();

      event = {
        eventTime  : eventTime,
        userId     : userId,
        eventType  : eventType,
        eventDay   : eventDay,
        eventMonth : eventMonth,
        locationId : locationId,
        transactionResult : true,
        valid : true
      };

      result = await model.WorkTimeEvent.create(event);
      console.log("time event {eventDay: '" + event.eventDay + "', id: " + result.id + ", userId: '" + userId + "', eventType: " + event.eventType + "} added.");

      event.id = result.id;

      events.push(event);
    }

    return events;
  } catch(e) {
    console.error('add test locations failed', e);
    throw e;
  }
}

async function addTimeLogs(count, userIds, userLocationIds) {
  let confirmStatus = [false, true, false, false, false, false, false, true, false, false, false, true, false];
  let logTypes = [1, 2, 3, 2, 3, 2, 3, 3, 1, 2, 3, 2, 3, 1, 3, 2, 3]; // 1: only start 2: only end 3: both
  let startTimes = ["07:00", "07:10", "07:50", "08:00", "08:15", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:30", "11:00", "11:10", "11:30", "12:00", "13:00"];
  let endTimes = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:15", "17:30", "17:45", "18:00", "18:30", "19:00", "19:30", "19:50", "20:00", "20:10", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "23:59"];
  let startDay = "20160101";
  let dayRange = 400;
  let standardWorkTimeOfMinutes = config.get('app.worktime.working_minutes');

  try {
    var existCount = await model.WorkTimeLog.count();
    console.log("exist WorkTimeLog count : ", existCount);

    var result = null;
    var timeLog = null;
    var event = null;
    var timeLogIds = [];

    var userId = null;
    var startLocationId = null;
    var endLocationId = null;
    var startTime = null;
    var endTime = null;
    var workDay = null;
    var workMonth = null;
    var startTimestamp = null;
    var endTimestamp = null;
    var confirmed = false;
    var logType = 0;
    var workDurationOfMinutes = null;
    var overtime = null;
    var locationIds = null;
    var endEventId = null;
    var startEventId = null;
    var existsTimeLog = null;

    for (var i = existCount; i < count + existCount; i++) {
      userId = userIds[Math.floor(Math.random() * userIds.length)];
      locationIds = userLocationIds[userId];
      if (!locationIds) {
        // try once
        userId = userIds[Math.floor(Math.random() * userIds.length)];
        locationIds = userLocationIds[userId];
      }
      confirmed = confirmStatus[Math.floor(Math.random() * confirmStatus.length)];
      logType = logTypes[Math.floor(Math.random() * logTypes.length)];

      workDay = moment(startDay, "YYYYMMDD").add(getRandomInt(0, dayRange), 'days').format('YYYYMMDD');
      workMonth = moment(workDay, "YYYYMMDD").format('YYYYMM');

      existsTimeLog = await model.WorkTimeLog.findOne({where: {userId: userId, workDay: workDay}});

      if (existsTimeLog) {
        // already exists
        console.log("exists time log {id: " + existsTimeLog.id + ", userId: " + userId + ", workDay: " + workDay + "}");
      } else {
        existsTimeLog = {};
      }

      if (logType == 3) {
        startLocationId = locationIds[Math.floor(Math.random() * locationIds.length)];
        startTime = startTimes[Math.floor(Math.random() * startTimes.length)];
        startTimestamp = moment(workDay + " " + startTime, "YYYYMMDD HH:mm").valueOf();

        endLocationId = locationIds[Math.floor(Math.random() * locationIds.length)];
        endTime = endTimes[Math.floor(Math.random() * endTimes.length)];
        endTimestamp = moment(workDay + " " + endTime, "YYYYMMDD HH:mm").valueOf();

        workDurationOfMinutes = Math.floor((endTimestamp - startTimestamp)/(1000 * 60));
        overtime = (workDurationOfMinutes > standardWorkTimeOfMinutes);
      } else if (logType == 2) {
        startLocationId = existsTimeLog.startLocationId || null;
        startTime = existsTimeLog.startTime || null;
        startTimestamp = existsTimeLog.startTimestamp || null;

        endLocationId = locationIds[Math.floor(Math.random() * locationIds.length)];
        endTime = endTimes[Math.floor(Math.random() * endTimes.length)];
        endTimestamp = moment(workDay + " " + endTime, "YYYYMMDD HH:mm").valueOf();

        workDurationOfMinutes = existsTimeLog.workMinutes || null;
        overtime = existsTimeLog.overtime || null;
        confirmed = existsTimeLog.confirmed || false;
      } else if (logType == 1) {
        startLocationId = locationIds[Math.floor(Math.random() * locationIds.length)];
        startTime = startTimes[Math.floor(Math.random() * startTimes.length)];
        startTimestamp = moment(workDay + " " + startTime, "YYYYMMDD HH:mm").valueOf();

        endLocationId = existsTimeLog.endLocationId || null;
        endTime = existsTimeLog.endTime || null;
        endTimestamp = existsTimeLog.endTimestamp || null;

        workDurationOfMinutes = existsTimeLog.workMinutes || null;
        overtime = existsTimeLog.overtime || null;
        confirmed = existsTimeLog.confirmed || false;
      }

      startEventId = null;
      endEventId = null;
      if (startTimestamp > 0) {
        event = {
          eventTime  : startTimestamp,
          userId     : userId,
          eventType  : 1,                     // enter
          eventDay   : workDay,
          eventMonth : workMonth,
          location   : startLocationId,
          transactionResult : true,
          valid : true
        };

        result = await model.WorkTimeEvent.create(event);
        console.log("start time event {id: " + result.id + ", eventTime: " + event.eventTime + ", eventType: " + event.eventType + "} added.");

        startEventId = result.id;
      }

      if (endTimestamp > 0) {
        event = {
          eventTime  : endTimestamp,
          userId     : userId,
          eventType  : 2,                     // leave
          eventDay   : workDay,
          eventMonth : workMonth,
          location   : endLocationId,
          transactionResult : true,
          valid : true
        };

        result = await model.WorkTimeEvent.create(event);
        console.log("end time event {id: " + result.id + ", eventTime: " + event.eventTime + ", eventType: " + event.eventType + "} added.");

        endEventId = result.id;
      }

      timeLog = {
        userId            : userId,
        workDay           : workDay,
        workMonth         : workMonth,
        startEventId      : startEventId,
        startTime         : startTimestamp,
        startLocationId   : startLocationId,
        endEventId        : endEventId,
        endTime           : endTimestamp,
        endLocationId     : endLocationId,
        workMinutes       : workDurationOfMinutes,
        overtime          : overtime,
        confirmed         : confirmed,
        rewardTokenName   : (confirmed ? 'CaicaCoin' : null),
        rewardTokenValue  : (confirmed ? 1 : null),
        rewardTransaction : (confirmed ? '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421' : null)
      };

      if (existsTimeLog && existsTimeLog.id > 0) {
        result = await existsTimeLog.update(timeLog);
        console.log("time log {eventDay: '" + timeLog.workDay + "', id: " + existsTimeLog.id + ", userId: '" + userId + "} updated.");
        timeLog.id = existsTimeLog.id;
      } else {
        result = await model.WorkTimeLog.create(timeLog);
        console.log("time log {eventDay: '" + timeLog.workDay + "', id: " + result.id + ", userId: '" + userId + "} added.");
        timeLog.id = result.id;
      }

      timeLogIds.push(timeLog.id);
    }

    return timeLogIds;
  } catch(e) {
    console.error('add test time logs failed', e);
    throw e;
  }
}

async function clearTables() {
  console.info("clear tables data");

  let tables = ["User", "WorkLocation", "WorkTimeEvent", "WorkTimeRegister", "WorkTimeLog"];

  for (let t of tables) {
    try {
      var result = await model[t].truncate();
      console.log("table " + t + " cleared!");
    } catch (e) {
      console.error('truncate table ' + t + ' failed', e);
      throw e;
    }
  }
}

async function createTestData() {
  try {
    await clearTables();

    var userIds = await addUsers(2);
    console.log("" + userIds.length + " test users added! ");

    var userLocationIds = await addLocations(80, userIds);
    console.log("" + userLocationIds.length + " users location data added! ");

    var events = await addTimeEvents(200, userIds, userLocationIds);
    console.log("" + events.length + " test events added! ");

    var timeLogIds  = await addTimeLogs(400, userIds, userLocationIds);
    console.log("" + timeLogIds.length + " test time logs added! ");

  } catch(e) {
    console.error('add test data failed', e);
    process.exit(1);
  }
}

async function initDatabase() {
  try {
    await common.sequelize.sync({force: true});

    console.log("database table re-created!");

    // add admin user
    var adminUser = await model.User.create({
      name     : "admin",
      password : "43cfe35b0aef97ebed190843ded79bc3",
      address  : "0x491d73f257016fa8546e398be0d3bb2a72288c09",
      role     : "admin"
    });

    console.log('user admin added with id: ' + adminUser.id);
  } catch(e) {
    console.error('init database failed!', e);
    process.exit(1);
  }
}

// -----------------------start main--------------------------------------

if (process.argv.length < 3) {
  console.error('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [create|drop|sync|truncate|data|encrypt|decrypt|notice]');
  process.exit(1);
}
var operation = process.argv[2];

console.log(operation + " database tables");

switch (operation) {
  case 'encrypt':
    var plain = process.argv[3];

    if (plain) {
      console.log('encrypt: [' + plain + ']');
      console.log('encrypted: [' + common.encrypt(plain) + ']');
    } else {
      console.log("Input text to encrypt!");
    }

    break;
  case 'decrypt':
    var encrypted = process.argv[3];

    if (encrypted) {
      console.log('decrypt: [' + encrypted + ']');
      console.log('decrypted: [' + common.decrypt(encrypted) + ']');
    } else {
      console.log("Input text to decrypt!");
    }

    break;
  case 'create':
    console.log('drop existed tables and re-create all tables');

    initDatabase();

    break;
  case 'drop':
    console.log('drop tables');

    common.sequelize.drop().then(function () {
      console.log("tables dropped!");
    });

    break;
  case 'sync':
    console.log('update table definition');

    common.sequelize.sync().then(function () {
      console.log("database table synchonized!");
    });

    break;
  case 'data':
    console.log('add some test data to table');

    createTestData();

    break;
  case 'truncate':
    console.log('truncate data');

    common.sequelize.truncate().then(function () {
      console.log("tables data truncated!");
    });

    break;
  case 'notice':
    var payload = process.argv[3] || false;
    var expireDays = process.argv[4] || 7;
    console.log('add system notice message: ', payload);
    console.log('expire days : ', expireDays);

    if (payload) {
      var expireDate = moment().add(expireDays, 'days').toDate();

      model.Notice.create({
        content    : payload,
        expireDate : expireDate
      }).then(data => {
        console.log('notice message added with id: ' + data.id);
      }).catch(error => {
        console.error(error);
      });
    }

    break;
  default:
    console.error('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [create|drop|sync|truncate|data|encrypt|decrypt|notice]');
    process.exit(1);
}

console.log(operation + " done!");

