const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedin} = require("../middleware.js");


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
router.get("/", wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedin,(req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",  wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  
  if(!listing){
    req.flash("error","Requested Listing does not exist");
    // 🔑 FIX: Add 'return' to terminate function execution.
    return res.redirect("/listings"); 
  }
  
  // This line is only reached if 'listing' exists.
  res.render("listings/show.ejs", { listing }); 
}));

//Create Route
router.post("/",isLoggedin, validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success","New listing Added!");
  res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedin, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Requested Listing does not exist");
    // 🔑 FIX: Add 'return' to terminate function execution.
    return res.redirect("/listings"); 
  }
  
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, isLoggedin,  wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing });
  req.flash("success","New listing Updated !");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",  isLoggedin, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success","listing deleted!");
  res.redirect("/listings");
}));

module.exports = router;