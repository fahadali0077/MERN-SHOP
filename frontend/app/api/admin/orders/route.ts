import type { NextRequest } from "next/server";
import { proxyGet, proxyPost, proxyMutation } from "../_shared";
export async function GET(req: NextRequest) { return proxyGet(req, "/api/v1/orders"); }
export async function POST(req: NextRequest) { return proxyPost(req, "/api/v1/orders"); }
export async function PUT(req: NextRequest) { return proxyMutation(req, "PUT", "/api/admin/orders", "/api/v1/orders"); }
export async function PATCH(req: NextRequest) { return proxyMutation(req, "PATCH", "/api/admin/orders", "/api/v1/orders"); }
