'use client'
import NavBar from "@/components/navbar/page";
import { useEffect, useState } from "react";

export default function Home() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/symptoms")
      .then((res) => res.json())
      .then((data) => {
        setSymptoms(
          data.length > 0
            ? Object.keys(data[0]).filter(key => key !== 'disease')
            : []
        );
      })
      .catch(error => console.error("Erro ao buscar sintomas:", error));
  }, []);

  const handleSelectSymptom = (symptom, value) => {
    setSelectedSymptoms((prev) => ({ ...prev, [symptom]: value }));
  };

  const handleDiagnose = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSymptoms),
      });
      const result = await response.json();
      setDiagnosis(result.diagnosis || "Não foi possível determinar a doença");
    } catch (error) {
      console.error("Erro ao diagnosticar:", error);
      setDiagnosis("Erro ao realizar diagnóstico");
    }
  };

  // Opções disponíveis para cada sintoma
  const options = ["Irrelevante", "Médio", "Forte"];

  return (
    <>
      <NavBar></NavBar>
      <div className="flex flex-col items-center p-6 text-black">
        <h1 className="text-2xl font-bold mb-4 text-white">Sistema de Diagnóstico Médico</h1>
        <div className="w-full max-w-xl mb-4 bg-slate-50 shadow-md border rounded-md p-4">
          <div className="flex flex-col">
            {symptoms
              .filter((symptom) => symptom !== "id")
              .map((symptom) => (
                <div key={symptom} className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    {symptom.replace("_", " ")}
                  </label>
                  <div className="flex space-x-4">
                    {options.map((option) => (
                      <label key={option} className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name={symptom}
                          value={option}
                          checked={selectedSymptoms[symptom] === option}
                          onChange={() => handleSelectSymptom(symptom, option)}
                          className="form-radio"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            <button
              className="bg-slate-600 text-black mt-4 p-2 rounded-md w-1/2 self-center"
              onClick={handleDiagnose}
            >
              Diagnosticar
            </button>
            {diagnosis && (
              <p className="mt-4 text-lg font-semibold text-center">
                Diagnóstico: {diagnosis}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
