
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


Deploy
------

```
# apt-get install libavahi-compat-libdnssd-dev libnss-mdns
# or
# yum install avahi-compat-libdns_sd-devel nss-mdns

sudo npm install -g mdns-recorder foreman
cat > ./env << 'EOF'
WEB_PORT=80
DNS_PORT=53
BIND_DNS_DOMAIN=.yournet.lan
EOF

useradd mdns-recorder

sudo nf export \
    --out      /etc/init/ \
    --app      mdns-recorder \
    --user     mdns-recorder \
    --env      ./env \
    --cwd      /usr/lib/node_modules/mdns-recorder/ \
    --procfile /usr/lib/node_modules/mdns-recorder/Procfile

sudo start mdns-recorder
```

Dev
---

```
git clone https://github.com/j-san/mdns-recorder.git
cd mdns-recorder
npm install

npm start
# you should open http://localhost:3000/
# or query DNS
dig @localhost foo.subnet.lan  ANY -p 3053

npm test
```

If you don't want to deploy a DNS record, hack your resolv.conf:

If you have resolveconf installed, add `name_servers=XX.XX.XX.XX` to `/etc/resolvconf.conf`.

