const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();
const dbo = require("../db/conn");
// Route 1 when /listing api is called with get request, corresponding function is called
//This section will help you get a list of all the documents.
recordRoutes.route("/listings").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("listingsAndReviews")
    .find({})
    .limit(10)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching listings!");
      } else {
        res.json(result);
      }
    });
});

// Route 2 when /listing/reocrdSwipe api is called with post request, corresponding function is called
// This section will help you create a new document
recordRoutes.route("/listings/recordSwipe").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const matchDocument = {
    listing_id: req.body.id,
    last_modified: new Date(),
    session_id: req.body.session_id,
    direction: req.body.direction,
  };

  dbConnect
    .collection("matches")
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400).send("Error inserting matches!");
      } else {
        console.log(`Added a new match with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// Route 3 when /listing/updateLike api is called with post request, corresponding function is called
// This section will help you update a document by id.
recordRoutes.route("/listings/updateLike").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { _id: req.body.id };

  let updates = {
    $inc: {
      likes: 1,
    },
  };

  //-> listingAndReviews collection is selected from sample_airbnb database
  //-> The document with the filter "listingQuery" is filtered
  // -> then the key "likes" of the filtered document is increase by 1
  // -> finally the check function is called

  dbConnect
    .collection("listingsAndReviews")
    .updateOne(listingQuery, updates, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error updating likes on listing with id ${listingQuery.id}!`);
      } else {
        console.log("1 document updated");
      }
    });
});

// Route 4 when /listing/delete/:id api is called with post request, corresponding function is called
// This section will help you delete a record.
recordRoutes.route("/listings/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.body.id };

  dbConnect
    .collection("listingsAndReviews")
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log("1 document deleted");
      }
    });
});

module.exports = recordRoutes;
