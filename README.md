
[![Build Status](http://img.shields.io/travis/j-san/mdns-recorder/master.svg)](https://travis-ci.org/j-san/mdns-recorder)
[![Version](http://img.shields.io/npm/v/mdns-recorder.svg)](https://www.npmjs.org/package/mdns-recorder)

mDNS Recorder
=============

Dynamic Zero Config DNS Server with mDNS.

Listen to local area machine, bind DNS name server and a web view. It allow you to bind names dinamicly for outsider of the subnetwork.


Howto
-----

- Install Avahi on servers in your lan (Mac just works, do nothing)
- Run this software inside your lan (see "Delpoy" section)
- Create a DNS record to point on mDNS Recorder
- Just use the web view


Local
-----

```
git clone https://github.com/j-san/mdns-recorder.git
cd mdns-recorder
npm install

npm start
# you should open http://localhost:300/
# or query DNS
dig @localhost foo.subnet.lan  ANY -p 3053

npm test
```

Deploy
------

```
npm install mdns-recorder
gem install foreman
edit mdns-recorder-env

sudo foreman export upstart /etc/init/ \
    --app=mdns-recorder \
    --procfile= node_modules/mdns-recorder/Procfile \
    --env=mdns-recorder-env

sudo start mdns-recorder
```
