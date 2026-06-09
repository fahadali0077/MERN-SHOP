import type { NextRequest } from "next/server";
import { proxyGet, proxyPost, proxyMutation } from "../_shared";
export async function GET(req: NextRequest) { return proxyGet(req, "/api/v1/products"); }
export async function POST(req: NextRequest) { return proxyPost(req, "/api/v1/products"); }
export async function PUT(req: NextRequest) { return proxyMutation(req, "PUT", "/api/admin/products", "/api/v1/products"); }
export async function DELETE(req: NextRequest) { return proxyMutation(req, "DELETE", "/api/admin/products", "/api/v1/products"); }
