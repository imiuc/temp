"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LogAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/log-analysis", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to analyze log file.");
      return;
    }

    setResult(data);
  };

  const handleDownload = () => {
    if (!result) return;

    const content = [
      `Threat Report - CyberSecureDocs\nGenerated: ${new Date().toLocaleString()}\n\n`,
      `Total Threats Detected: ${result.threatCount}\n\n`,
      ...result.threats.map(
        (t: any, idx: number) =>
          `${idx + 1}. [${t.type}] on line ${t.line}\n${t.content}\n`
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cyber-threat-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Upload Log File for Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select .log or .txt file</Label>
            <Input id="file" type="file" accept=".log,.txt" onChange={handleFileChange} />
          </div>

          <div className="flex gap-2">
            <Button disabled={!file || loading} onClick={handleUpload}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
            {result && (
              <Button variant="outline" onClick={handleDownload}>
                Download Report
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <div className="mt-4 space-y-2">
              <h3 className="font-bold">Detected Threats: {result.threatCount}</h3>
              <ul className="text-sm max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                {result.threats.map((threat: any, idx: number) => (
                  <li key={idx} className="border-b py-1">
                    <strong>{threat.type}</strong> on line {threat.line}:<br />
                    <code className="text-xs break-words">{threat.content}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
