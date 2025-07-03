var express = require("express");
var fileuploader = require("express-fileupload");
var ctp = express();
var mysql = require("mysql2");
var nodemailer = require('nodemailer');
var basicAuth = require('express-basic-auth');
ctp.use('/admin', basicAuth({
  users: { 'GurS': 'World=Gur' },  // you set the username/password here
  challenge: true                    // this makes the browser show the popup
}));
ctp.use(express.static("public"));
var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: 'dczfiu4bx',
  api_key: '243185842841418',
  api_secret: 'sRQ0urEZHxhXAus7MqXr-bNNbN8' // Click 'View API Keys' above to copy your API secret
});
//----------NODEMAILER

// Set up the nodemailer transporter
var transporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  auth: {
    user: 'bcacs2021155@gmail.com',
    pass: 'debqzotpmxgmiezs',
  }
})
//---------AIVEN
var config = "mysql://avnadmin:AVNS_mA9tSqBFctYKs4vOnOL@mysql-141117f4-gurrupak24-61dd.c.aivencloud.com:24170/defaultdb"
var mysqlServer = mysql.createConnection(config);
mysqlServer.connect(function (err) {
  if (err == null)
    console.log("Connected to Database Successfully");
  else
    console.log(err.message);
})
ctp.listen(2003, function () {
  console.log("Server Started at 2003");
});
ctp.get("/", function (req, resp) {
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);
});
ctp.get("/dash-Organizer", function (req, resp) {
  let path1 = __dirname + "/public/dash-Organizer.html";
  resp.sendFile(path1);
});
ctp.get("/profile-Organizer", function (req, resp) {
  let path2 = __dirname + "/public/profile-Organizer.html";
  resp.sendFile(path2);
});
ctp.get("/publish-tournaments", function (req, resp) {
  let path3 = __dirname + "/public/publish-tournaments.html";
  resp.sendFile(path3);
});
ctp.get("/tournaments-finder", function (req, resp) {
  let path4 = __dirname + "/public/tournaments-finder.html";
  resp.sendFile(path4);
});
ctp.get("/player-details", function (req, resp) {
  let path5 = __dirname + "/public/player-details.html"
  resp.sendFile(path5);
});


