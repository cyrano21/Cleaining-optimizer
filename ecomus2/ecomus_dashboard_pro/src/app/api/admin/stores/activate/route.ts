import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongodb";
import StoreVendor from "@/models/StoreVendor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit") || "20";
  const limit = limitParam === "all" ? 0 : parseInt(limitParam,10);
  const page  = parseInt(searchParams.get("page")||"1",10)-1;

  await connectDB();

  const pipeline:any[]=[
    { $match:{ status:"active" } },
    { $lookup:{ from:"stores", localField:"storeId", foreignField:"_id", as:"store" } },
    { $unwind:"$store" },
    { $replaceRoot:{ newRoot:"$store" } },
    { $sort:{ createdAt:-1 } }
  ];
  if(limit){ pipeline.push({$skip:page*limit},{$limit:limit}); }

  const [docs,total] = await Promise.all([
    StoreVendor.aggregate(pipeline),
    StoreVendor.countDocuments({ status:"active" })
  ]);

  return NextResponse.json({ success: true, data: { stores: docs, total } });
}
