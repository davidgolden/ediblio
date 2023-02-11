import { NextResponse } from 'next/server'
import {verifyJWT} from "./utils";

// http://localhost:3000/?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYzdiMTY1MzgtNTEwNC0xMWVhLTg5NmItOWU2ZTRhYmQ1YWExIiwicHJvZmlsZV9pbWFnZSI6InVzZXJzL2M3YjE2NTM4LTUxMDQtMTFlYS04OTZiLTllNmU0YWJkNWFhMS9fTUdfMjU0My5qcGVnIiwidXNlcm5hbWUiOiJEYXZpZCJ9LCJpYXQiOjE2NzYxMjc5NjZ9.epcFopmw0UM9qT8AiPT5LXYBiEvOJtOo2Ho239LJPSw

async function isLoggedIn(request) {
    let token = request.headers.get('x-access-token') || request.headers.get('authorization');

    if (token) {
        try {
            const verified = await verifyJWT(token);
            if (verified) {
                request.user = {id: verified.payload.user.id};
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export async function middleware(request) {

}