var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    let diff = [
        {
            id: 'D-P1',
            denivele_positif: 275,
            denivele_negatif: 171,
            distance: 16.1,
            distance_cummulee: 16.1,
            niveau_diff: 0,
            ouverture_pc: "2021-03-07T09:00:00.000Z",
            fermeture_pc: "2021-03-07T14:15:00.000Z",

        }, {
            id: 'P1-P2',
            denivele_positif: 181,
            denivele_negatif: 272,
            distance: 12.9,
            distance_cummulee: 29,
            niveau_diff: 1,
            ouverture_pc: "2021-03-07T11:00:00.000Z",
            fermeture_pc: "2021-03-07T18:15:00.000Z",

        }, {
            id: 'P2-P3',
            denivele_positif: 201,
            denivele_negatif: 99,
            distance: 14.1,
            distance_cummulee: 43.1,
            niveau_diff: 2,
            ouverture_pc: "2021-03-07T13:00:00.000Z",
            fermeture_pc: "2021-03-07T22:30:00.000Z",

        }, {
            id: 'P3-P4',
            denivele_positif: 168,
            denivele_negatif: 181,
            distance: 11.5,
            distance_cummulee: 54.6,
            niveau_diff: 3,
            ouverture_pc: "2021-03-07T14:30:00.000Z",
            fermeture_pc: "2021-04-07T02:00:00.000Z",

        }, {
            id: 'P4-P5',
            denivele_positif: 144,
            denivele_negatif: 217,
            distance: 11.7,
            distance_cummulee: 66.3,
            niveau_diff: 4,
            ouverture_pc: "2021-03-07T16:15:00.000Z",
            fermeture_pc: "2021-04-07T05:45:00.000Z",

        }, {
            id: 'P5-P6',
            denivele_positif: 97,
            denivele_negatif: 121,
            distance: 8.5,
            distance_cummulee: 74.8,
            niveau_diff: 5,
            ouverture_pc: "2021-03-07T17:30:00.000Z",
            fermeture_pc: "2021-04-07T08:30:00.000Z",

        }, {
            id: 'P6-P7',
            denivele_positif: 124,
            denivele_negatif: 87,
            distance: 6.9,
            distance_cummulee: 81.7,
            niveau_diff: 4,
            ouverture_pc: "2021-03-07T18:30:00.000Z",
            fermeture_pc: "2021-04-07T10:30:00.000Z",

        }, {
            id: 'P7-P8',
            denivele_positif: 155,
            denivele_negatif: 107,
            distance: 6.1,
            distance_cummulee: 87.8,
            niveau_diff: 3,
            ouverture_pc: "2021-03-07T19:00:00.000Z",
            fermeture_pc: "2021-04-07T12:15:00.000Z",

        }, {
            id: 'P8-A',
            denivele_positif: 212,
            denivele_negatif: 300,
            distance: 12.5,
            distance_cummulee: 100,
            niveau_diff: 2,
            ouverture_pc: "2021-03-07T21:00:00.000Z",
            fermeture_pc: "2021-04-07T15:15:00.000Z",

        }
    ]



    res.json(diff)
})

module.exports = router;
