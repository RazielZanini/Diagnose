'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import api from "@/utils/api";

export default function EditDisease() {
    const router = useRouter();
    const { id } = useParams()

    const [disease, setDisease] = useState(null);
    const [newSymptom, setNewSymptom] = useState("");
    const [newLevel, setNewLevel] = useState("Irrelevante");
    const [symptoms, setSymptoms] = useState({});

    const options = ["Irrelevante", "Médio", "Forte"];

    // Buscar a doença pelo ID
    useEffect(() => {
        if (id) {
            api.get(`/api/disease/${id}`)
                .then(response => {
                    setDisease(response.data);
                    setSymptoms(response.data);
                })
                .catch(error => {
                    console.error("Erro ao buscar doença:", error);
                });
        }
    }, [id]);

    // Atualizar nível do sintoma
    const handleSymptomChange = (symptom, level) => {
        setSymptoms(prevSymptoms => ({
            ...prevSymptoms,
            [symptom]: level
        }));
    };

    // Adicionar um novo sintoma
    const handleAddSymptom = () => {
        if (newSymptom && newLevel) {
            api.post(`/api/add-symptom`, {
                id: id,
                symptom: newSymptom,
                level: newLevel
            })
                .then(response => {
                    setSymptoms(response.data.updatedDisease);
                    setNewSymptom('');
                    setNewLevel('');
                    alert("Sintoma adicionado com sucesso!");
                })
                .catch(error => {
                    console.error("Erro ao adicionar sintoma:", error);
                    alert("Erro ao adicionar sintoma.");
                });
        } else {
            alert("Preencha todos os campos.");
        }
    };

    // Salvar alterações
    const handleSave = () => {
        if (!id) {
            alert("ID inválido.");
            return;
        }

        api.put(`/api/symptoms/${id}`, symptoms)
            .then(response => {
                alert("Sintomas atualizados com sucesso!");
                router.push('/doencas');
            })
            .catch(error => {
                console.log(error)
                console.error("Erro ao salvar sintomas:", error);
                alert("Erro ao salvar sintomas.");
            });
    };


    if (!disease) return <p>Carregando...</p>;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg text-black">
            <h2 className="text-xl font-bold mb-4">Editar Doença: {disease.disease}</h2>

            {Object.keys(disease)
                .filter(key => key !== "id" && key !== "disease")
                .map(symptom => (
                    <div key={symptom} className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            {symptom.replace("_", " ")}
                        </label>
                        <div className="flex space-x-4">
                            {options.map(option => (
                                <label key={option} className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        name={symptom}
                                        value={option}
                                        checked={symptoms[symptom] === option} // Altere de disease para symptoms
                                        onChange={() => handleSymptomChange(symptom, option)}
                                        className="form-radio"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

            {/* Adicionar novo sintoma */}
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Adicionar Novo Sintoma</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Nome do sintoma"
                        value={newSymptom}
                        onChange={(e) => setNewSymptom(e.target.value)}
                        className="border p-2 flex-1"
                    />
                    <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="border p-2">
                        {options.map(option => <option key={option}>{option}</option>)}
                    </select>
                    <button onClick={handleAddSymptom} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Adicionar
                    </button>
                </div>
            </div>

            <button onClick={handleSave} className="mt-6 bg-green-500 text-white px-4 py-2 rounded">
                Salvar Alterações
            </button>
        </div>
    );
}
