var express          = require('express');
var router           = express.Router();
var multer           = require('multer');
var upload           = multer({ dest: 'public/images/upload' });
var mongo            = require('mongodb');
var db               = require('monk')('localhost/nodeblog');
var categories  = db.get('categories');


///Show One Post
router.get('/show/:id', function(req, res, next) {

    var id    = req.params.id;
    var posts = db.get('posts');
    posts.findOne({_id : id},{}, function (err,post) {
        res.render('showpost',{
            title      :post.title,
            post :post,
            errors :''
        });
    });
});


/* Add  Post */
router.get('/add', function(req, res, next) {


    categories.find({} , {} , function (err,categories) {
        res.render('addpost',{
            title      :'Add Post',
            categories :categories,
            errors:''
        });
    });
});


router.post('/add',upload.single('mainimage') ,function(req, res, next) {
    var title         = req.body.title;
    var category      = req.body.category;
    var body          = req.body.body;
    var mainimage     = req.body.mainimage;
    var author        = req.body.author;
    var date          = new Date();

    //check image upload
    if(req.file){
        var mainimage = req.file.filename;

    }else{
       var mainimage  = 'noimage.jpg';
    }

    //form validation
    req.checkBody('title' , "Titel field is reguired").notEmpty();
    req.checkBody('body' , "Body field is reguired").notEmpty();

    var errors = req.validationErrors();

    if(errors){
        categories.find({} , {} , function (err,categories) {
            res.render('addpost',{
                title      :'Add Post',
                categories :categories,
                errors:errors
            });
        });
    }else{
        var posts = db.get('posts');
        posts.insert({
           "title":title,
            "body":body,
            "category":category,
            "date":date,
            "author":author,
            "mainimage":mainimage
        },function (err,post) {
            if (err){
                res.send(err);
            } else{
                req.flash('success' , "Post Added");
                categories.find({} , {} , function (err,categories) {
                    res.render('addpost',{
                        title      :'Add Post',
                        categories :categories,
                        errors:''
                    });
                });
            }
        })
    }
});

router.post('/addcomment' ,function(req, res, next) {
    var postid         = req.body.postid;
    var name           = req.body.name;
    var email          = req.body.email;
    var body           = req.body.body;
    var commentdate    = new Date();


    //form validation
    req.checkBody('name' , "Name field is reguired").notEmpty();
    req.checkBody('email' , "Email field is reguired but never displayed").notEmpty();
    req.checkBody('email' , "Email is not formatted property").notEmpty();
    req.checkBody('body' , "Body field is reguired").notEmpty();

    var errors = req.validationErrors();

    if(errors){
        var posts = db.get('posts');
        posts.findOne({_id : postid},{}, function (err,post) {
            res.render('showpost',{
                title  :post.title,
                post   :post,
                errors :errors
            });
        });
    }else{
         var comment = {
             "name"        :name,
             "email"       :email,
             "body"        :body,
             "commentdate" : commentdate
         }

         var posts = db.get('posts');

         posts.update({
             "_id":postid
         },{
             $push:{
                 "comments":comment
             }
         },function (err,doc) {
               if(err){
                   throw err;
               }else{
                   req.flash('success' , "Comment Added");
                  res.location('/posts/show/'+postid);
                  res.redirect('/posts/show/'+postid);
               }
         });
    }
});



/* Add  Post */
router.get('/edit/:id', function(req, res, next) {
    var id    = req.params.id;
    var posts = db.get('posts');
    posts.findOne({_id : id},{}, function (err,post) {
        var categories  = db.get('categories');

        categories.find({} , {} , function (err,categories) {
            res.render('editpost',{
                title      :post.title,
                post :post,
                errors :'',
                categories :categories
            });
        });

    });

});



router.post('/edit/:id',upload.single('mainimage')  ,function(req, res, next) {
    var postid        = req.body.postid;
    var title         = req.body.title;
    var category      = req.body.category;
    var body          = req.body.body;
    var mainimage     = req.body.mainimage;
    var author        = req.body.author;
    var date          = new Date();
    var id            = req.params.id;
    var comment       = [];

    //check image upload
    if(req.file){
        var mainimage = req.file.filename;

    }else{
        var mainimage  = 'noimage.jpg';
    }

    //form validation
    req.checkBody('title' , "Name field is reguired").notEmpty();
    req.checkBody('author' , "Email field is reguired but never displayed").notEmpty();
    req.checkBody('category' , "Email is not formatted property").notEmpty();
    req.checkBody('body' , "Body field is reguired").notEmpty();

    var errors = req.validationErrors();

    if(errors){
        var posts = db.get('posts');
        posts.findOne({_id : postid},{}, function (err,post) {
            var categories  = db.get('categories');
             comment = post.comment;
            categories.find({} , {} , function (err,categories) {
                res.render('editpost',{
                    title       :post.title,
                    post        :post,
                    errors      :errors,
                    categories  :categories
                });
            });

        });

    }else{

        var posts = db.get('posts');
        posts.findOne({_id : postid},{}, function (err,post) {
            console.log(post.comments);
            posts.update({
                "_id":postid
            },{
                "title"     :title,
                "body"      : body,
                "category"  : category,
                "date"      : date,
                "author"    : author,
                "mainimage" : mainimage,
                "comments"   : post.comments
            },function (err,doc) {
                if(err){
                    throw err;
                }else{
                    req.flash('success' , "Post Editted");
                    res.location('/posts/show/'+postid);
                    res.redirect('/posts/show/'+postid);
                }
            });
        });
    }
});




module.exports = router;
