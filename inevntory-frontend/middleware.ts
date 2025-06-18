import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "./core/api/localStorageKeys";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const token = request.cookies.get("nextToken")?.value;

    const role = request.cookies.get("userRole")?.value;
    const allowedLinks = JSON.parse(request.cookies.get("allowedLinks")?.value || "[]");


   
    if (token && role) {
        if (allowedLinks.includes(String(pathname)) === false) {
            const url = request.nextUrl.clone();
            url.pathname = "/not-allowed";
            return NextResponse.redirect(url);
        }
    }
   

    return NextResponse.next();
}


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|not-allowed).*)"
  ]
};
