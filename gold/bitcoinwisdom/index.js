var http = require('http');
var beeper = require('./beep.js').create_beeper();

setInterval(get_ticker, 1000);

function get_ticker () {
  http.get('http://s1.bitcoinwisdom.com:8080/ticker', ticker_response_handler);
}

function ticker_response_handler (res) {
  var data = '';
  res.on('data', function (chunk) {
    data += chunk;
  });
  res.on('end', function () {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return console.log('Error:', err);
    }
    ticker_data_handler(data);
  });
}

var last_data = {
  btceltcbtc: {
    last: 0, // price
    date: 0,
    tid: 0,
  },
}

function ticker_data_handler (data) {
  //console.log(data)

  var ticker = data.btceltcbtc
  var last_ticker = last_data.btceltcbtc

  if (ticker.date !== last_ticker.date) {

    var diff = ticker.last - last_ticker.last;

    var lag = data.now - ticker.date;

    freq = (2000 + 1000000 * diff) | 0;

    var out = [
      format_date(data.now) + '+' + pad_left(lag, 2, '0'),
      'btceltcbtc',
      '[' + diff_color(diff) + 'm' + ticker.last + '[m',
      lag,
      freq,
    ];

    console.log(out.join(' '));

    beeper.beep(freq, 10);
  }

  last_data.btceltcbtc = data.btceltcbtc;
}

function diff_color (diff) {
  if (diff < 0) {
    return '31;1';
  } else if (diff > 0) {
    return '32;1';
  } else {
    return '33;1';
  }
}

function format_date (unix) {
  return (new Date(unix * 1000)).toISOString()
    .replace(/\.000Z$/, 'Z')
}

function pad_left (obj, num, char) {
  var str = obj.toString();
  while (str.length < num) {
    str += char;
  }
  return str;
}