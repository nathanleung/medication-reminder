'use strict';

var q = require('q'),
    moment = require('moment'),
    Medication = require('./medication.model');

exports.index = function (req, res) {
    var query = {};
    if (req.query.start && req.query.end) {
        query = {
            $and: [
                { time: { $gte: moment(req.query.start, 'MM/DD/YYYY').toDate() } },
                { time: { $lt: moment(req.query.end, 'MM/DD/YYYY').toDate() } }
            ]
        };
    }
    q(Medication.find(query).sort({'d.c': -1}).exec()).then(function (meds) {
        res.json(meds);
    }).catch(function (err) {
        console.error('Error occured listing medications', err);
        res.send(500);
    });
};

exports.show = function (req, res) {
    q(Medication.findById(req.params.id).exec()).then(function (med) {
        if (med) {
            res.json(med);
        } else {
            res.send(404);
        }
    }).catch(function (err) {
        console.error('Error occured getting medication', err);
        res.send(500);
    });
};

exports.create = function (req, res) {
    req.body.d = {
        c: moment().toDate()
    }
    q(Medication.create(req.body)).then(function (med) {
        res.json(201, med);
    }).catch(function (err) {
        console.error('Error occured creating medication', err);
        res.send(500);
    });
};

// exports.update = function (req, res) {
//     q.resolve().then(function () {
//         req.body.d.m = moment().toDate();
//         return q(Medication.findByIdAndUpdate(req.params.id, req.body).exec()).then(function (med) {
//             if (!med) {
//                 res.send(404);
//             } else {
//                 res.json(med);
//             }
//         });
//     }).catch(function (err) {
//         console.error('Error occured updating medication', err);
//         res.send(500);
//     });
// };
exports.update = function(req, res){
    var updateRequest = req;
    q(Medication.remove({ _id: updateRequest.params.id }).exec()).then(function (med) {
        if (!med) {
            res.send(404);
        } else {
            // res.send(204);
            req.body.d.m = moment().toDate();
            q(Medication.create(updateRequest.body)).then(function (med) {
                res.json(201, med);
            }).catch(function (err) {
                console.error('Error occured creating medication', err);
                res.send(500);
            });
        }
    }).catch(function (err) {
        console.error('Error occured deleting medication', err);
        res.send(500);
    });
};

exports.destroy = function (req, res) {
    q(Medication.remove({ _id: req.params.id }).exec()).then(function (med) {
        if (!med) {
            res.send(404);
        } else {
            res.send(204);
        }
    }).catch(function (err) {
        console.error('Error occured deleting medication', err);
        res.send(500);
    });
};
