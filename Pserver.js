var express=require("express");
var fileuploader=require("express-fileupload");
var ctp=express();
var mysql=require("mysql2");
var nodemailer = require('nodemailer');
ctp.use(express.static("public"));
var cloudinary= require("cloudinary").v2;
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
var config="mysql://avnadmin:AVNS_mA9tSqBFctYKs4vOnOL@mysql-141117f4-gurrupak24-61dd.c.aivencloud.com:24170/defaultdb"
var mysqlServer= mysql.createConnection(config);
mysqlServer.connect(function(err)
{
    if(err==null)
        console.log("Connected to Database Successfully");
    else
    console.log(err.message);
})
ctp.listen(2003,function(){
    console.log("Server Started at 2003");
});
ctp.get("/",function(req,resp){
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
});
ctp.get("/dash-Organizer",function(req,resp){
    let path1=__dirname+"/public/dash-Organizer.html";
    resp.sendFile(path1);
});
ctp.get("/profile-Organizer",function(req,resp){
    let path2=__dirname+"/public/profile-Organizer.html";
    resp.sendFile(path2);
});
ctp.get("/publish-tournaments",function(req,resp){
    let path3=__dirname+"/public/publish-tournaments.html";
    resp.sendFile(path3);
});
ctp.get("/tournaments-finder",function(req,resp){
    let path4=__dirname+"/public/tournaments-finder.html";
    resp.sendFile(path4);
});
ctp.get("/player-details",function(req,resp){
    let path5=__dirname+"/public/player-details.html"
    resp.sendFile(path5);
});


ctp.get("/admin",function(req,resp){
    let path5=__dirname+"/public/Bck-res.html"
    resp.sendFile(path5);
});
//------------Database
ctp.get("/Signup",function(req,resp){
   // console.log(resp.query);
   let email=req.query.txtEmail;
   let pwd=req.query.txtPwd;
   let utype=req.query.utype;
   mysqlServer.query("insert into users(emailid,pwd,utype,status,dos) values(?,?,?,?,current_date())",[email,pwd,utype,1],function(err){
    if(err==null)
    {
        resp.send("You are Signed Up! Welcome");

    }
    else
        resp.send(err.message)
      })
       })
