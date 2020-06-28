const cool = require('cool-ascii-faces')
const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://mawrnubcqakjrq:82b6d3cd691b2cb9ef989d194ef68cf05759598c327c58ff129a4fa880df2ac9@ec2-35-169-254-43.compute-1.amazonaws.com:5432/dac2qujnnmo9h6",
  ssl: {
    rejectUnauthorized: false
  }
});

  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.get('/', (req, res) => res.render('pages/index'))
  app.get('/rate', (req, res) => res.render('pages/rate',{rateMessage:""}))
  app.get('/getrate', calculateRate)
  app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM letter');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  app.get('/cool', (req, res) => res.send(cool()))

  function calculateRate(req, res) {
    var weight = req.query.weight;
    console.log(weight);

    var service = req.query.service;
    console.log(service);

    var table = req.query.service;
    
    if(table == "metered" || table == "stamped"){
        var sql = "SELECT rate FROM letter WHERE weight = " + weight + "AND letterType = '" + service + "'";
    } else {
      var sql = "SELECT rate FROM " + table + " WHERE weight = " + weight;
    }
    console.log(sql);

    pool.query(sql, function(err, result) {
      // If an error occurred...
      if (err) {
        console.log("Error in query: ")
                  console.log(err);
                  res.end();
      }
 
    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows);

    //res.setHeader('Content-Type', 'application/json');
    //res.end(JSON.stringify(result.rows));
    
    var rateMessage = `The postage rate for a ${weight} ounce ${service} mailpiece is ${result.rows[0].rate}`;
    res.render('pages/rate', {
      rateMessage: rateMessage
  });
    
    });   
  }
  
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
