"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    UploadIcon,
    FileIcon,
    XIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadCase, analyzeCase, ApiError } from "@/services/api";

export default function NewCasePage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setError(null);
        setUploading(true);
        setStatus("Uploading document...");
        setUploadProgress(10);

        try {
            // Upload the file
            setUploadProgress(30);
            const uploadResult = await uploadCase(file);
            const caseId = uploadResult.case.case_id;

            setUploadProgress(50);
            setUploading(false);
            setAnalyzing(true);
            setStatus("Analyzing document for fraud signals...");

            // Trigger analysis
            setUploadProgress(70);
            await analyzeCase(caseId);

            setUploadProgress(100);
            setStatus("Analysis complete! Redirecting...");

            // Redirect to case detail page
            setTimeout(() => {
                router.push(`/cases/${caseId}`);
            }, 1000);

        } catch (err) {
            setUploading(false);
            setAnalyzing(false);
            setUploadProgress(0);

            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Please log in to upload documents.");
                } else {
                    setError(err.message || "Upload failed. Please try again.");
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
            console.error("Upload error:", err);
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadProgress(0);
        setError(null);
        setStatus("");
    };

    const isProcessing = uploading || analyzing;

    return (
        <>
            <Header
                title="Upload Document"
                description="Upload a financial document for fraud analysis"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-2xl space-y-6">
                    {/* Upload Area */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Upload</CardTitle>
                            <CardDescription>
                                Upload CSV, PDF, or Excel files containing financial transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Drag & Drop Zone */}
                            <div
                                className={cn(
                                    "relative rounded-lg border-2 border-dashed p-8 transition-colors",
                                    dragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                                    file && "border-emerald-500 bg-emerald-500/5"
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    accept=".csv,.xlsx,.xls,.pdf"
                                    onChange={handleFileSelect}
                                />
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    {file ? (
                                        <>
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                                                <FileIcon className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeFile();
                                                }}
                                            >
                                                <XIcon className="mr-1 h-4 w-4" />
                                                Remove
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                <UploadIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Drag and drop your file here
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    or click to browse files
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Supported: CSV, XLSX, XLS, PDF (max 50MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-600">
                                    <AlertCircleIcon className="h-5 w-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Upload/Analysis Progress */}
                            {isProcessing && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Loader2Icon className="h-4 w-4 animate-spin" />
                                            {status}
                                        </span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} />
                                </div>
                            )}

                            {/* Case Details */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Case Title (Optional)</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Q4 Vendor Payments Analysis"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Brief description of the document"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleUpload}
                                disabled={!file || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                        {analyzing ? "Analyzing..." : "Uploading..."}
                                    </>
                                ) : uploadProgress === 100 ? (
                                    <>
                                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                                        Complete!
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        Upload & Analyze
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Analysis Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        1
                                    </span>
                                    <span>Upload your financial document (CSV, Excel, or PDF)</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        2
                                    </span>
                                    <span>Our AI extracts and normalizes transaction data</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        3
                                    </span>
                                    <span>Multiple fraud detection algorithms analyze the data</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        4
                                    </span>
                                    <span>Receive an explainable risk assessment with visualizations</span>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
