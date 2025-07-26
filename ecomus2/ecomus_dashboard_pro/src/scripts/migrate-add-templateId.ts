require("dotenv/config");
const connectDB = require("../lib/mongodb").default;
const Template = require("../models/Template").default;
const Store = require("../models/Store").default;

(async()=>{
  await connectDB();
  const defaultTpl = (await Template.findOne({ slug:"default" })) ||
    (await Template.create({ name:"Default", slug:"default", components:{ sections:["hero"] }}));
  await Store.updateMany(
    { templateId:{ $exists:false } },
    { $set:{ templateId: defaultTpl._id } }
  );
  console.log("templateId ajouté.");
  process.exit(0);
})();
