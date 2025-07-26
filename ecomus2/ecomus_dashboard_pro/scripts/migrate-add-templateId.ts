require("dotenv/config");
import { connectDB } from "../src/lib/mongodb";
import Template from "../src/models/Template";
import Store from "../src/models/Store";

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
