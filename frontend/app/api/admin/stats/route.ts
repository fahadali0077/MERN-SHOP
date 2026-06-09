import type { NextRequest } from "next/server";
import { proxyGet } from "../_shared";
export async function GET(req: NextRequest) { return proxyGet(req, "/api/v1/orders/stats"); }