ctp.get("/admin", function (req, resp) {
  let path5 = __dirname + "/public/Bck-res.html"
  resp.sendFile(path5);
});
//------------Database
ctp.get("/Signup", function (req, resp) {
  let email = req.query.txtEmail;
  let pwd = req.query.txtPwd;
  let utype = req.query.utype;

  mysqlServer.query(
    "INSERT INTO users(emailid, pwd, utype, status, dos) values(?,?,?,?,current_date())",
    [email, pwd, utype, 1],
    function (err) {
      if (err == null) {
        // INSERT success: send welcome email
        var mailOptions = {
          from: '"PlayGround" <bcacs2021155@gmail.com>',
          to: email,
          subject: "Welcome to Our Web Application!",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Welcome to Our Application!</h2>
              <p>Dear User,</p>
              <p>Thank you for signing up. We're excited to have you on board.</p>
              <p>Enjoy using our app!</p>
              <br>
              <p>Best regards,<br>PlayGround Team</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("Email error:", error);
            resp.send("You are Signed Up! But the welcome email could not be sent.");
          } else {
            console.log("Email sent: " + info.response);
            resp.send("You are Signed Up! A welcome email has been sent to your inbox.");
          }
        });

      } else {
        // HANDLE DUPLICATE ENTRY
        if (err.code === 'ER_DUP_ENTRY') {
          resp.send("Already Taken");
        } else {
          // All other DB errors
          console.error("DB error:", err);
          resp.send("Server error: " + err.message);
        }
      }
    }
  );
});
//------------------login
ctp.get("/Login", function (req, resp) {
  let email = req.query.txtLogemail;
  let pwd = req.query.txtLogpwd;

  mysqlServer.query(
    "SELECT * FROM users WHERE emailid = ? AND pwd = ? AND status=1",
    [email, pwd],
    function (err, jsonArray) {
      console.log("Email:", email);

      if (err) {
        console.error("DB error:", err);
        resp.send("Server error");
        return;
      }

      if (jsonArray.length === 1) {
        const userType = jsonArray[0]["utype"];
        console.log("Login success. User type:", userType);

        // Prepare login email notification
        const subject = "Login Alert - Your Account";
        const message = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color:#4CAF50;">Login Notification</h2>
            <p>Hello,</p>
            <p>This is to inform you that your account <b>${email}</b> was just logged in successfully.</p>
            <p>If this was not you, please change your password immediately.</p>
            <br>
            <p style="font-size:0.9em; color:#888;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        `;

        // Send login email
        transporter.sendMail(
          {
            from: '"PlayGround Team" <bcacs2021155@gmail.com>',
            to: email,
            subject: subject,
            html: message,
          },
          function (mailErr, info) {
            if (mailErr) {
              console.error("Error sending login email:", mailErr);
              // Even if email fails, we still allow login
            } else {
              console.log("Login email sent:", info.response);
            }

            // Always respond to client after email attempt
            resp.send(userType);
          }
        );
      } else {
        resp.send("Incorrect credentials");
      }
    }
  );
});
//------------------- Upload Files
ctp.use(fileuploader());
ctp.use(express.urlencoded(true));//binary to json conversion
ctp.post("/save-data", async function (req, resp) {
  try {
    //----------SELECT BOX------------------------
    let Sports = req.body.Sport.toString();
    console.log(Sports);
    //resp.send(Sports);
    //-----------ID-Proof-----------------------
    let ID = req.body.inputProof;
    console.log(ID);
    //resp.send(ID);
    //--------City-----
    let city = req.body.inputCity;
    console.log(city);
    //resp.send(city);
    //-------Address------
    let Address = req.body.inputAddress;
    console.log(Address);
    //resp.send(Address);
    //-------------Contact----
    let Con = req.body.Contact;
    console.log(Con);
    //resp.send(Con);
    //--------Organization-----
    let bnda = req.body.Org;
    console.log(bnda);
    //resp.send(bnda);
    //--------Email---
    let mail = req.body.inputEmail;
    console.log(mail);
    //resp.send(mail);
    //---Previous Tournaments---
    let PT = req.body.PrevsText;
    console.log(PT);
    //resp.send(PT);
    //---------Website---
    let Site = req.body.Web;
    console.log(Site);
    //resp.send(Site);
    //-----Instagram----
    let Gram = req.body.Insta;
    console.log(Gram);
    //resp.send(Gram);
    let filename = "";
    if (req.files == null)//pic did't uploaded
    {
      filename = "nopic.jpg";
    }
    else {
      filename = req.files.profilepic.name;
      let path = __dirname + "/public/uploads/" + filename;
      console.log(path);
      req.files.profilepic.mv(path);
      //saving ur file/pic on cloudinary server
      await cloudinary.uploader.upload(path).then(function (result) {
        filename = result.url;   //will give u the url of ur pic on cloudinary server
        console.log(filename);
      });
    }
    // req.body.picpath=filename;
    mysqlServer.query("insert into organizations(emailid,Organization,contact,address,city,proof,propic,sports,prev,website,insta) values(?,?,?,?,?,?,?,?,?,?,?)", [mail, bnda, Con, Address, city, ID, filename, Sports, PT, Site, Gram], function (err) {
      if (err == null) {
        resp.send("Your Data is Saved");
      }
      else
        resp.send(err.message)
    })
  }
  catch (err) {
    console.error("Server Error:", err);
    resp.status(500).send("Server Error: " + err.message);
  }
})
ctp.get("/fetch-user", function (req, resp) {
  let email = req.query.inputEmail;
  mysqlServer.query("select * from organizations where emailid=?", [email], function (err, jsonArray) {
    console.log(email);
    console.log(email);
    //possibility : 0 or 1 records
    //response.send(jsonArray);
    if (err != null) {
      resp.send(err.message);
    }
    else
      resp.send(jsonArray);
  })
})
ctp.post("/update-data", async function (req, resp) {
  //----------SELECT BOX------------------------
  let Sports = req.body.Sport.toString();
  console.log(Sports);
  //resp.send(Sports);
  //-----------ID-Proof------------------------------
  let ID = req.body.inputProof;
  console.log(ID);
  //resp.send(ID);
  //--------City-----
  let city = req.body.inputCity;
  console.log(city);
  //resp.send(city);
  //-------Address------
  let Address = req.body.inputAddress;
  console.log(Address);
  //resp.send(Address);
  //-------------Contact----
  let Con = req.body.Contact;
  console.log(Con);
  //resp.send(Con);
  //--------Organization-----
  let bnda = req.body.Org;
  console.log(bnda);
  //resp.send(bnda);
  //--------Email---
  let mail = req.body.inputEmail;
  console.log(mail);
  //resp.send(mail);
  //---Previous Tournaments---
  let PT = req.body.PrevsText;
  console.log(PT);
  //resp.send(PT);
  //---------Website---
  let Site = req.body.Web;
  console.log(Site);
  //resp.send(Site);
  //-----Instagram----
  let Gram = req.body.Insta;
  console.log(Gram);
  //resp.send(Gram);
  let filename = "";
  if (req.files == null)//pic did't uploaded
  {
    filename = "nopic.jpg";
  }
  else {

    filename = req.files.profilepic.name;
    let path = __dirname + "/public/uploads/" + filename;
    console.log(path);
    req.files.profilepic.mv(path);
    //saving ur file/pic on cloudinary server
    await cloudinary.uploader.upload(path).then(function (result) {
      filename = result.url;   //will give u the url of ur pic on cloudinary server
      console.log(filename);
    });

  }
  req.body.picpath = filename;
  //save data acc to columns sequence
  mysqlServer.query("UPDATE organizations SET Organization = ?, contact = ?, address = ?, city = ?, proof = ?, propic = ?, sports = ?, prev = ?, website = ?, insta = ? WHERE emailid = ?",
    [bnda, Con, Address, city, ID, filename, Sports, PT, Site, Gram, mail], function (err) {
      if (err == null)
        resp.send("Record Updated Successfully");
      else
        resp.send(err.message);
    })
  // resp.send(req.body);
  //resp.send("U are Signedup with Id="+req.body.txtMail);
})

