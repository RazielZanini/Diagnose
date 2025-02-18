'use client'
import NavBar from "@/components/navbar/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DoencasPage() {
    const [deseases, setDeseases] = useState([])
    const route = useRouter()

    useEffect(() => {
        fetch('http://localhost:3001/api/symptoms')
            .then((response) => response.json())
            .then((data) => setDeseases(data))
    }, [])

    return (
        <>
            <NavBar />
            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-4 text-white">Doenças Cadastradas</h1>
                <div className="flex flex-row flex-wrap gap-4">
                    {deseases.map((item) => (
                        <div key={item.id} className="bg-slate-100 w-80 text-black p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">{item.disease}</h3>
                            <ul className="text-sm">
                                {Object.entries(item)
                                    .filter(([key]) => key !== "id" && key !== "disease")
                                    .map(([symptom, level]) => (
                                        <li key={symptom} className="flex justify-between border-b py-1">
                                            <span className="font-medium">{symptom.replace("_", " ")}:</span>
                                            <span>{level}</span>
                                        </li>
                                    ))}
                            </ul>
                            <button onClick={() => route.push(`/doencas/edit/${item.id}`)} className="bg-rose-400 w-full mt-2 shadow-sm rounded-md hover:bg-rose-500">Editar</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}