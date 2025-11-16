import React, { useState } from "react";

export default function App() {
  const [files, setFiles] = useState([]);
  const [useCase, setUseCase] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUseCaseChange = (e) => {
    setUseCase(e.target.value);
  };

  const uploadFilesAndGenerate = async () => {
    setLoading(true);
    try {
      const keys = [];

      for (const file of files) {
        const res = await fetch(
          `https://iale9abotk.execute-api.us-east-1.amazonaws.com/api/getPresignedUrl?filename=${file.name}`
        );
        const { url, key } = await res.json();

        console.log(`Uploading file ${file.name} to ${key}`);

        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        keys.push(key);
      }

      console.log("Uploaded files with keys:", keys);
      const genResponse = await fetch(
        "https://iale9abotk.execute-api.us-east-1.amazonaws.com/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keys, useCase }),
        }
      );

      const data = await genResponse.json();
      console.log("Generation response:", data);
      setResultUrl(data.resultUrl);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">GenAI Document Generator</h1>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <select
        value={useCase}
        onChange={handleUseCaseChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="">Select Use Case</option>
        <option value="checksheet">Generate Checksheet (XLS)</option>
        <option value="workinstruction">
          Generate Work Instruction (DOCX)
        </option>
      </select>

      <button
        disabled={files.length === 0 || !useCase || loading}
        onClick={uploadFilesAndGenerate}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {resultUrl && (
        <div className="mt-6">
          <a
            href={resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            Download Generated File
          </a>
        </div>
      )}
    </div>
  );
}