//-------------Check User Exists
ctp.get("/check-user",function(req,resp)
{
    let email=req.query.txtEmail;
    mysqlServer.query("select * from users where emailid=?",[email],function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
        if(jsonArray.length==1)
                resp.send("Already Taken");
            else
                resp.send("Available")
    })

})
//------------------login
ctp.get("/Login", function(req, resp) {
    let email = req.query.txtLogemail;
    let pwd = req.query.txtLogpwd;
    mysqlServer.query("SELECT * FROM users WHERE emailid = ?  and pwd = ? and status=1", [email, pwd], function(err, jsonArray) {
        console.log("Email:", email);

        // Check if user is found
        if (jsonArray.length ==1) 
            {
            // Respond with user type and status
            resp.send(jsonArray[0]["utype"]);
            console.log(jsonArray[0]["status"]);
            } 
        else {
            resp.send("Incorrect credentials");
        }
    })
})
//------------------- Upload Files
ctp.use(fileuploader());
ctp.use(express.urlencoded(true));//binary to json conversion
ctp.post("/save-data",async function(req,resp)
{
    try{
    //----------SELECT BOX------------------------
    let Sports=req.body.Sport.toString();
    console.log(Sports);
    //resp.send(Sports);
    //-----------ID-Proof-----------------------
    let ID=req.body.inputProof;
    console.log(ID);
    //resp.send(ID);
    //--------City-----
    let city=req.body.inputCity;
    console.log(city);
    //resp.send(city);
    //-------Address------
    let Address= req.body.inputAddress;
    console.log(Address);
    //resp.send(Address);
    //-------------Contact----
    let Con=req.body.Contact;
    console.log(Con);
    //resp.send(Con);
    //--------Organization-----
    let bnda=req.body.Org;
    console.log(bnda);
    //resp.send(bnda);
    //--------Email---
    let mail=req.body.inputEmail;
    console.log(mail);
    //resp.send(mail);
    //---Previous Tournaments---
    let PT=req.body.PrevsText;
    console.log(PT);
    //resp.send(PT);
    //---------Website---
    let Site=req.body.Web;
    console.log(Site);
    //resp.send(Site);
    //-----Instagram----
    let Gram=req.body.Insta;
    console.log(Gram);
    //resp.send(Gram);
    let filename="";
    if(req.files==null)//pic did't uploaded
        {
            filename="nopic.jpg";
        }
        else
        {
            filename=req.files.profilepic.name;
            let path=__dirname+"/public/uploads/"+filename;
            console.log(path);
            req.files.profilepic.mv(path);
            //saving ur file/pic on cloudinary server
           await cloudinary.uploader.upload(path).then(function(result){
                filename=result.url;   //will give u the url of ur pic on cloudinary server
                console.log(filename);
           });
        }
    // req.body.picpath=filename;
    mysqlServer.query("insert into organizations(emailid,Organization,contact,address,city,proof,propic,sports,prev,website,insta) values(?,?,?,?,?,?,?,?,?,?,?)",[mail,bnda,Con,Address,city,ID,filename,Sports,PT,Site,Gram],function(err){
        if(err==null)
        {
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
     ctp.get("/fetch-user",function(req,resp)
    {
    let email=req.query.inputEmail;
    mysqlServer.query("select * from organizations where emailid=?",[email],function(err,jsonArray)
    {
        console.log(email);
        console.log(email);
        //possibility : 0 or 1 records
        //response.send(jsonArray);
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
            resp.send(jsonArray);    
    })
    })
    ctp.post("/update-data",async function(req,resp)
    {
        //----------SELECT BOX------------------------
    let Sports=req.body.Sport.toString();
    console.log(Sports);
    //resp.send(Sports);
    //-----------ID-Proof------------------------------
    let ID=req.body.inputProof;
    console.log(ID);
    //resp.send(ID);
    //--------City-----
    let city=req.body.inputCity;
    console.log(city);
    //resp.send(city);
    //-------Address------
    let Address= req.body.inputAddress;
    console.log(Address);
    //resp.send(Address);
    //-------------Contact----
    let Con=req.body.Contact;
    console.log(Con);
    //resp.send(Con);
    //--------Organization-----
    let bnda=req.body.Org;
    console.log(bnda);
    //resp.send(bnda);
    //--------Email---
    let mail=req.body.inputEmail;
    console.log(mail);
    //resp.send(mail);
    //---Previous Tournaments---
    let PT=req.body.PrevsText;
    console.log(PT);
    //resp.send(PT);
    //---------Website---
    let Site=req.body.Web;
    console.log(Site);
    //resp.send(Site);
    //-----Instagram----
    let Gram=req.body.Insta;
    console.log(Gram);
    //resp.send(Gram);
    let filename="";
    if(req.files==null)//pic did't uploaded
        {
            filename="nopic.jpg";
        }
        else
        {

            filename=req.files.profilepic.name;
            let path=__dirname+"/public/uploads/"+filename;
            console.log(path);
            req.files.profilepic.mv(path);
            //saving ur file/pic on cloudinary server
           await cloudinary.uploader.upload(path).then(function(result){
                filename=result.url;   //will give u the url of ur pic on cloudinary server
                console.log(filename);
           });

        }
    req.body.picpath=filename;
    //save data acc to columns sequence
    mysqlServer.query("UPDATE organizations SET Organization = ?, contact = ?, address = ?, city = ?, proof = ?, propic = ?, sports = ?, prev = ?, website = ?, insta = ? WHERE emailid = ?",
        [bnda, Con, Address, city, ID, filename, Sports, PT, Site, Gram, mail],function(err)
    {
        if(err==null)
            resp.send("Record Updated Successfully");
        else
            resp.send(err.message);
    })
    // resp.send(req.body);
    //resp.send("U are Signedup with Id="+req.body.txtMail);
})

ctp.get("/fetch-all-users",function(req,resp){
    var city=req.query.city;
    var game=req.query.game;
    mysqlServer.query("select * from tournaments where City=? and Game=?",[city,game],function(err,jsonArray)
    {
        if(err!=null)
            {
                resp.send(err.message);
            }
            else
                resp.send(jsonArray);
                //console.log(jsonArray);
               
        })
})
ctp.post("/publish-tournaments",async function(req,resp){  
    var taareektime=req.body.Date.split("T");
    console.log(taareektime);
    var taareek=taareektime[0];
    console.log(taareek);
    let filenames="";
    if(req.files==null)//pic did't uploaded
        {
            filenames="nopic.jpg";
        }
        else
        {
            filenames=req.files.Image.name;
            let path12=__dirname+"/public/uploads/"+filenames;
            console.log(path12);
            req.files.Image.mv(path12);
        //     saving ur file/pic on cloudinary server
          await cloudinary.uploader.upload(path12).then(function(result){
                filenames=result.url;   //will give u the url of ur pic on cloudinary server
                console.log(filenames);
            });
        }
        req.body.picpath=filenames;
    mysqlServer.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?)",[null,req.body.Email,req.body.Game,req.body.Title,req.body.Entry,taareek,req.body.City,req.body.Location,req.body.Prizes,req.body.picpath,req.body.info],function(err)
    {
    if(err==null)
        resp.send("Tournament Published Successfully");
    else
    {
        console.log(err.message);
    }     
    })
})

ctp.get("/fetch-city",function(req,resp){
    mysqlServer.query("select distinct City from tournaments",function(err,jsonArray)
    {
      if(err!==null)
      {
        resp.send(err.message);
      }

      else
      {
        resp.send(jsonArray);
      }
    })
})
ctp.get("/fetch-game",function(req,resp){
    mysqlServer.query("select distinct Game from tournaments",function(err,jsonArray)
    {
      if(err!==null)
      {
        resp.send(err.message);
      }
      else
      {
        resp.send(jsonArray);
      }
    })
})
ctp.get("/fetch-all-userss",function(req,resp){
    mysqlServer.query("select * from tournaments",function(err,jsonArray)
    {
      if(err!==null)
      {
        resp.send(err.message);
      }
      else
      {
        resp.send(jsonArray);
      }
    })
})
ctp.get("/UpPass",function(req,resp){  
    var email=req.query.inputEmail;
    console.log(email);
    var pass=req.query.CurrPwd;        
    console.log(pass);
    var NewPass=req.query.NewPwd;
    console.log(NewPass);
    mysqlServer.query("update users set pwd=? where emailid=? and pwd=?",[NewPass,email,pass],function(err,respo){
        if(respo.affectedRows==1) 
            resp.send("Password updated");
        else 
        resp.send("Sorry Try Again");
    })
})
// Player Details 
ctp.post("/Send-T-Server",async function(req,resp)
{
    //--------Email---
    let mail=req.body.inputEmail;
    console.log(mail);
    // ---------Name -------
    let naam= req.body.Name;
    console.log(naam);
    //----------SELECT BOX------------------------
    let Games=req.body.Game.toString();
    console.log(Games);
    //resp.send(Sports);
    //-------------Contact----
    let Con=req.body.Contact;
    console.log(Con);
    //resp.send(Con);
    //--------DOB-------
    let Dob=req.body.Birth;
    console.log(Dob);
    //-----------Gender-----------------------
    let Gender=req.body.Gender;
    console.log(Gender);
    //resp.send(ID);
    //-------Address------
    let Address= req.body.inputAddress;
    console.log(Address);
    //resp.send(Address);
    //--------City-----
    let city=req.body.inputCity;
    console.log(city);
    //resp.send(city);
    //------Id Proof-------
    let proof=req.body.Proof;
    console.log(proof);
    //resp.send(proof);
    let filename="";
    if(req.files==null)//pic did't uploaded
        {
            filename="nopic.jpg";
        }
        else
        {
            filename=req.files.profilepic.name;
            let path=__dirname+"/public/uploads/"+filename;
            console.log(path);
            req.files.profilepic.mv(path);
            //saving ur file/pic on cloudinary server
           await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;   //will give u the url of ur pic on cloudinary server
            console.log(filename);
           });
        }
    // req.body.picpath=filename;
    //---Previous Tournaments---
    let PT=req.body.PrevsText;
    console.log(PT);
    //resp.send(PT);
    mysqlServer.query("insert into players(emailid,name,games,mobile,dob,gender,address,city,idproof,poster,otherinfo) values(?,?,?,?,?,?,?,?,?,?,?)",[mail,naam,Games,Con,Dob,Gender,Address,city,proof,filename,PT],function(err){
        if(err==null)
        {
            resp.send("Your Data is Saved");
        }
        else
            resp.send(err.message)
    })   
})
ctp.post("/Modify-Details",async function(req,resp){
        //--------Email---
        let mail=req.body.inputEmail;
        console.log(mail);
        // ---------Name -------
        let naam= req.body.Name;
        console.log(naam);
        //----------SELECT BOX------------------------
        let Games=req.body.Game.toString();
        console.log(Games);
        //resp.send(Sports);
        //-------------Contact----
        let Con=req.body.Contact;
        console.log(Con);
        //resp.send(Con);
        //--------DOB-------
        let Dob=req.body.Birth;
        console.log(Dob);
        //-----------Gender-----------------------
        let Gender=req.body.Gender;
        console.log(Gender);
        //resp.send(ID);
        //-------Address------
        let Address= req.body.inputAddress;
        console.log(Address);
        //resp.send(Address);
        //--------City-----
        let city=req.body.inputCity;
        console.log(city);
        //resp.send(city);
        //------Id Proof-------
        let proof=req.body.Proof;
        console.log(proof);
        //resp.send(proof);
        let filename="";
        if(req.files==null)//pic did't uploaded
            {
                filename="nopic.jpg";
            }
            else
            {
                filename=req.files.profilepic.name;
                let path=__dirname+"/public/uploads/"+filename;
                console.log(path);
                req.files.profilepic.mv(path);  
                //saving ur file/pic on cloudinary server
               await cloudinary.uploader.upload(path).then(function(result){
                    filename=result.url;   //will give u the url of ur pic on cloudinary server
                    console.log(filename);
               });
            }
        // req.body.picpath=filename;
        //---Previous Tournaments---
        let PT=req.body.PrevsText;
        console.log(PT);
        //resp.send(PT);
        mysqlServer.query("UPDATE players SET name = ?, games = ?, mobile = ?, dob = ?, gender = ?, address = ?, city = ?, idproof = ?, poster = ?, otherinfo = ? WHERE emailid = ?",
            [naam,Games,Con,Dob,Gender,Address,city,proof,filename,PT,mail],function(err)
        {
            if(err==null)
                resp.send("Record Updated Successfully");
            else
                resp.send(err.message); 
        })
})
ctp.get("/fetch-player",function(req,resp)
{
let email=req.query.inputEmail;
mysqlServer.query("select * from players where emailid=?",[email],function(err,jsonArray)
{
    console.log(email);
    //possibility : 0 or 1 records
    //response.send(jsonArray);
    if(err!=null)
    {
        resp.send(err.message);
    }
    else
        resp.send(jsonArray);
})
})
ctp.post("/SendFeedback",function (req,resp){
    var Fname=req.body.feedname;
    var feed=req.body.Feedback;
    var num=req.body.Cont;
//  email content
var subject = "Feedback from "+Fname ;
var message ="<h1>Feedback</h1>"+feed+"<br>"+"<br>"+"<b>Contact</b>"+num;
// Send email
transporter.sendMail({
    to: "bcacs2021155@gmail.com",
    subject: subject,
    html: message
})
    console.log("Email sent");
    resp.send("Feedback sent successfully!");
})

//=============angular Ajax===============================
ctp.get("/all-records",function(req,resp)
{
    mysqlServer.query("select * from users",function(err,result)
    {
        if(err==null)
        {
         resp.send(result);
        }
        else
        resp.send(err.message);
    })
})


ctp.get("/doBlock",function(req,resp)
{
    let userMail=req.query.emailKuch;
    //col name Same as  table col name
    mysqlServer.query("update users set status=0 where emailid=?",[userMail],function(err,result)
    {
        if(err==null)
        {
            if(result.affectedRows==1)
            resp.send("Status block Successfulllyyyy");
            else
            resp.send("Invalid User Id");
        }
        else
        resp.send(err.message);
    })
})

//-----------RESUME USER---------------------------
ctp.get("/Resume",function(req,resp)
{
    let userMail=req.query.emailKuch;
                                                  //col name Same as  table col name
    mysqlServer.query("update users set status=1 where emailid=?",[userMail],function(err,result)
    {
        if(err==null)
        {
            if(result.affectedRows==1)
            resp.send("Status Resume Successfulllyyyy");
            else
            resp.send("Invalid User Id");
        }
        else
        resp.send(err.message);
    })
})