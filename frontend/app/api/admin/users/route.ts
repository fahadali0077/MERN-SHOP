import type { NextRequest } from "next/server";
import { proxyGet, proxyMutation } from "../_shared";
export async function GET(req: NextRequest) { return proxyGet(req, "/api/v1/users"); }
export async function PUT(req: NextRequest) { return proxyMutation(req, "PUT", "/api/admin/users", "/api/v1/users"); }
export async function DELETE(req: NextRequest) { return proxyMutation(req, "DELETE", "/api/admin/users", "/api/v1/users"); }
