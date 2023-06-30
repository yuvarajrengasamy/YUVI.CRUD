 const express = require('express');
 const router = express.Router();
 const multer = require('multer') 
 const User = require ('../models/users');
 const fs = require('fs');


//image upload

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, "./uploads");
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});
var upload = multer({storage:storage,}).single('image');

// insert in user databse route
router.post('/add', upload,(req,res)=>{
    const user =new User ({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:req.file.filename
    });

    user.save((err)=>{
        if(err){
            res.json({message:err.message, type:'danger'})
        }
        else{
              req.session.message ={
                type:'success',
                message:"user added successfully!"
            } ;
              res.redirect("/");         
        }
    })
});


//get all user route:
router.get("/",(req,res)=>{
    User.find().exec((err,users) =>{
        if(err){
            res.json({message: err.message});
        }else{
            res.render("index",{
                title:"Home Page",
                users:users,
            });
        }
    });
});

    

router.get("/",(req,res)=>{
    res.render('index',{title:"HOME Page"});
 });
router.get('/add',(req,res)=>{
    res.render("add_users",{title:"Add Users"});
});
//edit route
router.get('/edit/:id',(req,res)=>{
       let id = req.params.id;
       User.findById(id,(err,user)=>{
        if(err){
            res.redirect('/');
        }else{
            if(user == null){
                res.redirect('/')
            }else{
                res.render('edit_users',{
                    title:"Edit User",
                    user:user,
                })
            }
        }
       })
});
//UPDATE USER ROUTE
router.post('/update/:id',upload,(req,res)=>{
    let id = req.params.id;
    let new_image ='';
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync("./uploads/"+req.body.old_image);
        }catch(err){
            console.log(err);
        }
    }else{
        new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(id,{
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:new_image,
    },(err,result)=>{
        if(err){
            res.json({message:err.message, type:'danger'})
        }
        else{
              req.session.message ={
                type:'success',
                message:"user added successfully!"
            } ;
              res.redirect("/");         
        }
    })
});

//delete
router.get('/delete/:id',(req,res)=>{
    let id = req.params.id;
    User,User.findByIdAndRemove(id,(err,result,image)=>{
        if(result.image !=""){
            try{
                fs.unlinkSync('./uplods/'+result.image);
            }catch(err){
                console.log(err);
            }
        }
        if(err){
            res.json({message:err.message});
        }else{
            req.session.message = {
                type:'info',
                message:"user delete "
            } ;
              res.redirect("/");   
        }
    })
})
 module.exports = router;