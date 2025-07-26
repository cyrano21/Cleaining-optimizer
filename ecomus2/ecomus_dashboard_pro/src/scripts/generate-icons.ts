import sharp from "sharp";
import Store, { StoreDocument } from "@/models/Store";
import dbConnect from "@/lib/dbConnect";
import fs from "fs/promises";
import fetch from "node-fetch";

(async () => {
  await dbConnect();
  const store = await Store.findOne().lean() as StoreDocument | null; // default store for PWA
  if (!store?.logoUrl) {
    console.log("No logoUrl, skipping icon generation.");
    return;
  }
  const res = await fetch(store.logoUrl);
  const buf = await res.arrayBuffer();
  const sizes = [192, 512];
  await Promise.all(sizes.map(async size => {
    const out = await sharp(Buffer.from(buf)).resize(size, size).png().toBuffer();
    await fs.writeFile(`public/icons/icon-${size}.png`, out);
  }));
  console.log("Icons generated.");
})();
