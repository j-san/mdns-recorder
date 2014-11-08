
[![Build Status](http://img.shields.io/travis/j-san/mdns-recorder/master.svg)](https://travis-ci.org/j-san/mdns-recorder)
[![Version](http://img.shields.io/npm/v/mdns-recorder.svg)](https://www.npmjs.org/package/mdns-recorder)

mDNS Recorder
=============

**Dynamic Zero Config DNS Server** with mDNS.

- Listen for local network machines.
- Give you a name server (DNS) and a web view.

It allow you to get all the power of ZeroConf outsider of the subnetwork.


Howto
-----

- Run mDNS Recorder inside your lan
- Bind a name for mDNS Recorder
- Install Avahi on servers in your lan (Mac just works, do nothing)
- That's it, just use the web view :)


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
BIND_DNS_DOMAIN=yournet.lan
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

Serve names with your mDNS DNS
------------------------------

- Deploy a DNS record NS in the parent DNS server
- Configure your dhcp / router to also use mdns-recorder for DNS
- Hack your resolv.conf, if you have resolveconf installed, add `name_servers_append=XX.XX.XX.XX` to `/etc/resolvconf.conf`


Add a server to DNS index
-------------------------

Run as root on a new terget:

```
yum install avahi
/etc/init.d/avahi-daemon start
```

Licence
-------

**THE BEER-WARE LICENSE** (Revision 42):

Jonathan Sanchez wrote this software. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.
