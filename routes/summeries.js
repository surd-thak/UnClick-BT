const express = require("express");
const router = express.Router();
const Summery = require("../models/summery");
const gtts = require("node-gtts")("en");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  const summeries = await Summery.find({}).populate("author");
  const userSummeries = [];
  for (let summery of summeries) {
    if (summery.author._id.equals(req.user._id)) {
      userSummeries.push(summery);
    }
  }
  res.render("summeries/index", { userSummeries });
});

router.post("/", isLoggedIn, async (req, res) => {
  const summery = new Summery(req.body);
  summery.author = req.user._id;
  await summery.save();
  req.flash("success", "successfully added");
  res.redirect("/");
});

router.get("/hear", (req, res) => {
  console.log("hello");
  console.log(req.query.play);
  console.log(req.query.lang);
  res.set({ "Content-Type": "audio/mpeg" });
  gtts.stream(req.query.play).pipe(res);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const summery = await Summery.findById(id);
  if (!summery) {
    req.flash("error", "cannot find details");
    return res.redirect("/summeries");
  }
  res.render("summeries/show", { summery });
});

router.get("/:id/edit", async (req, res) => {
  const { id } = req.params;
  const summery = await Summery.findById(id);
  if (!summery) {
    req.flash("error", "cannot find details");
    return res.redirect("/summeries");
  }
  res.render("summeries/edit", { summery });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const summery = await Summery.findByIdAndUpdate(id, { ...req.body });
  req.flash("success", "successfully updated details");
  res.redirect(`/summeries/${summery._id}`);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Summery.findByIdAndDelete(id);
  req.flash("error", "deleted");
  res.redirect("/summeries");
});

module.exports = router;
