"use client"
import { useRouter } from "next/navigation"
import Link from 'next/link';

export default function Custom404() {
    const router = useRouter()
    return <div >
                <h1>404 - Ooops!!!! Page Not Found!</h1>
                <div >
                    <Link href="/places" >Places</Link>
                    <Link href={`/articles`}>Articles</Link>
                    <Link href={`/tours`}>Tours</Link>
                    <Link href="" onClick={() => router.back()}>Back</Link>
                </div>
            </div>
}