ctp.get("/fetch-all-users", function (req, resp) {
  var city = req.query.city;
  var game = req.query.game;
  mysqlServer.query("select * from tournaments where City=? and Game=?", [city, game], function (err, jsonArray) {
    if (err != null) {
      resp.send(err.message);
    }
    else
      resp.send(jsonArray);
    //console.log(jsonArray);

  })
})
ctp.post("/publish-tournaments", async function (req, resp) {
  try {
    var taareektime = req.body.Date.split("T");
    var taareek = taareektime[0];

    let filenames = "";
    if (req.files == null) {
      filenames = "nopic.jpg";
    } else {
      filenames = req.files.Image.name;
      let path12 = __dirname + "/public/uploads/" + filenames;
      req.files.Image.mv(path12);
      await cloudinary.uploader.upload(path12).then(function (result) {
        filenames = result.url;
      });
    }
    req.body.picpath = filenames;

    mysqlServer.query(
      "insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?)",
      [
        null,
        req.body.Email,
        req.body.Game,
        req.body.Title,
        req.body.Entry,
        taareek,
        req.body.City,
        req.body.Location,
        req.body.Prizes,
        req.body.picpath,
        req.body.info
      ],
      function (err) {
        if (err == null) {
          mysqlServer.query("select email from subscribers", function (err, result) {
            if (err == null) {
              if (result.length == 0) {
                resp.send("Tournament Published Successfully (No subscribers to notify)");
              } else {
                let emails = result.map(row => row.email);

                let htmlContent = `
                  <h2>New Tournament: ${req.body.Title}</h2>
                  <p><strong>Game:</strong> ${req.body.Game}</p>
                  <p><strong>Date:</strong> ${taareek}</p>
                  <p><strong>City:</strong> ${req.body.City}</p>
                  <p><strong>Location:</strong> ${req.body.Location}</p>
                  <p><strong>Entry Fee:</strong> ${req.body.Entry}</p>
                  <p><strong>Prizes:</strong> ${req.body.Prizes}</p>
                  <p>${req.body.info}</p>
                  <p><img src="${req.body.picpath}" alt="Tournament Poster" width="300"></p>
                  <p>Visit PlayGround to register.</p>
                `;

                let mailOptions = {
                  from: '"PlayGround Team" <bcacs2021155@gmail.com>',
                  bcc: emails,
                  subject: `New Tournament Published: ${req.body.Title}`,
                  html: htmlContent
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.error(error);
                    resp.send("Tournament Published Successfully (Error sending emails to subscribers)");
                  } else {
                    console.log("Emails sent: " + info.response);
                    resp.send("Tournament Published Successfully and Subscribers Notified");
                  }
                });
              }
            } else {
              console.error(err.message);
              resp.send("Tournament Published, but error fetching subscribers");
            }
          });
        } else {
          console.error(err.message);
          resp.send("Error publishing tournament");
        }
      }
    );
  } catch (err) {
    console.error("Server Error:", err);
    resp.send("Server Error: " + err.message);
  }
});

