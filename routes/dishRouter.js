var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Dishes = require('../models/dishes-3.js');

var dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/* Route '/' */

dishRouter
  .route('/')
  .get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Dishes.find({}, function(err, dish){
        if(err) {
          throw err;  
        } 
        res.json(dish);
    });
  })
  .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Dishes.create(req.body, function(err, dish) {
        if(err) {
            throw err;
        }
        var id = dish._id;
        res.writeHead('200', {
            'Content-Type' : 'text/plain'
        });
        res.end('Added dish with id:'+id);
    });
  })
  .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Dishes.remove({}, function(err, resp) {
        if(err) {
            throw err;
        }
        res.json(resp);
    });
  });

/* Route '/:dishId' */

dishRouter
  .route('/:dishId')
  .get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Dishes.findById(req.param.dishId, function(err, dish) {
        if(err) {
            throw err;
        }
        res.json(dish);
    });
  })

  .put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Dishes.findByIdAndUpdate(req.param.dishId, {$set: req.body}, {new : true}, function(err, dish) {
        if(err) {
            throw err;
        }
        res.json(dish);
    });
  })

  .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Dishes.findByIdAndRemove(req.param.dishId, function(err, resp) {
        if(err) {
            throw err;
        }
        res.json(resp);
    });
  });


dishRouter.route('/:dishId/Comments')
            .get(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    Dishes.findById(req.param.dishId, function(err, dish){
        if(err) {
            throw err;
        }
        res.json(dish.comments);
    });
})
        .post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.param.dishId, function(err, dish) {
        if(err) {
            throw err;
        }
        dish.comments.push(req.body);
        dish.save(function(err, dish) {
            if(err) {
                throw err;
            }
            console.log('comments saved');
            res.json(dish);
        });
    })
})
        .delete(Verify.verifyOrdinaryUser, function(req, res, next ) {
    Dishes.findById(req.param.dishId, function(err, dish){
        if(err) {
            throw err;
        }
        for(var i=0; i < dish.comments.length; i++) {
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save(function(err, resp) {
           if(err) {
               throw err;
           } 
            res.writeHead('200', {'ContentType':'plain/text'});
            res.end('Deleted all comments');
        });
    } );
});




dishRouter.route('/:dishId/Comments/:commentId')
            .get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.param.dishId, function(err, dish){
        if(err) {
            throw err;
        }
        res.json(dish.comments.id(req.param.commentId));
    } );
})
    .put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Dishes.findById(req.param.dishId, function(err, dish){
        if(err) {
            throw err;
        }
        
        dish.comments.id(req.param.commentId).remove();
        dish.comments.push(req.body);
        dish.save(function(err, resp){
            if(err) {
                throw err;
            }
            console.log('updated comments');
            res.json(dish);
        });
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Dishes.findById(req.param.dishId, function(err, dish){
        if(err) {
            throw err;
        }
        dish.comments.id(req.param.commentId).remove();
        dish.save(function(err, resp){
            if(err) {
                throw err;
            }
            console.log('deleted comments');
            res.json(dish);
        });
    } );
});
module.exports = dishRouter;