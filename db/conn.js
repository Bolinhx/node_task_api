const mongoose = require('mongoose')

async function main() {
// process.env.DATABASE_URL
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        //const db = mongoose.connection;
        console.log('Connected to database');
        //db.once('open', (error)=> console.log('Connected to database'));
    } catch (err) {
        //db.on('error', (error)=> console.error(error));
        console.error(err);
    }


 

    // db.on('error', (error)=> console.error(error));
    // db.once('open', (error)=> console.log('Connected to database'));
   
}

module.exports = main;




