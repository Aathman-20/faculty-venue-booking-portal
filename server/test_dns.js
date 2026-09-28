const dns = require('dns');
const mongoose = require('mongoose');

const uri = "mongodb+srv://vigneshofficial2008_db_user:sishcVDi5WYbde6m@tcebooking.1h2a06i.mongodb.net/?appName=TceBooking";
const srvHost = "_mongodb._tcp.tcebooking.1h2a06i.mongodb.net";

// Configure external DNS servers before any resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('Active DNS Servers:', dns.getServers());

console.log('\n1. Testing dns.resolveSrv...');
dns.resolveSrv(srvHost, (err, addresses) => {
    if (err) {
        console.error('DNS resolveSrv failed:', err.message);
    } else {
        console.log('DNS resolveSrv succeeded:', addresses);
    }
    
    console.log('\n2. Testing mongoose.connect with mongodb+srv URI...');
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('Mongoose connected successfully!');
            process.exit(0);
        })
        .catch(err => {
            console.error('Mongoose connection failed:', err.message);
            process.exit(1);
        });
});