ctp.post("/subscribeNewsletter", function(req, resp) {
  const email = req.body.email;

  if (!email) {
    resp.send("Email is required.");
    return;
  }

  mysqlServer.query("select * from subscribers where email=?", [email], function(err, result) {
    if (err) {
      console.error(err);
      resp.send("Error checking subscription.");
      return;
    }

    if (result.length > 0) {
      resp.send("You are already subscribed.");
      return;
    }

    mysqlServer.query("insert into subscribers (email) values(?)", [email], function(err2) {
      if (err2) {
        console.error(err2);
        resp.send("Error saving subscription.");
        return;
      }

      const mailOptions = {
        from: '"PlayGround" <bcacs2021155@gmail.com>',
        to: email,
        subject: "Welcome to PlayGround Newsletter",
        html: `
          <h2>Welcome to PlayGround!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now get updates about tournaments and more.</p>
        `
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.error(error);
          resp.send("Subscribed, but error sending welcome email.");
        } else {
          resp.send("Subscribed successfully. Welcome email sent.");
        }
      });
    });
  });
});

ctp.get("/fetch-city", function (req, resp) {
  mysqlServer.query("select distinct City from tournaments", function (err, jsonArray) {
    if (err !== null) {
      resp.send(err.message);
    }

    else {
      resp.send(jsonArray);
    }
  })
})
ctp.get("/fetch-game", function (req, resp) {
  mysqlServer.query("select distinct Game from tournaments", function (err, jsonArray) {
    if (err !== null) {
      resp.send(err.message);
    }
    else {
      resp.send(jsonArray);
    }
  })
})
ctp.get("/fetch-all-userss", function (req, resp) {
  mysqlServer.query("select * from tournaments", function (err, jsonArray) {
    if (err !== null) {
      resp.send(err.message);
    }
    else {
      resp.send(jsonArray);
    }
  })
})
ctp.get("/UpPass", function (req, resp) {
  var email = req.query.inputEmail;
  console.log(email);
  var pass = req.query.CurrPwd;
  console.log(pass);
  var NewPass = req.query.NewPwd;
  console.log(NewPass);
  mysqlServer.query("update users set pwd=? where emailid=? and pwd=?", [NewPass, email, pass], function (err, respo) {
    if (respo.affectedRows == 1)
      resp.send("Password updated");
    else
      resp.send("Sorry Try Again");
  })
})
// Player Details 
ctp.post("/Send-T-Server", async function (req, resp) {
  try {
    //--------Email---
    let mail = req.body.inputEmail;
    console.log(mail);
    // ---------Name -------
    let naam = req.body.Name;
    console.log(naam);
    //----------SELECT BOX------------------------
    let Games = req.body.Game.toString();
    console.log(Games);
    //resp.send(Sports);
    //-------------Contact----
    let Con = req.body.Contact;
    console.log(Con);
    //resp.send(Con);
    //--------DOB-------
    let Dob = req.body.Birth;
    console.log(Dob);
    //-----------Gender-----------------------
    let Gender = req.body.Gender;
    console.log(Gender);
    //resp.send(ID);
    //-------Address------
    let Address = req.body.inputAddress;
    console.log(Address);
    //resp.send(Address);
    //--------City-----
    let city = req.body.inputCity;
    console.log(city);
    //resp.send(city);
    //------Id Proof-------
    let proof = req.body.Proof;
    console.log(proof);
    //resp.send(proof);
    let filename = "";
    if (req.files == null)//pic did't uploaded
    {
      filename = "nopic.jpg";
    }
    else {
      filename = req.files.profilepic.name;
      let path = __dirname + "/public/uploads/" + filename;
      console.log(path);
      req.files.profilepic.mv(path);
      //saving ur file/pic on cloudinary server
      await cloudinary.uploader.upload(path).then(function (result) {
        filename = result.url;   //will give u the url of ur pic on cloudinary server
        console.log(filename);
      });
    }
    // req.body.picpath=filename;
    //---Previous Tournaments---
    let PT = req.body.PrevsText;
    console.log(PT);
    //resp.send(PT);
    mysqlServer.query("insert into players(emailid,name,games,mobile,dob,gender,address,city,idproof,poster,otherinfo) values(?,?,?,?,?,?,?,?,?,?,?)", [mail, naam, Games, Con, Dob, Gender, Address, city, proof, filename, PT], function (err) {
      if (err == null) {
        resp.send("Your Data is Saved");
      }
      else
        resp.send(err.message)
    })
  }
  catch (err) {
    console.error("Server Error:", err);
    resp.status(500).send("Server Error: " + err.message);
  }
})
ctp.post("/Modify-Details", async function (req, resp) {
  //--------Email---
  let mail = req.body.inputEmail;
  console.log(mail);
  // ---------Name -------
  let naam = req.body.Name;
  console.log(naam);
  //----------SELECT BOX------------------------
  let Games = req.body.Game.toString();
  console.log(Games);
  //resp.send(Sports);
  //-------------Contact----
  let Con = req.body.Contact;
  console.log(Con);
  //resp.send(Con);
  //--------DOB-------
  let Dob = req.body.Birth;
  console.log(Dob);
  //-----------Gender-----------------------
  let Gender = req.body.Gender;
  console.log(Gender);
  //resp.send(ID);
  //-------Address------
  let Address = req.body.inputAddress;
  console.log(Address);
  //resp.send(Address);
  //--------City-----
  let city = req.body.inputCity;
  console.log(city);
  //resp.send(city);
  //------Id Proof-------
  let proof = req.body.Proof;
  console.log(proof);
  //resp.send(proof);
  let filename = "";
  if (req.files == null)//pic did't uploaded
  {
    filename = "nopic.jpg";
  }
  else {
    filename = req.files.profilepic.name;
    let path = __dirname + "/public/uploads/" + filename;
    console.log(path);
    req.files.profilepic.mv(path);
    //saving ur file/pic on cloudinary server
    await cloudinary.uploader.upload(path).then(function (result) {
      filename = result.url;   //will give u the url of ur pic on cloudinary server
      console.log(filename);
    });
  }
  // req.body.picpath=filename;
  //---Previous Tournaments---
  let PT = req.body.PrevsText;
  console.log(PT);
  //resp.send(PT);
  mysqlServer.query("UPDATE players SET name = ?, games = ?, mobile = ?, dob = ?, gender = ?, address = ?, city = ?, idproof = ?, poster = ?, otherinfo = ? WHERE emailid = ?",
    [naam, Games, Con, Dob, Gender, Address, city, proof, filename, PT, mail], function (err) {
      if (err == null)
        resp.send("Record Updated Successfully");
      else
        resp.send(err.message);
    })
})
ctp.get("/fetch-player", function (req, resp) {
  let email = req.query.inputEmail;
  mysqlServer.query("select * from players where emailid=?", [email], function (err, jsonArray) {
    console.log(email);
    //possibility : 0 or 1 records
    //response.send(jsonArray);
    if (err != null) {
      resp.send(err.message);
    }
    else
      resp.send(jsonArray);
  })
})
// Feedback Route
ctp.post("/SendFeedback", function (req, resp) {
  var Fname = req.body.feedname;
  var feed = req.body.Feedback;
  var num = req.body.Cont;

  var subject = `New Feedback from ${Fname}`;

  var message = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4CAF50;">New Feedback Received</h2>
      <p><strong>Name:</strong> ${Fname}</p>
      <p><strong>Contact:</strong> ${num}</p>
      <p><strong>Feedback:</strong></p>
      <blockquote style="border-left: 4px solid #4CAF50; margin: 10px; padding-left: 10px; color: #555;">
        ${feed}
      </blockquote>
      <br>
      <p style="font-size: 0.9em; color: #888;">This message was generated automatically by your website feedback form.</p>
    </div>
  `;

  transporter.sendMail(
    {
      to: "bcacs2021155@gmail.com",
      subject: subject,
      html: message,
    },
    function (error, info) {
      if (error) {
        console.error("Email error:", error);
        resp.send("Error sending feedback.");
      } else {
        console.log("Email sent:", info.response);
        resp.send("Feedback sent successfully!");
      }
    }
  );
});
//=============angular Ajax===============================
ctp.get("/all-records", function (req, resp) {
  mysqlServer.query("select * from users", function (err, result) {
    if (err == null) {
      resp.send(result);
    }
    else
      resp.send(err.message);
  })
})


ctp.get("/doBlock", function (req, resp) {
  let userMail = req.query.emailKuch;

  mysqlServer.query(
    "UPDATE users SET status=0 WHERE emailid=?",
    [userMail],
    function (err, result) {
      if (err == null) {
        if (result.affectedRows == 1) {
          // Prepare the email
          const mailOptions = {
            from: '"PlayGround" <bcacs2021155@gmail.com>',
            to: userMail,
            subject: "Your Free Trial Has Ended",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color:#E74C3C;">Trial Ended</h2>
                <p>Hello,</p>
                <p>Your free trial period has now ended and your account has been temporarily blocked.</p>
                <p>Please contact the service provider to resume your access.</p>
                <br>
                <p>Thank you,<br>PlayGround Team</p>
              </div>
            `
          };

          // Send the email
          transporter.sendMail(mailOptions, function (mailErr, info) {
            if (mailErr) {
              console.error("Error sending block email:", mailErr);
              resp.send("User blocked, but email could not be sent.");
            } else {
              console.log("Block email sent:", info.response);
              resp.send("User blocked successfully and email sent.");
            }
          });
        } else {
          resp.send("Invalid User Id");
        }
      } else {
        resp.send(err.message);
      }
    }
  );
});


