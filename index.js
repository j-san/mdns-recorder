
var dns = require('native-dns'),
    mdns = require('mdns'),
    util = require('util'),
    os = require("os"),
    express = require('express');

var MDNS_DOMAIN = process.env.MDNS_DOMAIN || '.local.';
var BIND_DNS_DOMAIN = process.env.BIND_DNS_DOMAIN || 'subnet.lan.';
var WEB_PORT = Number(process.env.WEB_PORT) || 3000;
var DNS_PORT = Number(process.env.DNS_PORT) || 3053;

var IPV4_PATTERN = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
var IPV6_PATTERN = /.*:.*:.*:.*:.*:.*/;

var discovered = {};

discovered[BIND_DNS_DOMAIN] = {};
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function(details) {
        if (details.family=='IPv4' && details.internal === false) {
            discovered[BIND_DNS_DOMAIN].A = details.address;
        }
        if (details.family=='IPv6' && details.internal === false) {
            discovered[BIND_DNS_DOMAIN].AAAA = details.address;
        }
    });
    console.log('Self IP', dev, discovered[BIND_DNS_DOMAIN].A, discovered[BIND_DNS_DOMAIN].AAAA);
});



/* ++++++ mDNS browser ++++++ */

var serviceBrowsing = [];
var browser = mdns.browseThemAll();
browser.on('serviceUp', function (service) {
    if (serviceBrowsing.indexOf(service.type.name) === -1) {
        console.log('browse service:', service.type.protocol, service.type.name);

        serviceBrowsing.push(service.type.name);
        var subBrowser = mdns.createBrowser(mdns[service.type.protocol](service.type.name));
        subBrowser.on('error', handleError);
        subBrowser.on('serviceUp', register);
        subBrowser.start();
    }
});

// var browser = mdns.createBrowser(mdns.tcp('ssh'));
// browser.on('serviceUp', register);

browser.on('serviceDown', unregister);
browser.on('error', handleError);

browser.start();

function register (service) {
    var name = service.host,
        addresses = service.addresses;

    if (name.indexOf(MDNS_DOMAIN, name.length - MDNS_DOMAIN.length) !== -1) {
        // if name is suffixed with MDNS_DOMAIN remove it
        name = name.substring(0, name.length - MDNS_DOMAIN.length);
    }

    name = name + '.' + BIND_DNS_DOMAIN;

    console.log("service up: ", name, addresses);
    // console.log(service);
    discovered[name] = {};
    addresses.forEach(function (addr) {
        if (IPV4_PATTERN.test(addr)) {
            discovered[name].A = addr;
        }
        if (IPV6_PATTERN.test(addr)) {
            discovered[name].AAAA = addr;
        }
    });
}

function unregister (service) {
    var name = service.name;

    console.log("service down: ", service);
    delete discovered[name];
}

function handleError (err) {
  console.error(err.stack);
}

/* ++++++ DNS server ++++++ */

var server = dns.createServer();

server.on('request', function (request, response) {
    // console.log(request);
    request.question.forEach(function (q) {
        var name = q.name;
        console.log('DNS request for ', name);

        if (name in discovered) {
            var addr = discovered[name];

            if (addr.A) {
                response.answer.push(dns.A({
                    name: name,
                    address: addr.A,
                    ttl: 60,
                }));
            }
            if (addr.AAAA) {
                response.answer.push(dns.AAAA({
                    name: name,
                    address: addr.AAAA,
                    ttl: 60,
                }));
            }
        }
    });
  response.send();
});

server.on('error', function (err, buff, req, res) {
  console.error(err.stack);
});

server.on('socketError', function (err, buff, req, res) {
  console.error('ERROR: Unable to dns bind server socket');
  console.error(err.stack);
});

server.serve(DNS_PORT);

/* ++++++ WEB ++++++*/

var app = express();

app.get('/', function (req, res) {
    var addressesHtml = [];
    Object.keys(discovered).sort().forEach(function (name) {
        var addresses = discovered[name];
        var addressHtml = [
            '<p>',
            util.format('<strong><a href="ssh://%s">%s</a></strong> ', name, name),
            '(' + (addresses.A || 'no ipV4') + ' - ' + (addresses.AAAA || 'no ipV6') + ')',
            '</p>',
            '<code><pre>$ ' + util.format('ssh %s', name) + '</pre></code>',
        ];
        addressesHtml.push(addressHtml.join('\n'));
    });

    res.send([
        '<html>',
        '<head>',
        '<title>mDNS Recorder</title>',
        '</head>',
        '<body>',
        '<h1>mDNS Recorder</h1>',
        addressesHtml.join('\n'),
        '</body>',
        '</html>'
    ].join('\n'));
    res.end();
});

var server = app.listen(WEB_PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});