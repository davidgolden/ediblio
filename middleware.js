import { NextResponse } from 'next/server'
import {verifyJWT} from "./utils";

async function isLoggedIn(request) {
    const token = request.cookies.get('jwt');

    try {
        await verifyJWT(token?.value);
        return true;
    } catch (e) {
        return false;
    }
}

const routesThatRequireAuthentication = [
    /\/users\/[\w-]+\/recipes/
]

export async function middleware(request) {
    if (routesThatRequireAuthentication.some(regex => regex.exec(request.nextUrl.pathname))) {
        if (await isLoggedIn(request)) {
            return NextResponse.next();
        } else {
            return new NextResponse(JSON.stringify({ detail: 'You need to be logged in to do that!' }), {
                status: 404, headers: { 'content-type': 'application/json' }
            })
        }
    }
}