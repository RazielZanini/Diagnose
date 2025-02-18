'use client'
import { useRouter } from "next/navigation"

export default function NavBar() {
    const route = useRouter()

    return (
        <header className="flex flex-row gap-4 bg-slate-100 w-full text-black">
            <span className="p-2 shadow hover:bg-slate-300 cursor-pointer" onClick={() => route.push('/')}>
                Diagnóstico
            </span>
            <span className="p-2 shadow hover:bg-slate-300 cursor-pointer" onClick={() => route.push('/doencas')}>
                Doenças
            </span>
        </header>
    )
}