//-----------RESUME USER---------------------------
ctp.get("/Resume", function (req, resp) {
  let userMail = req.query.emailKuch;

  mysqlServer.query(
    "UPDATE users SET status=1 WHERE emailid=?",
    [userMail],
    function (err, result) {
      if (err == null) {
        if (result.affectedRows == 1) {
          // Prepare the resume/reactivation email
          const mailOptions = {
            from: '"PlayGround" <bcacs2021155@gmail.com>',
            to: userMail,
            subject: "Your Account Has Been Reactivated",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color:#2ECC71;">Account Reactivated</h2>
                <p>Hello,</p>
                <p>Your account has been successfully reactivated. You now have access to all services again.</p>
                <p>If you have any questions, please contact support.</p>
                <br>
                <p>Thank you,<br>PlayGround Team</p>
              </div>
            `
          };

          // Send the email
          transporter.sendMail(mailOptions, function (mailErr, info) {
            if (mailErr) {
              console.error("Error sending resume email:", mailErr);
              resp.send("User resumed, but email could not be sent.");
            } else {
              console.log("Resume email sent:", info.response);
              resp.send("User resumed successfully and email sent.");
            }
          });
        } else {
          resp.send("Invalid User Id");
        }
      } else {
        resp.send(err.message);
      }
    }
  );
});