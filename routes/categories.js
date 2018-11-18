var express          = require('express');
var router           = express.Router();
var multer           = require('multer');
var upload           = multer({ dest: './public/images/upload' });
var mongo            = require('mongodb');
var db               = require('monk')('localhost/nodeblog');
var categories  = db.get('categories');
/* GET users listing. */

router.get('/show/:category', function(req, res, next) {

    var category = req.params.category;
    var posts = db.get('posts');

    posts.find({category:category} , {} , function (err,posts) {
        res.render('index', { posts:posts,title:category });
    });

});



router.get('/edit', function(req, res, next) {


    getCategories(function (err,categories) {
        res.render('editcategory',{
            title      :'Add Category',
            categories :categories,
            errors:''
        });
    });

});


function getCategories(callback){
    console.log(categories);
    categories.find({} , {} , callback);
}


router.post('/add' ,function(req, res, next) {
    var name         = req.body.name;


    //form validation
    req.checkBody('name' , "Name field is reguired").notEmpty();

    var errors = req.validationErrors();

    if(errors){
        getCategories(function (err,cats) {
            res.render('editcategory',{
                title      :'Add Category',
                categories :cats,
                errors:errors
            });
        });
    }else{

        categories.find({"name":name},function (err,category) {
            if (err){res.send(err)
            } else if(category.length > 0){
                req.flash('error' , "Category is exist");
                getCategories(function (err,cats) {
                    res.render('editcategory',{
                        title      :'Add Category',
                        categories :cats,
                        errors:''
                    });
                });
            }else{

                categories.insert({
                    "name":name
                },function (err,category) {
                    if (err){
                        res.send(err);
                    } else{

                        req.flash('success' , "Category Added");
                        getCategories(function (err,cats) {
                            res.render('editcategory',{
                                title      :'Add Category',
                                categories :cats,
                                errors:''
                            });
                        });
                    }
                })
            }
        });
    }
});



router.post('/delete' ,function(req, res, next) {
    var name         = req.body.category;

    //form validation
    req.checkBody('category' , "Category field is reguired").notEmpty();
    var errors = req.validationErrors();

    if(errors){
        getCategories(function (err,cats) {
            res.render('editcategory',{
                title      :'Edit Category',
                categories :cats,
                errors:errors
            });
        });
    }else{
        var categories = db.get('categories');
        categories.remove({"name":name},function (err,category) {
            if (err){res.send(err)
            } else if(category.length > 0){
                req.flash('error' , "Category is not exist");
                getCategories(function (err,cats) {
                    res.render('editcategory',{
                        title      :'Edit Category',
                        categories :cats,
                        errors:errors
                    });
                });
            }else{
                req.flash('success' , "Category Deleted");
                getCategories(function (err,cats) {
                    res.render('editcategory',{
                        title      :'Edit Category',
                        categories :cats,
                        errors:''
                    });
                });

            }
        });
    }
});




module.exports = router;
