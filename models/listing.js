const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

   image: {
  type: {
    filename: String,
    url: String
  },
  default: {
    filename: "default",
    url: "https://unsplash.com/photos/an-elegant-library-shows-many-books-on-shelves-7AEFNoZDy6Q",
  },
},

    price: Number,
    location: String,
    country: String,
  
    reviews: [
        {
            type: Schema.Types.ObjectId, // Review ki ID store hogi
            ref: "Review", // Review model ko reference kar raha hai
        },
    ],
    owner:{
      type : Schema.Types.ObjectId,
      ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async(listing) =>{
 if(listing){
   await Review.deleteMany({_id: {$in: listing.reviews}});
 }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
