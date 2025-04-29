import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeparatorWithText from "@/components/separatorWithText";
import { Alert } from "@/components/ui/alert";
import Loading from "@/components/loading";
import { submitLocalFileList, getLocalFileList, deleteLocalFileList } from "@/api";
import deleteIcon from "@/assets/delete.svg";
import uploadIcon from "@/assets/upload.svg";

// Supported file types - matches the types shown in the screenshot
const SUPPORTED_FILE_TYPES = [".pdf", ".doc", ".docx", ".txt", ".md", ".epub", ".mobi", ".pptx", ".xlsx", ".csv"];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

export const Files = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<API.LocalFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterText, setFilterText] = useState("");

  // Fetch the existing files when component mounts
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      setIsLoading(true);
      const response = await getLocalFileList();
      if (response.retcode === 0) {
        setUploadedFiles(response.data.file_list || []);
      } else {
        console.error("Failed to fetch files:", response.message);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = ""; // Reset the input
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setError(null);
    
    // Validate files
    for (const file of newFiles) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large. Maximum size is 30MB.`);
        return;
      }
      
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        setError(`Unsupported file type: ${fileExtension}. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`);
        return;
      }
    }
    
    setFiles([...files, ...newFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('file_list', file);
      });

      const response = await submitLocalFileList(formData);
      
      if (response.retcode === 0) {
        setSuccessMessage(`Successfully uploaded ${files.length} file(s).`);
        setFiles([]);
        // Auto-refresh removed
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading files:", err);
      setError(err instanceof Error ? err.message : "Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      setIsDeleting(true);
      const response = await deleteLocalFileList([fileId]);
      
      if (response.retcode === 0) {
        setSuccessMessage("File deletion initiated successfully.");
        // Auto-refresh removed
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(err instanceof Error ? err.message : "Failed to delete file. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const filteredUploadedFiles = uploadedFiles.filter(file => 
    file.origin_file_name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="mt-[5vh]">
      <div className="mb-10 rounded border border-zinc-200">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900">
            Files
          </h3>
        </div>
        <div className="p-5">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              {successMessage}
            </Alert>
          )}

          <div>
            {/* Upload area with drag & drop */}
            <div 
              className="border border-dashed border-neutral-200 p-16 cursor-pointer flex flex-col items-center justify-center rounded"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Input
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept={SUPPORTED_FILE_TYPES.join(',')}
                multiple
                type="file"
                name="file"
                disabled={isUploading}
              />
              
              <img src={uploadIcon} alt="upload" className="w-5 h-5 mb-4" />
              <div className="text-center">
                <p className="text-sm text-zinc-600">
                  Drag & drop files here, or click to select files
                </p>
                <span className="text-xs text-zinc-500">
                  Supported File Types: {SUPPORTED_FILE_TYPES.join(', ')}
                </span>
                <div className="mt-1 text-xs text-zinc-500">
                  If you are uploading a PDF, make sure you can select/highlight the text.
                </div>
              </div>
            </div>
            
            {/* Selected files list */}
            {files.length > 0 && (
              <div className="mt-6">
                <SeparatorWithText content={`Selected Files (${files.length})`} />
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="truncate flex-1">{file.name}</div>
                      <div className="text-sm text-gray-500 mx-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={isUploading}
                      >
                        <img src={deleteIcon} alt="delete" width={16} height={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="flex justify-end bg-zinc-100 px-5 py-3">
            <Button 
              size="sm" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? <Loading /> : 'Upload'}
            </Button>
          </div>
        )}
      </div>

      {/* Uploaded files section */}
      <div className="rounded border border-zinc-200">
        <div className="border-b border-zinc-200 px-5 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900">
            uploaded Files
          </h3>
        </div>
        
        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center my-4">
              <Loading />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Input 
                  placeholder="Filter file name..." 
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="max-w-full"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 w-8">
                        <input type="checkbox" disabled />
                      </th>
                      <th className="text-left py-2 px-4">File Name</th>
                      <th className="text-left py-2 px-4">File Link</th>
                      <th className="text-left py-2 px-4">Size</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUploadedFiles.length > 0 ? (
                      filteredUploadedFiles.map((file) => (
                        <tr key={file.id} className="border-b">
                          <td className="py-2 px-4">
                            <input type="checkbox" />
                          </td>
                          <td className="py-2 px-4">{file.origin_file_name}</td>
                          <td className="py-2 px-4">
                            <a href="#" className="text-blue-500 hover:underline">
                              Preview
                            </a>
                          </td>
                          <td className="py-2 px-4">{file.content_length}</td>
                          <td className="py-2 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {file.doc_status === 4 ? 'Trained' : 'Processing'}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={isDeleting}
                            >
                              <img src={deleteIcon} alt="delete" width={16} height={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          No results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {filteredUploadedFiles.length} total
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
